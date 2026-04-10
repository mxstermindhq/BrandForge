"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBootstrap } from "@/hooks/useBootstrap";
import { MarketplaceHeroStats, resolveMarketplaceHeroStats } from "@/components/marketplace/MarketplaceHeroStats";
import { WeeklyResetBanner } from "@/components/marketplace/WeeklyResetBanner";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";
import { formatDealRecordShort } from "@/lib/deal-record";

type Req = {
  id?: string;
  title?: string;
  status?: string;
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  bids?: number;
  days?: number | null;
  desc?: string;
  tags?: string[];
  category?: string | null;
  createdAt?: string | null;
  band?: string;
  canBid?: boolean;
  isUserCreated?: boolean;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

const CATEGORIES = [
  "All categories",
  "Design",
  "AI Training",
  "Development",
  "3D Motion",
  "Smart Contracts",
] as const;

type CategoryFilter = (typeof CATEGORIES)[number];

const SORTS = ["Newest", "Budget: high", "Budget: low"] as const;
type SortId = (typeof SORTS)[number];

function matchesCategory(r: Req, cat: CategoryFilter): boolean {
  if (cat === "All categories") return true;
  const needle = cat.toLowerCase();
  const compact = needle.replace(/\s+/g, "");
  const c = (r.category || "").trim().toLowerCase();
  if (c && (c === needle || c.replace(/\s+/g, "") === compact)) return true;
  const tags = (r.tags || []).map((t) => t.toLowerCase().replace(/_/g, " "));
  return tags.some((t) => t.includes(needle) || t.includes(compact));
}

function sortRequests(list: Req[], sort: SortId): Req[] {
  const out = [...list];
  const byLatest = (a: Req, b: Req) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  if (sort === "Newest") {
    out.sort(byLatest);
  } else if (sort === "Budget: high") {
    out.sort((a, b) => {
      const d = (b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0);
      return d !== 0 ? d : byLatest(a, b);
    });
  } else {
    out.sort((a, b) => {
      const d = (a.budgetMin ?? a.budgetMax ?? 0) - (b.budgetMin ?? b.budgetMax ?? 0);
      return d !== 0 ? d : byLatest(a, b);
    });
  }
  return out;
}

function bandUi(band: string | undefined) {
  if (band === "urgent")
    return {
      label: "Urgent priority",
      dot: "bg-secondary shadow-[0_0_10px_rgba(189,244,255,0.45)]",
      text: "text-secondary",
    };
  if (band === "enterprise")
    return {
      label: "Verified enterprise",
      dot: "bg-secondary/80",
      text: "text-secondary",
    };
  return {
    label: "Standard",
    dot: "bg-outline-variant",
    text: "text-on-surface-variant",
  };
}

export function RequestsClient() {
  const { session } = useAuth();
  const { data, err, loading } = useBootstrap();
  const ms = data?.marketplaceStats;

  const [category, setCategory] = useState<CategoryFilter>("All categories");
  const [sort, setSort] = useState<SortId>("Newest");

  const open = useMemo(() => {
    const requests = (data?.requests as Req[]) ?? [];
    return requests.filter((r) => r.status !== "closed" && r.status !== "awarded");
  }, [data?.requests]);

  const filtered = useMemo(() => {
    let list = open.filter((r) => matchesCategory(r, category));
    list = sortRequests(list, sort);
    return list;
  }, [open, category, sort]);

  const heroStats = useMemo(
    () => resolveMarketplaceHeroStats(ms, open.length),
    [ms, open.length],
  );

  const fabHref = session ? "/requests/new" : `/login?next=${encodeURIComponent("/requests/new")}`;
  const honor = data?.honorSeason as
    | { weekStartsAt?: string; weeklyListingFilterActive?: boolean }
    | undefined;

  if (loading) {
    return <PageRouteLoading title="Loading requests" subtitle="Fetching open briefs." />;
  }

  if (err) {
    return (
      <p className="text-error px-2" role="alert">
        {err}
      </p>
    );
  }

  return (
    <div className="page-root pb-12">
      <div className="page-content space-y-6 !pb-6">
      <header className="mb-10 flex flex-col items-start justify-between gap-8 md:flex-row">
        <div className="min-w-0 max-w-xl">
          <p className="section-label">Creator board</p>
          <h1 className="page-title">Open requests</h1>
          <p className="page-subtitle max-w-xl">
            Active briefs from registered operators — post yours or bid on real marketplace demand.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-6 sm:items-end md:w-auto md:text-right">
          <div className="mt-1 flex flex-wrap items-start gap-8 sm:justify-end">
            <MarketplaceHeroStats stats={heroStats} align="right" />
          </div>
          <Link href={fabHref} className="btn-primary min-h-11 w-full justify-center sm:w-auto">
            List a request
          </Link>
        </div>
      </header>

      <WeeklyResetBanner
        weekStartsAtISO={honor?.weekStartsAt}
        strictFilterActive={Boolean(honor?.weeklyListingFilterActive)}
        context="requests"
      />

      <div className="no-scrollbar mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-outline-variant/60 bg-surface-container-low p-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-headline font-600 tracking-[0.04em] transition-colors duration-150 ${
              category === c
                ? "bg-surface-container-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] font-body text-on-surface-variant">
          {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
          {category !== "All categories" ? ` · ${category}` : ""}
        </p>
        <label className="input-label !mb-0 flex items-center gap-2 normal-case">
          <span className="text-[11px]">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="input w-auto cursor-pointer py-2 normal-case"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state py-16">
          <span className="material-symbols-outlined empty-state-icon" aria-hidden>
            assignment
          </span>
          <p className="empty-state-title">No open requests this cycle</p>
          <p className="empty-state-body mt-1 max-w-md">Check back after the Monday reset or post a new brief.</p>
          <Link href={fabHref} className="btn-primary mt-4">
            List a request
          </Link>
        </div>
      ) : (
        <ul className="relative space-y-4">
          {filtered.map((r) => {
            const band = bandUi(r.band);
            const detailHref = r.id ? `/requests/${r.id}` : "/requests";
            const bidHref = r.id ? `/bid/request?id=${encodeURIComponent(r.id)}` : "/requests";
            const tags = (r.tags || []).slice(0, 6);
            const dealLbl = formatDealRecordShort(r.ownerDealWins, r.ownerDealLosses);
            return (
              <li key={String(r.id)}>
                <article className="group relative overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low transition-colors duration-150 hover:border-outline">
                  <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_auto]">
                    <div className="flex min-w-0 flex-col gap-4 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-headline inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-high/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${band.text}`}
                        >
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${band.dot}`} aria-hidden />
                          {band.label}
                        </span>
                        {r.category ? (
                          <span className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-wider">
                            {r.category}
                          </span>
                        ) : null}
                        {r.ownerReputation != null && r.ownerReputation > 0 ? (
                          <span className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-wider">
                            · Rep {Math.round(r.ownerReputation).toLocaleString()}
                          </span>
                        ) : null}
                        {dealLbl ? (
                          <span className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-wider">
                            · {dealLbl}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="text-[15px] font-headline font-600 leading-[1.3] tracking-[-0.01em] text-on-surface">
                        <Link href={detailHref} className="transition-colors hover:text-primary/90">
                          {r.title || "Untitled brief"}
                        </Link>
                      </h2>
                      {r.desc ? (
                        <p className="line-clamp-2 text-[13px] font-body leading-[1.5] text-on-surface-variant">
                          {r.desc}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <span className="border-outline-variant/20 bg-surface-container-high/50 text-on-surface inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold tabular-nums">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]" aria-hidden>
                            payments
                          </span>
                          {formatRequestBudget(r)}
                        </span>
                        <span className="border-outline-variant/20 bg-surface-container-high/50 text-on-surface-variant inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium">
                          <span className="material-symbols-outlined text-[18px]" aria-hidden>
                            schedule
                          </span>
                          {requestTimelineLabel(r.days)}
                        </span>
                        {typeof r.bids === "number" && r.bids > 0 ? (
                          <span className="border-outline-variant/20 bg-surface-container-high/50 text-on-surface-variant inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium">
                            <span className="material-symbols-outlined text-[18px]" aria-hidden>
                              forum
                            </span>
                            {r.bids} bid{r.bids === 1 ? "" : "s"}
                          </span>
                        ) : null}
                        {r.createdAt ? (
                          <span className="border-outline-variant/20 bg-surface-container-high/50 text-on-surface-variant inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium">
                            <span className="material-symbols-outlined text-[18px]" aria-hidden>
                              calendar_today
                            </span>
                            <PostedAgo iso={r.createdAt} />
                          </span>
                        ) : null}
                      </div>
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {tags.map((t) => (
                            <span
                              key={t}
                              className="border-outline-variant/25 bg-background/40 text-on-surface rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                            >
                              {t.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col justify-center gap-3 border-t border-outline-variant/40 p-5 md:border-l md:border-t-0">
                      {r.isUserCreated ? (
                        <span className="text-center text-[11px] font-headline font-500 uppercase tracking-[0.04em] text-primary/80">
                          Your brief
                        </span>
                      ) : null}
                      <Link
                        href={r.isUserCreated ? detailHref : r.canBid !== false ? bidHref : detailHref}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-1.5 ${
                          r.isUserCreated
                            ? "btn-secondary"
                            : r.canBid !== false
                              ? "btn-primary"
                              : "btn-secondary opacity-70"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {r.isUserCreated ? "edit" : r.canBid !== false ? "gavel" : "visibility"}
                        </span>
                        {r.isUserCreated ? "Manage" : r.canBid !== false ? "Bid" : "View brief"}
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
