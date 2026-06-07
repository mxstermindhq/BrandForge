import type { NextRequest } from "next/server";
import { getCampaignById, getLeadById } from "@/lib/db";
import { generateColdEmail } from "@/lib/gemini";
import { fail, handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";
import type { ProductContext } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const { id } = await params;

    const lead = await getLeadById(env.DB, id);
    if (!lead || lead.user_id !== session.userId) return fail(404, "Lead not found");

    const campaign = await getCampaignById(env.DB, lead.campaign_id);
    if (!campaign) return fail(404, "Campaign not found");

    const product: ProductContext = {
      type: campaign.type,
      product_name: campaign.product_name,
      product_description: campaign.product_description,
      target_description: campaign.target_description,
      price_point: campaign.price_point,
    };

    const email = await generateColdEmail(lead, product, env.GEMINI_API_KEY, env.GEMINI_MODEL);
    return ok(email);
  } catch (err) {
    return handleError(err);
  }
}
