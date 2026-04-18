"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { SmartMatchEngine } from "@/components/marketplace/SmartMatchEngine";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { formatDealRecordShort } from "@/lib/deal-record";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";

type ListingType = "all" | "services" | "requests";
type ViewMode = "browse" | "smart-match";

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

const CATEGORIES = ["All", "Development", "Design", "Strategy", "AI Training", "3D Motion", "Smart Contracts"] as const;
type CategoryId = (typeof CATEGORIES)[number];

function serviceDeliveryChip(days: number | null | undefined): string | null {
  if (days == null || !Number.isFinite(Number(days))) return null;
  const d = Math.round(Number(days));
  if (d <= 0) return null;
  return d === 1 ? "1-day turnaround" : `~${d} days delivery`;
}

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

function matchesCategory(item: ServiceRow | Req, cat: CategoryId, type: "service" | "request"): boolean {
  if (cat === "All") return true;
  const needle = cat.toLowerCase();
  if (type === "service") {
    const s = item as ServiceRow;
    const c = (s.cat || "").toLowerCase();
    return c.includes(needle);
  }
  const r = item as Req;
  const c = (r.category || "").toLowerCase();
  if (c && c.includes(needle)) return true;
  const tags = (r.tags || []).map((t) => t.toLowerCase().replace(/_/g, " "));
  return tags.some((t) => t.includes(needle));
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

export function UnifiedMarketplace() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [listingType, setListingType] = useState<ListingType>("all");
  const [category, setCategory] = useState<CategoryId>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const { data, err, loading } = useBootstrap();
  const { session } = useAuth();

  const services = useMemo(() => {
    const all = (data?.services as ServiceRow[]) ?? [];
    const filtered = all.filter((s) => matchesQuery(s, q, "service") && matchesCategory(s, category, "service"));
    return [...filtered].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [data?.services, q, category]);

  const requests = useMemo(() => {
    const all = (data?.requests as Req[]) ?? [];
    const open = all.filter((r) => r.status !== "closed" && r.status !== "awarded");
    const filtered = open.filter((r) => matchesQuery(r, q, "request") && matchesCategory(r, category, "request"));
    return [...filtered].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [data?.requests, q, category]);

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

  return (
    <div className="page-root pb-12">
      <div className="page-content space-y-6 !pb-6">
        {/* Header */}
        <header className="mb-10 flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="min-w-0 max-w-xl">
            <p className="section-label">Marketplace</p>
            <h1 className="page-title">The Arena</h1>
            <p className="page-subtitle max-w-xl">
              Hire pros. Offer skills. AI matches you instantly.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-6 sm:items-end md:w-auto md:text-right">
            <div className="flex gap-2">
              <Link href={listServiceHref} className="btn-primary min-h-11">
                <span className="material-symbols-outlined text-sm">add_business</span>
                Offer Service
              </Link>
              <Link href={listRequestHref} className="btn-secondary min-h-11">
                <span className="material-symbols-outlined text-sm">post_add</span>
                Request Service
              </Link>
            </div>
          </div>
        </header>

        {/* View Mode Tabs */}
        <div className="flex gap-2 border-b border-outline-variant/60">
          <button
            onClick={() => setViewMode("browse")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              viewMode === "browse"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined">grid_view</span>
            Browse
          </button>
          <button
            onClick={() => setViewMode("smart-match")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              viewMode === "smart-match"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Smart Match
          </button>
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
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Listing Type Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface-container-low p-1">
                {[
                  { id: "all", label: "All", icon: "apps" },
                  { id: "services", label: "Services", icon: "business_center" },
                  { id: "requests", label: "Requests", icon: "assignment" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setListingType(t.id as ListingType)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-headline font-600 tracking-[0.04em] transition-colors duration-150 ${
                      listingType === t.id
                        ? "bg-surface-container-highest text-on-surface"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface-container-low p-1">
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
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-body text-on-surface-variant">
                {listingType === "all" && `${services.length} services, ${requests.length} requests`}
                {listingType === "services" && `${services.length} services`}
                {listingType === "requests" && `${requests.length} requests`}
                {category !== "All" && ` · ${category}`}
              </p>
            </div>

            {/* Listings Grid */}
            {combinedListings.items.length === 0 ? (
              <div className="empty-state py-16">
                <span className="material-symbols-outlined empty-state-icon" aria-hidden>
                  inventory_2
                </span>
                <p className="empty-state-title">No listings found</p>
                <p className="empty-state-body">
                  {q || category !== "All"
                    ? "Try adjusting your filters or browse all categories."
                    : "Be the first to list a service or post a request."}
                </p>
                <div className="mt-4 flex gap-3 justify-center">
                  <Link href={listServiceHref} className="btn-primary">
                    Offer Service
                  </Link>
                  <Link href={listRequestHref} className="btn-secondary">
                    Request Service
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {combinedListings.items.map((item: ServiceRow | Req) => {
                  const isService = item._type === "service" || (!item._type && "price" in item);
                  
                  if (isService) {
                    const s = item as ServiceRow;
                    const pro = isPro(s);
                    const detailHref = s.id ? `/services/${s.id}` : "/services";
                    const bidHref = s.id ? `/bid/service?id=${encodeURIComponent(s.id || "")}` : "/services";
                    const ownerU = (s.ownerUsername || "").trim();
                    const isMine = Boolean(session?.user?.id && s.ownerId && String(session.user.id) === String(s.ownerId));
                    const dealLbl = formatDealRecordShort(s.ownerDealWins, s.ownerDealLosses);
                    const deliveryChip = serviceDeliveryChip(s.deliveryDays);
                    const desc = (s.description || "").trim();
                    const profileHref = ownerU ? `/p/${encodeURIComponent(ownerU)}` : null;

                    return (
                      <li key={`svc-${s.id}`}>
                        <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low transition-colors duration-150 hover:border-outline">
                          <div className="flex flex-1 flex-col p-5">
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span className="pill-default">{s.cat || "Service"}</span>
                              <span className="pill-primary text-[10px]">OFFER</span>
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
                                  <span className="text-on-surface-variant/50" aria-hidden>·</span>
                                  <span className="pill-primary text-[10px]">Pro</span>
                                </>
                              ) : null}
                              {s.rating && s.rating !== "New" ? (
                                <>
                                  <span className="text-on-surface-variant/50" aria-hidden>·</span>
                                  <span>{s.rating}</span>
                                </>
                              ) : null}
                              {s.ownerReputation != null && s.ownerReputation > 0 ? (
                                <>
                                  <span className="text-on-surface-variant/50" aria-hidden>·</span>
                                  <span>Rep {Math.round(s.ownerReputation).toLocaleString()}</span>
                                </>
                              ) : null}
                              {dealLbl ? (
                                <>
                                  <span className="text-on-surface-variant/50" aria-hidden>·</span>
                                  <span>{dealLbl}</span>
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
                  } else {
                    // Request
                    const r = item as Req;
                    const band = bandUi(r.band);
                    const detailHref = r.id ? `/requests/${r.id}` : "/requests";
                    const bidHref = r.id ? `/bid/request?id=${encodeURIComponent(r.id || "")}` : "/requests";
                    const dealLbl = formatDealRecordShort(r.ownerDealWins, r.ownerDealLosses);

                    return (
                      <li key={`req-${r.id}`}>
                        <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-low transition-colors duration-150 hover:border-outline">
                          <div className="flex flex-1 flex-col p-5">
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <span className={`font-headline inline-flex items-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-high/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${band.text}`}>
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${band.dot}`} aria-hidden />
                                {band.label}
                              </span>
                              <span className="pill-secondary text-[10px]">REQUEST</span>
                              {r.isUserCreated ? (
                                <span className="text-[11px] font-headline font-500 uppercase tracking-[0.04em] text-primary/80">
                                  Your brief
                                </span>
                              ) : null}
                            </div>
                            <Link href={detailHref}>
                              <h3 className="mb-2 text-[15px] font-headline font-600 tracking-[-0.01em] text-on-surface leading-[1.3] transition-colors group-hover:text-primary/90">
                                {r.title || "Untitled brief"}
                              </h3>
                            </Link>
                            {r.desc ? (
                              <p className="line-clamp-2 text-[13px] font-body leading-relaxed text-on-surface-variant">{r.desc}</p>
                            ) : null}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="border-outline-variant/25 bg-surface-container-high/70 text-on-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold tabular-nums">
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]" aria-hidden>
                                  payments
                                </span>
                                {formatRequestBudget(r)}
                              </span>
                              <span className="border-outline-variant/25 text-on-surface-variant inline-flex items-center gap-1.5 rounded-lg border bg-surface-container-high/40 px-2.5 py-1.5 text-[12px] font-medium">
                                <span className="material-symbols-outlined text-[16px]" aria-hidden>
                                  schedule
                                </span>
                                {requestTimelineLabel(r.days)}
                              </span>
                              {typeof r.bids === "number" && r.bids > 0 ? (
                                <span className="border-outline-variant/25 text-on-surface-variant inline-flex items-center gap-1.5 rounded-lg border bg-surface-container-high/40 px-2.5 py-1.5 text-[12px] font-medium">
                                  <span className="material-symbols-outlined text-[16px]" aria-hidden>
                                    forum
                                  </span>
                                  {r.bids} bid{r.bids === 1 ? "" : "s"}
                                </span>
                              ) : null}
                            </div>
                            {r.category ? (
                              <p className="mt-3 text-[11px] font-headline font-bold uppercase tracking-wide text-on-surface-variant">
                                {r.category}
                                {r.ownerReputation != null && r.ownerReputation > 0 ? (
                                  <span> · Rep {Math.round(r.ownerReputation).toLocaleString()}</span>
                                ) : null}
                                {dealLbl ? <span> · {dealLbl}</span> : null}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center justify-end border-t border-outline-variant/40 bg-surface-container-low/40 px-5 py-3">
                            <Link
                              href={r.isUserCreated ? detailHref : r.canBid !== false ? bidHref : detailHref}
                              className={`flex min-h-[44px] items-center gap-1 text-[12px] font-headline font-600 transition-colors hover:opacity-80 ${
                                r.isUserCreated ? "text-on-surface-variant" : "text-primary"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]" aria-hidden>
                                {r.isUserCreated ? "edit" : r.canBid !== false ? "gavel" : "visibility"}
                              </span>
                              {r.isUserCreated ? "Manage" : r.canBid !== false ? "Place Bid" : "View"}
                            </Link>
                          </div>
                        </article>
                      </li>
                    );
                  }
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
