"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DashboardData = {
  generatedAt: string;
  authNote: string;
  lookerStudioUrl: string | null;
  ga4Property: string;
  contentStats: Record<string, number>;
  lighthouse: {
    history: Array<{
      label: string;
      homeMobile: number;
      siteWideAverage: number | null;
      lcp: number | null;
      date: string | null;
    }>;
    regressions: Array<{ from: string; to: string; drop: number }>;
    current: {
      home: { performance: number; lcp: number; tbt: number; cls: number } | null;
      siteWideAverage: number | null;
      worstPages: Array<{ path: string; performance: number; lcp: number }>;
    } | null;
  };
  bundles: { totalJsKb: number; homeRoute?: { homeKb: number; deltaKb: number; regressed: boolean } } | null;
  images: { passed: boolean; oversized: unknown[]; legacyFormats: unknown[] } | null;
  abTests: {
    active: Array<{
      testId: string;
      location: string;
      variants: Array<{ id: string; label: string }>;
      startDate: string;
      status: string;
      impressions: Record<string, number | null>;
      conversions: Record<string, number | null>;
      confidence: number | null;
      winner: string | null;
    }>;
  } | null;
  ga4: {
    note?: string;
    topPages7d: Array<{ path: string; views: number }>;
    topPages30d: Array<{ path: string; views: number }>;
    conversions: Record<string, number | null>;
    trafficSources: Array<{ source: string; sessions: number }>;
    devices: { mobile: number | null; desktop: number | null };
  };
  contentPages: Array<{
    path: string;
    title: string;
    category: string;
    lastModified: string | null;
    schema: string;
    internalLinksIn: number;
    orphan: boolean;
  }>;
  seoKeywords: Array<{ keyword: string; pages: string[]; position: number | null }>;
};

const ADMIN_KEY = process.env.NEXT_PUBLIC_BF_ADMIN_KEY ?? "";

function BarChart({
  items,
  valueKey,
  labelKey,
  max = 100,
  regressionDrop,
}: {
  items: Array<Record<string, unknown>>;
  valueKey: string;
  labelKey: string;
  max?: number;
  regressionDrop?: number;
}): React.JSX.Element {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const val = Number(item[valueKey] ?? 0);
        const pct = Math.min(100, Math.round((val / max) * 100));
        const isRegression =
          regressionDrop !== undefined &&
          items.indexOf(item) > 0 &&
          val < Number(items[items.indexOf(item) - 1]?.[valueKey] ?? val) - regressionDrop;
        return (
          <div key={String(item[labelKey])}>
            <div className="flex justify-between font-mono text-[10px] text-muted">
              <span>{String(item[labelKey])}</span>
              <span className={isRegression ? "text-red-400" : "text-accent-bright"}>{val}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded bg-s2">
              <div
                className={`h-full rounded ${isRegression ? "bg-red-500" : "bg-accent"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }): React.JSX.Element {
  return (
    <div className="rounded-md border border-b1 bg-s1 p-4">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub ? <p className="mt-1 font-mono text-[9px] text-text-secondary">{sub}</p> : null}
    </div>
  );
}

export function AdminDashboard(): React.JSX.Element {
  const [authed, setAuthed] = useState(!ADMIN_KEY);
  const [keyInput, setKeyInput] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;
    fetch("/admin/dashboard-data.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to load dashboard-data.json — run build first."));
  }, [authed]);

  const onUnlock = useCallback(() => {
    if (keyInput === ADMIN_KEY) {
      sessionStorage.setItem("bf-admin-ok", "1");
      setAuthed(true);
    } else {
      setError("Invalid key");
    }
  }, [keyInput]);

  useEffect(() => {
    if (ADMIN_KEY && sessionStorage.getItem("bf-admin-ok") === "1") setAuthed(true);
  }, []);

  const filteredPages = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.contentPages.filter(
      (p) => !q || p.path.includes(q) || p.title.toLowerCase().includes(q) || p.category.includes(q),
    );
  }, [data, search]);

  if (!authed) {
    return (
      <div className="mx-auto max-w-md py-24">
        <h1 className="text-xl font-bold">BrandForge Admin</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Internal dashboard — not indexed. Use Cloudflare Access in production for real auth.
        </p>
        {ADMIN_KEY ? (
          <div className="mt-6 space-y-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              className="w-full rounded border border-b1 bg-s2 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              onClick={onUnlock}
              className="rounded bg-accent px-4 py-2 font-mono text-[11px] font-bold text-white"
            >
              Unlock
            </button>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </div>
        ) : (
          <p className="mt-4 font-mono text-[10px] text-amber">
            Set NEXT_PUBLIC_BF_ADMIN_KEY at build time, or protect /admin/ with Cloudflare Access.
          </p>
        )}
      </div>
    );
  }

  if (!data) {
    return <p className="py-24 text-center text-muted">{error || "Loading dashboard…"}</p>;
  }

  const home = data.lighthouse.current?.home;

  return (
    <div className="space-y-12 pb-24">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">Internal ops</p>
        <h1 className="text-2xl font-bold">BrandForge Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Updated {new Date(data.generatedAt).toLocaleString()} · GA4 {data.ga4Property}
        </p>
        <p className="mt-2 font-mono text-[9px] text-muted">{data.authNote}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Indexable pages" value={String(data.contentStats.total)} />
        <StatCard
          label="Home mobile perf"
          value={home ? String(home.performance) : "—"}
          sub={home ? `LCP ${Math.round(home.lcp)}ms · TBT ${Math.round(home.tbt)}ms` : undefined}
        />
        <StatCard
          label="Site-wide avg"
          value={data.lighthouse.current?.siteWideAverage ? String(data.lighthouse.current.siteWideAverage) : "—"}
        />
        <StatCard
          label="Home JS bundle"
          value={data.bundles?.homeRoute ? `${data.bundles.homeRoute.homeKb}KB` : "—"}
          sub={data.bundles?.homeRoute?.regressed ? `+${data.bundles.homeRoute.deltaKb}KB ⚠` : undefined}
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-md border border-b1 bg-s1 p-6">
          <h2 className="font-bold">Lighthouse trend — home mobile</h2>
          <p className="mt-1 text-xs text-muted">Red bars = &gt;10pt regression vs prior sprint</p>
          <div className="mt-4">
            <BarChart
              items={data.lighthouse.history.map((h) => ({ label: h.label, score: h.homeMobile }))}
              valueKey="score"
              labelKey="label"
              regressionDrop={10}
            />
          </div>
          {data.lighthouse.regressions.length ? (
            <ul className="mt-4 space-y-1 font-mono text-[10px] text-red-400">
              {data.lighthouse.regressions.map((r) => (
                <li key={`${r.from}-${r.to}`}>
                  Regression: {r.from} → {r.to} (−{r.drop})
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rounded-md border border-b1 bg-s1 p-6">
          <h2 className="font-bold">Site-wide average over time</h2>
          <div className="mt-4">
            <BarChart
              items={data.lighthouse.history
                .filter((h) => h.siteWideAverage)
                .map((h) => ({ label: h.label, score: h.siteWideAverage }))}
              valueKey="score"
              labelKey="label"
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-b1 bg-s1 p-6">
        <h2 className="font-bold">GA4 — traffic &amp; conversions</h2>
        {data.lookerStudioUrl ? (
          <iframe
            title="Looker Studio"
            src={data.lookerStudioUrl}
            className="mt-4 aspect-video w-full rounded border border-b1"
            loading="lazy"
          />
        ) : (
          <p className="mt-2 text-sm text-text-secondary">
            Set <code className="text-accent-bright">NEXT_PUBLIC_LOOKER_STUDIO_URL</code> or populate{" "}
            <code className="text-accent-bright">audit/ga4-snapshot.json</code>. Open GA4 Explore for live
            data.
          </p>
        )}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(data.ga4.conversions).map(([event, count]) => (
            <StatCard key={event} label={event} value={count !== null ? String(count) : "—"} />
          ))}
        </div>
        {data.ga4.topPages7d.length ? (
          <>
            <h3 className="mt-6 font-mono text-[10px] uppercase text-muted">Top pages (7d)</h3>
            <ul className="mt-2 space-y-1 font-mono text-[11px]">
              {data.ga4.topPages7d.slice(0, 10).map((p) => (
                <li key={p.path} className="flex justify-between">
                  <span>{p.path}</span>
                  <span className="text-accent-bright">{p.views}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="rounded-md border border-b1 bg-s1 p-6">
        <h2 className="font-bold">A/B tests</h2>
        {(data.abTests?.active ?? []).map((test) => (
          <div key={test.testId} className="mt-4 rounded border border-b1 bg-s2 p-4">
            <p className="font-mono text-[10px] text-accent-bright">{test.testId}</p>
            <p className="font-bold">{test.location}</p>
            <p className="mt-1 text-xs text-muted">Started {test.startDate} · {test.status}</p>
            <table className="mt-4 w-full font-mono text-[10px]">
              <thead>
                <tr className="text-left text-muted">
                  <th className="pb-2">Variant</th>
                  <th>Impressions</th>
                  <th>Conversions</th>
                  <th>CTR</th>
                </tr>
              </thead>
              <tbody>
                {test.variants.map((v) => {
                  const imp = test.impressions[v.id];
                  const conv = test.conversions[v.id];
                  const ctr = imp && conv ? `${Math.round((conv / imp) * 1000) / 10}%` : "—";
                  return (
                    <tr key={v.id} className="border-t border-b1">
                      <td className="py-2">{v.id}: {v.label}</td>
                      <td>{imp ?? "—"}</td>
                      <td>{conv ?? "—"}</td>
                      <td>{ctr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-text-secondary">
              Sync from GA4 → update <code className="text-accent-bright">audit/ab-tests.json</code>. Winner:{" "}
              {test.winner ?? "TBD"}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-b1 bg-s1 p-6">
        <h2 className="font-bold">Content health</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search slug or title…"
          className="mt-4 w-full max-w-md rounded border border-b1 bg-s2 px-3 py-2 font-mono text-sm"
        />
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full font-mono text-[10px]">
            <thead className="sticky top-0 bg-s1 text-muted">
              <tr>
                <th className="py-2 text-left">Path</th>
                <th>Category</th>
                <th>Modified</th>
                <th>Schema</th>
                <th>Links in</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.slice(0, 100).map((p) => (
                <tr key={p.path} className={`border-t border-b1 ${p.orphan ? "text-amber" : ""}`}>
                  <td className="py-1.5 pr-2">{p.path}</td>
                  <td>{p.category}</td>
                  <td>{p.lastModified ?? "—"}</td>
                  <td>{p.schema}</td>
                  <td>{p.internalLinksIn}{p.orphan ? " ⚠ orphan" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-b1 bg-s1 p-6">
        <h2 className="font-bold">SEO rank tracking</h2>
        <table className="mt-4 w-full font-mono text-[10px]">
          <thead className="text-muted">
            <tr>
              <th className="py-2 text-left">Keyword</th>
              <th>Target pages</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {data.seoKeywords.map((k) => (
              <tr key={k.keyword} className="border-t border-b1">
                <td className="py-2">{k.keyword}</td>
                <td className="text-text-secondary">{k.pages.join(", ")}</td>
                <td>{k.position ?? "Manual check"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-b1 bg-s1 p-6">
          <h2 className="font-bold">Store</h2>
          <p className="mt-2 font-mono text-[10px] text-muted">
            {(data as { store?: { productCount: number } }).store?.productCount ?? 0} products live
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {(data as { store?: { note: string } }).store?.note}
          </p>
        </div>
        <div className="rounded-md border border-b1 bg-s1 p-6">
          <h2 className="font-bold">Partners</h2>
          <p className="mt-2 font-mono text-[10px]">
            {(data as { partners?: { count: number; affiliateCommission: string } }).partners?.count ?? 0}{" "}
            listed · {(data as { partners?: { affiliateCommission: string } }).partners?.affiliateCommission}{" "}
            affiliate
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-b1 bg-s1 p-4">
          <h3 className="font-bold">Bundles</h3>
          <p className="mt-2 font-mono text-[10px]">Total JS: {data.bundles?.totalJsKb ?? "—"}KB</p>
        </div>
        <div className="rounded-md border border-b1 bg-s1 p-4">
          <h3 className="font-bold">Images</h3>
          <p className="mt-2 font-mono text-[10px]">
            {data.images?.passed ? "✓ Pass" : `⚠ ${data.images?.oversized?.length ?? 0} oversized`}
          </p>
        </div>
        <div className="rounded-md border border-b1 bg-s1 p-4">
          <h3 className="font-bold">Worst perf pages</h3>
          <ul className="mt-2 font-mono text-[10px]">
            {(data.lighthouse.current?.worstPages ?? []).slice(0, 3).map((p) => (
              <li key={p.path}>{p.path}: {p.performance}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
