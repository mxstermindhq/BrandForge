import type {
  Campaign,
  CampaignQueueMessage,
  ExtractedLeadData,
  LeadCreateInput,
  ProductContext,
} from "@/types";
import {
  ENRICH_CHUNK_SIZE,
  GEMINI_DELAY_MS,
  SCRAPE_CONCURRENCY,
} from "@/lib/constants";
import {
  createLeadsBatch,
  getCampaignById,
  getUserById,
  updateCampaignStatus,
} from "@/lib/db";
import { enrichLead } from "@/lib/gemini";
import {
  buildQuery,
  deduplicateLeads,
  extractFromURL,
  searchSerp,
} from "@/lib/scraper";
import type { SearchKeys } from "@/lib/search";
import { sendLeadsReady } from "@/lib/resend";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function candidatesKey(campaignId: string): string {
  return `campaign:${campaignId}:candidates`;
}

function nowIso(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function productContext(campaign: Campaign): ProductContext {
  return {
    type: campaign.type,
    product_name: campaign.product_name,
    product_description: campaign.product_description,
    target_description: campaign.target_description,
    price_point: campaign.price_point,
  };
}

/** Bounded concurrency map over an async fn (no external deps). */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * First-invocation work: scrape every selected platform, extract + dedupe, and
 * persist the truncated candidate set to KV so subsequent chunks can resume.
 */
async function buildCandidates(
  env: CloudflareEnv,
  campaign: Campaign,
): Promise<ExtractedLeadData[]> {
  const platforms: string[] = JSON.parse(campaign.platforms);
  const niche = campaign.product_name;
  const pagesPerQuery = Math.max(
    1,
    Math.min(3, Math.ceil(campaign.quantity_requested / 10 / platforms.length)),
  );

  const searchKeys: SearchKeys = {
    provider: env.SEARCH_PROVIDER,
    serperApiKey: env.SERPER_API_KEY,
    googleCseKey: env.GOOGLE_CSE_KEY,
    googleCseCx: env.GOOGLE_CSE_CX,
  };

  const rawResults: { url: string; platform: string }[] = [];
  for (const platform of platforms) {
    const queries = buildQuery({
      type: campaign.type,
      niche,
      location: campaign.location,
      platform,
      productDescription: campaign.product_description ?? "",
      targetDescription: campaign.target_description,
    });
    for (const query of queries) {
      const found = await searchSerp(query, pagesPerQuery, platform, searchKeys);
      for (const r of found) rawResults.push({ url: r.url, platform });
      // Pace queries to stay polite with free/keyless providers.
      await delay(800);
    }
  }

  // Extract lead data from each candidate URL with bounded concurrency.
  const extracted = await mapWithConcurrency(
    rawResults,
    SCRAPE_CONCURRENCY,
    ({ url, platform }) => extractFromURL(url, platform),
  );

  const deduped = deduplicateLeads(extracted);
  return deduped.slice(0, campaign.quantity_requested);
}

async function loadCandidates(
  env: CloudflareEnv,
  campaignId: string,
): Promise<ExtractedLeadData[] | null> {
  const raw = await env.SESSIONS.get(candidatesKey(campaignId));
  return raw ? (JSON.parse(raw) as ExtractedLeadData[]) : null;
}

function toLeadInput(
  campaign: Campaign,
  data: ExtractedLeadData,
  enrichment?: Awaited<ReturnType<typeof enrichLead>>,
): LeadCreateInput {
  return {
    campaign_id: campaign.id,
    user_id: campaign.user_id,
    platform_source: data.platform,
    company_name: enrichment?.company_name ?? data.company_name,
    contact_name: enrichment?.contact_name ?? data.contact_name,
    email: enrichment?.email ?? data.emails[0] ?? null,
    phone: data.phone,
    website: data.url,
    linkedin_url: data.linkedin_url,
    instagram_url: data.instagram_url,
    reddit_username: data.reddit_username,
    tiktok_handle: data.tiktok_handle,
    twitter_handle: data.twitter_handle,
    youtube_channel: data.youtube_channel,
    location: campaign.location,
    niche: campaign.product_name,
    score: enrichment?.score ?? 0,
    fit_label: enrichment?.fit_label ?? null,
    estimated_size: enrichment?.estimated_size ?? null,
    likely_needs: enrichment?.likely_needs ?? null,
    pitch_angle: enrichment?.pitch_angle ?? null,
    red_flags: enrichment?.red_flags ?? null,
    raw_data: JSON.stringify(data),
  };
}

export interface ChunkResult {
  done: boolean;
  nextCursor: number;
  delivered: number;
}

/**
 * Process one bounded slice of a campaign. Returns whether more work remains so
 * the caller (queue consumer) can re-enqueue a continuation message.
 */
export async function processCampaignChunk(
  env: CloudflareEnv,
  msg: CampaignQueueMessage,
): Promise<ChunkResult> {
  const campaign = await getCampaignById(env.DB, msg.campaignId);
  if (!campaign) return { done: true, nextCursor: 0, delivered: 0 };
  if (campaign.status === "cancelled" || campaign.status === "failed") {
    return { done: true, nextCursor: campaign.cursor, delivered: campaign.quantity_delivered };
  }

  const cursor = msg.cursor ?? campaign.cursor ?? 0;

  // First invocation: gather + persist candidates.
  let candidates = await loadCandidates(env, msg.campaignId);
  if (cursor === 0 || candidates === null) {
    await updateCampaignStatus(env.DB, campaign.id, { status: "running" });
    try {
      candidates = await buildCandidates(env, campaign);
    } catch (err) {
      await updateCampaignStatus(env.DB, campaign.id, {
        status: "failed",
        error_message: err instanceof Error ? err.message : "Scraping failed",
      });
      return { done: true, nextCursor: 0, delivered: 0 };
    }
    await env.SESSIONS.put(
      candidatesKey(campaign.id),
      JSON.stringify(candidates),
      { expirationTtl: 60 * 60 * 6 },
    );
  }

  const total = candidates.length;
  if (total === 0) {
    await updateCampaignStatus(env.DB, campaign.id, {
      status: "complete",
      quantity_delivered: 0,
      completed_at: nowIso(),
      cursor: 0,
    });
    await env.SESSIONS.delete(candidatesKey(campaign.id));
    return { done: true, nextCursor: 0, delivered: 0 };
  }

  const slice = candidates.slice(cursor, cursor + ENRICH_CHUNK_SIZE);
  const ctx = productContext(campaign);
  const leadInputs: LeadCreateInput[] = [];

  for (const data of slice) {
    if (campaign.enrich === 1) {
      try {
        const enrichment = await enrichLead(data, ctx, env.GEMINI_API_KEY, env.GEMINI_MODEL);
        leadInputs.push(toLeadInput(campaign, data, enrichment));
      } catch {
        // Gemini failed after retries — save the lead unenriched (graceful).
        leadInputs.push(toLeadInput(campaign, data));
      }
      await delay(GEMINI_DELAY_MS);
    } else {
      leadInputs.push(toLeadInput(campaign, data));
    }
  }

  try {
    await createLeadsBatch(env.DB, leadInputs);
  } catch {
    // D1 write failure — retry once with the same slice cursor next invocation.
    return { done: false, nextCursor: cursor, delivered: campaign.quantity_delivered };
  }

  const nextCursor = cursor + slice.length;
  const delivered = campaign.quantity_delivered + leadInputs.length;
  const done = nextCursor >= total;

  await updateCampaignStatus(env.DB, campaign.id, {
    quantity_delivered: delivered,
    cursor: nextCursor,
    status: done ? "complete" : "running",
    completed_at: done ? nowIso() : undefined,
  });

  if (done) {
    await env.SESSIONS.delete(candidatesKey(campaign.id));
    const user = await getUserById(env.DB, campaign.user_id);
    if (user) {
      const dashboardUrl = `${env.APP_URL}/campaigns/${campaign.id}`;
      await sendLeadsReady(
        env.RESEND_API_KEY,
        user.email,
        campaign.name,
        delivered,
        dashboardUrl,
      );
    }
  }

  return { done, nextCursor, delivered };
}

/** Local/queue-less driver: run chunks sequentially until the campaign finishes. */
export async function driveCampaign(
  env: CloudflareEnv,
  msg: CampaignQueueMessage,
): Promise<void> {
  let cursor = msg.cursor ?? 0;
  // Hard cap on iterations to avoid an infinite loop on persistent failure.
  for (let i = 0; i < 1000; i++) {
    const result = await processCampaignChunk(env, { ...msg, cursor });
    if (result.done) return;
    if (result.nextCursor === cursor) return; // no progress — stop
    cursor = result.nextCursor;
  }
}

/** Cloudflare Queue consumer entry. Re-enqueues a continuation when not done. */
export async function handleCampaignQueue(
  batch: MessageBatch<CampaignQueueMessage>,
  env: CloudflareEnv,
): Promise<void> {
  for (const message of batch.messages) {
    try {
      const result = await processCampaignChunk(env, message.body);
      if (!result.done) {
        await env.CAMPAIGN_QUEUE.send({
          campaignId: message.body.campaignId,
          userId: message.body.userId,
          cursor: result.nextCursor,
        });
      }
      message.ack();
    } catch (err) {
      console.error("Queue message failed:", err instanceof Error ? err.message : err);
      message.retry();
    }
  }
}
