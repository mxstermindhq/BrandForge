"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { apiGetJson, apiMutateJson } from "@/lib/api";

type ProfileSnap = {
  id?: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
};

function profileId(p: ProfileSnap | null | undefined): string {
  return p?.id != null ? String(p.id) : "";
}

function profileHref(p: ProfileSnap | null | undefined): string | null {
  const u = p?.username && String(p.username).trim();
  if (u) return `/p/${encodeURIComponent(u)}`;
  return null;
}

function displayHandle(p: ProfileSnap | null | undefined, fallback: string): string {
  const u = p?.username != null ? String(p.username).trim().replace(/^@+/, "") : "";
  if (u) return `@${u}`;
  const fn = p?.fullName != null ? String(p.fullName).trim() : "";
  if (fn) return fn;
  return fallback;
}

/** Turns raw day counts into readable copy; flags very long spans (bad data or true long-term deals). */
function formatDeliverySummary(days: number): { short: string; detail?: string; warn?: string } {
  const d = Math.round(Number(days));
  if (!Number.isFinite(d) || d <= 0) return { short: "Not specified" };
  if (d === 1) return { short: "1 calendar day" };
  if (d < 14) return { short: `${d} days` };
  if (d < 60) {
    const w = Math.max(1, Math.round(d / 7));
    return { short: `About ${w} week${w === 1 ? "" : "s"}`, detail: `${d} calendar days` };
  }
  if (d < 370) {
    const m = Math.max(1, Math.round(d / 30));
    return { short: `About ${m} month${m === 1 ? "" : "s"}`, detail: `${d} calendar days` };
  }
  const y = Math.round((d / 365) * 10) / 10;
  const yLabel = y % 1 === 0 ? String(Math.round(y)) : String(y);
  const warn =
    d > 730
      ? "This is an unusually long timeline — confirm the real deadline in chat before you accept."
      : d > 400
        ? "Double-check that this matches what you both expect."
        : undefined;
  const yNum = Number(yLabel);
  return {
    short: `About ${yLabel} year${yNum === 1 ? "" : "s"}`,
    detail: `${d.toLocaleString()} calendar days`,
    warn,
  };
}

/** Deal card: left accent + surface (brand tokens) */
function DealEmbedShell({ accentClassName, children }: { accentClassName: string; children: ReactNode }) {
  return (
    <div className="border-outline-variant/30 flex max-w-[520px] overflow-hidden rounded-lg border bg-surface-container-high">
      <div className={`w-1 shrink-0 self-stretch ${accentClassName}`} aria-hidden />
      <div className="min-w-0 flex-1 px-3 py-2.5">{children}</div>
    </div>
  );
}

function DealEmbedActionButton({
  children,
  onClick,
  disabled,
  type = "button",
  variant = "secondary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "secondary" | "primary";
}) {
  const cls =
    variant === "primary"
      ? "bg-secondary text-on-secondary hover:opacity-95 border-transparent"
      : "border-outline-variant/40 bg-surface-container-highest text-on-surface hover:bg-surface-container-low";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${cls} mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-semibold transition-colors disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function CounterOfferModal({
  open,
  onClose,
  listingTitle,
  initialPrice,
  initialDeliveryDays,
  onSubmit,
  busy,
  errorMsg,
}: {
  open: boolean;
  onClose: () => void;
  listingTitle: string;
  initialPrice: number | null;
  initialDeliveryDays: number | null;
  onSubmit: (v: { price: number; deliveryDays: number | null; proposal: string }) => void | Promise<void>;
  busy: boolean;
  errorMsg: string | null;
}) {
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [proposal, setProposal] = useState("");

  useEffect(() => {
    if (!open) return;
    setPrice(initialPrice != null && Number.isFinite(initialPrice) ? String(initialPrice) : "");
    setDeliveryDays(
      initialDeliveryDays != null && Number.isFinite(initialDeliveryDays) ? String(initialDeliveryDays) : "",
    );
    setProposal("");
  }, [open, initialPrice, initialDeliveryDays]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/65 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="counter-offer-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="border-outline-variant/40 bg-surface-container-high max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border shadow-2xl">
        <div className="border-outline-variant/30 from-secondary/15 flex items-start justify-between gap-3 border-b bg-gradient-to-r to-transparent px-4 py-3">
          <div>
            <p id="counter-offer-title" className="text-on-surface text-base font-bold">
              Counter offer
            </p>
            {listingTitle ? (
              <p className="text-on-surface-variant mt-0.5 line-clamp-2 text-xs font-medium">{listingTitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface rounded-lg p-1"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              close
            </span>
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">Price (USD)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="border-outline-variant/40 bg-surface-container mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
              Delivery (days)
            </label>
            <input
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              inputMode="numeric"
              className="border-outline-variant/40 bg-surface-container mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
              Notes / scope
            </label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={4}
              className="border-outline-variant/40 bg-surface-container mt-1 w-full resize-y rounded-lg border px-3 py-2 text-sm"
              placeholder="What you’re proposing instead…"
            />
          </div>
          {errorMsg ? (
            <p className="text-error text-xs" role="alert">
              {errorMsg}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="text-on-surface-variant hover:text-on-surface px-3 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const n = Number(String(price).replace(/[^0-9.]/g, ""));
                const dRaw = deliveryDays.trim() ? Number(deliveryDays) : null;
                const d = dRaw != null && Number.isFinite(dRaw) && dRaw > 0 ? Math.round(dRaw) : null;
                void onSubmit({ price: n, deliveryDays: d, proposal: proposal.trim() });
              }}
              className="bg-secondary text-on-secondary rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40"
            >
              Send counter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractDraftModal({
  open,
  onClose,
  initialTitle,
  initialBody,
  initialAmountUsd,
  onSave,
  busy,
  errorMsg,
}: {
  open: boolean;
  onClose: () => void;
  initialTitle: string;
  initialBody: string;
  initialAmountUsd: number | null;
  onSave: (v: { title: string; body: string; amountUsd: number }) => void | Promise<void>;
  busy: boolean;
  errorMsg: string | null;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setBody(initialBody);
    setAmount(initialAmountUsd != null && Number.isFinite(initialAmountUsd) ? String(initialAmountUsd) : "");
  }, [open, initialTitle, initialBody, initialAmountUsd]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/65 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-draft-title"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="border-outline-variant/40 bg-surface-container-high max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border shadow-2xl">
        <div className="border-outline-variant/30 flex items-start justify-between gap-3 border-b px-4 py-3">
          <div>
            <p id="contract-draft-title" className="text-on-surface text-base font-bold">
              Edit contract draft
            </p>
            <p className="text-on-surface-variant mt-0.5 text-xs font-medium">
              Update terms before sending for signatures. Both parties must approve to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-on-surface-variant hover:text-on-surface rounded-lg p-1"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              close
            </span>
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-outline-variant/40 bg-surface-container mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Engagement title"
            />
          </div>
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">Amount (USD)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="border-outline-variant/40 bg-surface-container mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">Terms / scope</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="border-outline-variant/40 bg-surface-container mt-1 w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed"
              placeholder="Deliverables, milestones, assumptions…"
            />
          </div>
          {errorMsg ? (
            <p className="text-error text-xs" role="alert">
              {errorMsg}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="text-on-surface-variant hover:text-on-surface px-3 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const n = Number(String(amount).replace(/[^0-9.]/g, ""));
                void onSave({ title: title.trim(), body: body.trim(), amountUsd: n });
              }}
              className="bg-secondary text-on-secondary rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40"
            >
              Save draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEAL_PHASE_RAIL_LABEL: Record<string, string> = {
  deal_opened: "Deal opened",
  proposal_review: "Proposal review",
  service_negotiation: "Service negotiation",
  negotiation: "Negotiation",
  deal_win: "Deal won",
  crypto_invoice: "Crypto invoice",
  retention: "Retention & bonuses",
};

function DealPhaseEmbed({ embed }: { embed: Record<string, unknown> }) {
  const phaseRaw = String(embed.phase || "");
  const tone = String(embed.tone || "info");
  const title = String(embed.title || "Deal update");
  const subtitle = embed.subtitle != null ? String(embed.subtitle) : "";
  const detail = embed.detail != null ? String(embed.detail) : "";
  const checkoutLink = embed.checkoutLink != null ? String(embed.checkoutLink).trim() : "";
  const reference = embed.reference != null ? String(embed.reference) : "";
  const paymentKind = embed.paymentKind != null ? String(embed.paymentKind) : "";
  const amountUsd = embed.amountUsd != null ? Number(embed.amountUsd) : null;
  const asset = embed.asset != null ? String(embed.asset).trim() : "";
  const network = embed.network != null ? String(embed.network).trim() : "";
  const bidId = embed.bidId != null ? String(embed.bidId) : "";
  const requestId = embed.requestId != null ? String(embed.requestId) : "";
  const contractId = embed.contractId != null ? String(embed.contractId) : "";

  const storageKey = reference ? `mx-checkout-opened:${reference}` : "";
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    setCheckoutOpened(window.sessionStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  const isCryptoInvoice = phaseRaw === "crypto_invoice";
  const successVisual = tone === "success" || phaseRaw === "deal_win" || checkoutOpened;
  const accentClassName = successVisual
    ? "bg-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.45)]"
    : tone === "action"
      ? "bg-secondary shadow-[0_0_14px_rgba(124,92,252,0.45)]"
      : "bg-sky-500/90";

  function markCheckoutOpened() {
    if (!storageKey || typeof window === "undefined") return;
    window.sessionStorage.setItem(storageKey, "1");
    setCheckoutOpened(true);
  }

  const phaseLabel =
    DEAL_PHASE_RAIL_LABEL[phaseRaw] ||
    (phaseRaw ? phaseRaw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Milestone");
  const kindLabel =
    paymentKind === "bid_escrow"
      ? "Bid escrow (legacy)"
      : paymentKind === "contract_escrow"
        ? "Contract escrow"
        : paymentKind || null;

  return (
    <div data-embed-type="deal_phase" className="w-full max-w-[520px] text-left">
      <DealEmbedShell accentClassName={accentClassName}>
        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.12em]">
          {phaseLabel ? phaseLabel : "Milestone"}
          {checkoutOpened && isCryptoInvoice ? (
                        <span className="text-emerald-500 dark:text-emerald-200 ml-2 font-black"> · Checkout opened</span>
          ) : null}
        </p>
        <p className="text-on-surface mt-1 text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? <p className="text-secondary mt-1 text-[13px] font-medium leading-snug">{subtitle}</p> : null}
        {kindLabel ? (
          <p className="text-on-surface-variant mt-1 text-[11px] font-medium">Type · {kindLabel}</p>
        ) : null}
        {isCryptoInvoice ? (
          <div className="border-outline-variant/25 bg-surface-variant mt-2 rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed">
            <p className="text-on-surface-variant font-bold uppercase tracking-wide">Transaction</p>
            <ul className="text-on-surface-variant mt-1 list-inside list-disc space-y-0.5">
              {amountUsd != null && Number.isFinite(amountUsd) ? (
                <li>
                  Invoice total:{" "}
                  <span className="text-on-surface font-semibold tabular-nums">${amountUsd.toLocaleString()} USD</span>
                </li>
              ) : null}
              {asset ? (
                <li>
                  Asset: <span className="text-on-surface">{asset}</span>
                  {network ? <span className="text-on-surface-variant"> · {network}</span> : null}
                </li>
              ) : null}
              {reference ? (
                <li>
                  Reference: <span className="font-mono text-on-surface">{reference}</span>
                </li>
              ) : null}
              {bidId ? (
                <li>
                  Bid id: <span className="font-mono text-on-surface/90">{bidId}</span>
                </li>
              ) : null}
              {requestId ? (
                <li>
                  Request id: <span className="font-mono text-on-surface/90">{requestId}</span>
                </li>
              ) : null}
              {contractId ? (
                <li>
                  Contract id: <span className="font-mono text-on-surface/90">{contractId}</span>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        {detail ? <p className="text-on-surface-variant mt-2 text-[12px] leading-relaxed">{detail}</p> : null}
        {isCryptoInvoice && checkoutLink ? (
          <p className="text-on-surface-variant mt-2 text-[11px] leading-snug">
            You can open checkout more than once if the tab closed. When the provider confirms payment, a{" "}
            <strong className="text-on-surface">notification is posted in this thread</strong> — keep the deal room open.
          </p>
        ) : null}
        {checkoutLink ? (
          <a
            href={checkoutLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => markCheckoutOpened()}
            className="border-outline-variant/40 bg-surface-container-highest text-secondary hover:bg-surface-container-low mt-3 inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold"
          >
            {checkoutOpened ? "Checkout opened — open again" : "Open checkout"}
          </a>
        ) : null}
        {reference && !checkoutLink ? (
          <p className="text-on-surface-variant/80 mt-2 font-mono text-[11px]">Reference · {reference}</p>
        ) : null}
      </DealEmbedShell>
    </div>
  );
}

function PartyLine({
  proposer,
  counterparty,
  leftFallback,
  rightFallback,
  subtle,
}: {
  proposer?: ProfileSnap;
  counterparty?: ProfileSnap;
  leftFallback: string;
  rightFallback: string;
  /** Plain 11px #444 — no profile links (deal room embeds). */
  subtle?: boolean;
}) {
  const a = (proposer?.username || proposer?.fullName || leftFallback).trim();
  const b = (counterparty?.username || counterparty?.fullName || rightFallback).trim();
  const ha = profileHref(proposer);
  const hb = profileHref(counterparty);
  const stripAt = (s: string) => s.replace(/^@+/, "");
  const showA = ha ? stripAt(a) : a;
  const showB = hb ? stripAt(b) : b;
  if (subtle) {
    return (
            <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
        <span>{a}</span>
        <span className="mx-1.5 opacity-70" aria-hidden>
          ·
        </span>
        <span>{b}</span>
      </p>
    );
  }
  return (
    <p className="text-on-surface-variant mt-1.5 text-[11px] leading-snug">
      {ha ? (
        <Link href={ha} className="text-secondary font-medium hover:underline">
          {showA}
        </Link>
      ) : (
        <span className="text-on-surface font-medium">{showA}</span>
      )}
      <span className="mx-1.5 opacity-35" aria-hidden>
        ·
      </span>
      {hb ? (
        <Link href={hb} className="text-secondary font-medium hover:underline">
          {showB}
        </Link>
      ) : (
        <span className="text-on-surface font-medium">{showB}</span>
      )}
    </p>
  );
}

function BidProposalEmbed({
  embed,
  threadId,
  transport,
  accessToken,
  onRefresh,
}: {
  embed: Record<string, unknown>;
  threadId?: string;
  transport?: string | null;
  accessToken?: string | null;
  onRefresh?: () => void;
}) {
  void transport;
  const proposer = embed.proposer as ProfileSnap | undefined;
  const counterparty = embed.counterparty as ProfileSnap | undefined;
  const price = embed.price != null ? Number(embed.price) : null;
  const delivery = embed.deliveryDays != null ? Number(embed.deliveryDays) : null;
  const preview = String(embed.proposalPreview || "").trim();
  const fullText = String(embed.proposalText || preview || "").trim();
  const listing = String(embed.requestTitle || "").trim();
  const requestId = String(embed.requestId || "").trim();
  const bidId = String(embed.bidId || "").trim();
  const convId = String(threadId || embed.conversationId || "").trim();
  const [expanded, setExpanded] = useState(false);
  const [acceptBusy, setAcceptBusy] = useState(false);
  const [acceptErr, setAcceptErr] = useState<string | null>(null);
  const [bidAccepted, setBidAccepted] = useState(false);
  const [rejectBusy, setRejectBusy] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterBusy, setCounterBusy] = useState(false);
  const [counterErr, setCounterErr] = useState<string | null>(null);

  async function onAcceptBid() {
    if (!accessToken || !bidId) return;
    setAcceptErr(null);
    setAcceptBusy(true);
    try {
      await apiMutateJson(
        `/api/bids/${encodeURIComponent(bidId)}/accept`,
        "POST",
        { conversationId: convId.trim() ? convId : undefined },
        accessToken,
      );
      setBidAccepted(true);
      onRefresh?.();
    } catch (e) {
      setAcceptErr(e instanceof Error ? e.message : "Could not accept");
    } finally {
      setAcceptBusy(false);
    }
  }

  async function submitCounter(v: { price: number; deliveryDays: number | null; proposal: string }) {
    if (!accessToken || !bidId || !convId) return;
    if (!Number.isFinite(v.price) || v.price <= 0) {
      setCounterErr("Enter a valid price");
      return;
    }
    if (!v.proposal) {
      setCounterErr("Add notes for your counter");
      return;
    }
    setCounterBusy(true);
    setCounterErr(null);
    try {
      await apiMutateJson(
        "/api/deals/counter-offer",
        "POST",
        {
          basis: "request_bid",
          conversationId: convId,
          counterToBidId: bidId,
          price: v.price,
          deliveryDays: v.deliveryDays,
          proposal: v.proposal,
        },
        accessToken,
      );
      setCounterOpen(false);
      onRefresh?.();
    } catch (e) {
      setCounterErr(e instanceof Error ? e.message : "Could not send counter");
    } finally {
      setCounterBusy(false);
    }
  }

  async function onRejectBid() {
    if (!accessToken || !bidId) return;
    setAcceptErr(null);
    setRejectBusy(true);
    try {
      await apiMutateJson(`/api/bids/${encodeURIComponent(bidId)}/reject`, "POST", {}, accessToken);
      onRefresh?.();
    } catch (e) {
      setAcceptErr(e instanceof Error ? e.message : "Could not reject");
    } finally {
      setRejectBusy(false);
    }
  }

  const titleEl =
    listing && requestId ? (
      <Link
        href={`/requests/${encodeURIComponent(requestId)}`}
        className="text-secondary hover:text-secondary/90 mt-1 inline-block text-[17px] font-bold leading-snug tracking-tight transition-colors hover:underline"
      >
        {listing}
      </Link>
    ) : listing ? (
      <p className="text-secondary mt-1 text-[17px] font-bold leading-snug tracking-tight">{listing}</p>
    ) : null;

  const bidDeliverySummary =
    delivery != null && Number.isFinite(delivery) ? formatDeliverySummary(delivery) : null;

  return (
    <div className="w-full max-w-[520px] text-left">
      <div className="border-outline-variant/25 overflow-hidden rounded-xl border shadow-sm">
        <DealEmbedShell
          accentClassName={
            bidAccepted
              ? "bg-emerald-500 shadow-[0_0_18px_rgba(52,211,153,0.35)]"
              : "bg-secondary shadow-[0_0_20px_rgba(124,92,252,0.12)]"
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                bidAccepted ? "bg-emerald-500/15 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-100" : "bg-secondary/15 text-secondary"
              }`}
            >
              {bidAccepted ? "Accepted" : "Request bid"}
            </span>
          </div>
          {titleEl}
          <PartyLine proposer={proposer} counterparty={counterparty} leftFallback="Bidder" rightFallback="Client" />
          <div className="border-outline-variant/20 mt-3 space-y-2 rounded-lg border bg-surface-variant px-2.5 py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Price</span>
              <span className="text-on-surface text-lg font-bold tabular-nums">
                {price != null && Number.isFinite(price) ? `$${price.toLocaleString()}` : "—"}
              </span>
            </div>
            <div className="border-outline-variant/15 border-t pt-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Delivery</span>
              {bidDeliverySummary ? (
                <>
                  <p className="text-on-surface mt-0.5 text-sm font-semibold leading-snug">{bidDeliverySummary.short}</p>
                  {bidDeliverySummary.detail ? (
                    <p className="text-on-surface-variant mt-0.5 text-xs tabular-nums">{bidDeliverySummary.detail}</p>
                  ) : null}
                  {bidDeliverySummary.warn ? (
                    <p className="mt-1 rounded-md bg-amber-500/10 dark:bg-amber-500/12 px-2 py-1 text-[11px] font-medium leading-snug text-amber-700 dark:text-amber-100">
                      {bidDeliverySummary.warn}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-on-surface-variant mt-0.5 text-sm">Not specified</p>
              )}
            </div>
          </div>
          {fullText ? (
            <div className="mt-3 rounded-lg bg-surface-variant px-2.5 py-2">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Proposal</p>
              <p
                className={`text-on-surface mt-1 whitespace-pre-wrap text-[13px] leading-relaxed ${
                  expanded ? "max-h-44 overflow-y-auto pr-1" : "line-clamp-3"
                }`}
              >
                {fullText}
              </p>
              {fullText.length > 160 ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-secondary mt-1.5 text-[12px] font-semibold hover:underline"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </div>
          ) : null}
        </DealEmbedShell>
      </div>
      {accessToken && bidId ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <DealEmbedActionButton
              variant="primary"
              disabled={acceptBusy || bidAccepted}
              onClick={() => void onAcceptBid()}
            >
              {acceptBusy ? "…" : bidAccepted ? "Accepted" : "Accept"}
            </DealEmbedActionButton>
            <DealEmbedActionButton
              type="button"
              disabled={acceptBusy || rejectBusy || bidAccepted || counterBusy || !convId}
              onClick={() => {
                setCounterErr(null);
                setCounterOpen(true);
              }}
            >
              Counter offer
            </DealEmbedActionButton>
            <DealEmbedActionButton
              type="button"
              disabled={acceptBusy || rejectBusy || bidAccepted}
              onClick={() => void onRejectBid()}
            >
              {rejectBusy ? "…" : "Decline"}
            </DealEmbedActionButton>
          </div>
          <p className="text-on-surface-variant text-[11px] font-light leading-snug">
            {bidAccepted
              ? "Deal locked — use the contract card below to draft or sign. Payment runs only from that contract after both parties approve."
              : "Counter-offers appear as a new card. Accept awards the bid and drops a contract draft here — pay only after signatures, not from a separate bid invoice."}
          </p>
          {acceptErr ? (
            <p className="text-error text-xs" role="alert">
              {acceptErr}
            </p>
          ) : null}
        </div>
      ) : null}
      <CounterOfferModal
        open={counterOpen}
        onClose={() => !counterBusy && setCounterOpen(false)}
        listingTitle={listing || "Request"}
        initialPrice={price}
        initialDeliveryDays={delivery}
        busy={counterBusy}
        errorMsg={counterErr}
        onSubmit={submitCounter}
      />
    </div>
  );
}

function ServiceOfferEmbed({
  embed,
  threadId,
  transport,
  accessToken,
  currentUserId,
  onRefresh,
}: {
  embed: Record<string, unknown>;
  threadId?: string;
  transport?: string | null;
  accessToken?: string | null;
  currentUserId?: string | null;
  onRefresh?: () => void;
}) {
  void transport;
  const proposer = embed.proposer as ProfileSnap | undefined;
  const counterparty = embed.counterparty as ProfileSnap | undefined;
  const price = embed.price != null ? Number(embed.price) : null;
  const delivery = embed.deliveryDays != null ? Number(embed.deliveryDays) : null;
  const preview = String(embed.proposalPreview || "").trim();
  const fullText = String(embed.proposalText || preview || "").trim();
  const listing = String(embed.serviceTitle || "").trim();
  const serviceId = String(embed.serviceId || "").trim();
  const convId = String(threadId || embed.conversationId || "").trim();
  const buyerId = profileId(proposer);
  const sellerId = profileId(counterparty);
  const uid = currentUserId ? String(currentUserId) : "";
  const isSeller = uid && sellerId && uid === sellerId;
  const [expanded, setExpanded] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterBusy, setCounterBusy] = useState(false);
  const [counterErr, setCounterErr] = useState<string | null>(null);
  const [acceptBusy, setAcceptBusy] = useState(false);
  const [acceptErr, setAcceptErr] = useState<string | null>(null);
  const [acceptOk, setAcceptOk] = useState<string | null>(null);
  const [declineBusy, setDeclineBusy] = useState(false);
  const [declineErr, setDeclineErr] = useState<string | null>(null);

  async function submitCounter(v: { price: number; deliveryDays: number | null; proposal: string }) {
    if (!accessToken || !serviceId || !convId || !buyerId) return;
    if (!Number.isFinite(v.price) || v.price <= 0) {
      setCounterErr("Enter a valid price");
      return;
    }
    if (!v.proposal) {
      setCounterErr("Add notes for your counter");
      return;
    }
    setCounterBusy(true);
    setCounterErr(null);
    try {
      await apiMutateJson(
        "/api/deals/counter-offer",
        "POST",
        {
          basis: "service_offer",
          conversationId: convId,
          serviceId,
          counterToProposerId: buyerId,
          price: v.price,
          deliveryDays: v.deliveryDays,
          proposal: v.proposal,
        },
        accessToken,
      );
      setCounterOpen(false);
      onRefresh?.();
    } catch (e) {
      setCounterErr(e instanceof Error ? e.message : "Could not send counter");
    } finally {
      setCounterBusy(false);
    }
  }

  async function onAcceptServiceDeal() {
    setAcceptOk(null);
    if (!accessToken || !serviceId || !convId) {
      setAcceptErr("Sign in and open this deal from the chat thread.");
      return;
    }
    if (!buyerId) {
      setAcceptErr("Could not read the buyer on this card — refresh the page.");
      return;
    }
    if (!Number.isFinite(price) || price == null || price <= 0) {
      setAcceptErr("This offer has no valid price to accept.");
      return;
    }
    setAcceptErr(null);
    setAcceptBusy(true);
    try {
      const out = await apiMutateJson<{
        alreadyLinked?: boolean;
        contract?: { id?: string } | null;
      }>(
        `/api/services/${encodeURIComponent(serviceId)}/accept-deal`,
        "POST",
        {
          conversationId: convId,
          counterProposerId: buyerId,
          agreedPrice: price,
          deliveryDays: delivery != null && Number.isFinite(delivery) ? delivery : null,
        },
        accessToken,
      );
      const linked = out && typeof out === "object" && out.alreadyLinked;
      const hasContract =
        out &&
        typeof out === "object" &&
        out.contract &&
        typeof out.contract === "object" &&
        String((out.contract as { id?: string }).id || "").length > 0;
      if (linked) {
        setAcceptOk("This deal was already accepted — see the contract in the thread below.");
      } else if (hasContract) {
        setAcceptOk("Offer accepted. A contract card was added below — review, send, then both sign.");
      } else {
        setAcceptOk("Offer accepted. New updates were added to this thread — scroll down.");
      }
      onRefresh?.();
    } catch (e) {
      setAcceptErr(e instanceof Error ? e.message : "Could not accept");
    } finally {
      setAcceptBusy(false);
    }
  }

  async function onDeclineServiceDeal() {
    if (!accessToken || !serviceId || !convId || !buyerId) return;
    setDeclineErr(null);
    setDeclineBusy(true);
    try {
      await apiMutateJson(
        `/api/services/${encodeURIComponent(serviceId)}/decline-deal`,
        "POST",
        {
          conversationId: convId,
          counterProposerId: buyerId,
          reason: "Seller declined current terms",
        },
        accessToken,
      );
      setAcceptOk("Offer declined. Buyer can send a new offer card when ready.");
      onRefresh?.();
    } catch (e) {
      setDeclineErr(e instanceof Error ? e.message : "Could not decline");
    } finally {
      setDeclineBusy(false);
    }
  }

  const titleEl =
    listing && serviceId ? (
      <Link
        href={`/services/${encodeURIComponent(serviceId)}`}
        className="text-emerald-500 hover:opacity-95 mt-1 inline-block text-[17px] font-bold leading-snug tracking-tight transition-opacity hover:underline"
      >
        {listing}
      </Link>
    ) : listing ? (
      <p className="text-emerald-500 mt-1 text-[17px] font-bold leading-snug tracking-tight">{listing}</p>
    ) : null;

  const deliverySummary =
    delivery != null && Number.isFinite(delivery) ? formatDeliverySummary(delivery) : null;

  return (
    <div className="w-full max-w-[480px] text-left">
      <div className="border-outline-variant/25 overflow-hidden rounded-lg border shadow-sm">
        <DealEmbedShell accentClassName="bg-emerald-500 shadow-[0_0_12px_rgba(0,208,132,0.12)]">
          {/* Header row with badge and listing */}
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-on-primary">
              Buyer offer
            </span>
            {titleEl ?? <span className="text-on-surface-variant text-xs italic">Untitled</span>}
          </div>

          {/* Compact row: Buyer | Seller | Price | Delivery */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3">
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant/70 text-[9px] uppercase">Buyer</span>
              {(() => {
                const h = profileHref(proposer);
                const text = displayHandle(proposer, "Buyer");
                return h ? (
                  <Link href={h} className="text-on-surface font-medium hover:underline">{text}</Link>
                ) : (
                  <span className="text-on-surface font-medium">{text}</span>
                );
              })()}
            </div>
            <span className="text-on-surface-variant/30">·</span>
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant/70 text-[9px] uppercase">Seller</span>
              {(() => {
                const h = profileHref(counterparty);
                const text = displayHandle(counterparty, "Seller");
                return h ? (
                  <Link href={h} className="text-on-surface font-medium hover:underline">{text}</Link>
                ) : (
                  <span className="text-on-surface font-medium">{text}</span>
                );
              })()}
            </div>
            <span className="text-on-surface-variant/30">·</span>
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant/70 text-[9px] uppercase">Offer</span>
              <span className="text-on-surface font-bold text-emerald-600 dark:text-emerald-400">
                {price != null && Number.isFinite(price) ? `$${price.toLocaleString()}` : "—"}
              </span>
            </div>
            {deliverySummary && (
              <>
                <span className="text-on-surface-variant/30">·</span>
                <div className="flex items-center gap-1">
                  <span className="text-on-surface-variant/70 text-[9px] uppercase">Delivery</span>
                  <span className="text-on-surface font-medium">{deliverySummary.short}</span>
                </div>
              </>
            )}
          </div>

          {/* Buyer message */}
          {fullText ? (
            <div className="border-t border-outline-variant/20 pt-2 mt-2">
              <p className={`text-on-surface-variant/90 text-xs leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
                {fullText}
              </p>
              {fullText.length > 180 ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-secondary mt-1 text-[11px] font-medium hover:underline"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </div>
          ) : null}
        </DealEmbedShell>
      </div>
      {accessToken ? (
        <div className="mt-2 flex items-center gap-2">
          {isSeller ? (
            <DealEmbedActionButton variant="primary" disabled={acceptBusy || !convId} onClick={() => void onAcceptServiceDeal()}>
              {acceptBusy ? "…" : "Accept"}
            </DealEmbedActionButton>
          ) : null}
          {isSeller ? (
            <>
              <DealEmbedActionButton
                type="button"
                disabled={acceptBusy || declineBusy || counterBusy || !convId}
                onClick={() => {
                  setCounterErr(null);
                  setCounterOpen(true);
                }}
              >
                Counter
              </DealEmbedActionButton>
              <DealEmbedActionButton
                type="button"
                disabled={acceptBusy || declineBusy || counterBusy || !convId}
                onClick={() => void onDeclineServiceDeal()}
              >
                {declineBusy ? "…" : "Decline"}
              </DealEmbedActionButton>
            </>
          ) : null}
          {!isSeller && (
            <span className="text-on-surface-variant/60 text-[10px]">Waiting for seller response...</span>
          )}
          {acceptErr ? (
            <p className="text-error text-xs" role="alert">
              {acceptErr}
            </p>
          ) : null}
          {declineErr ? (
            <p className="text-error text-xs" role="alert">
              {declineErr}
            </p>
          ) : null}
          {acceptOk ? (
            <p className="text-secondary text-xs font-medium" role="status">
              {acceptOk}
            </p>
          ) : null}
        </div>
      ) : null}
      <CounterOfferModal
        open={counterOpen}
        onClose={() => !counterBusy && setCounterOpen(false)}
        listingTitle={listing || "Service"}
        initialPrice={price}
        initialDeliveryDays={delivery}
        busy={counterBusy}
        errorMsg={counterErr}
        onSubmit={submitCounter}
      />
    </div>
  );
}

function DealCounterOfferEmbed({
  embed,
  threadId,
  accessToken,
  currentUserId,
  onRefresh,
}: {
  embed: Record<string, unknown>;
  threadId?: string;
  accessToken?: string | null;
  currentUserId?: string | null;
  onRefresh?: () => void;
}) {
  const basis = String(embed.basis || "");
  const proposer = embed.proposer as ProfileSnap | undefined;
  const counterparty = embed.counterparty as ProfileSnap | undefined;
  const price = embed.price != null ? Number(embed.price) : null;
  const delivery = embed.deliveryDays != null ? Number(embed.deliveryDays) : null;
  const label = String(embed.label || "Counter offer");
  const preview = String(embed.proposalPreview || "").trim();
  const fullText = String(embed.proposalText || preview || "").trim();
  const serviceId = String(embed.serviceId || "").trim();
  const requestTitle = String(embed.requestTitle || "").trim();
  const requestId = String(embed.requestId || "").trim();
  const proposerId = profileId(proposer);
  const recipientId = profileId(counterparty);
  const uid = currentUserId ? String(currentUserId) : "";
  const convId = String(threadId || embed.conversationId || "").trim();
  const [expanded, setExpanded] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterBusy, setCounterBusy] = useState(false);
  const [counterErr, setCounterErr] = useState<string | null>(null);
  const [acceptBusy, setAcceptBusy] = useState(false);
  const [acceptErr, setAcceptErr] = useState<string | null>(null);
  const [acceptOk, setAcceptOk] = useState<string | null>(null);

  const canAcceptService = basis === "service_offer" && uid && recipientId && uid === recipientId && proposerId;
  const canCounterService = basis === "service_offer" && uid && proposerId && uid !== proposerId && serviceId && convId;
  const showRequestHint = basis === "request_bid";

  async function onAcceptCounterDeal() {
    setAcceptOk(null);
    if (!accessToken || !serviceId || !convId) {
      setAcceptErr("Sign in and open this deal from the chat thread.");
      return;
    }
    if (!proposerId) {
      setAcceptErr("Could not read who made this offer — refresh the page.");
      return;
    }
    if (!Number.isFinite(price) || price == null || price <= 0) {
      setAcceptErr("This counter has no valid price to accept.");
      return;
    }
    setAcceptErr(null);
    setAcceptBusy(true);
    try {
      const out = await apiMutateJson<{
        alreadyLinked?: boolean;
        contract?: { id?: string } | null;
      }>(
        `/api/services/${encodeURIComponent(serviceId)}/accept-deal`,
        "POST",
        {
          conversationId: convId,
          counterProposerId: proposerId,
          agreedPrice: price,
          deliveryDays: delivery != null && Number.isFinite(delivery) ? delivery : null,
        },
        accessToken,
      );
      const linked = out && typeof out === "object" && out.alreadyLinked;
      const hasContract =
        out &&
        typeof out === "object" &&
        out.contract &&
        typeof out.contract === "object" &&
        String((out.contract as { id?: string }).id || "").length > 0;
      if (linked) {
        setAcceptOk("This deal was already accepted — see the contract in the thread below.");
      } else if (hasContract) {
        setAcceptOk("Offer accepted. A contract card was added below — review, send, then both sign.");
      } else {
        setAcceptOk("Offer accepted. New updates were added to this thread — scroll down.");
      }
      onRefresh?.();
    } catch (e) {
      setAcceptErr(e instanceof Error ? e.message : "Could not accept");
    } finally {
      setAcceptBusy(false);
    }
  }

  async function submitCounter(v: { price: number; deliveryDays: number | null; proposal: string }) {
    if (!accessToken || !serviceId || !convId || !proposerId) return;
    if (!Number.isFinite(v.price) || v.price <= 0) {
      setCounterErr("Enter a valid price");
      return;
    }
    if (!v.proposal) {
      setCounterErr("Add notes for your counter");
      return;
    }
    setCounterBusy(true);
    setCounterErr(null);
    try {
      await apiMutateJson(
        "/api/deals/counter-offer",
        "POST",
        {
          basis: "service_offer",
          conversationId: convId,
          serviceId,
          counterToProposerId: proposerId,
          price: v.price,
          deliveryDays: v.deliveryDays,
          proposal: v.proposal,
        },
        accessToken,
      );
      setCounterOpen(false);
      onRefresh?.();
    } catch (e) {
      setCounterErr(e instanceof Error ? e.message : "Could not send counter");
    } finally {
      setCounterBusy(false);
    }
  }

  const accent = basis === "request_bid" ? "bg-amber-500" : "bg-cyan-500";

  const headline =
    basis === "request_bid" && requestId && requestTitle ? (
      <Link
        href={`/requests/${encodeURIComponent(requestId)}`}
        className="text-amber-100 mt-1 inline-block text-[16px] font-bold leading-snug hover:underline"
      >
        {requestTitle}
      </Link>
    ) : basis === "service_offer" && serviceId && embed.serviceTitle ? (
      <Link
        href={`/services/${encodeURIComponent(serviceId)}`}
        className="mt-1 inline-block text-[16px] font-bold leading-snug text-cyan-50 hover:underline"
      >
        {String(embed.serviceTitle)}
      </Link>
    ) : null;

  const counterDeliverySummary =
    delivery != null && Number.isFinite(delivery) ? formatDeliverySummary(delivery) : null;

  return (
    <div className="w-full max-w-[520px] text-left">
      <div className="border-outline-variant/25 overflow-hidden rounded-xl border shadow-sm">
        <DealEmbedShell accentClassName={`${accent} shadow-[0_0_16px_rgba(255,255,255,0.06)]`}>
          <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.14em]">{label}</span>
          {headline}
          <PartyLine proposer={proposer} counterparty={counterparty} leftFallback="Party A" rightFallback="Party B" />
          <div className="border-outline-variant/20 mt-2 space-y-2 rounded-lg border bg-black/15 px-2.5 py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Price</span>
              <span className="text-on-surface text-lg font-bold tabular-nums">
                {price != null && Number.isFinite(price) ? `$${price.toLocaleString()}` : "—"}
              </span>
            </div>
            <div className="border-outline-variant/15 border-t border-white/10 pt-2">
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Delivery</span>
              {counterDeliverySummary ? (
                <>
                  <p className="text-on-surface mt-0.5 text-sm font-semibold leading-snug">{counterDeliverySummary.short}</p>
                  {counterDeliverySummary.detail ? (
                    <p className="text-on-surface-variant mt-0.5 text-xs tabular-nums opacity-90">
                      {counterDeliverySummary.detail}
                    </p>
                  ) : null}
                  {counterDeliverySummary.warn ? (
                    <p className="mt-1 rounded-md bg-amber-950/40 px-2 py-1 text-[11px] font-medium leading-snug text-amber-100">
                      {counterDeliverySummary.warn}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-on-surface-variant mt-0.5 text-sm opacity-90">Not specified</p>
              )}
            </div>
          </div>
          {fullText ? (
            <div className="mt-2 rounded-lg bg-black/15 px-2.5 py-2">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">Terms</p>
              <p
                className={`text-on-surface mt-1 whitespace-pre-wrap text-[13px] leading-relaxed ${
                  expanded ? "max-h-44 overflow-y-auto" : "line-clamp-3"
                }`}
              >
                {fullText}
              </p>
              {fullText.length > 140 ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-[12px] font-semibold text-white/90 hover:underline"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </div>
          ) : null}
        </DealEmbedShell>
      </div>
      {showRequestHint ? (
        <p className="text-on-surface-variant mt-2 text-[11px] leading-snug">
          Client counter — the specialist can submit an updated bid from the request page, or continue negotiating in chat.
        </p>
      ) : null}
      {accessToken && basis === "service_offer" ? (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {canAcceptService ? (
              <DealEmbedActionButton variant="primary" disabled={acceptBusy || !convId} onClick={() => void onAcceptCounterDeal()}>
                {acceptBusy ? "…" : "Accept terms"}
              </DealEmbedActionButton>
            ) : null}
            {canCounterService ? (
              <DealEmbedActionButton
                type="button"
                disabled={acceptBusy || counterBusy}
                onClick={() => {
                  setCounterErr(null);
                  setCounterOpen(true);
                }}
              >
                Counter offer
              </DealEmbedActionButton>
            ) : null}
          </div>
          {acceptErr ? (
            <p className="text-error text-xs" role="alert">
              {acceptErr}
            </p>
          ) : null}
          {acceptOk ? (
            <p className="text-secondary text-xs font-medium" role="status">
              {acceptOk}
            </p>
          ) : null}
        </div>
      ) : null}
      <CounterOfferModal
        open={counterOpen}
        onClose={() => !counterBusy && setCounterOpen(false)}
        listingTitle={String(embed.serviceTitle || requestTitle || "Deal")}
        initialPrice={price}
        initialDeliveryDays={delivery}
        busy={counterBusy}
        errorMsg={counterErr}
        onSubmit={submitCounter}
      />
    </div>
  );
}

type ContractRow = {
  id: string;
  status: string;
  title?: string;
  body?: string;
  amountUsd?: number;
  fundReference?: string | null;
  clientSignedAt?: string | null;
  providerSignedAt?: string | null;
  client?: ProfileSnap;
  provider?: ProfileSnap;
  revisionNote?: string | null;
};

function contractFundingStepper(statusRaw: string) {
  const status = String(statusRaw || "").toLowerCase();
  const steps = [
    { id: "terms", label: "Terms", hint: "Draft & send" },
    { id: "sign", label: "Sign", hint: "Both parties" },
    { id: "fund", label: "Pay", hint: "Client escrow" },
    { id: "held", label: "Held", hint: "In escrow" },
    { id: "out", label: "Payout", hint: "Released" },
  ];
  let active = 0;
  if (status === "cancelled") return { steps, active: -1, cancelled: true };
  if (["draft", "revision_requested"].includes(status)) active = 0;
  else if (status === "sent") active = 1;
  else if (status === "fully_accepted") active = 2;
  else if (status === "awaiting_funds") active = 2;
  else if (status === "funds_held") active = 3;
  else if (status === "released") active = 4;
  return { steps, active, cancelled: false };
}

export function ContractCardEmbed({
  embed,
  currentUserId,
  accessToken,
  onRefresh,
}: {
  embed: Record<string, unknown>;
  currentUserId: string | null | undefined;
  accessToken: string | null | undefined;
  onRefresh: () => void;
}) {
  const contractId = String(embed.contractId || "").trim();
  const [row, setRow] = useState<ContractRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [payout, setPayout] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftErr, setDraftErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!contractId || !accessToken) return;
    try {
      const data = await apiGetJson<{ contract: ContractRow }>(`/api/contracts/${contractId}`, accessToken);
      setRow(data.contract);
    } catch {
      setRow(null);
    }
  }, [contractId, accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const snapStatus = String(embed.status || "");
  const status = row?.status || snapStatus;
  const title = row?.title || String(embed.title || "Contract");
  const amount = row?.amountUsd ?? (embed.amountUsd != null ? Number(embed.amountUsd) : null);
  const client = row?.client || (embed.clientId ? ({ id: String(embed.clientId) } as ProfileSnap) : undefined);
  const provider =
    row?.provider || (embed.providerId ? ({ id: String(embed.providerId) } as ProfileSnap) : undefined);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setErr(null);
    try {
      await fn();
      await load();
      onRefresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const uid = currentUserId ? String(currentUserId) : "";
  const isClient = uid && client?.id && uid === String(client.id);
  const isProvider = uid && provider?.id && uid === String(provider.id);
  const party = isClient || isProvider;
  const bodyPreview = String(row?.body || embed.bodyPreview || "").trim();
  const { steps: stepperSteps, active: stepperActive, cancelled: stepperCancelled } = contractFundingStepper(status);

  return (
    <div data-embed-type="contract_card" className="w-full max-w-[520px] text-left">
      <DealEmbedShell accentClassName="bg-[#F5A623]">
        <p className="text-on-surface-variant text-[12px] font-semibold uppercase tracking-wide">
          Contract &amp; payment
        </p>
        <p className="text-secondary mt-1 text-[16px] font-semibold">{title}</p>
        <p className="text-on-surface-variant mt-2 text-[12px] leading-relaxed">
          Terms, signatures, and escrow — all surfaced in this deal room. Delivery and milestones stay in-thread.
        </p>
        <div className="mt-3 overflow-x-auto rounded border border-black/25 bg-[#1e1f22] px-2 py-3">
          <div className="flex min-w-max items-start gap-1">
            {stepperSteps.map((s, i) => {
              const done = stepperActive > i;
              const current = stepperActive === i;
              const muted = stepperCancelled || stepperActive < 0;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex max-w-[4.5rem] flex-col items-center px-1 text-center sm:max-w-none sm:px-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                        muted
                          ? "bg-[#2b2d31] text-[#949f96]"
                          : done
                            ? "bg-[#248046] text-white"
                            : current
                              ? "bg-[#5865F2] text-white ring-2 ring-[#5865F2]/40"
                              : "bg-[#2b2d31] text-[#949f96]"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="mt-1 text-[10px] font-bold leading-tight text-[#f2f3f5]">{s.label}</span>
                    <span className="text-[9px] font-light leading-tight text-[#949f96]">{s.hint}</span>
                  </div>
                  {i < stepperSteps.length - 1 ? (
                    <span className="mb-6 px-0.5 text-[#949f96]/40" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          {stepperCancelled ? (
            <p className="text-error mt-2 px-1 text-center text-[10px] font-bold uppercase">Cancelled</p>
          ) : null}
        </div>
        <PartyLine proposer={client} counterparty={provider} leftFallback="Client" rightFallback="Specialist" />
        {["sent", "fully_accepted", "awaiting_funds", "funds_held", "released"].includes(status) ? (
          <div className="mt-2 rounded border border-black/15 bg-[#111214]/60 px-2 py-2 text-[11px] leading-relaxed text-[#dbdee1]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#949f96]">Signatures</p>
            <p className="mt-1">
              <span className="text-[#949f96]">Client:</span>{" "}
              {row?.clientSignedAt ? (
                <span className="font-semibold text-emerald-300">Signed</span>
              ) : (
                <span className="text-amber-200/90">Awaiting</span>
              )}
            </p>
            <p className="mt-0.5">
              <span className="text-[#949f96]">Specialist:</span>{" "}
              {row?.providerSignedAt ? (
                <span className="font-semibold text-emerald-300">Signed</span>
              ) : (
                <span className="text-amber-200/90">Awaiting</span>
              )}
            </p>
            {status === "fully_accepted" || status === "awaiting_funds" || status === "funds_held" || status === "released" ? (
              <p className="text-on-surface-variant mt-1.5 text-[10px] font-medium">
                Both signatures are required before the client can fund escrow.
              </p>
            ) : null}
          </div>
        ) : null}
        {amount != null && Number.isFinite(amount) ? (
          <p className="mt-2 text-sm tabular-nums text-[#f2f3f5]">
            <span className="text-lg font-bold">${amount.toLocaleString()}</span>{" "}
            <span className="text-[12px] text-[#949f96]">USD total</span>
          </p>
        ) : null}
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#949f96]">Status · {status}</p>
        {bodyPreview ? (
          <div className="mt-2 rounded border border-black/20 bg-[#111214]/80 p-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#949f96]">Terms (excerpt)</p>
            <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap text-[12px] leading-relaxed text-[#dbdee1]">
              {bodyPreview}
            </p>
          </div>
        ) : null}
        {row?.revisionNote || embed.revisionNote ? (
          <p className="mt-2 border-t border-white/10 pt-2 text-[12px] text-[#b5bac1]">
            {String(row?.revisionNote || embed.revisionNote || "")}
          </p>
        ) : null}
      </DealEmbedShell>
      {err ? (
        <p className="text-error mt-2 text-xs" role="alert">
          {err}
        </p>
      ) : null}
      {party ? (
        <div className="border-outline-variant/30 mt-3 flex flex-col gap-2 border-t pt-3">
          {["draft", "revision_requested"].includes(status) ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy) || draftBusy}
                className="rounded-lg border border-[#1E1E1E] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                onClick={() => {
                  setDraftErr(null);
                  setDraftOpen(true);
                }}
              >
                Edit draft
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                className="bg-primary/90 text-on-primary font-headline rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                onClick={() =>
                  void run("send", async () => {
                    await apiMutateJson(`/api/contracts/${contractId}/send`, "POST", {}, accessToken);
                  })
                }
              >
                {busy === "send" ? "…" : "Send"}
              </button>
            </div>
          ) : null}
          {status === "sent" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={Boolean(busy)}
                className="bg-secondary-container text-on-secondary-container font-headline rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                onClick={() =>
                  void run("sign", async () => {
                    await apiMutateJson(`/api/contracts/${contractId}/sign`, "POST", {}, accessToken);
                  })
                }
              >
                {busy === "sign" ? "…" : "Approve / sign"}
              </button>
              <button
                type="button"
                disabled={Boolean(busy)}
                className="rounded-lg border border-[#1E1E1E] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                onClick={() => {
                  const note = typeof window !== "undefined" ? window.prompt("What should change?") : "";
                  if (note === null) return;
                  void run("rev", async () => {
                    await apiMutateJson(
                      `/api/contracts/${contractId}/revision`,
                      "POST",
                      { note: note || "" },
                      accessToken,
                    );
                  });
                }}
              >
                Request edits
              </button>
            </div>
          ) : null}
          {["draft", "sent", "revision_requested", "fully_accepted"].includes(status) ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              className="text-on-surface-variant hover:text-error text-left text-[11px] font-medium underline-offset-2 hover:underline disabled:opacity-50"
              onClick={() =>
                void run("x", async () => {
                  await apiMutateJson(`/api/contracts/${contractId}/cancel`, "POST", {}, accessToken);
                })
              }
            >
              {busy === "x" ? "…" : "Cancel contract"}
            </button>
          ) : null}
          {status === "fully_accepted" && isClient ? (
            <div className="flex flex-col gap-1">
              <p className="text-on-surface-variant text-[11px] font-light leading-relaxed">
                Next: add the specialist&apos;s on-chain payout address, then open the hosted checkout. When the
                invoice confirms, funds show as held and the engagement is under escrow — not informal chat.
              </p>
              <label className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                Payee wallet (specialist)
              </label>
              <input
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
                placeholder="0x… or payout address"
                className="rounded-lg border border-[#1E1E1E] bg-surface-container-low px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                disabled={Boolean(busy)}
                className="bg-primary-container text-on-primary-container font-headline w-fit rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50"
                onClick={() =>
                  void run("pay", async () => {
                    const out = await apiMutateJson<{ checkoutLink?: string }>(
                      `/api/contracts/${contractId}/crypto-intent`,
                      "POST",
                      { payoutAddress: payout.trim() },
                      accessToken,
                    );
                    const url = out && typeof out === "object" && out.checkoutLink ? String(out.checkoutLink) : "";
                    if (url) window.location.assign(url);
                    else throw new Error("No checkout link");
                  })
                }
              >
                {busy === "pay" ? "…" : "Open payment & lock funds"}
              </button>
            </div>
          ) : null}
          {status === "awaiting_funds" && isClient ? (
            <p className="text-on-surface-variant text-[11px] font-light leading-relaxed">
              Finish hosted checkout if you haven&apos;t yet.{" "}
              <strong className="text-on-surface">When the payment provider confirms</strong>, you&apos;ll get a
              notification and this thread will update (invoice reference{" "}
              {row?.fundReference || embed.fundReference ? (
                <span className="font-mono text-on-surface/90">
                  {String(row?.fundReference || embed.fundReference || "")}
                </span>
              ) : (
                "on file"
              )}
              ). You can safely retry checkout if the tab closed.
            </p>
          ) : null}
          {status === "funds_held" ? (
            <p className="text-on-surface-variant text-[11px] font-light">
              Funds are in escrow. Keep delivery updates and files in this chat until release is recorded.
            </p>
          ) : null}
        </div>
      ) : null}
      <ContractDraftModal
        open={draftOpen}
        onClose={() => !draftBusy && setDraftOpen(false)}
        initialTitle={row?.title || title}
        initialBody={row?.body || bodyPreview}
        initialAmountUsd={amount}
        busy={draftBusy}
        errorMsg={draftErr}
        onSave={async (v) => {
          if (!accessToken || !contractId) return;
          if (!v.title) {
            setDraftErr("Title is required");
            return;
          }
          if (!Number.isFinite(v.amountUsd) || v.amountUsd <= 0) {
            setDraftErr("Enter a valid amount");
            return;
          }
          setDraftBusy(true);
          setDraftErr(null);
          try {
            await apiMutateJson(`/api/contracts/${contractId}/draft`, "PATCH", v, accessToken);
            await load();
            onRefresh();
            setDraftOpen(false);
          } catch (e) {
            setDraftErr(e instanceof Error ? e.message : "Save failed");
          } finally {
            setDraftBusy(false);
          }
        }}
      />
    </div>
  );
}

export function ChatMessageEmbed({
  embed,
  currentUserId,
  accessToken,
  onRefresh,
  threadId,
  transport,
}: {
  embed: Record<string, unknown> | null | undefined;
  currentUserId: string | null | undefined;
  accessToken: string | null | undefined;
  onRefresh: () => void;
  threadId?: string;
  transport?: string | null;
}) {
  if (!embed || typeof embed !== "object" || !embed.type) return null;
  const t = String(embed.type);
  if (t === "bid_proposal") {
    return (
      <BidProposalEmbed
        embed={embed}
        threadId={threadId}
        transport={transport}
        accessToken={accessToken}
        onRefresh={onRefresh}
      />
    );
  }
  if (t === "service_bid") {
    return (
      <ServiceOfferEmbed
        embed={embed}
        threadId={threadId}
        transport={transport}
        accessToken={accessToken}
        currentUserId={currentUserId}
        onRefresh={onRefresh}
      />
    );
  }
  if (t === "deal_counter_offer") {
    return (
      <DealCounterOfferEmbed
        embed={embed}
        threadId={threadId}
        accessToken={accessToken}
        currentUserId={currentUserId}
        onRefresh={onRefresh}
      />
    );
  }
  if (t === "contract_card") {
    return (
      <ContractCardEmbed
        embed={embed}
        currentUserId={currentUserId}
        accessToken={accessToken}
        onRefresh={onRefresh}
      />
    );
  }
  if (t === "deal_phase") {
    return <DealPhaseEmbed embed={embed} />;
  }
  return null;
}
