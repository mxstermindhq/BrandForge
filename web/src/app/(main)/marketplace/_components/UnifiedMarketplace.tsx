"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { apiGetJson } from "@/lib/api";
import { SmartMatchEngine } from "@/components/marketplace/SmartMatchEngine";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { AuthWall } from "@/components/ui/AuthWall";
import { formatDealRecordShort } from "@/lib/deal-record";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";
import {
  Store, Sparkles, Grid3X3, Briefcase, FileText, Search,
  Clock, ChevronDown, Plus, ArrowRight, Eye,
  Bookmark, MessageSquare
} from "lucide-react";

type ListingType = "all" | "services" | "requests";
type ViewMode = "browse" | "smart-match";
type SortOption = "trending" | "newest" | "price-low" | "price-high";
type MarketCollection = "all" | "featured" | "new";

type ServiceRow = {
  _type?: "service";
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
  offers?: number; // Number of active offers/bids on this service
  views?: number; // View count
  createdAt?: string | null;
  deliveryDays?: number | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

type Req = {
  _type?: "request";
  id?: string;
  title?: string;
  status?: string;
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  bids?: number;
  views?: number; // View count
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

function serviceDeliveryChip(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(Number(days))) return null;
  const d = Math.round(Number(days));
  if (d <= 0) return null;
  return d === 1 ? "1-day turnaround" : `~${d} days delivery`;
}

function reputationTier(reputation?: number | null, wins?: number | null): string {
  const rep = reputation || 0;
  const w = wins || 0;
  if (w >= 50 || rep >= 5000) return "Undisputed";
  if (w >= 35 || rep >= 3500) return "Gladiator";
  if (w >= 20 || rep >= 2000) return "Duelist";
  if (w >= 10 || rep >= 1000) return "Rival";
  return "Challenger";
}

const tierColors: Record<string, string> = {
  Challenger: "text-muted-foreground",
  Rival: "text-sky-500 dark:text-sky-400",
  Duelist: "text-amber-500 dark:text-amber-400",
  Gladiator: "text-rose-500 dark:text-rose-400",
  Undisputed: "text-purple-500 dark:text-purple-400",
};

function matchesQuery(item: ServiceRow | Req, q: string, type: "service" | "request"): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  if (type === "service") {
    const s = item as ServiceRow;
    return Boolean(
      s.title?.toLowerCase().includes(n) ||
        s.cat?.toLowerCase().includes(n) ||
        s.sel?.toLowerCase().includes(n) ||
        s.description?.toLowerCase().includes(n) ||
        s.ownerUsername?.toLowerCase().includes(n)
    );
  }
  const r = item as Req;
  const blob = [r.title, r.desc, r.budget, r.category, ...(r.tags || [])].filter(Boolean).join(" ").toLowerCase();
  return blob.includes(n);
}

function isPro(s: ServiceRow): boolean {
  if (s.topMember) return true;
  const n = Number(s.sales);
  return Number.isFinite(n) && n >= 12;
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

function sortItems<T extends ServiceRow | Req>(items: T[], sortBy: SortOption, type: "service" | "request"): T[] {
  const sorted = [...items];
  
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    case "price-low":
      if (type === "service") {
        return sorted.sort((a, b) => (Number((a as ServiceRow).price) || 0) - (Number((b as ServiceRow).price) || 0));
      }
      return sorted.sort((a, b) => (Number((a as Req).budgetMin) || 0) - (Number((b as Req).budgetMin) || 0));
    case "price-high":
      if (type === "service") {
        return sorted.sort((a, b) => (Number((b as ServiceRow).price) || 0) - (Number((a as ServiceRow).price) || 0));
      }
      return sorted.sort((a, b) => (Number((b as Req).budgetMax) || 0) - (Number((a as Req).budgetMax) || 0));
    case "trending":
    default:
      // Trending = by views/sales for services, by bids for requests
      if (type === "service") {
        return sorted.sort((a, b) => (Number((b as ServiceRow).views) || 0) - (Number((a as ServiceRow).views) || 0));
      }
      return sorted.sort((a, b) => (Number((b as Req).bids) || 0) - (Number((a as Req).bids) || 0));
  }
}

function parseListingTab(raw: string | null): ListingType {
  const t = (raw || "").toLowerCase();
  if (t === "services" || t === "requests") return t;
  return "all";
}

function parseViewMode(raw: string | null): ViewMode {
  const v = (raw || "").toLowerCase();
  if (v === "browse") return "browse";
  return "smart-match";
}

function parseSort(raw: string | null): SortOption {
  const s = (raw || "").toLowerCase();
  if (s === "newest" || s === "price-low" || s === "price-high") return s;
  return "trending";
}

function parseCollection(raw: string | null): MarketCollection {
  const c = (raw || "").toLowerCase();
  if (c === "featured" || c === "new") return c;
  return "all";
}

function isNewListing(item: ServiceRow | Req): boolean {
  if (!item.createdAt) return false;
  const ageMs = Date.now() - new Date(item.createdAt).getTime();
  return Number.isFinite(ageMs) && ageMs <= 14 * 24 * 60 * 60 * 1000;
}

function isFeaturedListing(item: ServiceRow | Req): boolean {
  const maybeService = item as ServiceRow;
  const maybeRequest = item as Req;
  if (maybeService._type === "service" || (!maybeRequest._type && "price" in item)) {
    return isPro(maybeService) || Number(maybeService.offers || maybeService.sales || 0) > 0;
  }
  return maybeRequest.band === "urgent" || maybeRequest.band === "enterprise" || Number(maybeRequest.bids || 0) > 0;
}

export function UnifiedMarketplace() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const qFromUrl = (params.get("q") || "").trim();
  const listingType = parseListingTab(params.get("tab"));
  const viewMode = parseViewMode(params.get("view"));
  const sortBy = parseSort(params.get("sort"));
  const collection = parseCollection(params.get("collection"));
  const [searchDraft, setSearchDraft] = useState(qFromUrl);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [eco, setEco] = useState<{
    listingsActive: number;
    volumeUsdEstimate: number;
    dealsClosed: number;
  } | null>(null);
  const { data, err, loading } = useBootstrap();
  const { session } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const j = await apiGetJson<{
          listingsActive?: number;
          volumeUsdEstimate?: number;
          dealsClosed?: number;
        }>("/api/marketplace/stats", null);
        if (cancelled) return;
        setEco({
          listingsActive: Number(j.listingsActive) || 0,
          volumeUsdEstimate: Number(j.volumeUsdEstimate) || 0,
          dealsClosed: Number(j.dealsClosed) || 0,
        });
      } catch {
        if (!cancelled) setEco(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchDraft(qFromUrl);
  }, [qFromUrl]);

  const replaceQuery = useCallback(
    (mutate: (u: URLSearchParams) => void) => {
      const u = new URLSearchParams(params.toString());
      mutate(u);
      const qs = u.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = searchDraft.trim();
      if (next === qFromUrl) return;
      replaceQuery(u => {
        if (next) u.set("q", next);
        else u.delete("q");
      });
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchDraft, qFromUrl, replaceQuery]);

  const q = searchDraft.trim();

  const services = useMemo(() => {
    const all = (data?.services as ServiceRow[]) ?? [];
    const filtered = all.filter((s) => matchesQuery(s, q, "service"));
    return sortItems([...filtered], sortBy, "service") as ServiceRow[];
  }, [data?.services, q, sortBy]);

  const requests = useMemo(() => {
    const all = (data?.requests as Req[]) ?? [];
    const open = all.filter((r) => r.status !== "closed" && r.status !== "awarded");
    const filtered = open.filter((r) => matchesQuery(r, q, "request"));
    return sortItems([...filtered], sortBy, "request") as Req[];
  }, [data?.requests, q, sortBy]);

  const combinedListings = useMemo(() => {
    if (listingType === "services") return { items: services, type: "service" as const };
    if (listingType === "requests") return { items: requests, type: "request" as const };
    // Mix services and requests, newest first
    const mixed = [
      ...services.map((s) => ({ ...s, _type: "service" as const, _sortKey: s.createdAt || "" })),
      ...requests.map((r) => ({ ...r, _type: "request" as const, _sortKey: r.createdAt || "" })),
    ].sort((a, b) => String(b._sortKey).localeCompare(String(a._sortKey)));
    return { items: mixed, type: "mixed" as const };
  }, [services, requests, listingType]);

  const visibleListings = useMemo(() => {
    if (collection === "featured") return combinedListings.items.filter(isFeaturedListing);
    if (collection === "new") return combinedListings.items.filter(isNewListing);
    return combinedListings.items;
  }, [combinedListings.items, collection]);

  const featuredCount = useMemo(() => combinedListings.items.filter(isFeaturedListing).length, [combinedListings.items]);
  const newCount = useMemo(() => combinedListings.items.filter(isNewListing).length, [combinedListings.items]);

  const listServiceHref = session ? "/services/new" : `/login?next=${encodeURIComponent("/services/new")}`;
  const listRequestHref = session ? "/requests/new" : `/login?next=${encodeURIComponent("/requests/new")}`;
  const loginBrowseHref = `/login?next=${encodeURIComponent("/marketplace")}`;
  const myListedServices = useMemo(() => {
    const uid = session?.user?.id;
    if (!uid) return 0;
    const all = (data?.services as ServiceRow[]) ?? [];
    return all.filter(s => s.ownerId && String(s.ownerId) === String(uid)).length;
  }, [data?.services, session?.user?.id]);

  if (loading) {
    return <PageRouteLoading title="Loading marketplace" subtitle="Fetching services and requests." />;
  }

  if (err) {
    return (
      <p className="text-error px-2" role="alert">
        {err}
      </p>
    );
  }

  const totalListings = services.length + requests.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero header */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:block hidden"/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full dark:block hidden"/>
        
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Store size={12}/> Marketplace
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find the right work faster</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Discover AI-matched briefs and specialists first, then browse every live request and service from BrandForge and our matching network.
              </p>
              {eco ? (
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
                      Est. marketplace volume
                    </p>
                    <p className="font-mono text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${eco.volumeUsdEstimate.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-600/90 dark:text-sky-400/90">
                      Active listings
                    </p>
                    <p className="font-mono text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400">
                      {eco.listingsActive.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600/90 dark:text-violet-300/90">
                      Deals closed
                    </p>
                    <p className="font-mono text-lg font-bold tabular-nums text-violet-600 dark:text-violet-300">
                      {eco.dealsClosed.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* View toggle (Browse vs Smart Match) */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1 lg:w-auto">
            <button
              type="button"
              onClick={() =>
                replaceQuery(u => {
                  u.delete("view");
                })
              }
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === "browse" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Grid3X3 size={14}/> Browse
            </button>
            <button
              type="button"
              onClick={() =>
                replaceQuery(u => {
                  u.set("view", "smart-match");
                })
              }
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === "smart-match" ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Sparkles size={14}/> Smart Match
              <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] dark:bg-white/20">AI</span>
            </button>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-auto lg:w-auto">
            <Link href={listRequestHref} className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm transition hover:border-border/80">
              <Plus size={14}/> Request Service
            </Link>
            <Link href={listServiceHref} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              <Briefcase size={14}/> Offer Service
            </Link>
          </div>
        </div>

        {/* Smart Match View */}
        {viewMode === "smart-match" && (
          <div className="py-4">
            <SmartMatchEngine />
          </div>
        )}

        {/* Browse View */}
        {viewMode === "browse" && (
          <>
            <div className="mb-5 grid gap-2 sm:grid-cols-3">
              {[
                {
                  id: "featured",
                  label: "Featured",
                  count: featuredCount,
                  note: "Active bids, proven sellers, urgent briefs",
                  className: "border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300",
                },
                {
                  id: "new",
                  label: "New",
                  count: newCount,
                  note: "Fresh listings from the last 14 days",
                  className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                },
                {
                  id: "all",
                  label: "All live",
                  count: totalListings,
                  note: "BrandForge plus Discord and Telegram reach",
                  className: "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
                },
              ].map((c) => {
                const active = collection === c.id || (collection === "all" && c.id === "all");
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      replaceQuery(u => {
                        if (c.id === "all") u.delete("collection");
                        else u.set("collection", c.id);
                      })
                    }
                    className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      active ? c.className : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{c.label}</span>
                      <span className="font-mono text-lg font-black tabular-nums">{c.count}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug opacity-80">{c.note}</p>
                  </button>
                );
              })}
            </div>

            {/* Search + filters row */}
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/>
                <input
                  value={searchDraft}
                  onChange={e => setSearchDraft(e.target.value)}
                  placeholder="Search services, skills, or requests..."
                  className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  aria-label="Search marketplace"
                />
              </div>
              
              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-muted/50 p-1">
                {[
                  { id: "all", label: "All", icon: Grid3X3 },
                  { id: "services", label: "Services", icon: Briefcase },
                  { id: "requests", label: "Requests", icon: FileText },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        replaceQuery(u => {
                          if (t.id === "all") u.delete("tab");
                          else u.set("tab", t.id);
                        })
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                        listingType === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                      <Icon size={12}/>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition hover:border-border/80 lg:w-auto"
                >
                  Sort: <span className="text-primary">
                    {sortBy === "trending" ? "Trending" : 
                     sortBy === "newest" ? "Newest" : 
                     sortBy === "price-low" ? "Price: Low to High" : 
                     "Price: High to Low"}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}/>
                </button>
                
                {showSortDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {[
                      { id: "trending", label: "Trending" },
                      { id: "newest", label: "Newest" },
                      { id: "price-low", label: "Price: Low to High" },
                      { id: "price-high", label: "Price: High to Low" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          replaceQuery(u => {
                            if (opt.id === "trending") u.delete("sort");
                            else u.set("sort", opt.id);
                          });
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${
                          sortBy === opt.id 
                            ? "bg-muted text-foreground" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{visibleListings.length}</span>
                <span className="text-muted-foreground"> / {totalListings}</span>
                <span className="hidden sm:inline"> offers and briefs</span>
              </div>
              <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Bookmark size={12} /> Saved
              </button>
            </div>

            {/* Listings grid */}
            {visibleListings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-muted-foreground/60"/>
                </div>
                <p className="text-muted-foreground font-medium mb-2">No listings found</p>
                <p className="text-sm text-muted-foreground/80 mb-6">
                  {q
                    ? "Try adjusting your search or filters."
                    : session
                      ? "List an offer or post what you need so the marketplace has something to browse."
                      : "Sign in to add the first listing, or widen your search."}
                </p>
                <div className="flex flex-col items-center gap-3">
                  {!session ? (
                    <>
                      <Link
                        href={loginBrowseHref}
                        className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                      >
                        Sign in to post a listing
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchDraft("");
                          replaceQuery(u => {
                            u.delete("q");
                            u.delete("tab");
                            u.delete("sort");
                          });
                        }}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Clear search
                      </button>
                    </>
                  ) : q ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchDraft("");
                        replaceQuery(u => u.delete("q"));
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    >
                      Clear search
                    </button>
                  ) : listingType === "requests" ? (
                    <>
                      <Link
                        href={listRequestHref}
                        className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                      >
                        Post a request
                      </Link>
                      <Link
                        href={listServiceHref}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        List a service instead
                      </Link>
                    </>
                  ) : listingType === "services" ? (
                    <>
                      <Link
                        href={listServiceHref}
                        className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                      >
                        Offer a service
                      </Link>
                      <Link
                        href={listRequestHref}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Post a request instead
                      </Link>
                    </>
                  ) : myListedServices > 0 ? (
                    <>
                      <Link
                        href={listRequestHref}
                        className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                      >
                        Post a request
                      </Link>
                      <Link
                        href={listServiceHref}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Add another service listing
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={listServiceHref}
                        className="inline-flex px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition"
                      >
                        Offer a service
                      </Link>
                      <Link
                        href={listRequestHref}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Post a request instead
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/50 shadow-sm backdrop-blur-sm">
                  {visibleListings.map((item, index) => {
                    const isService = item._type === "service" || (!item._type && "price" in item);
                    const rowKey = isService ? `svc-${(item as ServiceRow).id || "unknown"}` : `req-${(item as Req).id || "unknown"}`;
                    const expanded = expandedKey === rowKey;
                    
                    // For guests, show first 6 items, then AuthWall for rest
                    const shouldShowAuthWall = !session && index >= 6;
                    
                    if (isService) {
                      const s = item as ServiceRow;
                      return (
                        <AuthWall
                          key={rowKey}
                          feature="Marketplace"
                          ctaText={`Sign in to see all ${visibleListings.length} specialists`}
                          preview={
                            <div className="border-b border-border/60 px-4 py-3.5 sm:py-4 opacity-30">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded bg-muted" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-3/4 rounded bg-muted" />
                                  <div className="h-3 w-1/2 rounded bg-muted" />
                                </div>
                              </div>
                            </div>
                          }
                        >
                          <MarketplaceRow
                            expanded={expanded}
                            onToggle={() => setExpandedKey(prev => (prev === rowKey ? null : rowKey))}
                            heading={s.title || "Untitled service"}
                            subheading={`Offer · ${s.cat || "Service"}`}
                            rightMeta={`$${s.price?.toLocaleString() || "—"}`}
                            compactMeta={
                              <>
                                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                  open
                                </span>
                                <span>{s.offers || s.sales || 0} offers</span>
                                <span className="opacity-40">·</span>
                                <span>{s.deliveryDays != null ? `${s.deliveryDays}d` : "—"}</span>
                                {s.createdAt ? (
                                  <>
                                    <span className="opacity-40">·</span>
                                    <PostedAgo iso={s.createdAt} />
                                  </>
                                ) : null}
                              </>
                            }
                          >
                            <ServiceDetails service={s} session={session} />
                          </MarketplaceRow>
                        </AuthWall>
                      );
                    } else {
                      const r = item as Req;
                      return (
                        <AuthWall
                          key={rowKey}
                          feature="Marketplace"
                          ctaText={`Sign in to see all ${visibleListings.length} requests`}
                          preview={
                            <div className="border-b border-border/60 px-4 py-3.5 sm:py-4 opacity-30">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded bg-muted" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-3/4 rounded bg-muted" />
                                  <div className="h-3 w-1/2 rounded bg-muted" />
                                </div>
                              </div>
                            </div>
                          }
                        >
                          <MarketplaceRow
                            expanded={expanded}
                            onToggle={() => setExpandedKey(prev => (prev === rowKey ? null : rowKey))}
                            heading={r.title || "Untitled request"}
                            subheading={`Request · ${r.category || "General"}`}
                            rightMeta={formatRequestBudget(r)}
                            compactMeta={
                              <>
                                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                  open
                                </span>
                                <span>{r.bids ?? 0} proposals</span>
                                <span className="opacity-40">·</span>
                                <span>{r.days != null && r.days >= 0 ? `${r.days}d` : "—"}</span>
                                {r.createdAt ? (
                                  <>
                                    <span className="opacity-40">·</span>
                                    <PostedAgo iso={r.createdAt} />
                                  </>
                                ) : null}
                              </>
                            }
                          >
                            <RequestDetails request={r} session={session} />
                          </MarketplaceRow>
                        </AuthWall>
                      );
                    }
                  })}
                </div>

                {!session && visibleListings.length > 6 && (
                  <AuthWall
                    feature="Marketplace"
                    ctaText={`Sign in to see all ${visibleListings.length} specialists`}
                    preview={<div />}
                  >
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      Showing 6 of {visibleListings.length} listings
                    </div>
                  </AuthWall>
                )}
              </>
            )}

            <div className="mt-8 text-center text-xs text-muted-foreground">
              New listings sync here and to the configured Discord and Telegram channels as they are posted.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MarketplaceRow({
  expanded,
  onToggle,
  heading,
  subheading,
  rightMeta,
  compactMeta,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  heading: string;
  subheading: string;
  rightMeta: string;
  compactMeta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/60 last:border-b-0 last:rounded-b-2xl first:rounded-t-2xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-muted/30 sm:py-4"
      >
        <ChevronDown
          size={18}
          className={`mt-0.5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
        />
        <div className="min-w-0 flex-1 pr-2">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{heading}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subheading}</p>
          {compactMeta ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] tabular-nums text-muted-foreground">
              {compactMeta}
            </div>
          ) : null}
        </div>
        <span className="shrink-0 pt-0.5 text-right text-sm font-bold tabular-nums text-primary">{rightMeta}</span>
      </button>
      {expanded ? (
        <div className="border-t border-border/60 bg-muted/10 px-4 py-4 sm:px-5">{children}</div>
      ) : null}
    </div>
  );
}

function ServiceDetails({ service, session }: { service: ServiceRow; session: ReturnType<typeof useAuth>["session"] }) {
  const ownerU = (service.ownerUsername || "").trim();
  const isMine = Boolean(session?.user?.id && service.ownerId && String(session.user.id) === String(service.ownerId));
  const detailHref = service.id ? `/services/${service.id}` : "/marketplace";
  const bidHref = service.id ? `/bid/service?id=${encodeURIComponent(service.id || "")}` : "/marketplace";
  const profileHref = ownerU ? `/p/${encodeURIComponent(ownerU)}` : null;
  const dealLbl = formatDealRecordShort(service.ownerDealWins, service.ownerDealLosses);
  const tier = reputationTier(service.ownerReputation, service.ownerDealWins);
  const deliveryChip = serviceDeliveryChip(service.deliveryDays);

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">{service.description || "No description provided."}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[service.sel].filter(Boolean).map((tag, i) => (
          <span key={i} className="text-[10px] px-2 py-1 bg-muted text-muted-foreground rounded border border-border">
            {tag}
          </span>
        ))}
        <span className="text-[10px] px-2 py-1 rounded border border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300">
          Discord
        </span>
        <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          Telegram
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{dealLbl ?? "No closed deals yet"}</span>
        <span className="opacity-40">·</span>
        <span className={`font-semibold ${tierColors[tier]}`}>{tier}</span>
        {deliveryChip ? (
          <>
            <span className="opacity-40">·</span>
            <span>{deliveryChip}</span>
          </>
        ) : null}
      </div>
      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye size={12}/> {service.views || 0} views
        </div>
        <div className="flex items-center gap-1">
          <Briefcase size={12}/> {service.offers || service.sales || 0} offers
        </div>
      </div>
      <p className="mb-3 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        Listed on BrandForge and broadcast to configured Discord and Telegram matching channels for faster buyer discovery.
      </p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="p-3 bg-muted/50 border border-border rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Starting at</div>
          <div className="text-lg font-bold">${service.price?.toLocaleString() || "—"}</div>
        </div>
        <div className="p-3 bg-muted/50 border border-border rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Delivery</div>
          <div className="text-lg font-bold flex items-center gap-1.5">
            <Clock size={14} className="text-muted-foreground"/>
            ~{service.deliveryDays || "?"} days
          </div>
        </div>
      </div>
      <Link href={isMine ? detailHref : bidHref}>
        <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
          isMine
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-amber-500 text-black hover:bg-amber-400"
        }`}>
          {isMine ? "Manage listing" : "Book offer"}
          <ArrowRight size={14}/>
        </button>
      </Link>
    </div>
  );
}

function RequestDetails({ request, session }: { request: Req; session: ReturnType<typeof useAuth>["session"] }) {
  const isMine = request.isUserCreated;
  const detailHref = request.id ? `/requests/${request.id}` : "/marketplace";
  const bidHref = request.id ? `/bid/request?id=${encodeURIComponent(request.id || "")}` : "/marketplace";
  const dealLbl = formatDealRecordShort(request.ownerDealWins, request.ownerDealLosses);
  const tier = reputationTier(request.ownerReputation, request.ownerDealWins);
  const timelineLbl = requestTimelineLabel(request.days);

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">{request.desc || "No description provided."}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(request.tags || []).slice(0, 3).map((tag, i) => (
          <span key={i} className="text-[10px] px-2 py-1 bg-muted text-muted-foreground rounded border border-border">
            {tag}
          </span>
        ))}
        <span className="text-[10px] px-2 py-1 rounded border border-purple-500/25 bg-purple-500/10 text-purple-700 dark:text-purple-300">
          Discord
        </span>
        <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          Telegram
        </span>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{dealLbl ?? "No deal history yet"}</span>
        <span className="opacity-40">·</span>
        <span className={`font-semibold ${tierColors[tier]}`}>{tier}</span>
        <span className="opacity-40">·</span>
        <span>Timeline {timelineLbl}</span>
      </div>
      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye size={12}/> {request.views || 0} views
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare size={12}/> {request.bids || 0} bids
        </div>
      </div>
      <p className="mb-3 rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        Posted on BrandForge and broadcast to configured Discord and Telegram matching channels so freelancers can respond faster.
      </p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="p-3 bg-muted/50 border border-border rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Budget</div>
          <div className="text-lg font-bold">{formatRequestBudget(request)}</div>
        </div>
        <div className="p-3 bg-muted/50 border border-border rounded-xl">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Deadline</div>
          <div className="text-lg font-bold flex items-center gap-1.5">
            <Clock size={14} className="text-muted-foreground"/>
            {request.days || "?"} days
          </div>
        </div>
      </div>
      <Link href={isMine ? detailHref : request.canBid !== false ? bidHref : detailHref}>
        <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
          isMine
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-sky-500 text-black hover:bg-sky-400"
        }`}>
          {isMine ? "Manage request" : request.canBid !== false ? "Submit proposal" : "View"}
          <ArrowRight size={14}/>
        </button>
      </Link>
    </div>
  );
}
