"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { MarketplaceHeroStats, resolveMarketplaceHeroStats } from "@/components/marketplace/MarketplaceHeroStats";
import { WeeklyResetBanner } from "@/components/marketplace/WeeklyResetBanner";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { formatDealRecordShort } from "@/lib/deal-record";

const CATEGORIES = ["All", "Development", "Design", "Strategy", "AI Training"] as const;
type CategoryId = (typeof CATEGORIES)[number];

type ServiceRow = {
  id?: string;
  ownerId?: string | null;
  title?: string;
  cat?: string;
  price?: number;
  sel?: string;
  description?: string;
  ownerUsername?: string | null;
  rating?: string;
  coverUrl?: string | null;
  ownerAvatar?: string | null;
  topMember?: boolean;
  sales?: number;
  createdAt?: string | null;
  deliveryDays?: number | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

function serviceDeliveryChip(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(Number(days))) return null;
  const d = Math.round(Number(days));
  if (d <= 0) return null;
  return d === 1 ? "1-day turnaround" : `~${d} days delivery`;
}

function matchesQuery(s: ServiceRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  return Boolean(
    s.title?.toLowerCase().includes(n) ||
      s.cat?.toLowerCase().includes(n) ||
      s.sel?.toLowerCase().includes(n) ||
      s.description?.toLowerCase().includes(n) ||
      s.ownerUsername?.toLowerCase().includes(n),
  );
}

function matchesCategory(s: ServiceRow, cat: CategoryId): boolean {
  if (cat === "All") return true;
  const c = (s.cat || "").toLowerCase();
  if (cat === "Development") {
    return (
      c.includes("dev") ||
      c.includes("engineer") ||
      c.includes("code") ||
      c.includes("software") ||
      c.includes("full") ||
      c.includes("web")
    );
  }
  if (cat === "Design") {
    return c.includes("design") || c.includes("brand") || c.includes("ui") || c.includes("graphic");
  }
  if (cat === "Strategy") {
    return (
      c.includes("strateg") ||
      c.includes("consult") ||
      c.includes("growth") ||
      c.includes("product") ||
      c.includes("go-to-market") ||
      c.includes("gtm")
    );
  }
  if (cat === "AI Training") {
    return c.includes("ai") || c.includes("ml") || c.includes("train") || c.includes("model") || c.includes("data");
  }
  return true;
}

function isPro(s: ServiceRow): boolean {
  if (s.topMember) return true;
  const n = Number(s.sales);
  return Number.isFinite(n) && n >= 12;
}

export function ServicesClient() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [category, setCategory] = useState<CategoryId>("All");
  const { data, err, loading } = useBootstrap();
  const { session } = useAuth();
  const listServiceHref = session ? "/services/new" : `/login?next=${encodeURIComponent("/services/new")}`;
  const ms = data?.marketplaceStats;
  const openRequestsBootstrap = useMemo(() => {
    const reqs = (data?.requests as { status?: string }[]) ?? [];
    return reqs.filter((r) => r.status !== "closed" && r.status !== "awarded").length;
  }, [data?.requests]);
  const heroStats = useMemo(() => resolveMarketplaceHeroStats(ms, openRequestsBootstrap), [ms, openRequestsBootstrap]);
  const honor = data?.honorSeason as
    | { weekStartsAt?: string; weeklyListingFilterActive?: boolean }
    | undefined;

  const services = useMemo(() => {
    const all = (data?.services as ServiceRow[]) ?? [];
    const filtered = all.filter((s) => matchesQuery(s, q) && matchesCategory(s, category));
    return [...filtered].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [data?.services, q, category]);

  if (loading) {
    return <PageRouteLoading title="Loading marketplace" subtitle="Fetching published services." />;
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
          <p className="section-label">Digital services</p>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-subtitle max-w-xl">
            {q ? (
              <>
                Results for &quot;{q}&quot; — {services.length} listing{services.length === 1 ? "" : "s"}.
              </>
            ) : (
              <>Published services from registered specialists.</>
            )}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-6 sm:items-end md:w-auto md:text-right">
          <div className="mt-1 flex flex-wrap items-start gap-8 sm:justify-end">
            <MarketplaceHeroStats stats={heroStats} align="right" />
          </div>
          <Link href={listServiceHref} className="btn-primary min-h-11 w-full justify-center sm:w-auto">
            List a service
          </Link>
        </div>
      </header>

      <WeeklyResetBanner
        weekStartsAtISO={honor?.weekStartsAt}
        strictFilterActive={Boolean(honor?.weeklyListingFilterActive)}
        context="services"
      />

      <div className="mb-6 flex w-fit items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface-container-low p-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-headline font-600 tracking-[0.04em] transition-colors duration-150 ${
              category === c
                ? "bg-surface-container-highest text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="empty-state py-16">
          <span className="material-symbols-outlined empty-state-icon" aria-hidden>
            inventory_2
          </span>
          <p className="empty-state-title">No services listed yet</p>
          <p className="empty-state-body">
            {q || category !== "All"
              ? "No services match this filter. Try another category or browse from the home board."
              : "Be the first."}
          </p>
        </div>
      ) : (
        <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const pro = isPro(s);
            const detailHref = s.id ? `/services/${s.id}` : "/services";
            const bidHref = s.id ? `/bid/service?id=${encodeURIComponent(s.id)}` : "/services";
            const ownerU = (s.ownerUsername || "").trim();
            const isMine = Boolean(session?.user?.id && s.ownerId && String(session.user.id) === String(s.ownerId));
            const dealLbl = formatDealRecordShort(s.ownerDealWins, s.ownerDealLosses);
            const deliveryChip = serviceDeliveryChip(s.deliveryDays);
            const desc = (s.description || "").trim();
            const profileHref = ownerU ? `/p/${encodeURIComponent(ownerU)}` : null;
            return (
              <li key={String(s.id)}>
                <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low transition-colors duration-150 hover:border-outline">
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="pill-default">{s.cat || "Service"}</span>
                      {isMine ? (
                        <span className="text-[11px] font-headline font-500 uppercase tracking-[0.04em] text-primary/80">
                          Your listing
                        </span>
                      ) : null}
                    </div>
                    <Link href={detailHref}>
                      <h3 className="mb-2 text-[15px] font-headline font-600 tracking-[-0.01em] text-on-surface leading-[1.3] transition-colors group-hover:text-primary/90">
                        {s.title}
                      </h3>
                    </Link>
                    {desc ? (
                      <p className="line-clamp-2 text-[13px] font-body leading-relaxed text-on-surface-variant">{desc}</p>
                    ) : null}
                    <p className="text-on-surface-variant mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] leading-snug">
                      <span className="text-on-surface-variant/80 shrink-0 font-medium">By</span>
                      {profileHref ? (
                        <Link href={profileHref} className="text-primary/90 font-medium hover:underline">
                          @{ownerU}
                        </Link>
                      ) : (
                        <span className="text-on-surface font-medium">{s.sel || "Member"}</span>
                      )}
                      {pro ? (
                        <>
                          <span className="text-on-surface-variant/50" aria-hidden>
                            ·
                          </span>
                          <span className="pill-primary text-[10px]">Pro</span>
                        </>
                      ) : null}
                      {s.rating && s.rating !== "New" ? (
                        <>
                          <span className="text-on-surface-variant/50" aria-hidden>
                            ·
                          </span>
                          <span>{s.rating}</span>
                        </>
                      ) : null}
                      {s.ownerReputation != null && s.ownerReputation > 0 ? (
                        <>
                          <span className="text-on-surface-variant/50" aria-hidden>
                            ·
                          </span>
                          <span>Rep {Math.round(s.ownerReputation).toLocaleString()}</span>
                        </>
                      ) : null}
                      {dealLbl ? (
                        <>
                          <span className="text-on-surface-variant/50" aria-hidden>
                            ·
                          </span>
                          <span>{dealLbl}</span>
                        </>
                      ) : null}
                      {s.createdAt ? (
                        <>
                          <span className="text-on-surface-variant/50" aria-hidden>
                            ·
                          </span>
                          <span className="text-on-surface-variant/90">
                            Listed <PostedAgo iso={s.createdAt} className="inline" />
                          </span>
                        </>
                      ) : null}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="border-outline-variant/25 bg-surface-container-high/70 text-on-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold tabular-nums">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]" aria-hidden>
                          payments
                        </span>
                        {s.price != null ? `$${Number(s.price).toLocaleString()}` : "—"}
                      </span>
                      {deliveryChip ? (
                        <span className="border-outline-variant/25 text-on-surface-variant inline-flex items-center gap-1.5 rounded-lg border bg-surface-container-high/40 px-2.5 py-1.5 text-[12px] font-medium">
                          <span className="material-symbols-outlined text-[16px]" aria-hidden>
                            schedule
                          </span>
                          {deliveryChip}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-end border-t border-outline-variant/40 bg-surface-container-low/40 px-5 py-3">
                    <Link
                      href={isMine ? detailHref : bidHref}
                      className="flex min-h-[44px] items-center gap-1 text-[12px] font-headline font-600 text-primary transition-colors hover:text-primary/80"
                    >
                      {isMine ? "Manage listing" : "Send offer"}
                      <span className="material-symbols-outlined text-[14px]" aria-hidden>
                        arrow_forward
                      </span>
                    </Link>
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
