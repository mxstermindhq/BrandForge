"use client";

import * as React from "react";
import {
  Button,
  Card,
  EmptyState,
  FitBadge,
  Input,
  Select,
  Spinner,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import { PLATFORMS } from "@/lib/constants";
import type { Lead, LeadStatus, PaginatedResponse } from "@/types";
import { LeadDrawer } from "@/components/leads/LeadDrawer";

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "rejected"];

export function LeadsView({ campaignId }: { campaignId?: string }): React.JSX.Element {
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [sortBy, setSortBy] = React.useState("created_at");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<Lead> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<Lead | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);

  const buildQuery = React.useCallback(
    (forExport = false): string => {
      const sp = new URLSearchParams();
      if (campaignId) sp.set("campaignId", campaignId);
      if (q.trim()) sp.set("q", q.trim());
      if (status) sp.set("status", status);
      if (platform) sp.set("platform", platform);
      sp.set("sortBy", sortBy);
      sp.set("sortDir", sortBy === "company_name" ? "asc" : "desc");
      if (!forExport) {
        sp.set("page", String(page));
        sp.set("limit", "20");
      }
      return sp.toString();
    },
    [campaignId, q, status, platform, sortBy, page],
  );

  const load = React.useCallback(() => {
    setLoading(true);
    apiFetch<PaginatedResponse<Lead>>(`/api/leads?${buildQuery()}`)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, page: 1, totalPages: 1, limit: 20 }))
      .finally(() => setLoading(false));
  }, [buildQuery]);

  React.useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0); // debounce search
    return () => clearTimeout(t);
  }, [load, q]);

  React.useEffect(() => setPage(1), [q, status, platform, sortBy]);

  function patchLeadLocal(updated: Lead): void {
    setData((d) =>
      d ? { ...d, items: d.items.map((l) => (l.id === updated.id ? updated : l)) } : d,
    );
    setActive((a) => (a && a.id === updated.id ? updated : a));
  }

  async function setLeadStatus(lead: Lead, next: LeadStatus): Promise<void> {
    const updated = await apiFetch<Lead>(`/api/leads/${lead.id}`, {
      method: "PATCH",
      json: { status: next },
    });
    patchLeadLocal(updated);
  }

  // Download as a blob so the browser always triggers a file save (a plain
  // <a href> to the API route gets intercepted by the client router and can't
  // surface auth/empty errors).
  async function exportCsv(): Promise<void> {
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch(`/api/leads/export?${buildQuery(true)}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        let message = `Export failed (${res.status})`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) message = body.error;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] ?? `leadforge-export-${new Date().toISOString().slice(0, 10)}.csv`;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search company, email, niche…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-40">
          <option value="">All sources</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40">
          <option value="created_at">Newest</option>
          <option value="score">Top score</option>
          <option value="company_name">Company A–Z</option>
        </Select>
        <Button
          variant="secondary"
          className="ml-auto"
          loading={exporting}
          disabled={exporting || (data?.total ?? 0) === 0}
          onClick={exportCsv}
        >
          Export CSV
        </Button>
      </div>
      {exportError && (
        <p className="mt-2 text-right text-sm text-red-400">{exportError}</p>
      )}

      <div className="mt-5">
        {loading && !data ? (
          <div className="flex justify-center py-16 text-gold">
            <Spinner />
          </div>
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="No leads yet"
            body="Leads will appear here as your campaigns run and enrich."
          />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-tx-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setActive(lead)}
                    className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-bg-raised"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-tx">{lead.company_name ?? "—"}</p>
                      {lead.location && (
                        <p className="text-xs text-tx-muted">{lead.location}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-tx">{lead.contact_name ?? "—"}</p>
                      <p className="text-xs text-tx-muted">{lead.email ?? "no email"}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-tx-muted">{lead.platform_source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-tx">{lead.score}</span>
                        <FitBadge label={lead.fit_label} />
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={lead.status}
                        onChange={(e) => setLeadStatus(lead, e.target.value as LeadStatus)}
                        className="w-32 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-4 text-sm">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-tx-muted">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {active && (
        <LeadDrawer
          lead={active}
          onClose={() => setActive(null)}
          onStatus={(next) => setLeadStatus(active, next)}
          onNotesSaved={patchLeadLocal}
        />
      )}
    </div>
  );
}
