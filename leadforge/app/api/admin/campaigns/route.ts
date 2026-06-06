import type { NextRequest } from "next/server";
import { handleError, ok, parsePagination } from "@/lib/http";
import { adminAuthed, campaignToView } from "@/lib/route-helpers";
import type { Campaign } from "@/types";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const offset = (page - 1) * limit;
    const status = url.searchParams.get("status");

    const where = status ? "WHERE status = ?" : "";
    const whereBinds = status ? [status] : [];

    const countRow = await env.DB.prepare(
      `SELECT COUNT(*) AS c FROM campaigns ${where}`,
    )
      .bind(...whereBinds)
      .first<{ c: number }>();
    const total = countRow?.c ?? 0;

    const { results } = await env.DB.prepare(
      `SELECT * FROM campaigns ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(...whereBinds, limit, offset)
      .all<Campaign>();

    return ok({
      items: (results ?? []).map(campaignToView),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (err) {
    return handleError(err);
  }
}
