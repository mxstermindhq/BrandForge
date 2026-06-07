import type { NextRequest } from "next/server";
import { getAdminStats } from "@/lib/db";
import { handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const stats = await getAdminStats(env.DB);
    return ok(stats);
  } catch (err) {
    return handleError(err);
  }
}
