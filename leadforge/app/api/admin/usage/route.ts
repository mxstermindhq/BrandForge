import type { NextRequest } from "next/server";
import { getModelUsage } from "@/lib/admin-telemetry";
import { handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await adminAuthed(request);
    const limit = Number(request.nextUrl.searchParams.get("recent") ?? "50");
    const result = await getModelUsage({ recentLimit: limit });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
