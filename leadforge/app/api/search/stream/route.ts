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
import { extractPersona, enrichLeadWithPersona, scoreToFitLabel } from "@/lib/gemini";
import { leadToStreamLead } from "@/lib/stream-lead";
import type { LeadCreateInput } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const VALID_CHANNELS = VALID_SEARCH_CHANNELS as readonly string[];

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
  } | null;

  const persona_text = body?.persona_text?.trim() ?? "";
  const quantity = Math.min(5000, Math.max(1, Number(body?.quantity) || 25));
  const product = body?.product?.trim() ?? "";

  if (!persona_text) {
    return Response.json({ success: false, error: "persona_text is required" }, { status: 400 });
  }

  const selectedChannels = (body?.channels ?? []).filter((c) => VALID_CHANNELS.includes(c));
  if (selectedChannels.length === 0) {
    return Response.json({ success: false, error: "Select at least one channel" }, { status: 400 });
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

      const leadsPerChannel = Math.ceil(quantity / selectedChannels.length);
      const seen = new Set<string>();
      const progress = { totalFound: 0 };
      let campaignId = "";

      try {
        send("status", { message: "Analyzing your buyer description..." });
        const persona = await extractPersona(persona_text, env.GEMINI_API_KEY, env.GEMINI_MODEL);
        send("persona", persona);

        const activeChannels =
          selectedChannels.length > 0 ? selectedChannels : persona.suggested_channels.slice(0, 4);

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
          platforms: activeChannels,
          enrich: true,
          credits_used: 0,
          status: "running",
          persona_text,
          extracted_persona: persona,
        });
        campaignId = campaign.id;
        send("campaign", { id: campaign.id });

        const channelPromises = activeChannels.map(async (channel: string) => {
          send("channel_start", { channel, query: buildChannelQuery(persona, channel) });
          let channelFound = 0;

          try {
            const rawLeads = await searchChannel(
              channel,
              persona,
              leadsPerChannel,
              searchKeys,
            );

            for (const raw of rawLeads) {
              if (progress.totalFound >= quantity) break;

              const dedupeKey = raw.url || raw.name.toLowerCase();
              if (seen.has(dedupeKey)) continue;
              seen.add(dedupeKey);

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

              const leadInput = rawToLeadInput(raw, enriched, campaign.id, userId, channel);
              const saved = await createLead(env.DB, leadInput);
              progress.totalFound++;
              channelFound++;
              send("lead", leadToStreamLead(saved));
            }

            send("channel_done", { channel, found: channelFound });
          } catch (err) {
            send("channel_error", {
              channel,
              error: err instanceof Error ? err.message : "Channel search failed",
            });
          }
        });

        await Promise.allSettled(channelPromises);

        const actualCost = Math.max(1, progress.totalFound);
        if (progress.totalFound > 0) {
          await deductCredits(env.DB, userId, actualCost);
        }
        await updateCampaignStatus(env.DB, campaignId, {
          status: progress.totalFound > 0 ? "complete" : "failed",
          quantity_delivered: progress.totalFound,
          credits_used: progress.totalFound > 0 ? actualCost : 0,
          completed_at: new Date().toISOString(),
          error_message: progress.totalFound === 0 ? "No leads found" : null,
        });

        send("done", {
          campaign_id: campaignId,
          total: progress.totalFound,
          credits_used: progress.totalFound > 0 ? actualCost : 0,
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
