import type { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { buildChannelQuery, searchChannel } from "@/lib/channel-search";
import { getEnv } from "@/lib/cloudflare";
import { calculateCampaignCost, VALID_SEARCH_CHANNELS } from "@/lib/constants";
import {
  createCampaign,
  createLead,
  deductCredits,
  getCreditBalance,
  updateCampaignStatus,
} from "@/lib/db";
import {
  extractEmailFromContactPage,
  isKnownSocialUrl,
} from "@/lib/email-extract";
import { enrichLeadWithPersona, scoreToFitLabel, textToAnalysis } from "@/lib/gemini";
import { applyClarifyingAnswers } from "@/lib/search-intent";
import { leadToStreamLead } from "@/lib/stream-lead";
import { appendAdminLog } from "@/lib/admin-telemetry";
import {
  websiteAnalysisToPersona,
  websiteAnalysisToPersonaText,
  websiteAnalysisToSiteProfile,
} from "@/lib/website-analysis-bridge";
import type {
  ExtractedPersona,
  LeadCreateInput,
  PersonaEnrichmentOutput,
  SiteBusinessProfile,
  WebsiteAnalysis,
} from "@/types";
import type { RawLead } from "@/lib/channel-search";

export const runtime = "nodejs";
export const maxDuration = 300;

const VALID_CHANNELS = VALID_SEARCH_CHANNELS as readonly string[];
const HEARTBEAT_MS = 3000;

export async function POST(req: NextRequest): Promise<Response> {
  const env = getEnv();
  let session;
  try {
    session = await requireAuth(env.DB);
  } catch {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    website_analysis?: WebsiteAnalysis;
    site_url?: string;
    site?: SiteBusinessProfile;
    persona_text?: string;
    channels?: string[];
    quantity?: number;
    extracted_persona?: ExtractedPersona;
    intent_summary?: string;
    clarifying_answers?: Record<string, string>;
  } | null;

  const quantity = Math.min(5000, Math.max(1, Number(body?.quantity) || 25));
  const selectedChannels = (body?.channels ?? []).filter((c) => VALID_CHANNELS.includes(c));
  if (selectedChannels.length === 0) {
    return Response.json({ success: false, error: "Select at least one channel" }, { status: 400 });
  }

  let websiteAnalysis: WebsiteAnalysis | null = body?.website_analysis ?? null;
  let persona = body?.extracted_persona ?? null;
  let persona_text = body?.persona_text?.trim() ?? "";
  let site = body?.site;
  const site_url = body?.site_url?.trim() ?? site?.url ?? "";

  if (!websiteAnalysis && !persona_text && !body?.extracted_persona) {
    return Response.json(
      { success: false, error: "Provide website_analysis or persona_text" },
      { status: 400 },
    );
  }

  const estimatedCost = calculateCampaignCost(quantity, selectedChannels, true);
  const balance = await getCreditBalance(env.DB, session.userId);
  if (balance.balance < estimatedCost) {
    return Response.json(
      {
        success: false,
        error: `Insufficient credits. Need ~${estimatedCost}, have ${balance.balance}.`,
      },
      { status: 402 },
    );
  }

  const searchKeys = {
    provider: env.SEARCH_PROVIDER,
    serperApiKey: env.SERPER_API_KEY,
    googleCseKey: env.GOOGLE_CSE_KEY,
    googleCseCx: env.GOOGLE_CSE_CX,
  };

  const encoder = new TextEncoder();
  const userId = session.userId;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          /* client disconnected */
        }
      };

      const heartbeat = setInterval(() => {
        send("heartbeat", { ts: Date.now() });
      }, HEARTBEAT_MS);

      const leadsPerChannel = Math.ceil(quantity / selectedChannels.length);
      const seen = new Set<string>();
      let campaignId = "";

      try {
        if (!websiteAnalysis && persona_text) {
          send("status", { message: "Analyzing buyer description..." });
          websiteAnalysis = await textToAnalysis(
            persona_text,
            env.GEMINI_API_KEY,
            env.GEMINI_MODEL,
          );
        }

        if (!websiteAnalysis) {
          send("error", { message: "Run site analysis first" });
          return;
        }

        persona = websiteAnalysisToPersona(websiteAnalysis);
        if (body?.clarifying_answers && Object.keys(body.clarifying_answers).length > 0) {
          persona = applyClarifyingAnswers(persona, body.clarifying_answers);
        }

        if (!persona_text) {
          persona_text = websiteAnalysisToPersonaText(websiteAnalysis);
        }
        if (!site && site_url) {
          site = websiteAnalysisToSiteProfile(websiteAnalysis, site_url);
        }

        send("status", { message: "Scraping leads that match your ideal buyer profile..." });
        send("persona", persona);
        send("intent", {
          summary: body?.intent_summary ?? websiteAnalysis.icp.one_liner,
          channels: selectedChannels,
          site_url,
          company: websiteAnalysis.company_name,
        });

        const campaign = await createCampaign(env.DB, {
          user_id: userId,
          name: `Site: ${websiteAnalysis.company_name || persona.keywords[0] || "Lead search"}`,
          type: persona.b2b ? "b2b" : "b2c",
          product_name: websiteAnalysis.company_name,
          product_description: websiteAnalysis.product_summary,
          target_description:
            websiteAnalysis.icp.one_liner ||
            persona.titles.join(", ") ||
            persona_text.slice(0, 100),
          price_point: websiteAnalysis.price_signal || websiteAnalysis.icp.budget_range || "Unknown",
          location: persona.locations.join(", ") || null,
          quantity_requested: quantity,
          platforms: selectedChannels,
          enrich: true,
          credits_used: 0,
          status: "running",
          persona_text,
          extracted_persona: persona,
        });
        campaignId = campaign.id;
        send("campaign", { id: campaign.id });

        appendAdminLog({
          level: "info",
          source: "search/stream",
          message: `Search started: ${quantity} leads × ${selectedChannels.join(", ")}`,
          userId,
          meta: { site_url, campaign_id: campaignId, channels: selectedChannels },
        });

        send("status", {
          message: `Searching ${selectedChannels.length} channel${selectedChannels.length > 1 ? "s" : ""} in parallel...`,
        });

        for (const channel of selectedChannels) {
          send("channel_start", {
            channel,
            query: buildChannelQuery(websiteAnalysis, channel),
          });
        }

        const scrapeResults = await Promise.allSettled(
          selectedChannels.map(async (channel) => {
            const rawLeads = await searchChannel(
              channel,
              websiteAnalysis as WebsiteAnalysis,
              leadsPerChannel,
              searchKeys,
            );
            return { channel, rawLeads };
          }),
        );

        type RawItem = RawLead & { channel: string };
        const queue: RawItem[] = [];

        for (const result of scrapeResults) {
          if (result.status !== "fulfilled") {
            send("channel_error", {
              channel: "unknown",
              error: result.reason instanceof Error ? result.reason.message : "Scrape failed",
            });
            continue;
          }
          const { channel, rawLeads } = result.value;
          let channelFound = 0;
          for (const raw of rawLeads) {
            const dedupeKey = raw.url || raw.name.toLowerCase();
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);
            queue.push({ ...raw, channel });
            channelFound++;
          }
          send("channel_done", { channel, found: channelFound });
        }

        const toProcess = queue.slice(0, quantity);
        send("status", {
          message: `Found ${toProcess.length} candidates — enriching with AI (${toProcess.length} calls queued)...`,
        });

        let totalFound = 0;
        for (let i = 0; i < toProcess.length; i++) {
          let raw = toProcess[i];
          send("status", {
            message: `Enriching lead ${i + 1} of ${toProcess.length}...`,
            progress: { current: i + 1, total: toProcess.length },
          });

          if (!raw.email && raw.url && !isKnownSocialUrl(raw.url)) {
            try {
              const contacted = await extractEmailFromContactPage(raw.url);
              if (contacted.length > 0) {
                raw = {
                  ...raw,
                  email: contacted[0].email,
                  email_confidence: contacted[0].confidence,
                  email_source: contacted[0].source,
                };
              }
            } catch {
              /* best effort */
            }
          }

          const enriched = await enrichLeadWithPersona(
            raw,
            websiteAnalysis,
            env.GEMINI_API_KEY,
            env.GEMINI_MODEL,
          );

          const leadInput = rawToLeadInput(raw, enriched, campaign.id, userId, raw.channel);
          const saved = await createLead(env.DB, leadInput);
          totalFound++;
          send("lead", leadToStreamLead(saved));
        }

        const actualCost = Math.max(1, totalFound);
        if (totalFound > 0) {
          await deductCredits(env.DB, userId, actualCost);
        }
        await updateCampaignStatus(env.DB, campaignId, {
          status: totalFound > 0 ? "complete" : "failed",
          quantity_delivered: totalFound,
          credits_used: totalFound > 0 ? actualCost : 0,
          completed_at: new Date().toISOString(),
          error_message: totalFound === 0 ? "No leads found" : null,
        });

        send("done", {
          campaign_id: campaignId,
          total: totalFound,
          credits_used: totalFound > 0 ? actualCost : 0,
        });
        appendAdminLog({
          level: "info",
          source: "search/stream",
          message: `Search complete: ${totalFound} leads, ${totalFound > 0 ? actualCost : 0} credits`,
          userId,
          meta: { campaign_id: campaignId, total: totalFound },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Search failed";
        if (campaignId) {
          await updateCampaignStatus(env.DB, campaignId, {
            status: "failed",
            error_message: errMsg,
          }).catch(() => undefined);
        }
        appendAdminLog({
          level: "error",
          source: "search/stream",
          message: errMsg,
          userId,
          meta: { campaign_id: campaignId || null },
        });
        send("error", { message: errMsg });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function rawToLeadInput(
  raw: RawLead,
  enriched: PersonaEnrichmentOutput,
  campaignId: string,
  userId: string,
  channel: string,
): LeadCreateInput {
  const score = enriched.score;
  return {
    campaign_id: campaignId,
    user_id: userId,
    platform_source: channel,
    company_name: enriched.company_name || raw.company || null,
    contact_name: enriched.contact_name || raw.name || null,
    email: enriched.email_guess || raw.email || null,
    email_confidence: enriched.email_confidence ?? raw.email_confidence ?? null,
    email_source: enriched.email_source ?? raw.email_source ?? null,
    company_domain: enriched.company_domain || null,
    website: raw.url || null,
    linkedin_url: raw.linkedin || null,
    twitter_handle: raw.twitter || null,
    instagram_url: raw.instagram || null,
    location: enriched.location_guess || null,
    niche: raw.title || null,
    score,
    fit_label: scoreToFitLabel(score),
    estimated_size: enriched.estimated_company_size,
    pitch_angle: enriched.pitch_angle,
    score_reason: enriched.score_reason,
    fit_tags: enriched.fit_tags,
    likely_pain: enriched.likely_pain,
    best_contact_channel: enriched.best_contact_channel,
    location_guess: enriched.location_guess,
    likely_needs: enriched.likely_pain ? [enriched.likely_pain] : [],
    raw_data: JSON.stringify({ bio: raw.bio, platform: raw.platform }),
  };
}
