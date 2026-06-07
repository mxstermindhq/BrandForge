"use client";

import * as React from "react";
import { Card, Spinner } from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import type {
  AdminKeyStatus,
  AdminLogEntry,
  AdminLogLevel,
  AdminSystemInfo,
  ModelUsageEvent,
  ModelUsageSummary,
} from "@/types";

type Tab = "system" | "usage" | "logs";

const CATEGORY_ORDER: AdminKeyStatus["category"][] = [
  "ai",
  "search",
  "billing",
  "email",
  "auth",
  "integrations",
];

const LEVEL_COLORS: Record<AdminLogLevel, string> = {
  debug: "text-tx-muted",
  info: "text-status-new",
  warn: "text-status-contacted",
  error: "text-red-400",
};

export function AdminOpsPanel(): React.JSX.Element {
  const [tab, setTab] = React.useState<Tab>("system");
  const [system, setSystem] = React.useState<AdminSystemInfo | null>(null);
  const [usageSummary, setUsageSummary] = React.useState<ModelUsageSummary[]>([]);
  const [usageRecent, setUsageRecent] = React.useState<ModelUsageEvent[]>([]);
  const [usageReady, setUsageReady] = React.useState(true);
  const [logs, setLogs] = React.useState<AdminLogEntry[]>([]);
  const [logsReady, setLogsReady] = React.useState(true);
  const [logLevel, setLogLevel] = React.useState<AdminLogLevel | "">("");
  const [loading, setLoading] = React.useState(false);

  const loadSystem = React.useCallback(() => {
    apiFetch<AdminSystemInfo>("/api/admin/system").then(setSystem).catch(() => setSystem(null));
  }, []);

  const loadUsage = React.useCallback(() => {
    setLoading(true);
    apiFetch<{ summary: ModelUsageSummary[]; recent: ModelUsageEvent[]; tableReady: boolean }>(
      "/api/admin/usage?recent=50",
    )
      .then((r) => {
        setUsageSummary(r.summary);
        setUsageRecent(r.recent);
        setUsageReady(r.tableReady);
      })
      .catch(() => {
        setUsageSummary([]);
        setUsageRecent([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadLogs = React.useCallback(() => {
    setLoading(true);
    const q = logLevel ? `?level=${logLevel}&limit=150` : "?limit=150";
    apiFetch<{ items: AdminLogEntry[]; tableReady: boolean }>(`/api/admin/logs${q}`)
      .then((r) => {
        setLogs(r.items);
        setLogsReady(r.tableReady);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [logLevel]);

  React.useEffect(() => {
    loadSystem();
  }, [loadSystem]);

  React.useEffect(() => {
    if (tab === "usage") loadUsage();
    if (tab === "logs") loadLogs();
  }, [tab, loadUsage, loadLogs]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "system", label: "API keys & models" },
    { id: "usage", label: "Model usage" },
    { id: "logs", label: "Logs" },
  ];

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-light">System & telemetry</h2>
          <p className="mt-1 text-sm text-tx-muted">
            Masked keys only — full secrets never leave the server.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded px-3 py-1.5 font-mono text-[10px] transition ${
                tab === t.id
                  ? "bg-gold text-bg"
                  : "text-tx-muted hover:text-tx"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "system" && (
        <div className="mt-6 space-y-6">
          {!system ? (
            <div className="flex justify-center py-10 text-gold">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Runtime", value: system.runtime },
                  { label: "App env", value: system.appEnv },
                  { label: "Search provider", value: system.searchProvider },
                  { label: "Admin email", value: system.adminEmail ?? "—" },
                ].map((item) => (
                  <Card key={item.label} className="p-4">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-tx-subtle">
                      {item.label}
                    </p>
                    <p className="mt-2 font-mono text-xs text-tx">{item.value}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-gold">
                  Active models
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded border border-border bg-bg px-4 py-3">
                    <p className="text-xs text-tx-muted">Gemini</p>
                    <p className="mt-1 font-mono text-sm">{system.models.gemini}</p>
                  </div>
                  <div className="rounded border border-border bg-bg px-4 py-3">
                    <p className="text-xs text-tx-muted">Groq (fallback)</p>
                    <p className="mt-1 font-mono text-sm">{system.models.groq}</p>
                  </div>
                </div>
              </Card>

              {CATEGORY_ORDER.map((cat) => {
                const keys = system.keys.filter((k) => k.category === cat);
                if (keys.length === 0) return null;
                return (
                  <Card key={cat} className="overflow-hidden">
                    <p className="border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-gold">
                      {cat}
                    </p>
                    <table className="w-full text-sm">
                      <tbody>
                        {keys.map((k) => (
                          <tr key={k.envVar} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-3">
                              <p className="text-tx">{k.label}</p>
                              <p className="font-mono text-[10px] text-tx-muted">{k.envVar}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] ${
                                  k.configured
                                    ? "bg-gold-bg text-gold"
                                    : "bg-bg-raised text-tx-muted"
                                }`}
                              >
                                {k.configured ? "configured" : "missing"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-tx-muted">
                              {k.preview ?? "—"}
                            </td>
                            <td className="hidden px-4 py-3 text-xs text-tx-muted md:table-cell">
                              {k.note ?? ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab === "usage" && (
        <div className="mt-6 space-y-6">
          {!usageReady && (
            <div className="rounded-lg border border-gold/30 bg-gold-bg/20 px-4 py-3 text-sm text-tx-muted">
              Run <code className="text-gold">supabase/migration-admin-telemetry.sql</code> in
              Supabase to enable usage tracking.
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={loadUsage}
              className="rounded border border-border px-3 py-1.5 font-mono text-[10px] text-tx-muted hover:border-gold hover:text-gold"
            >
              Refresh
            </button>
          </div>
          {loading && usageSummary.length === 0 ? (
            <div className="flex justify-center py-10 text-gold">
              <Spinner />
            </div>
          ) : (
            <>
              <Card className="overflow-hidden">
                <p className="border-b border-border px-4 py-3 text-xs uppercase tracking-wide text-tx-muted">
                  Aggregated by provider / model / operation
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="border-b border-border text-left text-[10px] uppercase text-tx-muted">
                      <tr>
                        <th className="px-4 py-2">Provider</th>
                        <th className="px-4 py-2">Model</th>
                        <th className="px-4 py-2">Operation</th>
                        <th className="px-4 py-2">Calls</th>
                        <th className="px-4 py-2">24h</th>
                        <th className="px-4 py-2">OK / Err</th>
                        <th className="px-4 py-2">Avg ms</th>
                        <th className="px-4 py-2">Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageSummary.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-tx-muted">
                            No usage recorded yet — run a search to populate.
                          </td>
                        </tr>
                      ) : (
                        usageSummary.map((u) => (
                          <tr
                            key={`${u.provider}-${u.model}-${u.operation}`}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="px-4 py-2 font-mono text-xs">{u.provider}</td>
                            <td className="px-4 py-2 font-mono text-xs text-tx-muted">
                              {u.model || "—"}
                            </td>
                            <td className="px-4 py-2 text-xs">{u.operation}</td>
                            <td className="px-4 py-2 font-mono">{u.call_count}</td>
                            <td className="px-4 py-2 font-mono text-gold">{u.calls_24h}</td>
                            <td className="px-4 py-2 font-mono text-xs">
                              <span className="text-status-qualified">{u.success_count}</span>
                              {" / "}
                              <span className="text-red-400">{u.error_count}</span>
                            </td>
                            <td className="px-4 py-2 font-mono text-xs">{u.avg_duration_ms}</td>
                            <td className="px-4 py-2 font-mono text-[10px] text-tx-muted">
                              {u.last_called_at
                                ? new Date(u.last_called_at).toLocaleString()
                                : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <p className="border-b border-border px-4 py-3 text-xs uppercase tracking-wide text-tx-muted">
                  Recent calls
                </p>
                <div className="max-h-[360px] overflow-y-auto">
                  {usageRecent.map((e) => (
                    <div
                      key={e.id}
                      className="flex flex-wrap items-center gap-2 border-b border-border/40 px-4 py-2 text-xs last:border-0"
                    >
                      <span className="font-mono text-[10px] text-tx-muted">
                        {new Date(e.created_at).toLocaleTimeString()}
                      </span>
                      <span className="font-mono text-gold">{e.provider}</span>
                      <span className="text-tx-muted">{e.model || "—"}</span>
                      <span>{e.operation}</span>
                      <span className={e.success ? "text-status-qualified" : "text-red-400"}>
                        {e.success ? "ok" : "err"}
                      </span>
                      <span className="font-mono text-tx-muted">{e.duration_ms}ms</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "logs" && (
        <div className="mt-6 space-y-4">
          {!logsReady && (
            <div className="rounded-lg border border-gold/30 bg-gold-bg/20 px-4 py-3 text-sm text-tx-muted">
              Run <code className="text-gold">supabase/migration-admin-telemetry.sql</code> in
              Supabase to persist logs. Until then, check Vercel function logs.
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value as AdminLogLevel | "")}
              className="rounded border border-border bg-bg px-3 py-1.5 font-mono text-[10px] text-tx"
            >
              <option value="">All levels</option>
              <option value="debug">debug</option>
              <option value="info">info</option>
              <option value="warn">warn</option>
              <option value="error">error</option>
            </select>
            <button
              type="button"
              onClick={loadLogs}
              className="rounded border border-border px-3 py-1.5 font-mono text-[10px] text-tx-muted hover:border-gold hover:text-gold"
            >
              Refresh
            </button>
          </div>
          <Card className="overflow-hidden">
            <div className="max-h-[520px] overflow-y-auto">
              {loading && logs.length === 0 ? (
                <div className="flex justify-center py-10 text-gold">
                  <Spinner />
                </div>
              ) : logs.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-tx-muted">No logs yet.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="border-b border-border/40 px-4 py-3 last:border-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-tx-muted">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      <span className={`font-mono text-[10px] uppercase ${LEVEL_COLORS[log.level]}`}>
                        {log.level}
                      </span>
                      <span className="font-mono text-[10px] text-gold">{log.source}</span>
                    </div>
                    <p className="mt-1 text-sm text-tx">{log.message}</p>
                    {Object.keys(log.meta).length > 0 && (
                      <pre className="mt-1 overflow-x-auto font-mono text-[10px] text-tx-muted">
                        {JSON.stringify(log.meta, null, 0)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
