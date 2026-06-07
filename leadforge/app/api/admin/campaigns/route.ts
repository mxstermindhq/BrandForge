import type { NextRequest } from "next/server";
import { getAdminCampaigns } from "@/lib/db";
import { handleError, ok, parsePagination } from "@/lib/http";
import { adminAuthed, campaignToView } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const status = url.searchParams.get("status");
    const result = await getAdminCampaigns(env.DB, page, limit, status);
    return ok({ ...result, items: result.items.map(campaignToView) });
  } catch (err) {
    return handleError(err);
  }
}
