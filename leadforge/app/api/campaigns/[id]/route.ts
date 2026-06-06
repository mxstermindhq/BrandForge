import type { NextRequest } from "next/server";
import {
  addCredits,
  getCampaignById,
  getCampaignLeadBreakdown,
  updateCampaignStatus,
} from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { authed, campaignToView } from "@/lib/route-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const { id } = await params;
    const campaign = await getCampaignById(env.DB, id);
    if (!campaign || campaign.user_id !== session.userId) {
      return fail(404, "Campaign not found");
    }
    const breakdown = await getCampaignLeadBreakdown(env.DB, id);
    return ok({ campaign: campaignToView(campaign), breakdown });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const { id } = await params;
    const campaign = await getCampaignById(env.DB, id);
    if (!campaign || campaign.user_id !== session.userId) {
      return fail(404, "Campaign not found");
    }
    if (campaign.status !== "queued" && campaign.status !== "failed") {
      return fail(409, "Only queued or failed campaigns can be cancelled");
    }

    // Soft-delete + refund the unused credits.
    await updateCampaignStatus(env.DB, id, { status: "cancelled" });
    if (campaign.credits_used > 0) {
      await addCredits(env.DB, session.userId, campaign.credits_used);
    }
    return ok({ ok: true }, "Campaign cancelled and credits refunded");
  } catch (err) {
    return handleError(err);
  }
}
