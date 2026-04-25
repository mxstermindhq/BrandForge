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
import { ArrowLeft, Edit, X, Save, Trash2, Clock, DollarSign, User, CheckCircle, FileText, Tag, Gavel, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 text-sm mb-4" role="alert">{err || "Request not found."}</p>
          <Link href="/marketplace" className="text-on-surface-variant hover:text-on-surface text-sm flex items-center gap-2 justify-center">
            <ArrowLeft size={14}/> Back to marketplace
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

  const statusColor = open
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
    : request.status === "awarded"
      ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
      : "text-on-surface-variant bg-surface-container-high border-outline-variant";

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <div className="border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-6">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-sm mb-4 transition">
            <ArrowLeft size={14}/> Back to marketplace
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-semibold ${statusColor}`}>
                  {request.status || "open"}
                </span>
                {isOwner && <span className="text-[10px] px-2 py-1 bg-amber-500 text-black rounded-full font-bold">YOUR BRIEF</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{request.title}</h1>
              {repShow || dealLbl ? (
                <p className="text-sm text-on-surface-variant mt-2">
                  {repShow && <>Poster reputation <span className="text-primary">{Math.round(Number(request.ownerReputation)).toLocaleString()}</span></>}
                  {repShow && dealLbl && <> · {dealLbl}</>}
                  {!repShow && dealLbl && <>Deal record · {dealLbl}</>}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatRequestBudget(request)}</div>
              <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-1">
                {request.bids != null && <span>{request.bids} proposal{request.bids === 1 ? "" : "s"}</span>}
                {request.days != null && request.days >= 0 && <><Clock size={12}/> {request.days}d</>}
                {request.createdAt && <PostedAgo iso={request.createdAt} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Tags */}
            {request.tags && request.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {request.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface-variant">
                    <Tag size={10} className="inline mr-1"/>{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
              <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14}/> Brief
              </h2>
              <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{request.desc || "No description provided."}</p>
              {request.successCriteria && (
                <div className="border-t border-outline-variant pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-on-surface-variant mb-2">Success criteria</h3>
                  <p className="text-on-surface">{request.successCriteria}</p>
                </div>
              )}
            </div>

            {/* Bid CTA for non-owners */}
            {showBidCta && (
              <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2"><Gavel size={14}/> Submit a proposal</h3>
                <p className="text-sm text-on-surface-variant mb-4">Enter your price, delivery timeline, and proposal. This will open a message thread with the requester.</p>
                <Link href={`/bid/request?id=${encodeURIComponent(id)}`} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-lg font-semibold hover:bg-emerald-400 transition">
                  Place Bid
                </Link>
              </div>
            )}

            {/* Owner management */}
            {isOwner && open && (
              <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2"><Edit size={14}/> Manage brief</h3>
                    <p className="text-sm text-on-surface-variant">Edit or close this request</p>
                  </div>
                  <button onClick={() => setManageOpen(!manageOpen)} className="px-4 py-2 bg-surface-container-high hover:bg-surface-container rounded-lg text-sm transition">
                    {manageOpen ? <X size={14}/> : <Edit size={14}/>}
                  </button>
                </div>
                {manageOpen && (
                  <form onSubmit={onSaveRequest} className="space-y-4 border-t border-outline-variant pt-4">
                    {saveErr && <p className="text-rose-400 text-sm">{saveErr}</p>}
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Title</label>
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" required/>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Description</label>
                      <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface resize-y" required/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Budget</label>
                        <input value={editBudget} onChange={e => setEditBudget(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" required/>
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Due date</label>
                        <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Tags (comma-separated)</label>
                      <input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="design, motion, web" className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"/>
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1">Success criteria</label>
                      <textarea value={editSuccess} onChange={e => setEditSuccess(e.target.value)} rows={3} className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface resize-y"/>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={saveBusy} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold disabled:opacity-50">
                        <Save size={14}/> {saveBusy ? "Saving…" : "Save"}
                      </button>
                      <button type="button" disabled={closeBusy} onClick={onCloseRequest} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg disabled:opacity-50">
                        <Trash2 size={14}/> {closeBusy ? "Closing…" : "Close"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Proposals section for owner */}
            {isOwner && open && (
              <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant">
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Proposals ({ownerBids.length})</h3>
                {bidActionErr && <p className="text-rose-400 text-sm mb-4">{bidActionErr}</p>}
                {cryptoPanel && (
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
                    <p className="text-sm text-amber-400 mb-2 flex items-center gap-2"><AlertCircle size={14}/> Payment Required</p>
                    <p className="text-sm text-on-surface-variant">Reference: <span className="font-mono text-on-surface">{cryptoPanel.reference}</span> · {cryptoPanel.amountUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                    {cryptoPanel.checkoutLink && (
                      <a href={cryptoPanel.checkoutLink} target="_blank" rel="noopener noreferrer" className="inline-flex mt-3 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-semibold">
                        Open checkout
                      </a>
                    )}
                    <button onClick={() => setCryptoPanel(null)} className="block mt-2 text-on-surface-variant text-sm hover:text-on-surface">Close</button>
                  </div>
                )}
                {ownerBidsLoading ? <p className="text-on-surface-variant">Loading…</p> :
                  ownerBidsErr ? <p className="text-rose-400">{ownerBidsErr}</p> :
                  ownerBids.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant">
                      <FileText size={32} className="mx-auto mb-2 opacity-30"/>
                      <p>No proposals yet</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {ownerBids.map((b) => {
                        const canAct = b.status === "submitted" || b.status === "shortlisted";
                        return (
                          <li key={b.id} className="p-4 rounded-lg bg-surface-container border border-outline-variant">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{b.bidderName || "Member"}</p>
                                <p className="text-sm text-on-surface-variant">{b.price}{b.deliveryDays ? ` · ${b.deliveryDays}d delivery` : ""} · <span className="text-on-surface uppercase text-xs">{b.status}</span></p>
                              </div>
                              {canAct && (
                                <div className="flex gap-2">
                                  <button disabled={busyBidId === b.id} onClick={() => onAcceptBid(b.id)} className="px-3 py-1.5 bg-emerald-500 text-black rounded text-sm font-semibold disabled:opacity-50">Accept</button>
                                  <button disabled={busyBidId === b.id} onClick={() => onRejectBid(b.id)} className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded text-sm disabled:opacity-50">Reject</button>
                                </div>
                              )}
                            </div>
                            {b.proposal && <p className="text-sm text-on-surface-variant mt-3 border-t border-outline-variant pt-3">{b.proposal}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  )
                }
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {showBidCta ? (
              <Link href={`/bid/request?id=${encodeURIComponent(id)}`} className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-center font-semibold rounded-xl transition">
                Place Bid
              </Link>
            ) : isOwner ? (
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant text-center">
                <CheckCircle size={20} className="text-amber-400 mx-auto mb-2"/>
                <p className="text-sm text-on-surface-variant">This is your request</p>
              </div>
            ) : null}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
              <h3 className="text-sm font-semibold text-on-surface-variant mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Budget</span><span className="text-primary">{formatRequestBudget(request)}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Timeline</span><span>{request.days ? `${request.days} days` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Proposals</span><span>{request.bids || 0}</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><span className="capitalize">{request.status}</span></div>
              </div>
            </div>
            {isOwner && (
              <Link href="/requests/new" className="block w-full py-3 bg-surface-container border border-outline-variant text-center text-sm rounded-xl hover:bg-surface-container-high transition">
                Post another request
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
