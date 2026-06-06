import type { NextRequest } from "next/server";
import { getLeadsByUser } from "@/lib/db";
import { handleError, ok, parsePagination } from "@/lib/http";
import { authed } from "@/lib/route-helpers";
import { parseLeadFilters } from "@/lib/lead-filters";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const filters = parseLeadFilters(url);
    const result = await getLeadsByUser(env.DB, session.userId, filters, page, limit);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
