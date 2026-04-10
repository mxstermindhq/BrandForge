"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { getAccessTokenFromBrowserSession } from "@/lib/supabase/access-token";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { PostedAgo } from "@/components/ui/PostedAgo";
import { budgetInputFromRequest, formatRequestBudget } from "@/lib/request-display";
import { formatDealRecordShort } from "@/lib/deal-record";

type RequestRow = {
  id?: string;
  title?: string;
  status?: string;
  desc?: string;
  budget?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  bids?: number;
  days?: number | null;
  dueDate?: string;
  tags?: string[];
  canBid?: boolean;
  isUserCreated?: boolean;
  successCriteria?: string;
  createdAt?: string | null;
  ownerReputation?: number | null;
  ownerDealWins?: number | null;
  ownerDealLosses?: number | null;
};

type BidRow = {
  id: string;
  bidderName?: string;
  price?: string;
  deliveryDays?: number | null;
  proposal?: string;
  status?: string;
  createdAt?: string | null;
};

type CryptoPanelState = {
  bidId: string;
  reference: string;
  amountUsd: number;
  treasuryAddress: string | null;
  checkoutLink: string | null;
  confirmMode: string;
  asset: string;
  network: string;
};

export function RequestDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [closeBusy, setCloseBusy] = useState(false);
  const [ownerBids, setOwnerBids] = useState<BidRow[]>([]);
  const [ownerBidsLoading, setOwnerBidsLoading] = useState(false);
  const [ownerBidsErr, setOwnerBidsErr] = useState<string | null>(null);
  const [bidActionErr, setBidActionErr] = useState<string | null>(null);
  const [busyBidId, setBusyBidId] = useState<string | null>(null);
  const [cryptoPanel, setCryptoPanel] = useState<CryptoPanelState | null>(null);

  const loadRequest = useCallback(async () => {
    const t = await getAccessTokenFromBrowserSession();
    const data = await apiGetJson<{ request: RequestRow }>(`/api/requests/${id}`, t);
    const r = data.request || null;
    setRequest(r);
    return r;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await loadRequest();
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
          setRequest(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRequest]);

  const loadOwnerBids = useCallback(async () => {
    if (!request || request.status === "closed" || request.status === "awarded" || !request.isUserCreated) {
      return;
    }
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setOwnerBidsLoading(true);
    setOwnerBidsErr(null);
    try {
      const data = await apiGetJson<{ bids: BidRow[] }>(`/api/requests/${id}/bids`, t);
      setOwnerBids(data.bids || []);
    } catch (e) {
      setOwnerBidsErr(e instanceof Error ? e.message : "Could not load proposals");
      setOwnerBids([]);
    } finally {
      setOwnerBidsLoading(false);
    }
  }, [id, request]);

  useEffect(() => {
    void loadOwnerBids();
  }, [loadOwnerBids]);

  useEffect(() => {
    const escrow = searchParams.get("escrow");
    if (escrow !== "success" && escrow !== "cancel") return;
    void (async () => {
      const r = await loadRequest();
      const t = await getAccessTokenFromBrowserSession();
      if (t && r && r.status !== "closed" && r.status !== "awarded" && r.isUserCreated) {
        try {
          const data = await apiGetJson<{ bids: BidRow[] }>(`/api/requests/${id}/bids`, t);
          setOwnerBids(data.bids || []);
        } catch {
          /* ignore */
        }
      }
      router.replace(`/requests/${id}`, { scroll: false });
    })();
  }, [searchParams, id, router, loadRequest]);

  useEffect(() => {
    if (!manageOpen || !request) return;
    setEditTitle(request.title || "");
    setEditDesc(request.desc || "");
    setEditBudget(budgetInputFromRequest(request));
    setEditDue(request.dueDate || "");
    setEditTags((request.tags || []).join(", "));
    setEditSuccess(request.successCriteria || "");
    setSaveErr(null);
  }, [manageOpen, request]);

  async function onSaveRequest(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) {
      router.push(`/login?next=${encodeURIComponent(`/requests/${id}`)}`);
      return;
    }
    const title = editTitle.trim();
    const desc = editDesc.trim();
    if (!title || !desc) {
      setSaveErr("Title and description are required.");
      return;
    }
    const budget = editBudget.trim();
    if (!budget) {
      setSaveErr("Budget is required.");
      return;
    }
    const tags = editTags
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    setSaveBusy(true);
    try {
      await apiMutateJson<unknown>(
        `/api/requests/${id}`,
        "PATCH",
        {
          title,
          desc,
          budget,
          deadline: editDue.trim() || null,
          tags,
          successCriteria: editSuccess.trim(),
        },
        t,
      );
      await loadRequest();
      setManageOpen(false);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaveBusy(false);
    }
  }

  async function onCloseRequest() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Close this request? It will leave the board and stop accepting new proposals.")
    ) {
      return;
    }
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setCloseBusy(true);
    try {
      await apiMutateJson<unknown>(`/api/requests/${id}`, "DELETE", {}, t);
      await loadRequest();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Could not close");
    } finally {
      setCloseBusy(false);
    }
  }

  async function onAcceptBid(bidId: string) {
    setBidActionErr(null);
    setCryptoPanel(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) {
      router.push(`/login?next=${encodeURIComponent(`/requests/${id}`)}`);
      return;
    }
    setBusyBidId(bidId);
    try {
      await apiMutateJson<{ project: { id: string } }>(`/api/bids/${bidId}/accept`, "POST", {}, t);
      router.push(`/chat`);
    } catch (e) {
      setBidActionErr(e instanceof Error ? e.message : "Could not accept proposal");
    } finally {
      setBusyBidId(null);
    }
  }

  async function onConfirmCryptoTrust() {
    if (!cryptoPanel) return;
    setBidActionErr(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setBusyBidId(cryptoPanel.bidId);
    try {
      await apiMutateJson<{ project: { id: string } }>(
        `/api/bids/${cryptoPanel.bidId}/crypto-confirm`,
        "POST",
        { reference: cryptoPanel.reference },
        t,
      );
      setCryptoPanel(null);
      router.push(`/chat`);
    } catch (e) {
      setBidActionErr(e instanceof Error ? e.message : "Could not confirm payment");
    } finally {
      setBusyBidId(null);
    }
  }

  async function onRejectBid(bidId: string) {
    if (typeof window !== "undefined" && !window.confirm("Reject this proposal?")) return;
    setBidActionErr(null);
    const t = await getAccessTokenFromBrowserSession();
    if (!t) return;
    setBusyBidId(bidId);
    try {
      await apiMutateJson(`/api/bids/${bidId}/reject`, "POST", {}, t);
      await loadOwnerBids();
      await loadRequest();
    } catch (e) {
      setBidActionErr(e instanceof Error ? e.message : "Could not reject");
    } finally {
      setBusyBidId(null);
    }
  }

  if (loading) {
    return <PageRouteLoading title="Loading request" variant="inline" />;
  }

  if (err || !request) {
    return (
      <div className="page-content page-content-sm">
        <div className="empty-state py-16">
          <p className="text-critical text-[13px] font-body" role="alert">
            {err || "Request not found."}
          </p>
          <Link
            href="/requests"
            className="text-[12px] font-body text-on-surface-variant hover:text-on-surface transition-colors mt-2 inline-flex items-center gap-1"
          >
            ← Requests
          </Link>
        </div>
      </div>
    );
  }

  const open = request.status !== "closed" && request.status !== "awarded";
  const isOwner = Boolean(request.isUserCreated);
  const showBidCta = open && request.canBid && !isOwner;
  const dealLbl = formatDealRecordShort(request.ownerDealWins, request.ownerDealLosses);
  const repShow = request.ownerReputation != null && request.ownerReputation > 0;

  const statusPillClass =
    open ? "pill-success" : request.status === "awarded" ? "pill-primary" : "pill-default";

  return (
    <article className="page-content page-content-sm pb-24">
      <div className="flex items-center gap-1.5 mb-8">
        <Link
          href="/requests"
          className="text-[12px] font-body text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
        >
          ← Requests
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="page-title max-w-[520px]">{request.title}</h1>
          {isOwner ? (
            <p className="text-[11px] font-headline font-500 text-primary/80 tracking-[0.04em] uppercase mt-2">Your brief</p>
          ) : null}
          {repShow || dealLbl ? (
            <p className="text-[12px] font-body text-on-surface-variant leading-[1.5] mt-2">
              {repShow ? (
                <>
                  Poster reputation{" "}
                  <span className="text-primary font-headline font-600 tabular-nums">
                    {Math.round(Number(request.ownerReputation)).toLocaleString()}
                  </span>
                </>
              ) : null}
              {repShow && dealLbl ? <> · {dealLbl}</> : null}
              {!repShow && dealLbl ? <>Deal record · {dealLbl}</> : null}
            </p>
          ) : null}
        </div>
        <span className={`${statusPillClass} mt-1.5 shrink-0 uppercase`}>{request.status || "open"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8 text-[13px] font-body text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">payments</span>
          <span className="text-primary font-600">{formatRequestBudget(request)}</span>
        </div>
        {request.bids != null ? (
          <>
            <span className="text-outline-variant">·</span>
            <span>
              {request.bids} proposal{request.bids === 1 ? "" : "s"}
            </span>
          </>
        ) : null}
        {request.days != null && request.days >= 0 ? (
          <>
            <span className="text-outline-variant">·</span>
            <span>due in {request.days}d</span>
          </>
        ) : null}
        {request.dueDate ? (
          <>
            <span className="text-outline-variant">·</span>
            <span>{request.dueDate}</span>
          </>
        ) : null}
        {request.createdAt ? (
          <>
            <span className="text-outline-variant">·</span>
            <PostedAgo iso={request.createdAt} className="inline" />
          </>
        ) : null}
      </div>

      {request.tags && request.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 mb-8">
          {request.tags.map((tag) => (
            <li key={tag} className="pill-default">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-4">
        <p className="section-label">Brief</p>
        <p className="text-[14px] font-body text-on-surface leading-[1.6] whitespace-pre-wrap">{request.desc || "No description."}</p>
        {request.successCriteria ? (
          <div className="border-t border-outline-variant/40 pt-4 mt-4">
            <p className="section-label">Success criteria</p>
            <p className="text-[14px] font-body text-on-surface leading-[1.6] whitespace-pre-wrap">{request.successCriteria}</p>
          </div>
        ) : null}
      </div>

      {showBidCta ? (
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-4">
          <p className="section-label">Bid</p>
          <p className="text-[13px] font-body text-on-surface-variant leading-[1.6] mb-4">
            Enter your price, delivery, and proposal on the next screen. Submitting opens Messages and posts your bid as
            an embed for the brief owner.
          </p>
          <Link href={`/bid/request?id=${encodeURIComponent(id)}`} className="btn-primary inline-flex">
            Bid
          </Link>
        </div>
      ) : null}

      {isOwner && open ? (
        <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="section-label">Manage brief</p>
              <p className="text-[13px] font-body text-on-surface-variant leading-[1.6]">
                Edit fields or close the request to stop new bids.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={closeBusy}
                onClick={() => void onCloseRequest()}
                className="btn-danger text-[12px] px-3 py-2"
              >
                {closeBusy ? "Closing…" : "Close Request"}
              </button>
              <button
                type="button"
                onClick={() => setManageOpen((o) => !o)}
                className="btn-primary text-[12px] px-3 py-2"
              >
                {manageOpen ? "Cancel editing" : "Edit Request"}
              </button>
            </div>
          </div>
          {manageOpen ? (
            <form onSubmit={(ev) => void onSaveRequest(ev)} className="border-t border-outline-variant/40 pt-4 mt-4 space-y-4">
              {saveErr ? (
                <p className="text-critical text-[13px] font-body" role="alert">
                  {saveErr}
                </p>
              ) : null}
              <div>
                <label htmlFor="edit-req-title" className="input-label">
                  Title
                </label>
                <input
                  id="edit-req-title"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="edit-req-desc" className="input-label">
                  Description
                </label>
                <textarea
                  id="edit-req-desc"
                  required
                  rows={5}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="input min-h-[120px] resize-y"
                />
              </div>
              <div>
                <label htmlFor="edit-req-budget" className="input-label">
                  Budget (e.g. 500–1500 or 2000)
                </label>
                <input
                  id="edit-req-budget"
                  required
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="edit-req-due" className="input-label">
                  Due date (optional)
                </label>
                <input id="edit-req-due" type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} className="input" />
              </div>
              <div>
                <label htmlFor="edit-req-tags" className="input-label">
                  Tags (comma-separated, max 5)
                </label>
                <input
                  id="edit-req-tags"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="design, motion, web"
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="edit-req-sc" className="input-label">
                  Success criteria
                </label>
                <textarea
                  id="edit-req-sc"
                  rows={3}
                  value={editSuccess}
                  onChange={(e) => setEditSuccess(e.target.value)}
                  className="input min-h-[72px] resize-y"
                />
              </div>
              <button type="submit" disabled={saveBusy} className="btn-primary disabled:opacity-50">
                {saveBusy ? "Saving…" : "Save changes"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {isOwner && open ? (
        <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 mb-6">
          <p className="section-label">Proposals</p>
          <p className="text-[13px] font-body text-on-surface-variant leading-[1.6] mb-4">
            Accepting a proposal starts payment per your server configuration. Reject to clear it from your shortlist.
          </p>
          {bidActionErr ? (
            <p className="text-critical mb-4 text-[13px] font-body" role="alert">
              {bidActionErr}
            </p>
          ) : null}
          {cryptoPanel ? (
            <div className="border border-primary/20 bg-primary/5 mb-6 rounded-xl p-4">
              <p className="section-label mb-1">Payment</p>
              <p className="text-[13px] font-body text-on-surface-variant leading-[1.6]">
                Reference{" "}
                <span className="text-on-surface font-mono text-[12px]">{cryptoPanel.reference}</span>
                {" · "}
                {cryptoPanel.amountUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              {cryptoPanel.checkoutLink ? (
                <div className="mt-4 space-y-3">
                  <a
                    href={cryptoPanel.checkoutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex min-h-[44px]"
                  >
                    Open crypto checkout
                  </a>
                  <p className="text-[12px] font-body text-on-surface-variant leading-[1.6]">
                    When the provider confirms payment, this brief is awarded automatically. Use refresh if the status
                    does not update.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void loadOwnerBids();
                      void loadRequest();
                    }}
                    className="btn-ghost text-[12px] px-0"
                  >
                    Refresh status
                  </button>
                </div>
              ) : null}
              {cryptoPanel.treasuryAddress ? (
                <div className="mt-4 text-[13px] font-body">
                  <p className="text-on-surface-variant leading-[1.6]">
                    Send <span className="text-on-surface font-600">{cryptoPanel.asset}</span>
                    {cryptoPanel.network ? ` (${cryptoPanel.network})` : ""} to:
                  </p>
                  <p className="text-on-surface mt-1 break-all font-mono text-[12px]">{cryptoPanel.treasuryAddress}</p>
                  {cryptoPanel.confirmMode === "trust" ? (
                    <button
                      type="button"
                      disabled={busyBidId === cryptoPanel.bidId}
                      onClick={() => void onConfirmCryptoTrust()}
                      className="btn-primary mt-4 min-h-[44px] disabled:opacity-50"
                    >
                      {busyBidId === cryptoPanel.bidId ? "Confirming…" : "I sent the payment — continue"}
                    </button>
                  ) : null}
                </div>
              ) : null}
              <button type="button" onClick={() => setCryptoPanel(null)} className="btn-ghost text-[12px] mt-4 px-0">
                Close
              </button>
            </div>
          ) : null}
          {ownerBidsLoading ? (
            <p className="text-[13px] font-body text-on-surface-variant">Loading proposals…</p>
          ) : ownerBidsErr ? (
            <p className="text-critical text-[13px] font-body" role="alert">
              {ownerBidsErr}
            </p>
          ) : ownerBids.length === 0 ? (
            <div className="empty-state py-12">
              <span className="empty-state-icon material-symbols-outlined" aria-hidden>
                assignment
              </span>
              <p className="empty-state-title">No proposals yet</p>
              <p className="empty-state-body">Specialists can bid on your brief once it goes live.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {ownerBids.map((b) => {
                const canAct = b.status === "submitted" || b.status === "shortlisted";
                return (
                  <li key={b.id} className="bg-surface-container-high/30 border border-outline-variant/40 rounded-xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-headline font-600 tracking-[-0.01em] text-on-surface">{b.bidderName || "Member"}</p>
                        <p className="text-[13px] font-body text-on-surface-variant leading-[1.5]">
                          {b.price || "—"}
                          {b.deliveryDays != null && b.deliveryDays > 0 ? ` · ${b.deliveryDays}d delivery` : ""}
                          {b.status ? (
                            <span className="text-on-surface-variant">
                              {" "}
                              · <span className="font-headline text-[11px] uppercase tracking-[0.06em]">{b.status}</span>
                            </span>
                          ) : null}
                        </p>
                      </div>
                      {canAct ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyBidId === b.id}
                            onClick={() => void onAcceptBid(b.id)}
                            className="btn-primary text-[12px] px-3 py-2 disabled:opacity-50"
                          >
                            {busyBidId === b.id ? "…" : "Accept"}
                          </button>
                          <button
                            type="button"
                            disabled={busyBidId === b.id}
                            onClick={() => void onRejectBid(b.id)}
                            className="btn-danger text-[12px] px-3 py-2 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {b.proposal ? (
                      <p className="text-[13px] font-body text-on-surface-variant mt-3 whitespace-pre-wrap leading-[1.6]">{b.proposal}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {isOwner ? (
        <Link href="/requests/new" className="btn-secondary w-full justify-center min-h-[48px]">
          Post another request
        </Link>
      ) : null}
    </article>
  );
}
