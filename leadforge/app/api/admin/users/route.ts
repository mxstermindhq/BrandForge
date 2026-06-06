import type { NextRequest } from "next/server";
import { handleError, ok, parsePagination } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";
import type { AdminUserRow } from "@/types";

interface Row {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  created_at: string;
  balance: number | null;
  lifetime_purchased: number | null;
  campaign_count: number;
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const url = new URL(request.url);
    const { page, limit } = parsePagination(url);
    const offset = (page - 1) * limit;

    const countRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first<{
      c: number;
    }>();
    const total = countRow?.c ?? 0;

    const { results } = await env.DB.prepare(
      `SELECT
         u.id, u.email, u.name, u.is_admin, u.created_at,
         c.balance, c.lifetime_purchased,
         (SELECT COUNT(*) FROM campaigns WHERE user_id = u.id) AS campaign_count
       FROM users u
       LEFT JOIN credits c ON c.user_id = u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all<Row>();

    const items: AdminUserRow[] = (results ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      is_admin: r.is_admin === 1,
      balance: r.balance ?? 0,
      lifetime_purchased: r.lifetime_purchased ?? 0,
      campaign_count: r.campaign_count,
      created_at: r.created_at,
    }));

    return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)), limit });
  } catch (err) {
    return handleError(err);
  }
}
