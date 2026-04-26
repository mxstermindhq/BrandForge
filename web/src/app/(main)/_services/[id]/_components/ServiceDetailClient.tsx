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
import { ArrowLeft, Edit, Trash2, Save, X, Clock, Star, CheckCircle, Package, FileText } from "lucide-react";

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
  offers?: number | null;
  sales?: number | null;
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
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-error text-sm mb-4" role="alert">{err || "Service not found."}</p>
          <Link href="/marketplace" className="text-on-surface-variant hover:text-on-surface text-sm flex items-center gap-2 justify-center">
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
  const offersCount = Number(service.offers ?? service.sales) || 0;

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
    <div className="min-h-screen bg-background text-on-surface">
      {safeImageSrc(service.coverUrl) ? (
        <div className="relative h-36 w-full overflow-hidden sm:h-40">
          <Image
            src={safeImageSrc(service.coverUrl)!}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>
      ) : null}

      <div className="border-b border-outline-variant">
        <div className="mx-auto max-w-5xl px-6 py-6 md:px-10">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition hover:text-on-surface"
          >
            <ArrowLeft size={14} /> Back to marketplace
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  open
                </span>
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <Package size={12} /> {service.cat || "Service"}
                </span>
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">{service.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${service.price?.toLocaleString() || "—"}</div>
              <div className="mt-1 flex flex-wrap items-center justify-end gap-3 text-sm text-on-surface-variant">
                <span>{offersCount} offers</span>
                {service.deliveryDays != null ? (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {service.deliveryDays}d
                  </span>
                ) : null}
                {service.createdAt ? <PostedAgo iso={service.createdAt} /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Provider info */}
            <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-surface-container-high to-surface-container text-lg font-bold">
                {avatar ? (
                  <Image src={avatar} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  (service.sel || "?").slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {ownerUser ? (
                    <Link href={`/p/${encodeURIComponent(ownerUser)}`} className="font-semibold hover:text-primary transition truncate">
                      @{ownerUser}
                    </Link>
                  ) : (
                    <span className="font-semibold">{service.sel || "Provider"}</span>
                  )}
                  {pro && <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-black rounded-full font-bold">PRO</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1">
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
                <div className="text-xs text-on-surface-variant">
                  <PostedAgo iso={service.createdAt} />
                </div>
              )}
            </div>

            {/* Scope — mirrors request “Brief” block */}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                <FileText size={14} /> Scope
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-on-surface">
                {service.description || "No description provided."}
              </p>
            </div>

            {/* Owner management */}
            {isOwner && (
              <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2"><Edit size={14}/> Your listing</h3>
                    <p className="text-sm text-on-surface-variant">Edit or archive this service</p>
                  </div>
                  <button onClick={() => setManageOpen(!manageOpen)} className="px-4 py-2 bg-surface-container-high hover:bg-surface-container rounded-lg text-sm transition">
                    {manageOpen ? <X size={14}/> : <Edit size={14}/>}
                  </button>
                </div>
                {manageOpen && (
                  <form onSubmit={onSaveEdits} className="space-y-4 border-t border-outline-variant pt-4">
                    {saveErr && <p className="text-error text-sm">{saveErr}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Title</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" required/>
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Price ($)</label>
                        <input value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" required/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Category</label>
                        <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface">
                          {SERVICE_LISTING_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Delivery (days)</label>
                        <input value={editDelivery} onChange={e => setEditDelivery(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Description</label>
                      <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface resize-y"/>
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
              <Link
                href={`/bid/service?id=${encodeURIComponent(id)}`}
                className="block w-full rounded-xl bg-amber-500 py-4 text-center font-semibold text-black transition hover:bg-amber-400"
              >
                Book this offer
              </Link>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2"/>
                <p className="text-sm text-on-surface-variant">This is your listing</p>
              </div>
            )}
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
              <h3 className="mb-3 text-sm font-semibold text-on-surface-variant">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Category</span>
                  <span className="text-right">{service.cat || "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Price</span>
                  <span className="text-right font-semibold text-primary">${service.price?.toLocaleString() || "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className="text-right">{service.deliveryDays ? `${service.deliveryDays} days` : "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Offers</span>
                  <span className="text-right tabular-nums">{offersCount}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Provider</span>
                  <span className="truncate text-right">@{ownerUser || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
