"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { ExploreClient } from "../explore/_components/ExploreClient";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

type HomeStats = {
  totals: {
    members: number;
    chats: number;
    deals: number;
    onlineMembers?: number;
    bids?: number;
    servicesListed?: number;
    openRequests?: number;
    volumeUsd?: number;
  } | null;
  latest?: unknown;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4">
      <p className="stat-number">{value}</p>
      <p className="mt-1 text-[11px] font-body text-on-surface-variant">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] font-body text-on-surface-variant/50">{hint}</p> : null}
    </div>
  );
}

export function HomeHubClient() {
  const [data, setData] = useState<HomeStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const j = await apiGetJson<HomeStats>("/api/home/stats", null);
        setData(j);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not load stats");
      }
    })();
  }, []);

  const t = data?.totals;

  return (
    <div className="page-root text-on-surface">
      <div className="page-content pb-10">
        <div className="mb-10">
          <p className="section-label !mb-3">BrandForge</p>
          <h1 className="page-title max-w-[520px]">Deal rooms, marketplace, and live pulse — one home.</h1>
          <p className="page-subtitle max-w-[440px]">
            Negotiate in chat. Sign contracts. Escrow payments. All in one thread.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/chat" className="btn-primary min-h-11 px-5">
              Open a Chat
            </Link>
            <Link href="/requests/new" className="btn-secondary min-h-11 px-5">
              Post a Brief
            </Link>
          </div>
        </div>

        <div>
          <p className="section-label">Live counts</p>
          <p className="page-subtitle !mt-0 max-w-xl">
            Refreshed when you load the page. Online status reflects profile activity (last 1h).
          </p>
          {err ? (
            <p className="text-error mt-6 text-[13px] font-body" role="alert">
              {err}
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Chats" value={t ? String(t.chats) : "—"} hint="Active deal rooms." />
            <StatCard label="Members" value={t ? String(t.members) : "—"} hint="Registered profiles." />
            <StatCard label="Deals" value={t ? String(t.deals) : "—"} hint="Open active projects." />
            <StatCard label="Deals Won" value="—" hint="Season wins signed." />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <PageRouteLoading title="Loading marketplace" subtitle="Services, members, and requests." variant="inline" />
        }
      >
        <ExploreClient compactHero />
      </Suspense>
    </div>
  );
}
