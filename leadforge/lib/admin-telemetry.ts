import { waitUntil } from "@/lib/runtime";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminLogEntry, AdminLogLevel, ModelUsageEvent, ModelUsageSummary } from "@/types";

export interface LogInput {
  level: AdminLogLevel;
  source: string;
  message: string;
  meta?: Record<string, unknown>;
  userId?: string | null;
}

export interface UsageInput {
  provider: string;
  model?: string;
  operation: string;
  success: boolean;
  durationMs?: number;
  userId?: string | null;
  meta?: Record<string, unknown>;
}

/** PostgREST uses PGRST205; Postgres uses 42P01 — treat both as "run migration". */
export function isMissingTelemetryTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205" || error.code === "PGRST116") {
    return true;
  }
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("could not find the table") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function getDb() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

/** Fire-and-forget structured log (also mirrors to console). */
export function appendAdminLog(input: LogInput): void {
  const { level, source, message, meta, userId } = input;
  const prefix = `[${source}]`;
  if (level === "error") console.error(prefix, message, meta ?? "");
  else if (level === "warn") console.warn(prefix, message, meta ?? "");
  else console.log(prefix, message);

  const db = getDb();
  if (!db) return;

  waitUntil(
    (async () => {
      const { error } = await db.from("admin_logs").insert({
        level,
        source,
        message: message.slice(0, 4000),
        meta: meta ?? {},
        user_id: userId ?? null,
      });
      if (isMissingTelemetryTable(error)) return;
      if (error) console.warn("[admin-telemetry] log insert failed:", error.message);
    })(),
  );
}

/** Record an external API / model call. */
export function recordModelUsage(input: UsageInput): void {
  const db = getDb();
  if (!db) return;

  waitUntil(
    (async () => {
      const { error } = await db.from("model_usage").insert({
        provider: input.provider,
        model: input.model ?? "",
        operation: input.operation,
        success: input.success,
        duration_ms: Math.max(0, Math.round(input.durationMs ?? 0)),
        user_id: input.userId ?? null,
        meta: input.meta ?? {},
      });
      if (isMissingTelemetryTable(error)) return;
      if (error) console.warn("[admin-telemetry] usage insert failed:", error.message);
    })(),
  );
}

export async function getAdminLogs(options: {
  limit?: number;
  level?: AdminLogLevel | "";
  source?: string;
}): Promise<{ items: AdminLogEntry[]; tableReady: boolean; hint?: string }> {
  const db = getDb();
  if (!db) {
    return {
      items: [],
      tableReady: false,
      hint: "Supabase admin client unavailable — check env vars.",
    };
  }

  const limit = Math.min(200, Math.max(1, options.limit ?? 100));
  let q = db
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options.level) q = q.eq("level", options.level);
  if (options.source?.trim()) q = q.ilike("source", `%${options.source.trim()}%`);

  const { data, error } = await q;
  if (isMissingTelemetryTable(error)) {
    return {
      items: [],
      tableReady: false,
      hint: "Run supabase/migration-admin-telemetry.sql in Supabase SQL Editor.",
    };
  }
  if (error) {
    console.warn("[admin-telemetry] getAdminLogs:", error.message);
    return { items: [], tableReady: false, hint: error.message };
  }

  return {
    tableReady: true,
    items: (data ?? []).map(mapLogRow),
  };
}

export async function getModelUsage(options: {
  recentLimit?: number;
}): Promise<{
  summary: ModelUsageSummary[];
  recent: ModelUsageEvent[];
  tableReady: boolean;
  hint?: string;
}> {
  const db = getDb();
  if (!db) {
    return {
      summary: [],
      recent: [],
      tableReady: false,
      hint: "Supabase admin client unavailable — check env vars.",
    };
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [allRes, recentRes] = await Promise.all([
    db
      .from("model_usage")
      .select("provider, model, operation, success, duration_ms, created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(5000),
    db
      .from("model_usage")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(100, options.recentLimit ?? 50)),
  ]);

  const tableErr = allRes.error ?? recentRes.error;
  if (isMissingTelemetryTable(tableErr)) {
    return {
      summary: [],
      recent: [],
      tableReady: false,
      hint: "Run supabase/migration-admin-telemetry.sql in Supabase SQL Editor.",
    };
  }
  if (allRes.error) {
    console.warn("[admin-telemetry] getModelUsage aggregate:", allRes.error.message);
    return { summary: [], recent: [], tableReady: false, hint: allRes.error.message };
  }
  if (recentRes.error) {
    console.warn("[admin-telemetry] getModelUsage recent:", recentRes.error.message);
    return { summary: [], recent: [], tableReady: false, hint: recentRes.error.message };
  }

  const buckets = new Map<string, ModelUsageSummary>();

  for (const row of allRes.data ?? []) {
    const provider = String(row.provider);
    const model = String(row.model ?? "");
    const operation = String(row.operation);
    const key = `${provider}|${model}|${operation}`;
    const existing = buckets.get(key) ?? {
      provider,
      model,
      operation,
      call_count: 0,
      success_count: 0,
      error_count: 0,
      calls_24h: 0,
      total_duration_ms: 0,
      avg_duration_ms: 0,
      last_called_at: "",
    };
    existing.call_count += 1;
    if (row.success) existing.success_count += 1;
    else existing.error_count += 1;
    existing.total_duration_ms += Number(row.duration_ms ?? 0);
    const created = String(row.created_at);
    if (created >= since24h) existing.calls_24h += 1;
    if (!existing.last_called_at || created > existing.last_called_at) {
      existing.last_called_at = created;
    }
    buckets.set(key, existing);
  }

  const summary = [...buckets.values()]
    .map((s) => ({
      ...s,
      avg_duration_ms:
        s.call_count > 0 ? Math.round(s.total_duration_ms / s.call_count) : 0,
    }))
    .sort((a, b) => b.call_count - a.call_count);

  return {
    summary,
    recent: (recentRes.data ?? []).map(mapUsageRow),
    tableReady: true,
  };
}

function mapLogRow(row: Record<string, unknown>): AdminLogEntry {
  return {
    id: String(row.id),
    level: row.level as AdminLogEntry["level"],
    source: String(row.source),
    message: String(row.message),
    meta: (row.meta as Record<string, unknown>) ?? {},
    user_id: row.user_id ? String(row.user_id) : null,
    created_at: String(row.created_at),
  };
}

function mapUsageRow(row: Record<string, unknown>): ModelUsageEvent {
  return {
    id: String(row.id),
    provider: String(row.provider),
    model: String(row.model ?? ""),
    operation: String(row.operation),
    success: Boolean(row.success),
    duration_ms: Number(row.duration_ms ?? 0),
    user_id: row.user_id ? String(row.user_id) : null,
    meta: (row.meta as Record<string, unknown>) ?? {},
    created_at: String(row.created_at),
  };
}
