"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { getAccessTokenFromBrowserSession } from "@/lib/supabase/access-token";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { useAuth } from "@/providers/AuthProvider";
import { SERVICE_LISTING_CATEGORIES } from "@/lib/service-categories";
import { formatDealRecordShort } from "@/lib/deal-record";
import { ArrowLeft, Edit, Trash2, Save, X, Clock, DollarSign, User, Star, CheckCircle, Package } from "lucide-react";

type Service = {
  id?: string;
  ownerId?: string | null;
  title?: string;
  cat?: string;
  description?: string;
  price?: number;
  sel?: string;
  ownerUsername?: string | null;
  rating?: string;
  coverUrl?: string | null;
  ownerAvatar?: string | null;
  topMember?: boolean;
  deliveryDays?: number;
  deliveryMode?: string;
  createdAt?: string | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

export function ServiceDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<string>(SERVICE_LISTING_CATEGORIES[0]);
  const [editPrice, setEditPrice] = useState("");
  const [editDelivery, setEditDelivery] = useState("7");
  const [editDescription, setEditDescription] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [archiveBusy, setArchiveBusy] = useState(false);

  const loadService = useCallback(async () => {
    const t = await getAccessTokenFromBrowserSession();
    const data = await apiGetJson<{ service: Service }>(`/api/services/${id}`, t);
    const s = data.service || null;
    setService(s);
    return s;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await loadService();
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
          setService(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadService]);

  useEffect(() => {
    if (!manageOpen || !service) return;
    setEditTitle(service.title || "");
    const c = service.cat || "";
    setEditCategory(
      (SERVICE_LISTING_CATEGORIES as readonly string[]).find((x) => x === c) ?? SERVICE_LISTING_CATEGORIES[0],
    );
    setEditPrice(service.price != null ? String(service.price) : "");
    setEditDelivery(service.deliveryDays != null ? String(service.deliveryDays) : "7");
    setEditDescription(service.description || "");
    setSaveErr(null);
  }, [manageOpen, service]);

  if (loading) {
    return <PageRouteLoading title="Loading service" variant="inline" />;
  }

  if (err || !service) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 text-sm mb-4" role="alert">{err || "Service not found."}</p>
          <Link href="/marketplace" className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 justify-center">
            <ArrowLeft size={14}/> Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const pro = Boolean(service.topMember);
  const avatar = safeImageSrc(service.ownerAvatar);
  const ownerUser = (service.ownerUsername || "").trim();
  const dealLbl = formatDealRecordShort(service.ownerDealWins, service.ownerDealLosses);
  const isOwner = Boolean(session?.user?.id && service.ownerId && String(session.user.id) === String(service.ownerId));

  async function onSaveEdits(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) {
      router.push(`/login?next=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }
    setSaveBusy(true);
    try {
      await apiMutateJson<unknown>(
        `/api/services/${id}`, "PATCH",
        { title: editTitle.trim(), category: editCategory, price: editPrice, delivery: editDelivery, description: editDescription.trim() },
        t,
      );
      await loadService();
      setManageOpen(false);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaveBusy(false);
    }
  }

  async function onArchive() {
    if (typeof window !== "undefined" && !window.confirm("Archive this listing? It will disappear from the marketplace.")) return;
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setArchiveBusy(true);
    try {
      await apiMutateJson<unknown>(`/api/services/${id}`, "DELETE", {}, t);
      router.push("/marketplace");
      router.refresh();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not archive");
    } finally {
      setArchiveBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero cover */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {safeImageSrc(service.coverUrl) ? (
          <Image src={safeImageSrc(service.coverUrl)!} alt="" fill className="object-cover" sizes="100vw" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4 transition">
              <ArrowLeft size={14}/> Back to marketplace
            </Link>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-wider mb-2">
                  <Package size={12}/> {service.cat || "Service"}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{service.title}</h1>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-400">${service.price?.toLocaleString() || "—"}</div>
                {service.deliveryDays && (
                  <div className="flex items-center gap-1 text-zinc-500 text-sm mt-1">
                    <Clock size={12}/> {service.deliveryDays} days delivery
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Provider info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-lg font-bold">
                {avatar ? <Image src={avatar} alt="" fill className="object-cover rounded-full" sizes="56px" /> : (service.sel || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {ownerUser ? (
                    <Link href={`/p/${encodeURIComponent(ownerUser)}`} className="font-semibold hover:text-amber-400 transition truncate">
                      @{ownerUser}
                    </Link>
                  ) : (
                    <span className="font-semibold">{service.sel || "Provider"}</span>
                  )}
                  {pro && <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-black rounded-full font-bold">PRO</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                  {service.rating && service.rating !== "New" && (
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400"/> {service.rating}</span>
                  )}
                  {service.ownerReputation != null && service.ownerReputation > 0 && (
                    <span>Rep {Math.round(service.ownerReputation).toLocaleString()}</span>
                  )}
                  {dealLbl && <span>{dealLbl}</span>}
                </div>
              </div>
              {service.createdAt && (
                <div className="text-xs text-zinc-500">
                  <PostedAgo iso={service.createdAt} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Description</h2>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{service.description || "No description provided."}</p>
            </div>

            {/* Owner management */}
            {isOwner && (
              <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2"><Edit size={14}/> Your listing</h3>
                    <p className="text-sm text-zinc-500">Edit or archive this service</p>
                  </div>
                  <button onClick={() => setManageOpen(!manageOpen)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition">
                    {manageOpen ? <X size={14}/> : <Edit size={14}/>}
                  </button>
                </div>
                {manageOpen && (
                  <form onSubmit={onSaveEdits} className="space-y-4 border-t border-zinc-800 pt-4">
                    {saveErr && <p className="text-rose-400 text-sm">{saveErr}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Title</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" required/>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Price ($)</label>
                        <input value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm" required/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Category</label>
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm">
                          {SERVICE_LISTING_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Delivery (days)</label>
                        <input value={editDelivery} onChange={e => setEditDelivery(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Description</label>
                      <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm resize-y"/>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={saveBusy} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold disabled:opacity-50">
                        <Save size={14}/> {saveBusy ? "Saving…" : "Save"}
                      </button>
                      <button type="button" disabled={archiveBusy} onClick={onArchive} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg disabled:opacity-50">
                        <Trash2 size={14}/> {archiveBusy ? "Archiving…" : "Archive"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {!isOwner ? (
              <Link href={`/bid/service?id=${encodeURIComponent(id)}`} className="block w-full py-4 bg-amber-500 hover:bg-amber-400 text-black text-center font-semibold rounded-xl transition">
                Send Offer
              </Link>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2"/>
                <p className="text-sm text-zinc-400">This is your listing</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Category</span><span>{service.cat || "—"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Price</span><span className="text-amber-400">${service.price?.toLocaleString() || "—"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Delivery</span><span>{service.deliveryDays ? `${service.deliveryDays} days` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Provider</span><span>@{ownerUser || "—"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
