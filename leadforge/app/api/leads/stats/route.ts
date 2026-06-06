import type { NextRequest } from "next/server";
import { getLeadStats } from "@/lib/db";
import { handleError, ok } from "@/lib/http";
import { authed } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env, session } = await authed(request);
    const stats = await getLeadStats(env.DB, session.userId);
    return ok(stats);
  } catch (err) {
    return handleError(err);
  }
}
