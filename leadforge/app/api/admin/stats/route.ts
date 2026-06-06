import type { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/http";
import { adminAuthed } from "@/lib/route-helpers";
import type { AdminStats } from "@/types";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { env } = await adminAuthed(request);
    const db = env.DB;

    const [users, campaigns, leads, revenue, completion, today] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS c FROM users").first<{ c: number }>(),
      db.prepare("SELECT COUNT(*) AS c FROM campaigns").first<{ c: number }>(),
      db.prepare("SELECT COUNT(*) AS c FROM leads").first<{ c: number }>(),
      db
        .prepare(
          "SELECT COALESCE(SUM(amount_cents),0) AS s FROM transactions WHERE status = 'complete'",
        )
        .first<{ s: number }>(),
      db
        .prepare(
          `SELECT
             AVG(CASE WHEN quantity_requested > 0
               THEN CAST(quantity_delivered AS REAL) / quantity_requested ELSE 0 END) AS r
           FROM campaigns WHERE status IN ('complete','running','failed')`,
        )
        .first<{ r: number | null }>(),
      db
        .prepare(
          "SELECT COUNT(*) AS c FROM leads WHERE date(created_at) = date('now')",
        )
        .first<{ c: number }>(),
    ]);

    const stats: AdminStats = {
      totalUsers: users?.c ?? 0,
      totalCampaigns: campaigns?.c ?? 0,
      totalLeads: leads?.c ?? 0,
      totalRevenueCents: revenue?.s ?? 0,
      avgCompletionRate: Math.min(1, Math.max(0, completion?.r ?? 0)),
      leadsDeliveredToday: today?.c ?? 0,
    };
    return ok(stats);
  } catch (err) {
    return handleError(err);
  }
}
