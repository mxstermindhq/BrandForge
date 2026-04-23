"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { formatRequestBudget } from "@/lib/request-display";
import { getAccessTokenFromBrowserSession } from "@/lib/supabase/access-token";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { useAuth } from "@/providers/AuthProvider";

type BidVariant = "request" | "service";

type RequestCtx = {
  title?: string;
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  desc?: string;
  canBid?: boolean;
  isUserCreated?: boolean;
  status?: string;
};
type ServiceCtx = { title?: string; price?: number; description?: string; ownerId?: string | null };

export function BidPageClient({ variant }: { variant: BidVariant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const id = useMemo(() => (searchParams.get("id") || "").trim(), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reqCtx, setReqCtx] = useState<RequestCtx | null>(null);
  const [svcCtx, setSvcCtx] = useState<ServiceCtx | null>(null);

  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [proposal, setProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setErr(null);
      setReqCtx(null);
      setSvcCtx(null);
      return;
    }
    setLoading(true);
    setErr(null);
    const t = await getAccessTokenFromBrowserSession();
    try {
      if (variant === "request") {
        const data = await apiGetJson<{ request: RequestCtx }>(`/api/requests/${id}`, t);
        const r = data.request || {};
        setReqCtx(r);
        setSvcCtx(null);
        if (r.isUserCreated) {
          setErr("You cannot bid on your own request.");
        } else if (r.status === "closed" || r.status === "awarded") {
          setErr("This request is no longer accepting bids.");
        } else if (r.canBid === false) {
          setErr("You are not allowed to bid on this brief.");
        }
      } else {
        const data = await apiGetJson<{ service: ServiceCtx }>(`/api/services/${id}`, t);
        const s = data.service || {};
        setSvcCtx(s);
        setReqCtx(null);
        if (session?.user?.id && s.ownerId && String(session.user.id) === String(s.ownerId)) {
          setErr("You cannot bid on your own listing.");
        }
        if (s.price != null) setPrice(String(s.price));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load listing");
      setReqCtx(null);
      setSvcCtx(null);
    } finally {
      setLoading(false);
    }
  }, [variant, id, session?.user?.id]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const nextUrl = useMemo(() => {
    if (!id) return `/bid/${variant}`;
    return `/bid/${variant}?id=${encodeURIComponent(id)}`;
  }, [variant, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) {
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }
    if (!id || err) return;
    const p = Number(String(price).replace(/[^0-9.]/g, "").trim());
    const prop = proposal.trim();
    if (!Number.isFinite(p) || p <= 0) {
      setFormErr("Enter a valid price.");
      return;
    }
    if (!prop) {
      setFormErr("Describe your offer.");
      return;
    }
    setSubmitting(true);
    try {
      if (variant === "request") {
        const body: Record<string, unknown> = { requestId: id, price: p, proposal: prop };
        const dd = deliveryDays.trim() ? Number(deliveryDays) : null;
        if (dd != null && Number.isFinite(dd) && dd > 0) body.deliveryDays = Math.round(dd);
        const out = await apiMutateJson<{ conversationId?: string | null }>("/api/bids", "POST", body, t);
        const cid = out.conversationId;
        if (cid) router.push(`/chat/${cid}`);
        else router.push("/chat");
      } else {
        const body: Record<string, unknown> = { price: p, proposal: prop };
        const dd = deliveryDays.trim() ? Number(deliveryDays) : null;
        if (dd != null && Number.isFinite(dd) && dd > 0) body.deliveryDays = Math.round(dd);
        const out = await apiMutateJson<{ conversationId?: string | null }>(
          `/api/services/${id}/bid`,
          "POST",
          body,
          t,
        );
        const cid = out.conversationId;
        if (cid) router.push(`/chat/${cid}`);
        else router.push("/chat");
      }
    } catch (e2) {
      setFormErr(e2 instanceof Error ? e2.message : "Could not send bid");
    } finally {
      setSubmitting(false);
    }
  }

  if (!id) {
    return (
      <div className="page-content page-content-sm">
        <div className="empty-state py-16">
          <p className="text-critical text-[13px] font-body max-w-[320px]" role="alert">
            Missing listing id. Open this screen from a brief or service using Bid.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/marketplace" className="btn-ghost text-[13px] justify-center">
              Browse marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageRouteLoading title="Loading" subtitle="Preparing bid form." variant="inline" />;
  }

  const blocked = Boolean(err);

  return (
    <div className="page-content page-content-sm pb-24">
      <div className="flex items-center gap-1.5 mb-8">
        <Link
          href={variant === "request" ? `/requests/${id}` : `/services/${id}`}
          className="text-[12px] font-body text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          {variant === "request" ? "Request" : "Service"}
        </Link>
      </div>

      <header className="mb-8">
        <p className="section-label mb-0">{variant === "request" ? "Brief bid" : "Service bid"}</p>
        <h1 className="page-title max-w-[520px] mt-3">
          {variant === "request" ? reqCtx?.title || "Brief" : svcCtx?.title || "Service"}
        </h1>
        {variant === "request" ? (
          <p className="page-subtitle max-w-[440px]">
            Budget{" "}
            <span className="text-primary font-600">{formatRequestBudget(reqCtx ?? {})}</span>
          </p>
        ) : null}
        {variant === "service" && svcCtx?.price != null ? (
          <p className="page-subtitle max-w-[440px]">
            Listed from <span className="text-primary font-600">${Number(svcCtx.price).toLocaleString()}</span>
          </p>
        ) : null}
      </header>

      {variant === "request" && reqCtx?.desc ? (
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-8">
          <p className="text-[13px] font-body text-on-surface-variant line-clamp-6 leading-[1.6]">{reqCtx.desc}</p>
        </div>
      ) : null}
      {variant === "service" && svcCtx?.description ? (
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-8">
          <p className="text-[13px] font-body text-on-surface-variant line-clamp-6 leading-[1.6]">{svcCtx.description}</p>
        </div>
      ) : null}

      {err ? (
        <p className="text-critical mb-6 text-[13px] font-body" role="alert">
          {err}
        </p>
      ) : null}

      {!blocked ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bid-page-price" className="input-label">
                Your price (USD)
              </label>
              <input id="bid-page-price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" required className="input" />
            </div>
            <div>
              <label htmlFor="bid-page-days" className="input-label">
                Delivery (days)
              </label>
              <input
                id="bid-page-days"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                inputMode="numeric"
                placeholder="14"
                className="input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bid-page-proposal" className="input-label">
              Proposal
            </label>
            <textarea
              id="bid-page-proposal"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={6}
              required
              placeholder="Scope, deliverables, and assumptions."
              className="input min-h-[140px] resize-y"
            />
          </div>
          {formErr ? (
            <p className="text-critical text-[13px] font-body" role="alert">
              {formErr}
            </p>
          ) : null}
          <p className="text-[12px] font-body text-on-surface-variant leading-[1.5]">
            After you submit, we open your deal thread and post a card the other party sees — that is the start of the project
            conversation.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary min-h-[52px] w-full disabled:opacity-50">
            {variant === "request" ? "Submit request bid" : "Submit service bid"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
