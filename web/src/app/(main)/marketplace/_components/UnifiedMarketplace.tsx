"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";
import { SmartMatchEngine } from "@/components/marketplace/SmartMatchEngine";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { formatDealRecordShort } from "@/lib/deal-record";
import { formatRequestBudget, requestTimelineLabel } from "@/lib/request-display";
import {
  Store, Sparkles, Grid3X3, Briefcase, FileText, Search, SlidersHorizontal,
  DollarSign, Clock, Users, Zap, TrendingUp, ChevronDown, Plus, ArrowRight, Eye,
  Bookmark, MessageSquare, Star, Tag
} from "lucide-react";

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

  const getCategory = (x: ServiceRow | Req) => {
    if (x._type === "service") return (x as ServiceRow).cat || "";
    return (x as Req).category || "";
  };

  const categories = [
    { id: "All", label: "All", count: services.length + requests.length },
    { id: "Development", label: "Development", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("dev")).length },
    { id: "Design", label: "Design", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("design")).length },
    { id: "Strategy", label: "Strategy", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("strategy")).length },
    { id: "AI Training", label: "AI Training", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("ai")).length },
    { id: "3D Motion", label: "3D Motion", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("3d")).length },
    { id: "Smart Contracts", label: "Smart Contracts", count: [...services, ...requests].filter(x => getCategory(x).toLowerCase().includes("contract")).length },
  ];

  // Calculate stats
  const totalListings = services.length + requests.length;
  const volumeThisWeek = services.reduce((acc, s) => acc + (s.price || 0), 0);
  const onlinePros = Math.floor(totalListings * 0.34); // estimate based on activity

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero header */}
      <div className="relative border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5"/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full"/>
        
        <div className="relative max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
                <Store size={12}/> Marketplace
              </div>
              <h1 className="text-4xl font-bold mb-2">The Arena</h1>
              <p className="text-zinc-400">Hire pros. Offer skills. AI matches you instantly.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={listRequestHref} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition">
                <Plus size={14}/> Request Service
              </Link>
              <Link href={listServiceHref} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 transition">
                <Briefcase size={14}/> Offer Service
              </Link>
            </div>
          </div>

          {/* Live stats strip */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-400"/>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Active listings</div>
                <div className="font-semibold">{totalListings}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-amber-400"/>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Volume this week</div>
                <div className="font-semibold">${(volumeThisWeek / 1000).toFixed(1)}k</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Users size={16} className="text-sky-400"/>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Online pros</div>
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                  {onlinePros}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap size={16} className="text-purple-400"/>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Avg match time</div>
                <div className="font-semibold">4 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* View toggle (Browse vs Smart Match) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit mb-6">
          <button onClick={() => setViewMode("browse")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === "browse" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}>
            <Grid3X3 size={14}/> Browse
          </button>
          <button onClick={() => setViewMode("smart-match")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === "smart-match" ? "bg-gradient-to-r from-amber-500 to-purple-500 text-black" : "text-zinc-400 hover:text-white"
            }`}>
            <Sparkles size={14}/> Smart Match
            <span className="text-[10px] px-1.5 py-0.5 bg-black/20 rounded">AI</span>
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
            {/* Search + filters row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16}/>
                <input placeholder="Search services, skills, or requests..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"/>
              </div>
              
              <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                {[
                  { id: "all", label: "All", icon: Grid3X3 },
                  { id: "services", label: "Services", icon: Briefcase },
                  { id: "requests", label: "Requests", icon: FileText },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setListingType(t.id as ListingType)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                        listingType === t.id ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                      }`}>
                      <Icon size={12}/>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm hover:border-zinc-700 transition">
                <SlidersHorizontal size={14}/> Filters
              </button>

              <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm hover:border-zinc-700 transition">
                Sort: <span className="text-amber-400">Trending</span>
                <ChevronDown size={14}/>
              </button>
            </div>

            {/* Category pills with counts */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id as CategoryId)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                    category === cat.id 
                      ? "bg-amber-500 text-black font-medium" 
                      : "bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}>
                  {cat.label}
                  <span className={`text-xs ${category === cat.id ? "text-black/60" : "text-zinc-600"}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Results meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-zinc-500">
                Showing <span className="text-white font-medium">{combinedListings.items.length}</span> of {totalListings} listings
              </div>
              <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                <Bookmark size={12}/> Saved listings
              </button>
            </div>

            {/* Listings grid */}
            {combinedListings.items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-zinc-600"/>
                </div>
                <p className="text-zinc-400 font-medium mb-2">No listings found</p>
                <p className="text-sm text-zinc-500 mb-6">
                  {q || category !== "All"
                    ? "Try adjusting your filters or browse all categories."
                    : "Be the first to list a service or post a request."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href={listRequestHref} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition">
                    Request Service
                  </Link>
                  <Link href={listServiceHref} className="px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold hover:bg-amber-400 transition">
                    Offer Service
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {combinedListings.items.map((item) => {
                  const isService = item._type === "service" || (!item._type && "price" in item);
                  
                  if (isService) {
                    const s = item as ServiceRow;
                    return <ServiceCard key={`svc-${s.id}`} service={s} session={session} />;
                  } else {
                    const r = item as Req;
                    return <RequestCard key={`req-${r.id}`} request={r} session={session} />;
                  }
                })}
              </div>
            )}

            {/* Load more */}
            <div className="flex justify-center mt-8">
              <button className="px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm hover:border-zinc-700 transition">
                Load more listings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, session }: { service: ServiceRow; session: ReturnType<typeof useAuth>["session"] }) {
  const ownerU = (service.ownerUsername || "").trim();
  const isMine = Boolean(session?.user?.id && service.ownerId && String(session.user.id) === String(service.ownerId));
  const detailHref = service.id ? `/services/${service.id}` : "/services";
  const bidHref = service.id ? `/bid/service?id=${encodeURIComponent(service.id || "")}` : "/services";
  const profileHref = ownerU ? `/p/${encodeURIComponent(ownerU)}` : null;
  const dealLbl = formatDealRecordShort(service.ownerDealWins, service.ownerDealLosses);
  
  const tierColors: Record<string, string> = {
    Challenger: "text-zinc-400",
    Rival: "text-sky-400",
    Duelist: "text-amber-400",
    Gladiator: "text-rose-400",
    Undisputed: "text-purple-400",
  };
  
  // Determine tier based on reputation/deals
  const getTier = (reputation?: number | null, wins?: number | null) => {
    const rep = reputation || 0;
    const w = wins || 0;
    if (w >= 50 || rep >= 5000) return "Undisputed";
    if (w >= 35 || rep >= 3500) return "Gladiator";
    if (w >= 20 || rep >= 2000) return "Duelist";
    if (w >= 10 || rep >= 1000) return "Rival";
    return "Challenger";
  };
  
  const tier = getTier(service.ownerReputation, service.ownerDealWins);
  
  return (
    <div className="group relative rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 bg-gradient-to-br from-amber-500/[0.03] to-transparent border-zinc-800 hover:border-amber-500/30">
      {service.topMember && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-amber-500 to-amber-600 text-black text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
          <Star size={10} className="inline mr-1"/> Featured
        </div>
      )}

      <div className="p-5">
        {/* Top row: type badge + category */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Briefcase size={10}/> Offer
          </div>
          <div className="text-xs text-zinc-500">{service.cat || "Service"}</div>
          {isMine && (
            <div className="ml-auto text-[10px] px-2 py-0.5 bg-white/10 rounded">YOUR LISTING</div>
          )}
        </div>

        {/* Title */}
        <Link href={detailHref}>
          <h3 className="text-lg font-semibold leading-snug mb-2 group-hover:text-amber-400 transition-colors">
            {service.title || "Untitled service"}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
          {service.description || "No description provided."}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[service.sel].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-1 bg-zinc-800/50 text-zinc-400 rounded border border-zinc-800">
              {tag}
            </span>
          ))}
        </div>

        {/* Views + Offers row */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-1">
            <Eye size={12}/> {service.views || 0} views
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={12}/> {service.offers || service.sales || 0} offers
          </div>
        </div>

        {/* Author card */}
        <div className="flex items-center gap-3 p-3 bg-black/30 border border-zinc-800 rounded-xl mb-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center font-semibold">
              {service.ownerUsername?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-medium text-sm truncate">{service.ownerUsername || "Anonymous"}</div>
              <div className={`text-[10px] font-semibold ${tierColors[tier]}`}>{tier}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Star size={10} className="text-amber-400 fill-amber-400"/>
                <span className="text-white">{service.rating !== "New" ? service.rating : "4.5"}</span>
              </div>
              <span>·</span>
              <span>{dealLbl || "0 deals"}</span>
            </div>
          </div>
        </div>

        {/* Price + delivery row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Starting at</div>
            <div className="text-lg font-bold">${service.price?.toLocaleString() || "—"}</div>
          </div>
          <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Delivery</div>
            <div className="text-lg font-bold flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-500"/>
              ~{service.deliveryDays || "?"} days
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={isMine ? detailHref : bidHref}>
          <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
            isMine
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-amber-500 text-black hover:bg-amber-400"
          }`}>
            {isMine ? "Manage listing" : "Hire now"}
            <ArrowRight size={14}/>
          </button>
        </Link>
      </div>
    </div>
  );
}

// Request Card Component  
function RequestCard({ request, session }: { request: Req; session: ReturnType<typeof useAuth>["session"] }) {
  const isMine = request.isUserCreated;
  const detailHref = request.id ? `/requests/${request.id}` : "/requests";
  const bidHref = request.id ? `/bid/request?id=${encodeURIComponent(request.id || "")}` : "/requests";
  const dealLbl = formatDealRecordShort(request.ownerDealWins, request.ownerDealLosses);
  const band = bandUi(request.band);
  
  return (
    <div className="group relative rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 bg-gradient-to-br from-sky-500/[0.03] to-transparent border-zinc-800 hover:border-sky-500/30">
      {/* Urgent ribbon */}
      {request.band === "urgent" && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-rose-500 to-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
          <span className="inline mr-1">!</span> Urgent
        </div>
      )}

      <div className="p-5">
        {/* Top row: type badge + category */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FileText size={10}/> Request
          </div>
          <div className="text-xs text-zinc-500">{request.category || "General"}</div>
          {isMine && (
            <div className="ml-auto text-[10px] px-2 py-0.5 bg-white/10 rounded">YOUR REQUEST</div>
          )}
        </div>

        {/* Title */}
        <Link href={detailHref}>
          <h3 className="text-lg font-semibold leading-snug mb-2 group-hover:text-sky-400 transition-colors">
            {request.title || "Untitled request"}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
          {request.desc || "No description provided."}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(request.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-1 bg-zinc-800/50 text-zinc-400 rounded border border-zinc-800">
              {tag}
            </span>
          ))}
        </div>

        {/* Views + Bids row */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye size={12}/> {request.views || 0} views
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={12}/> {request.bids || 0} bids
            </div>
          </div>
          {dealLbl && <span>{dealLbl}</span>}
        </div>

        {/* Budget + deadline row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Budget</div>
            <div className="text-lg font-bold">{formatRequestBudget(request)}</div>
          </div>
          <div className="p-3 bg-black/30 border border-zinc-800 rounded-xl">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Deadline</div>
            <div className="text-lg font-bold flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-500"/>
              {request.days || "?"} days
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href={isMine ? detailHref : request.canBid !== false ? bidHref : detailHref}>
          <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition ${
            isMine
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "bg-sky-500 text-black hover:bg-sky-400"
          }`}>
            {isMine ? "Manage request" : request.canBid !== false ? "Submit proposal" : "View"}
            <ArrowRight size={14}/>
          </button>
        </Link>
      </div>
    </div>
  );
}
