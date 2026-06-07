import type {
  Campaign,
  CampaignQueueMessage,
  ExtractedLeadData,
  ExtractedPersona,
  LeadCreateInput,
  RawScrapedLead,
  ScraperEnvKeys,
} from "@/types";
import {
  clearCampaignCandidates,
  createLeadsBatch,
  getCampaignById,
  getExistingCandidateIdentifiers,
  getUserById,
  purgeExpiredCandidates,
  registerCandidates,
  updateCampaignStatus,
} from "@/lib/db";
import { enrichCandidateData, extractScraperBlueprint, scoreToFitLabel } from "@/lib/gemini";
import { buildScraperBlueprint, routeScraperByPlatform, sourceIdentifierForLead } from "@/lib/scraper";
import { sendLeadsReady } from "@/lib/resend";

function nowIso(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function scraperEnvFromCloudflare(env: CloudflareEnv): ScraperEnvKeys {
  return {
    apolloApiKey: env.APOLLO_API_KEY,
    apifyApiKey: env.APIFY_API_KEY,
    apifyUserId: env.APIFY_USER_ID,
    searchProvider: env.SEARCH_PROVIDER,
    serperApiKey: env.SERPER_API_KEY,
    googleCseKey: env.GOOGLE_CSE_KEY,
    googleCseCx: env.GOOGLE_CSE_CX,
  };
}

function targetPersonaText(campaign: Campaign): string {
  if (campaign.persona_text?.trim()) return campaign.persona_text.trim();
  return campaign.target_description;
}

function parsePersona(campaign: Campaign): ExtractedPersona | null {
  if (!campaign.extracted_persona) return null;
  try {
    return JSON.parse(campaign.extracted_persona) as ExtractedPersona;
  } catch {
    return null;
  }
}

function mergeBlueprint(
  geminiBlueprint: Awaited<ReturnType<typeof extractScraperBlueprint>>,
  campaign: Campaign,
  persona: ExtractedPersona | null,
): ReturnType<typeof buildScraperBlueprint> {
  const base = buildScraperBlueprint({
    industry: geminiBlueprint.industry || persona?.industries[0] || campaign.product_name,
    location: geminiBlueprint.location || persona?.locations[0] || campaign.location || "",
    keywords: geminiBlueprint.keywords.length
      ? geminiBlueprint.keywords
      : persona?.keywords ?? [],
    titles: geminiBlueprint.titles.length ? geminiBlueprint.titles : persona?.titles ?? [],
    pain_points: geminiBlueprint.pain_points.length
      ? geminiBlueprint.pain_points
      : persona?.pain_points ?? [],
    target_description: campaign.target_description,
    product_name: campaign.product_name,
  });
  return base;
}

function socialUrl(lead: RawScrapedLead, key: string): string | null {
  return lead.social_links[key] ?? null;
}

function rawToLeadInput(
  campaign: Campaign,
  lead: RawScrapedLead,
  enriched?: Awaited<ReturnType<typeof enrichCandidateData>>,
): LeadCreateInput {
  const score = enriched?.suitability_score ?? 0;
  return {
    campaign_id: campaign.id,
    user_id: campaign.user_id,
    platform_source: lead.platform,
    company_name: enriched?.clean_company_name ?? lead.company ?? null,
    contact_name: lead.name || null,
    email: lead.email || null,
    website:
      socialUrl(lead, lead.platform) ??
      socialUrl(lead, "linkedin") ??
      null,
    linkedin_url: socialUrl(lead, "linkedin"),
    instagram_url: socialUrl(lead, "instagram"),
    reddit_username: socialUrl(lead, "reddit"),
    tiktok_handle: socialUrl(lead, "tiktok"),
    twitter_handle: socialUrl(lead, "twitter"),
    youtube_channel: socialUrl(lead, "youtube"),
    location: campaign.location,
    niche: campaign.product_name,
    score,
    fit_label: scoreToFitLabel(score),
    pitch_angle: enriched?.pitch_angle ?? null,
    score_reason: enriched?.fit_reasoning ?? null,
    likely_pain: enriched?.pain_point ?? null,
    raw_data: JSON.stringify(lead),
  };
}

async function dedupeCandidates(
  env: CloudflareEnv,
  campaign: Campaign,
  scraped: RawScrapedLead[],
): Promise<RawScrapedLead[]> {
  await purgeExpiredCandidates(env.DB);
  const existing = await getExistingCandidateIdentifiers(env.DB, campaign.id);
  const seen = new Set(existing);
  const unique: RawScrapedLead[] = [];
  const toRegister: {
    user_id: string;
    campaign_id: string;
    platform: string;
    source_identifier: string;
  }[] = [];

  for (const lead of scraped) {
    const id = sourceIdentifierForLead(lead);
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(lead);
    toRegister.push({
      user_id: campaign.user_id,
      campaign_id: campaign.id,
      platform: lead.platform,
      source_identifier: id,
    });
  }

  await registerCandidates(env.DB, toRegister);
  return unique;
}

/**
 * End-to-end campaign pipeline: blueprint → parallel scrape → dedup → enrich → save.
 */
export async function processCampaignPipeline(
  env: CloudflareEnv,
  campaignId: string,
): Promise<void> {
  const campaign = await getCampaignById(env.DB, campaignId);
  if (!campaign) return;
  if (campaign.status === "cancelled" || campaign.status === "failed") return;

  await updateCampaignStatus(env.DB, campaign.id, { status: "running" });

  try {
    const persona = parsePersona(campaign);
    const promptText = targetPersonaText(campaign);
    const geminiBlueprint = await extractScraperBlueprint(
      promptText,
      env.GEMINI_API_KEY,
      env.GEMINI_MODEL,
    );
    const blueprint = mergeBlueprint(geminiBlueprint, campaign, persona);

    const platforms: string[] = JSON.parse(campaign.platforms);
    const perPlatformLimit = Math.max(
      5,
      Math.ceil(campaign.quantity_requested / Math.max(platforms.length, 1)),
    );
    const scraperEnv = scraperEnvFromCloudflare(env);

    const settled = await Promise.allSettled(
      platforms.map((platform) =>
        routeScraperByPlatform(platform, blueprint, perPlatformLimit, scraperEnv),
      ),
    );

    const scraped: RawScrapedLead[] = [];
    for (const result of settled) {
      if (result.status === "fulfilled") scraped.push(...result.value);
      else console.warn("[pipeline] platform scrape failed:", result.reason);
    }

    const unique = await dedupeCandidates(env, campaign, scraped);
    const capped = unique.slice(0, campaign.quantity_requested);

    const leadInputs: LeadCreateInput[] = [];
    const personaText = promptText;

    for (const candidate of capped) {
      if (campaign.enrich !== 0) {
        try {
          const enriched = await enrichCandidateData(
            candidate,
            personaText,
            env.GEMINI_API_KEY,
            env.GEMINI_MODEL,
          );
          leadInputs.push(rawToLeadInput(campaign, candidate, enriched));
        } catch (err) {
          const reason = err instanceof Error ? err.message : "Unknown error";
          console.warn(`[pipeline] enrich failed for ${candidate.name}:`, reason);
          leadInputs.push({
            ...rawToLeadInput(campaign, candidate),
            score_reason: `Enrichment failed: ${reason}`,
          });
        }
      } else {
        leadInputs.push(rawToLeadInput(campaign, candidate));
      }
    }

    if (leadInputs.length > 0) {
      await createLeadsBatch(env.DB, leadInputs);
    }

    const delivered = leadInputs.length;
    await updateCampaignStatus(env.DB, campaign.id, {
      status: "complete",
      quantity_delivered: delivered,
      cursor: delivered,
      completed_at: nowIso(),
      error_message: null,
    });

    await clearCampaignCandidates(env.DB, campaign.id);

    const user = await getUserById(env.DB, campaign.user_id);
    if (user && delivered > 0) {
      const dashboardUrl = `${env.APP_URL}/campaigns/${campaign.id}`;
      await sendLeadsReady(
        env.RESEND_API_KEY,
        user.email,
        campaign.name,
        delivered,
        dashboardUrl,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    console.error("[pipeline]", message);
    await updateCampaignStatus(env.DB, campaign.id, {
      status: "failed",
      error_message: message,
    });
  }
}

/** Queue / waitUntil entry — runs the full pipeline in one background invocation. */
export async function driveCampaign(
  env: CloudflareEnv,
  msg: CampaignQueueMessage,
): Promise<void> {
  void msg.cursor;
  await processCampaignPipeline(env, msg.campaignId);
}

/** Legacy chunk types kept for Cloudflare queue consumer compatibility. */
export interface ChunkResult {
  done: boolean;
  nextCursor: number;
  delivered: number;
}

export async function processCampaignChunk(
  env: CloudflareEnv,
  msg: CampaignQueueMessage,
): Promise<ChunkResult> {
  await processCampaignPipeline(env, msg.campaignId);
  const campaign = await getCampaignById(env.DB, msg.campaignId);
  return {
    done: true,
    nextCursor: campaign?.quantity_delivered ?? 0,
    delivered: campaign?.quantity_delivered ?? 0,
  };
}

export async function handleCampaignQueue(
  batch: MessageBatch<CampaignQueueMessage>,
  env: CloudflareEnv,
): Promise<void> {
  for (const message of batch.messages) {
    try {
      await processCampaignPipeline(env, message.body.campaignId);
      message.ack();
    } catch (err) {
      console.error("Queue message failed:", err instanceof Error ? err.message : err);
      message.retry();
    }
  }
}

/** @deprecated Legacy helper — retained for staging cache compatibility. */
export type { ExtractedLeadData };
