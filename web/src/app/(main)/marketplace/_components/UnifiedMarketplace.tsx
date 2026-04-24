"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { SmartMatchEngine } from "@/components/marketplace/SmartMatchEngine";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { formatDealRecordShort } from "@/lib/deal-record";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";
import {
  Store, Sparkles, Grid3X3, Briefcase, FileText, Search, SlidersHorizontal,
  Clock, ChevronDown, Plus, ArrowRight, Eye,
  Bookmark, MessageSquare, Star, Tag
} from "lucide-react";

type ListingType = "all" | "services" | "requests";
type ViewMode = "browse" | "smart-match";
type SortOption = "trending" | "newest" | "price-low" | "price-high";

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
  if (v === "smart-match") return "smart-match";
  return "browse";
}

function parseSort(raw: string | null): SortOption {
  const s = (raw || "").toLowerCase();
  if (s === "newest" || s === "price-low" || s === "price-high") return s;
  return "trending";
}

export function UnifiedMarketplace() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const qFromUrl = (params.get("q") || "").trim();
  const listingType = parseListingTab(params.get("tab"));
  const viewMode = parseViewMode(params.get("view"));
  const sortBy = parseSort(params.get("sort"));
  const [searchDraft, setSearchDraft] = useState(qFromUrl);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { data, err, loading } = useBootstrap();
  const { session } = useAuth();

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
        
        <div className="relative max-w-7xl mx-auto px-8 py-10">
          <div className="mb-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <Store size={12}/> Marketplace
              </div>
              <h1 className="text-4xl font-bold">Browse opportunities</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* View toggle (Browse vs Smart Match) */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1">
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
          <div className="ml-auto flex items-center gap-2">
            <Link href={listRequestHref} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm transition hover:border-border/80">
              <Plus size={14}/> Request Service
            </Link>
            <Link href={listServiceHref} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
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
            {/* Search + filters row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/>
                <input
                  value={searchDraft}
                  onChange={e => setSearchDraft(e.target.value)}
                  placeholder="Search services, skills, or requests..."
                  className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  aria-label="Search marketplace"
                />
              </div>
              
              <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-xl">
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
                  className="flex items-center gap-2 px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm hover:border-border/80 transition"
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
                Showing <span className="text-foreground font-medium">{combinedListings.items.length}</span> of {totalListings} listings
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Bookmark size={12}/> Saved listings
              </button>
            </div>

            {/* Listings grid */}
            {combinedListings.items.length === 0 ? (
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
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
                {combinedListings.items.map((item) => {
                  const isService = item._type === "service" || (!item._type && "price" in item);
                  const rowKey = isService ? `svc-${(item as ServiceRow).id || "unknown"}` : `req-${(item as Req).id || "unknown"}`;
                  const expanded = expandedKey === rowKey;
                  if (isService) {
                    const s = item as ServiceRow;
                    return (
                      <MarketplaceRow
                        key={rowKey}
                        expanded={expanded}
                        onToggle={() => setExpandedKey(prev => (prev === rowKey ? null : rowKey))}
                        heading={s.title || "Untitled service"}
                        subheading={`Offer · ${s.cat || "Service"}`}
                        rightMeta={`$${s.price?.toLocaleString() || "—"}`}
                      >
                        <ServiceDetails service={s} session={session} />
                      </MarketplaceRow>
                    );
                  } else {
                    const r = item as Req;
                    return (
                      <MarketplaceRow
                        key={rowKey}
                        expanded={expanded}
                        onToggle={() => setExpandedKey(prev => (prev === rowKey ? null : rowKey))}
                        heading={r.title || "Untitled request"}
                        subheading={`Request · ${r.category || "General"}`}
                        rightMeta={formatRequestBudget(r)}
                      >
                        <RequestDetails request={r} session={session} />
                      </MarketplaceRow>
                    );
                  }
                })}
              </div>
            )}

            {/* Load more */}
            <div className="flex justify-center mt-8">
              <button className="px-6 py-3 bg-muted/50 border border-border rounded-xl text-sm hover:border-border/80 transition">
                Load more listings
              </button>
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
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  heading: string;
  subheading: string;
  rightMeta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40"
      >
        <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{heading}</p>
          <p className="truncate text-xs text-muted-foreground">{subheading}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-foreground">{rightMeta}</span>
      </button>
      {expanded ? <div className="border-t border-border bg-background px-4 py-4">{children}</div> : null}
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
          {isMine ? "Manage listing" : "Hire now"}
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
