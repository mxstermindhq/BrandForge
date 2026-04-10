"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGetJson } from "@/lib/api";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";
import { MemberJourneyStrip } from "@/components/journey/MemberJourneyStrip";
import { formatDealRecordShort } from "@/lib/deal-record";
import { formatEventAgo } from "@/lib/relative-time";
import { OnlinePresenceDot } from "@/components/ui/OnlinePresenceDot";

type Svc = {
  id?: string;
  title?: string;
  cat?: string;
  price?: number;
  coverUrl?: string | null;
  sel?: string;
  description?: string;
  ownerUsername?: string | null;
  createdAt?: string | null;
  deliveryDays?: number | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};
type Prof = {
  id?: string;
  n?: string;
  r?: string;
  username?: string | null;
  avatarUrl?: string | null;
  rating?: number;
  sk?: string[];
  createdAt?: string | null;
};
type Req = {
  id?: string;
  title?: string;
  status?: string;
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  days?: number | null;
  desc?: string;
  tags?: string[];
  createdAt?: string | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

type SearchMarketplaceResponse = {
  q: string;
  limit: number;
  honorWeek: boolean;
  services: Svc[];
  profiles: Prof[];
  requests: Req[];
};

function formatLocalDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const LATEST_FEED_LIMIT = 8;

function matchesService(s: Svc, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.toLowerCase();
  return Boolean(
    s.title?.toLowerCase().includes(n) ||
      s.cat?.toLowerCase().includes(n) ||
      s.sel?.toLowerCase().includes(n) ||
      s.description?.toLowerCase().includes(n) ||
      s.ownerUsername?.toLowerCase().includes(n),
  );
}

function exploreDeliveryChip(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(Number(days))) return null;
  const d = Math.round(Number(days));
  if (d <= 0) return null;
  return d === 1 ? "1-day delivery" : `~${d} days delivery`;
}

function matchesProfile(p: Prof, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.toLowerCase();
  const sk = (p.sk || []).join(" ").toLowerCase();
  return Boolean(
    p.n?.toLowerCase().includes(n) ||
      (p.username && p.username.toLowerCase().includes(n)) ||
      p.r?.toLowerCase().includes(n) ||
      sk.includes(n),
  );
}

function matchesRequest(r: Req, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.toLowerCase();
  const blob = [r.title, r.desc, r.budget, ...(r.tags || [])].filter(Boolean).join(" ").toLowerCase();
  return blob.includes(n);
}

const EXPLORE_SECTION_IDS = {
  services: "explore-services",
  requests: "explore-requests",
  activity: "explore-activity",
} as const;

function buildExploreHref(opts: {
  q?: string;
  type?: "services" | "requests" | "people" | "specialists" | "members";
}): string {
  const usp = new URLSearchParams();
  const qv = opts.q?.trim();
  if (qv) usp.set("q", qv);
  if (opts.type) usp.set("type", opts.type);
  const s = usp.toString();
  return s ? `/?${s}` : "/";
}

function resolveExploreTypeParam(raw: string | null): keyof typeof EXPLORE_SECTION_IDS | null {
  if (!raw) return null;
  const t = raw.trim().toLowerCase();
  if (t === "services") return "services";
  if (t === "requests") return "requests";
  if (t === "people" || t === "specialists" || t === "members") return "activity";
  return null;
}

function ExploreSearchFallbackCtas() {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href="/services"
        className="bg-primary text-on-primary font-headline inline-flex min-h-10 items-center rounded-lg px-4 text-xs font-bold transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Browse services
      </Link>
      <Link
        href="/requests"
        className="border-outline-variant/40 text-on-surface hover:bg-surface-container-high inline-flex min-h-10 items-center rounded-lg border px-4 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Open requests
      </Link>
      <Link
        href="/requests/new"
        className="border-outline-variant/40 text-on-surface hover:bg-surface-container-high inline-flex min-h-10 items-center rounded-lg border px-4 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        New brief
      </Link>
      <Link
        href="/"
        className="text-secondary inline-flex min-h-10 items-center text-xs font-bold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Clear search
      </Link>
    </div>
  );
}

export function ExploreClient({ compactHero = false }: { compactHero?: boolean }) {
  const searchParams = useSearchParams();
  const qRaw = (searchParams.get("q") || "").trim();
  const hasQ = Boolean(qRaw);
  const qLower = qRaw.toLowerCase();
  const useServerSearch = hasQ && qRaw.length >= 2;
  const typeScroll = searchParams.get("type");
  const sectionKey = useMemo(() => resolveExploreTypeParam(typeScroll), [typeScroll]);

  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;
  const [searchPayload, setSearchPayload] = useState<SearchMarketplaceResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);

  const { data, err, loading } = useBootstrap();

  useEffect(() => {
    if (!useServerSearch) {
      setSearchPayload(null);
      setSearchErr(null);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    setSearchErr(null);
    setSearchPayload(null);
    const qs = new URLSearchParams({ q: qRaw, limit: "24" });
    void apiGetJson<SearchMarketplaceResponse>(`/api/search?${qs.toString()}`, accessToken)
      .then((json) => {
        if (!cancelled) setSearchPayload(json);
      })
      .catch((e) => {
        if (!cancelled) setSearchErr(e instanceof Error ? e.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useServerSearch, qRaw, accessToken]);

  useEffect(() => {
    if (loading || err || !sectionKey) return;
    if (useServerSearch && searchLoading) return;
    const id = EXPLORE_SECTION_IDS[sectionKey];
    const el = document.getElementById(id);
    if (!el) return;
    const instant =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
    });
  }, [loading, err, sectionKey, useServerSearch, searchLoading]);

  const services = useMemo(() => {
    const allServices = (data?.services as Svc[]) ?? [];
    const byLatest = (a: Svc, b: Svc) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    if (useServerSearch) {
      if (searchErr) return [...allServices.filter((s) => matchesService(s, qLower))].sort(byLatest);
      if (searchPayload?.services)
        return [...(searchPayload.services as Svc[])].sort(byLatest);
      return [];
    }
    if (!hasQ) return [...allServices].sort(byLatest).slice(0, 36);
    return [...allServices.filter((s) => matchesService(s, qLower))].sort(byLatest);
  }, [data?.services, hasQ, qLower, useServerSearch, searchPayload?.services, searchErr]);

  const profiles = useMemo(() => {
    const allProfiles = (data?.profiles as Prof[]) ?? [];
    const byRegistered = (a: Prof, b: Prof) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    if (useServerSearch) {
      if (searchErr) return [...allProfiles.filter((p) => matchesProfile(p, qLower))].sort(byRegistered);
      if (searchPayload?.profiles) return [...(searchPayload.profiles as Prof[])].sort(byRegistered);
      return [];
    }
    if (!hasQ) return [...allProfiles].sort(byRegistered);
    return [...allProfiles.filter((p) => matchesProfile(p, qLower))].sort(byRegistered);
  }, [data?.profiles, hasQ, qLower, useServerSearch, searchPayload?.profiles, searchErr]);

  /** All requests (any status), newest first — for “latest posted” feed. */
  const requestsAllForFeed = useMemo(() => {
    const all = (data?.requests as Req[]) ?? [];
    const byLatest = (a: Req, b: Req) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    if (useServerSearch) {
      if (searchErr) return [...all.filter((r) => matchesRequest(r, qLower))].sort(byLatest);
      if (searchPayload?.requests) return [...(searchPayload.requests as Req[])].sort(byLatest);
      return [];
    }
    if (!hasQ) return [...all].sort(byLatest);
    return [...all.filter((r) => matchesRequest(r, qLower))].sort(byLatest);
  }, [data?.requests, hasQ, qLower, useServerSearch, searchPayload?.requests, searchErr]);

  const onlineSet = useMemo(() => {
    const ids = data?.onlineUserIds;
    if (!Array.isArray(ids)) return new Set<string>();
    return new Set(ids.map((id) => String(id)));
  }, [data?.onlineUserIds]);

  const requests = useMemo(() => {
    const allOpenRequests =
      (data?.requests as Req[])?.filter((r) => r.status !== "closed" && r.status !== "awarded") ?? [];
    const byLatest = (a: Req, b: Req) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    if (useServerSearch) {
      if (searchErr) return [...allOpenRequests.filter((r) => matchesRequest(r, qLower))].sort(byLatest);
      if (searchPayload?.requests) return [...(searchPayload.requests as Req[])].sort(byLatest);
      return [];
    }
    if (!hasQ) return [...allOpenRequests].sort(byLatest);
    return [...allOpenRequests.filter((r) => matchesRequest(r, qLower))].sort(byLatest);
  }, [data?.requests, hasQ, qLower, useServerSearch, searchPayload?.requests, searchErr]);

  if (loading) {
    return <PageRouteLoading title="Loading explore" subtitle="Fetching services, profiles, and requests." />;
  }

  if (err) {
    return (
      <p className="text-error px-6 md:px-12" role="alert">
        {err}
      </p>
    );
  }

  const showSearchSpinner = useServerSearch && searchLoading && !searchErr;

  return (
    <div className="relative pb-16">
      {!compactHero ? (
        <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/10 blur-[120px]" />
      ) : null}

      {compactHero ? (
        <section className="border-outline-variant/40 bg-background border-b px-6 pb-10 pt-6 md:px-12 md:pb-12 md:pt-8">
          <div className="mx-auto w-full max-w-6xl">
            <p className="section-label">Marketplace</p>
            <h2 className="page-title">Marketplace</h2>
            <p className="page-subtitle max-w-[560px]">
              Published services, member profiles, and open briefs — search and jump to sections below.
            </p>
          </div>
        </section>
      ) : (
        <section className="relative px-6 pb-16 pt-4 md:px-12 md:pt-4">
          <div className="max-w-5xl">
            <span className="font-headline mb-6 block text-xs font-bold uppercase tracking-[0.35em] text-secondary">
              Services · Requests · Delivery
            </span>
            <h1 className="font-headline mb-10 text-5xl font-black leading-[0.95] tracking-tighter text-on-surface md:text-6xl lg:text-7xl">
              Run better work{" "}
              <span className="from-primary via-secondary to-primary-container bg-gradient-to-r bg-clip-text text-transparent">
                in one network
              </span>
            </h1>
            <p className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-on-surface-variant md:text-xl">
              List services, post briefs, collaborate on projects, and use AI tooling—built on clear identity,
              reputation, and marketplace rails your team can trust.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/services"
                className="font-headline hover:shadow-glow flex min-h-[52px] items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-on-primary transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Browse services
                <span className="material-symbols-outlined" aria-hidden>
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/studio"
                className="font-headline border-primary/20 bg-surface-container-high/40 hover:bg-surface-container-highest flex min-h-[52px] items-center rounded-xl border px-8 py-4 text-sm font-bold text-primary backdrop-blur-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Open studio
              </Link>
            </div>
          </div>
        </section>
      )}

      {!compactHero ? <MemberJourneyStrip /> : null}

      {hasQ ? (
        <section className="px-6 pb-8 md:px-12" aria-live="polite">
          <p className="text-on-surface text-base leading-relaxed md:text-lg">
            Results for <span className="text-secondary font-semibold">&quot;{qRaw}&quot;</span>
            <span className="text-on-surface-variant"> — </span>
            {showSearchSpinner ? "…" : `${services.length} service${services.length === 1 ? "" : "s"}, ${profiles.length} creator${profiles.length === 1 ? "" : "s"}, ${requests.length} request${requests.length === 1 ? "" : "s"}`}
          </p>
          {useServerSearch && !showSearchSpinner && !searchErr ? (
            <p className="text-on-surface-variant mt-1 text-xs font-light">
              Matches come from a database search across published listings (broader than the home preview grid).
            </p>
          ) : null}
          <nav
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium"
            aria-label="Jump to matching sections"
          >
            <span className="text-on-surface-variant">Jump to</span>
            <Link
              href={buildExploreHref({ q: qRaw, type: "services" })}
              className="text-secondary font-headline font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Services
            </Link>
            <span className="text-on-surface-variant" aria-hidden>
              ·
            </span>
            <Link
              href={buildExploreHref({ q: qRaw, type: "people" })}
              className="text-secondary font-headline font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Latest activity
            </Link>
            <span className="text-on-surface-variant" aria-hidden>
              ·
            </span>
            <Link
              href={buildExploreHref({ q: qRaw, type: "requests" })}
              className="text-secondary font-headline font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Requests
            </Link>
            <span className="text-on-surface-variant" aria-hidden>
              ·
            </span>
            <Link
              href="/"
              className="text-on-surface-variant hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Clear search
            </Link>
          </nav>
        </section>
      ) : null}

      {useServerSearch && searchErr ? (
        <p className="text-error px-6 pb-4 text-sm md:px-12" role="alert">
          {searchErr} — showing matches from loaded explore data only.
        </p>
      ) : null}

      {showSearchSpinner ? (
        <PageRouteLoading
          title="Searching marketplace"
          subtitle="Matching services, members, and open briefs."
          variant="inline"
        />
      ) : null}

      {!showSearchSpinner ? (
        <>
      <section
        id={EXPLORE_SECTION_IDS.services}
        className={`mb-24 scroll-mt-32 ${compactHero ? "pt-10 md:pt-14" : ""}`}
        aria-labelledby="services-marketplace-heading"
      >
        <div className="mb-10 flex flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between md:px-12 lg:gap-x-20">
          <div className="min-w-0">
            <h2 id="services-marketplace-heading" className="font-headline text-3xl font-black uppercase tracking-tight">
              {hasQ ? "Matching services" : "Published services"}
            </h2>
            <div className="mt-3 h-1 w-12 bg-secondary" />
          </div>
          <Link
            href="/services"
            className="font-headline flex shrink-0 items-center gap-2 self-start text-sm font-bold text-on-surface-variant transition-colors hover:text-secondary sm:self-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            BROWSE ALL{" "}
            <span className="material-symbols-outlined text-base" aria-hidden>
              north_east
            </span>
          </Link>
        </div>
        {services.length === 0 ? (
          <div className="px-6 md:px-12">
            <p className="text-on-surface-variant text-sm">
              {hasQ
                ? "No services match that search — try another keyword or browse the marketplace."
                : "No published services yet — list one from the marketplace."}
            </p>
            {hasQ ? <ExploreSearchFallbackCtas /> : null}
          </div>
        ) : (
          <div className="no-scrollbar flex gap-6 overflow-x-auto px-6 pb-10 pt-1 md:gap-8 md:px-12 md:pb-12">
            {services.map((s) => {
              const dealLbl = formatDealRecordShort(s.ownerDealWins, s.ownerDealLosses);
              const desc = (s.description || "").trim();
              const deliveryChip = exploreDeliveryChip(s.deliveryDays);
              const ou = (s.ownerUsername || "").trim();
              return (
              <Link
                key={String(s.id)}
                href={s.id ? `/services/${s.id}` : "/services"}
                className="border-outline-variant/20 bg-surface-container-low/60 hover:border-outline-variant/35 min-w-[280px] cursor-pointer rounded-xl border p-5 transition-colors sm:min-w-[300px] lg:min-w-[320px]"
              >
                <article className="h-full text-left">
                  <span className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest">
                    {s.cat || "Service"}
                  </span>
                  <h3 className="text-on-surface group-hover:text-secondary mt-2 line-clamp-2 text-lg font-bold leading-snug transition-colors">
                    {s.title}
                  </h3>
                  {desc ? (
                    <p className="text-on-surface-variant mt-2 line-clamp-2 text-[13px] font-light leading-relaxed">
                      {desc}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="border-outline-variant/25 bg-surface-container-high/50 text-on-surface inline-flex items-center rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums">
                      {s.price != null ? `$${Number(s.price).toLocaleString()}` : "—"}
                    </span>
                    {deliveryChip ? (
                      <span className="border-outline-variant/25 text-on-surface-variant inline-flex items-center rounded-lg border bg-surface-container-high/30 px-2 py-1 text-xs font-medium">
                        {deliveryChip}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-on-surface-variant mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] leading-snug">
                    {ou ? (
                      <>
                        <span className="text-on-surface-variant/80">By</span>
                        <span className="text-on-surface font-medium">@{ou}</span>
                      </>
                    ) : s.sel ? (
                      <span className="text-on-surface font-medium">{s.sel}</span>
                    ) : null}
                    {s.ownerReputation != null && s.ownerReputation > 0 ? (
                      <>
                        <span className="text-on-surface-variant/40" aria-hidden>
                          ·
                        </span>
                        <span>Rep {Math.round(s.ownerReputation).toLocaleString()}</span>
                      </>
                    ) : null}
                    {dealLbl ? (
                      <>
                        <span className="text-on-surface-variant/40" aria-hidden>
                          ·
                        </span>
                        <span>{dealLbl}</span>
                      </>
                    ) : null}
                    {s.createdAt ? (
                      <>
                        <span className="text-on-surface-variant/40" aria-hidden>
                          ·
                        </span>
                        <span>
                          Listed <PostedAgo iso={s.createdAt} className="inline" />
                        </span>
                      </>
                    ) : null}
                  </p>
                </article>
              </Link>
            );
            })}
          </div>
        )}
      </section>

      <section
        id={EXPLORE_SECTION_IDS.activity}
        className="scroll-mt-32 border-t border-outline-variant/40 bg-surface-container-low/30 py-16"
        aria-labelledby="latest-activity-heading"
      >
        <div className="mb-10 px-6 md:px-12">
          <h2 id="latest-activity-heading" className="font-headline mb-2 text-3xl font-black uppercase tracking-tight">
            {hasQ ? "Matching activity" : "Latest activity"}
          </h2>
          <p className="font-light text-on-surface-variant">
            {hasQ
              ? "Newest registrations, listings, and briefs that match your search."
              : "Newest registrations, published services, and posted requests."}
          </p>
        </div>
        <div className="grid gap-10 px-6 md:grid-cols-3 md:gap-8 md:px-12">
          {/* Latest registered members */}
          <div className="min-w-0">
            <h3 className="font-headline mb-1 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Latest members
            </h3>
            <p className="mb-4 text-xs font-light text-on-surface-variant/80">
              Active specialists from the last 30 days.
            </p>
            {profiles.length === 0 ? (
              <div>
                <p className="text-on-surface-variant text-sm">{hasQ ? "No matching members." : "No members yet."}</p>
                {hasQ ? <ExploreSearchFallbackCtas /> : null}
              </div>
            ) : (
              <ul className="space-y-4">
                {profiles.slice(0, LATEST_FEED_LIMIT).map((p) => {
                  const label = p.username ? `@${p.username}` : p.n || "Member";
                  const href = p.username ? `/p/${encodeURIComponent(p.username)}` : null;
                  const rel = formatEventAgo(p.createdAt, "Registered");
                  const abs = formatLocalDateTime(p.createdAt);
                  const inner = (
                    <>
                      <span className="flex items-center gap-2">
                        <OnlinePresenceDot active={Boolean(p.id && onlineSet.has(String(p.id)))} />
                        <span className="line-clamp-1 font-medium text-on-surface">{label}</span>
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-on-surface-variant">
                        {rel ? <span>{rel}</span> : null}
                        {rel && abs ? <span aria-hidden> · </span> : null}
                        {abs ? <span className="tabular-nums">{abs}</span> : !rel ? <span>—</span> : null}
                      </span>
                    </>
                  );
                  return (
                    <li key={String(p.id)} className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                      {href ? (
                        <Link href={href} className="block transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                          {inner}
                        </Link>
                      ) : (
                        <div>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Latest services listed */}
          <div className="min-w-0">
            <h3 className="font-headline mb-1 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Latest services listed
            </h3>
            <p className="mb-4 text-xs font-light text-on-surface-variant/80">Recently published packages.</p>
            {services.length === 0 ? (
              <p className="text-on-surface-variant text-sm">{hasQ ? "No matching services." : "No services yet."}</p>
            ) : (
              <ul className="space-y-4">
                {services.slice(0, LATEST_FEED_LIMIT).map((s) => {
                  const rel = formatEventAgo(s.createdAt, "Listed");
                  const abs = formatLocalDateTime(s.createdAt);
                  return (
                    <li key={String(s.id)} className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={s.id ? `/services/${s.id}` : "/services"}
                        className="block transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span className="line-clamp-2 font-medium text-on-surface">{s.title || "Service"}</span>
                        <span className="mt-1 block text-[11px] leading-snug text-on-surface-variant">
                          {rel ? <span>{rel}</span> : null}
                          {rel && abs ? <span aria-hidden> · </span> : null}
                          {abs ? <span className="tabular-nums">{abs}</span> : !rel ? <span>—</span> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Open requests feed */}
          <div className="min-w-0">
            <h3 className="font-headline mb-1 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Open requests
            </h3>
            <p className="mb-4 text-xs font-light text-on-surface-variant/80">Actively accepting proposals.</p>
            {requestsAllForFeed.length === 0 ? (
              <p className="text-on-surface-variant text-sm">{hasQ ? "No matching requests." : "No requests yet."}</p>
            ) : (
              <ul className="space-y-4">
                {requestsAllForFeed.slice(0, LATEST_FEED_LIMIT).map((r) => {
                  const rel = r.createdAt ? <PostedAgo iso={r.createdAt} className="inline" /> : null;
                  const abs = formatLocalDateTime(r.createdAt);
                  return (
                    <li key={String(r.id)} className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                      <Link
                        href={r.id ? `/requests/${r.id}` : "/requests"}
                        className="block transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span className="line-clamp-2 font-medium text-on-surface">{r.title || "Request"}</span>
                        {r.status ? (
                          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {r.status}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-[11px] leading-snug text-on-surface-variant">
                          {rel}
                          {rel && abs ? <span aria-hidden> · </span> : null}
                          {abs ? <span className="tabular-nums">{abs}</span> : !rel ? <span>—</span> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section
        id={EXPLORE_SECTION_IDS.requests}
        className="scroll-mt-32 px-6 pb-16 pt-12 md:px-12"
        aria-labelledby="requests-heading"
      >
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="requests-heading" className="font-headline text-3xl font-black uppercase tracking-tight">
              {hasQ ? "Matching requests" : "Open Requests"}
            </h2>
            <p className="mt-2 font-light text-on-surface-variant">
              {hasQ ? "Briefs that mention your search terms." : "Open briefs accepting proposals."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/requests"
              className="font-headline flex h-10 items-center justify-center rounded-lg border border-outline-variant/30 transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Filters"
            >
              <span className="material-symbols-outlined px-2" aria-hidden>
                filter_list
              </span>
            </Link>
            <span className="font-headline bg-surface-container-high flex h-10 items-center rounded-lg px-4 text-xs font-bold uppercase tracking-widest">
              Active only
            </span>
          </div>
        </div>
        {requests.length === 0 ? (
          <div>
            <p className="text-on-surface-variant text-sm">
              {hasQ
                ? "No open requests match that search."
                : "No open requests — post one now."}
            </p>
            {hasQ ? <ExploreSearchFallbackCtas /> : null}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {requests.map((r, idx) => {
              const dealLbl = formatDealRecordShort(r.ownerDealWins, r.ownerDealLosses);
              return (
              <li
                key={String(r.id)}
                className="border-outline-variant/10 bg-surface-container-low/80 hover:border-outline-variant/25 group flex flex-col justify-between rounded-2xl border p-6 transition-all md:p-8"
              >
                <div className="min-w-0">
                  <div className="mb-5 flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${idx % 2 === 0 ? "bg-primary-container text-on-primary-container" : "bg-secondary-container text-on-secondary-container"}`}
                    >
                      <span className="material-symbols-outlined text-2xl" aria-hidden>
                        description
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-on-surface text-lg font-bold leading-snug tracking-tight">
                        {r.title || "Untitled brief"}
                      </h4>
                      <p className="text-on-surface-variant mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-widest">
                        <span>Open request</span>
                        {r.ownerReputation != null && r.ownerReputation > 0 ? (
                          <span className="font-medium normal-case tracking-normal">
                            · Rep {Math.round(r.ownerReputation).toLocaleString()}
                          </span>
                        ) : null}
                        {dealLbl ? (
                          <span className="font-medium normal-case tracking-normal">· {dealLbl}</span>
                        ) : null}
                        {r.createdAt ? <PostedAgo iso={r.createdAt} className="font-medium normal-case tracking-normal" /> : null}
                      </p>
                    </div>
                  </div>
                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="border-outline-variant/20 bg-surface-container-high/60 text-on-surface inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums">
                      <span className="material-symbols-outlined text-on-surface-variant text-base" aria-hidden>
                        payments
                      </span>
                      {formatRequestBudget(r)}
                    </span>
                    <span className="border-outline-variant/20 bg-surface-container-high/60 text-on-surface-variant inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium">
                      <span className="material-symbols-outlined text-base" aria-hidden>
                        schedule
                      </span>
                      {requestTimelineLabel(r.days)}
                    </span>
                  </div>
                  <p className="mb-6 line-clamp-3 text-sm font-light leading-relaxed text-on-surface-variant">
                    {r.desc || "Open the brief for full details and deliverables."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={r.id ? `/requests/${r.id}` : "/requests"}
                    className="font-headline border-outline-variant/30 bg-background group-hover:border-primary/40 flex min-h-[48px] flex-1 items-center justify-center rounded-xl border py-3 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Details
                  </Link>
                  <Link
                    href={r.id ? `/bid/request?id=${encodeURIComponent(r.id)}` : "/requests"}
                    className="font-headline bg-secondary hover:brightness-110 flex min-h-[48px] items-center justify-center rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-secondary-container transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Request bid
                  </Link>
                </div>
              </li>
            );
            })}
          </ul>
        )}
      </section>
        </>
      ) : null}
    </div>
  );
}
