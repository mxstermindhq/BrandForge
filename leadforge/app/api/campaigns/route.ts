import type { NextRequest } from "next/server";
import { waitUntil } from "@/lib/cloudflare";
import { calculateCampaignCost } from "@/lib/constants";
import {
  createCampaign,
  deductCredits,
  getCampaignsByUser,
} from "@/lib/db";
import { driveCampaign } from "@/workers/campaign-processor";
import { fail, handleError, jsonResponse, ok, parsePagination } from "@/lib/http";
import { authed, campaignToView } from "@/lib/route-helpers";
import { ValidationError, validateCampaignInput } from "@/lib/validation";
import type { CampaignQueueMessage } from "@/types";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const body = await request.json().catch(() => null);
    const input = validateCampaignInput(body, session.userId);

    const cost = calculateCampaignCost(
      input.quantity_requested,
      input.platforms,
      input.enrich,
    );

    // Atomic conditional deduction — fails if balance is insufficient.
    const deducted = await deductCredits(env.DB, session.userId, cost);
    if (!deducted) {
      return fail(402, "Insufficient credits for this campaign");
    }

    const campaign = await createCampaign(env.DB, { ...input, credits_used: cost });

    const message: CampaignQueueMessage = {
      campaignId: campaign.id,
      userId: session.userId,
      cursor: 0,
    };

    if (process.env.NODE_ENV === "production") {
      // Production: decouple via the queue (chunked continuation in the consumer).
      await env.CAMPAIGN_QUEUE.send(message);
    } else {
      // Local dev has no queue consumer — drive the campaign in the background.
      waitUntil(driveCampaign(env, message));
    }

    return jsonResponse(
      { success: true, data: campaignToView(campaign), message: "Campaign queued" },
      201,
    );
  } catch (err) {
    if (err instanceof ValidationError) return fail(err.status, err.message);
    return handleError(err);
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const status = url.searchParams.get("status") ?? undefined;

    const result = await getCampaignsByUser(env.DB, session.userId, page, limit, status);
    return ok({
      ...result,
      items: result.items.map(campaignToView),
    });
  } catch (err) {
    return handleError(err);
  }
}
