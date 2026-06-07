"use client";

import * as React from "react";
import Link from "next/link";
import { useMe } from "@/components/app/AppShell";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { apiFetch } from "@/lib/client/api";
import type { CampaignView, LeadStats, PaginatedResponse } from "@/types";

export default function DashboardPage(): React.JSX.Element {
  const { me } = useMe();
  const [stats, setStats] = React.useState<LeadStats | null>(null);
  const [campaigns, setCampaigns] = React.useState<CampaignView[] | null>(null);

  React.useEffect(() => {
    apiFetch<LeadStats>("/api/leads/stats").then(setStats).catch(() => setStats(null));
    apiFetch<PaginatedResponse<CampaignView>>("/api/campaigns?limit=5")
      .then((r) => setCampaigns(r.items))
      .catch(() => setCampaigns([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-light">
            Welcome back, {me.user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-tx-muted">Here&apos;s how your pipeline is doing.</p>
        </div>
      </div>

      <Link
        href="/search"
        className="mt-8 block rounded-xl border border-gold/30 bg-gold-bg p-6 transition hover:border-gold"
      >
        <p className="text-xs uppercase tracking-widest text-gold">Start here</p>
        <h2 className="mt-2 font-display text-2xl font-light">Start a new search</h2>
        <p className="mt-1 text-sm text-tx-muted">
          Paste your website — we analyze your buyers and scrape matching leads live.
        </p>
      </Link>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credits" value={me.credits.balance.toLocaleString()} accent />
        <StatCard label="Total leads" value={stats ? stats.total.toLocaleString() : "—"} />
        <StatCard label="Hot (70+)" value={stats ? stats.hot.toLocaleString() : "—"} />
        <StatCard
          label="With email"
          value={
            stats
              ? stats.total > 0
                ? `${stats.emailCoveragePct}% (${stats.withEmail})`
                : stats.withEmail.toLocaleString()
              : "—"
          }
        />
      </div>

      {stats && stats.total > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="New" value={stats.new} />
          <StatCard label="Contacted" value={stats.contacted} />
          <StatCard label="Qualified" value={stats.qualified} />
          <StatCard label="Avg score" value={stats.avgScore} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-2xl font-light">Recent campaigns</h2>
        <Link href="/campaigns" className="text-sm text-gold hover:underline">
          View all →
        </Link>
      </div>

      <div className="mt-4">
        {campaigns === null ? (
          <div className="flex justify-center py-10 text-gold">
            <Spinner />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            body="Launch your first campaign to start collecting enriched leads."
            action={
              <Link href="/search">
                <Button>Start a search</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <Card className="flex items-center justify-between p-4 hover:border-border-hover">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-tx-muted">
                      {c.type.toUpperCase()} · {c.quantity_delivered}/{c.quantity_requested} leads
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
