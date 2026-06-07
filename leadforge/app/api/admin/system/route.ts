import type { NextRequest } from "next/server";
import { buildAdminSystemInfo } from "@/lib/admin-system";
import { handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";

/** Masked API keys, active models, and runtime info — admin only. */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    return ok(buildAdminSystemInfo(env));
  } catch (err) {
    return handleError(err);
  }
}
