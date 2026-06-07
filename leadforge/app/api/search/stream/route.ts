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
import { enrichLeadWithPersona, scoreToFitLabel } from "@/lib/gemini";
import { applyClarifyingAnswers } from "@/lib/search-intent";
import { leadToStreamLead } from "@/lib/stream-lead";
import type { ExtractedPersona, LeadCreateInput } from "@/types";

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
    persona_text?: string;
    channels?: string[];
    quantity?: number;
    product?: string;
    extracted_persona?: ExtractedPersona;
    intent_summary?: string;
    clarifying_answers?: Record<string, string>;
  } | null;

  const persona_text = body?.persona_text?.trim() ?? "";
  const quantity = Math.min(5000, Math.max(1, Number(body?.quantity) || 25));
  const product = body?.product?.trim() ?? "";

  if (!persona_text) {
    return Response.json({ success: false, error: "persona_text is required" }, { status: 400 });
  }

  if (!body?.extracted_persona) {
    return Response.json(
      {
        success: false,
        error: "Run intent analysis first (/api/search/analyze) before streaming.",
      },
      { status: 400 },
    );
  }

  const selectedChannels = (body?.channels ?? []).filter((c) => VALID_CHANNELS.includes(c));
  if (selectedChannels.length === 0) {
    return Response.json({ success: false, error: "Select at least one channel" }, { status: 400 });
  }

  let persona = body.extracted_persona;
  if (body.clarifying_answers && Object.keys(body.clarifying_answers).length > 0) {
    persona = applyClarifyingAnswers(persona, body.clarifying_answers);
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
        send("status", { message: "Starting search with your confirmed buyer profile..." });
        send("persona", persona);
        send("intent", {
          summary: body?.intent_summary ?? "",
          channels: selectedChannels,
        });

        const campaign = await createCampaign(env.DB, {
          user_id: userId,
          name: `Search: ${persona.keywords[0] ?? persona_text.slice(0, 40)}`,
          type: persona.b2b ? "b2b" : "b2c",
          product_name: product || persona.product_context || "Unknown",
          product_description: persona_text,
          target_description: persona.titles.join(", ") || persona_text.slice(0, 100),
          price_point: persona.budget_signal || "Unknown",
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

        send("status", {
          message: `Searching ${selectedChannels.length} channel${selectedChannels.length > 1 ? "s" : ""} in parallel...`,
        });

        for (const channel of selectedChannels) {
          send("channel_start", { channel, query: buildChannelQuery(persona, channel) });
        }

        const scrapeResults = await Promise.allSettled(
          selectedChannels.map(async (channel) => {
            const rawLeads = await searchChannel(
              channel,
              persona,
              leadsPerChannel,
              searchKeys,
            );
            return { channel, rawLeads };
          }),
        );

        type RawItem = Awaited<ReturnType<typeof searchChannel>>[number] & { channel: string };
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
          const raw = toProcess[i];
          send("status", {
            message: `Enriching lead ${i + 1} of ${toProcess.length}...`,
            progress: { current: i + 1, total: toProcess.length },
          });

          let enriched;
          try {
            enriched = await enrichLeadWithPersona(
              raw,
              persona,
              env.GEMINI_API_KEY,
              env.GEMINI_MODEL,
            );
          } catch (err) {
            const reason = err instanceof Error ? err.message : "Unknown error";
            console.warn(`[search] enrich failed for ${raw.name}:`, reason);
            enriched = {
              score: 30,
              score_reason: `Enrichment failed: ${reason}`,
              fit_tags: [] as string[],
              pitch_angle: "",
              likely_pain: "",
              best_contact_channel: "email",
              estimated_company_size: "unknown",
              location_guess: "",
              email_guess: raw.email ?? "",
              contact_name: raw.name,
              company_name: raw.company || "Unknown",
            };
          }

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
      } catch (err) {
        if (campaignId) {
          await updateCampaignStatus(env.DB, campaignId, {
            status: "failed",
            error_message: err instanceof Error ? err.message : "Search failed",
          }).catch(() => undefined);
        }
        send("error", { message: err instanceof Error ? err.message : "Search failed" });
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
  raw: {
    name: string;
    title: string;
    company: string;
    url: string;
    bio: string;
    email?: string;
    platform: string;
  },
  enriched: {
    score: number;
    score_reason: string;
    fit_tags: string[];
    pitch_angle: string;
    likely_pain: string;
    best_contact_channel: string;
    estimated_company_size: string;
    location_guess: string;
    email_guess: string;
    contact_name: string;
    company_name: string;
  },
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
    website: raw.url || null,
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
