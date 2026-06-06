import type { NextRequest } from "next/server";
import { getCampaignById } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";
import type { CampaignStatusView } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const { id } = await params;
    const campaign = await getCampaignById(env.DB, id);
    if (!campaign || campaign.user_id !== session.userId) {
      return fail(404, "Campaign not found");
    }
    const view: CampaignStatusView = {
      status: campaign.status,
      quantity_delivered: campaign.quantity_delivered,
      quantity_requested: campaign.quantity_requested,
      error_message: campaign.error_message,
    };
    return ok(view);
  } catch (err) {
    return handleError(err);
  }
}
