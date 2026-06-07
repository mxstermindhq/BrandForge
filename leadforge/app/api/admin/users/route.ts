import type { NextRequest } from "next/server";
import { getAdminUsers } from "@/lib/db";
import { handleError, ok, parsePagination } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const result = await getAdminUsers(env.DB, page, limit);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
