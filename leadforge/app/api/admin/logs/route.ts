import type { NextRequest } from "next/server";
import { getAdminLogs } from "@/lib/admin-telemetry";
import { handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";
import type { AdminLogLevel } from "@/types";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await adminAuthed(request);
    const url = request.nextUrl;
    const level = (url.searchParams.get("level") ?? "") as AdminLogLevel | "";
    const source = url.searchParams.get("source") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "100");

    const result = await getAdminLogs({ level, source, limit });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
