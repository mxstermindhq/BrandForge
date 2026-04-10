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
      <div className="text-on-surface-variant mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-error text-sm" role="alert">
          {err || "Service not found."}
        </p>
        <Link href="/services" className="text-secondary mt-6 inline-block text-sm font-bold hover:underline">
          ← Back to services
        </Link>
      </div>
    );
  }

  const pro = Boolean(service.topMember);
  const avatar = safeImageSrc(service.ownerAvatar);
  const ownerUser = (service.ownerUsername || "").trim();
  const dealLbl = formatDealRecordShort(service.ownerDealWins, service.ownerDealLosses);
  const isOwner = Boolean(
    session?.user?.id && service.ownerId && String(session.user.id) === String(service.ownerId),
  );

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
        `/api/services/${id}`,
        "PATCH",
        {
          title: editTitle.trim(),
          category: editCategory,
          price: editPrice,
          delivery: editDelivery,
          description: editDescription.trim(),
        },
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
    if (
      typeof window !== "undefined" &&
      !window.confirm("Archive this listing? It will disappear from the marketplace. You cannot undo this from the app.")
    ) {
      return;
    }
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setArchiveBusy(true);
    try {
      await apiMutateJson<unknown>(`/api/services/${id}`, "DELETE", {}, t);
      router.push("/services");
      router.refresh();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not archive");
    } finally {
      setArchiveBusy(false);
    }
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 pb-24 md:px-6">
      <Link href="/services" className="text-on-surface-variant hover:text-secondary mb-6 inline-flex text-xs font-bold uppercase tracking-widest">
        ← Services
      </Link>

      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl">
        {safeImageSrc(service.coverUrl) ? (
          <Image
            src={safeImageSrc(service.coverUrl)!}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-surface-container-high to-surface-container-low"
            aria-hidden
          />
        )}
      </div>

      <header className="mb-8 flex flex-wrap items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-outline-variant/30">
          {avatar ? (
            <Image src={avatar} alt="" fill className="object-cover" sizes="56px" />
          ) : (
            <span className="text-primary flex h-full items-center justify-center text-sm font-bold">
              {(service.sel || "?").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-secondary font-headline text-[10px] font-black uppercase tracking-[0.25em]">
            {service.cat || "Service"}
          </p>
          <h1 className="font-display text-on-surface mt-2 text-3xl font-bold tracking-tight md:text-4xl">{service.title}</h1>
          <p className="text-on-surface-variant mt-2 flex flex-wrap items-center gap-2 text-sm">
            {ownerUser ? (
              <Link href={`/p/${encodeURIComponent(ownerUser)}`} className="text-secondary hover:underline">
                {service.sel || "Specialist"}
              </Link>
            ) : (
              <span>{service.sel || "Specialist"}</span>
            )}
            {pro ? (
              <span className="bg-secondary/15 text-secondary rounded px-2 py-0.5 text-[10px] font-black uppercase">Pro</span>
            ) : null}
            <span>· {service.rating || "New"}</span>
            {service.ownerReputation != null && service.ownerReputation > 0 ? (
              <span>· Rep {Math.round(service.ownerReputation).toLocaleString()}</span>
            ) : null}
            {dealLbl ? <span>· {dealLbl}</span> : null}
            {service.createdAt ? (
              <>
                <span aria-hidden>·</span>
                <PostedAgo iso={service.createdAt} />
              </>
            ) : null}
          </p>
        </div>
        <div className="w-full sm:w-auto sm:text-right">
          <p className="text-secondary font-headline text-3xl font-bold tabular-nums">
            ${service.price != null ? Number(service.price).toLocaleString() : "—"}
          </p>
          {service.deliveryDays != null ? (
            <p className="text-on-surface-variant mt-1 text-xs">Delivery ~{service.deliveryDays} days</p>
          ) : null}
        </div>
      </header>

      <div className="surface-card border-outline-variant/20 mb-8">
        <h2 className="font-headline text-on-surface mb-4 text-xs font-black uppercase tracking-[0.2em]">Overview</h2>
        <p className="text-on-surface-variant whitespace-pre-wrap text-sm font-light leading-relaxed">
          {service.description || "No description provided."}
        </p>
      </div>

      {isOwner ? (
        <div className="border-secondary/25 bg-secondary/5 mb-8 rounded-2xl border px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-headline text-secondary text-[10px] font-black uppercase tracking-[0.25em]">
                Your listing
              </p>
              <p className="text-on-surface-variant mt-1 text-sm font-light">
                Edit details or archive when you no longer offer this package.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setManageOpen((o) => !o)}
              className="border-outline-variant/40 text-on-surface hover:bg-surface-container-high font-headline min-h-[44px] rounded-xl border px-5 text-xs font-bold uppercase tracking-wider"
            >
              {manageOpen ? "Cancel" : "Edit listing"}
            </button>
          </div>
          {manageOpen ? (
            <form onSubmit={(ev) => void onSaveEdits(ev)} className="mt-6 space-y-4 border-t border-outline-variant/15 pt-6">
              {saveErr ? (
                <p className="text-error text-sm" role="alert">
                  {saveErr}
                </p>
              ) : null}
              <div>
                <label htmlFor="edit-svc-title" className="text-on-surface-variant mb-1 block text-xs font-bold uppercase tracking-wider">
                  Title
                </label>
                <input
                  id="edit-svc-title"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border-outline-variant/30 bg-surface-container-low focus:border-primary/50 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-svc-cat" className="text-on-surface-variant mb-1 block text-xs font-bold uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    id="edit-svc-cat"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="border-outline-variant/30 bg-surface-container-low w-full rounded-xl border px-4 py-3 text-sm"
                  >
                    {SERVICE_LISTING_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-svc-price" className="text-on-surface-variant mb-1 block text-xs font-bold uppercase tracking-wider">
                    Price (USD)
                  </label>
                  <input
                    id="edit-svc-price"
                    required
                    inputMode="decimal"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="border-outline-variant/30 bg-surface-container-low w-full rounded-xl border px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="edit-svc-delivery" className="text-on-surface-variant mb-1 block text-xs font-bold uppercase tracking-wider">
                  Delivery (days)
                </label>
                <input
                  id="edit-svc-delivery"
                  inputMode="numeric"
                  value={editDelivery}
                  onChange={(e) => setEditDelivery(e.target.value)}
                  className="border-outline-variant/30 bg-surface-container-low w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-svc-desc" className="text-on-surface-variant mb-1 block text-xs font-bold uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  id="edit-svc-desc"
                  rows={5}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border-outline-variant/30 bg-surface-container-low focus:border-primary/50 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saveBusy}
                  className="bg-primary text-on-primary font-headline min-h-[44px] rounded-xl px-6 text-sm font-bold disabled:opacity-50"
                >
                  {saveBusy ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  disabled={archiveBusy}
                  onClick={() => void onArchive()}
                  className="text-error font-headline border-error/40 hover:bg-error/10 min-h-[44px] rounded-xl border px-5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {archiveBusy ? "Archiving…" : "Archive listing"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}

      {!isOwner ? (
        <Link
          href={`/bid/service?id=${encodeURIComponent(id)}`}
          className="bg-primary text-on-primary font-headline inline-flex min-h-[48px] items-center justify-center rounded-xl px-6 text-sm font-bold transition-all hover:shadow-glow"
        >
          Bid
        </Link>
      ) : null}
    </article>
  );
}
