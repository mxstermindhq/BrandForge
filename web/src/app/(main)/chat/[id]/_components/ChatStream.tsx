"use client";

import Image from "next/image";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef, type MutableRefObject, useState } from "react";
import { ChatMessageEmbed } from "@/components/messages/ChatEmbeds";
import { Sparkles, MessageSquare, FileText, Send, Zap, Lightbulb } from "lucide-react";

export type StreamMessage = {
  id?: string;
  role?: string;
  text?: string;
  createdAt?: string;
  contentType?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  embed?: Record<string, unknown> | null;
  senderId?: string | null;
  senderUsername?: string | null;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  roleBadge?: string | null;
  isAI?: boolean;
};

const SUGGESTED_FOLLOWUPS = [
  { icon: Sparkles, label: "Summarize this deal", color: "text-amber-400" },
  { icon: FileText, label: "Draft a proposal", color: "text-sky-400" },
  { icon: Zap, label: "Check for red flags", color: "text-rose-400" },
  { icon: Lightbulb, label: "Suggest next steps", color: "text-emerald-400" },
];

const ROLE_BADGE_CLASS: Record<string, string> = {
  Buyer: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  Seller: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  CLIENT: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  SPECIALIST: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  ARCHITECT: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  GLADIATOR: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  AI: "border-purple-500/40 bg-purple-500/15 text-purple-300",
};

function dayKey(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toDateString();
  } catch {
    return "";
  }
}

function daySeparatorLabel(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function formatMessageTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function minutesBetween(isoPrev?: string, isoNext?: string): number {
  if (!isoPrev || !isoNext) return 999;
  const a = new Date(isoPrev).getTime();
  const b = new Date(isoNext).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 999;
  return Math.abs(b - a) / 60000;
}

/** Caption under the bubble: hide auto "Attachment: …" for images (image is shown above). */
function attachmentCaptionPlain(m: StreamMessage): string {
  const raw = (m.text || "").trim();
  const autoLabel = m.fileName ? `Attachment: ${m.fileName}` : "";
  if (m.contentType === "image") {
    if (!raw || raw === autoLabel) return "";
    return raw;
  }
  return raw || autoLabel;
}

function RolePill({ code, isAI }: { code: string | null | undefined; isAI?: boolean }) {
  if (!code && !isAI) return null;
  const cls = isAI ? ROLE_BADGE_CLASS.AI : (code ? ROLE_BADGE_CLASS[code] : ROLE_BADGE_CLASS.GLADIATOR);
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase leading-snug tracking-wide ${cls} border`}
    >
      {isAI ? "AI" : code}
    </span>
  );
}

function isGenericChatLabel(s: string): boolean {
  const t = s.trim().toLowerCase();
  return (
    t === "member" ||
    t === "you" ||
    t === "user" ||
    t === "mxstermind user" ||
    t === "bidder" ||
    t === "seller" ||
    t === "buyer"
  );
}

/** Always prefer username; then display name; then short id — never placeholder roles like Member/You. */
function streamHandle(
  senderUsername: string | null | undefined,
  senderName: string | null | undefined,
  senderId: string | null | undefined,
): string {
  const raw = senderUsername?.trim().replace(/^@+/, "");
  if (raw) return raw;
  const n = senderName?.trim();
  if (n && !isGenericChatLabel(n)) return n;
  const id = senderId ? String(senderId).replace(/-/g, "") : "";
  if (id.length >= 8) return `user_${id.slice(0, 8)}`;
  return "user";
}

function profileHrefFromUsername(username: string): string | null {
  const u = username.trim().replace(/^@/, "");
  if (!u) return null;
  return `/p/${encodeURIComponent(u)}`;
}

/** Service deal: listing owner = seller. Request deal: listing owner = buyer. */
function buyerSellerPill(
  senderId: string | null | undefined,
  dealKind: string | null | undefined,
  dealListingOwnerId: string | null | undefined,
): string | null {
  if (!dealKind || !dealListingOwnerId || !senderId) return null;
  if (dealKind !== "service" && dealKind !== "request") return null;
  const isOwner = String(senderId) === String(dealListingOwnerId);
  if (dealKind === "service") return isOwner ? "Seller" : "Buyer";
  return isOwner ? "Buyer" : "Seller";
}

export function ChatStream({
  messages,
  currentUserId,
  accessToken,
  threadId,
  transport,
  onRefresh,
  scrollContainerRef,
  hasMoreOlder,
  loadingOlder,
  onLoadOlder,
  viewerRoleBadge,
  viewerAvatarUrl,
  viewerUsername,
  dealKind,
  dealListingOwnerId,
  canAdminDelete,
  onAdminDeleteMessage,
  jumpToMessageId,
  onJumpToMessageConsumed,
  onSuggestedAction,
  isAIChat = false,
}: {
  messages: StreamMessage[];
  currentUserId: string | null | undefined;
  accessToken: string | null | undefined;
  threadId: string;
  transport?: string | null;
  onRefresh: () => void;
  scrollContainerRef?: MutableRefObject<HTMLDivElement | null>;
  hasMoreOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  viewerRoleBadge?: string | null;
  viewerAvatarUrl?: string | null;
  viewerUsername?: string | null;
  /** When set with dealListingOwnerId, name row shows Buyer / Seller instead of DEAL · PHASE · etc. */
  dealKind?: string | null;
  dealListingOwnerId?: string | null;
  canAdminDelete?: boolean;
  onAdminDeleteMessage?: (messageId: string) => void;
  /** When set, scrolls the virtualized list so this message id is centered (deal phase rail). */
  jumpToMessageId?: string | null;
  onJumpToMessageConsumed?: () => void;
  /** Callback when a suggested follow-up is clicked */
  onSuggestedAction?: (action: string) => void;
  /** Whether this is an AI chat (affects styling) */
  isAIChat?: boolean;
}) {
  const internalRef = useRef<HTMLDivElement>(null);
  const parentRef = scrollContainerRef ?? internalRef;
  const loadOlderCooldown = useRef(0);
  const count = messages.length;
  const [showSuggestions, setShowSuggestions] = useState(true);

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 128, []),
    overscan: 24,
  });

  const items = useMemo(() => messages, [messages]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el || !onLoadOlder || !hasMoreOlder) return;
    const onScroll = () => {
      if (loadingOlder) return;
      const now = Date.now();
      if (now - loadOlderCooldown.current < 600) return;
      if (el.scrollTop > 72) return;
      loadOlderCooldown.current = now;
      onLoadOlder();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onLoadOlder, hasMoreOlder, loadingOlder, parentRef]);

  useEffect(() => {
    if (!jumpToMessageId) return;
    const idx = messages.findIndex((m) => m.id != null && String(m.id) === jumpToMessageId);
    if (idx < 0) {
      onJumpToMessageConsumed?.();
      return;
    }
    const id = requestAnimationFrame(() => {
      rowVirtualizer.scrollToIndex(idx, { align: "center" });
      onJumpToMessageConsumed?.();
    });
    return () => cancelAnimationFrame(id);
  }, [jumpToMessageId, messages, onJumpToMessageConsumed, rowVirtualizer]);

  const handleSuggestionClick = (label: string) => {
    setShowSuggestions(false);
    onSuggestedAction?.(label);
  };

  // Show suggested follow-ups when no messages
  const showEmptyState = messages.length === 0 && showSuggestions;

  return (
    <div
      ref={parentRef}
      className="scrollbar-thin bg-surface text-on-surface min-h-0 flex-1 overflow-y-auto px-4 py-3 md:px-5"
    >
      {hasMoreOlder ? (
        <div className="mb-3 flex justify-center">
          {loadingOlder ? (
            <span className="text-on-surface-variant text-[12px]">Loading earlier messages…</span>
          ) : (
            <span className="text-on-surface-variant text-[11px]">Scroll up for older messages</span>
          )}
        </div>
      ) : null}
      
      {/* Empty State with Suggested Follow-ups */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-on-surface-variant">
          <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-on-surface-variant/60" />
          </div>
          <p className="text-lg font-medium text-on-surface mb-1">Start the conversation</p>
          <p className="text-sm text-on-surface-variant mb-6">Send a message or try a suggested action</p>
          
          {/* Suggested Follow-ups */}
          <div className="w-full max-w-[600px]">
            <p className="text-[11px] uppercase tracking-wider text-on-surface-variant/60 mb-3 text-center">Suggested follow-ups</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_FOLLOWUPS.map((followup) => (
                <button
                  key={followup.label}
                  onClick={() => handleSuggestionClick(followup.label)}
                  className="flex items-center gap-3 p-3 bg-surface-container border border-outline-variant rounded-xl text-left hover:bg-surface-container-high hover:border-outline transition group"
                >
                  <followup.icon size={18} className={`${followup.color} shrink-0`} />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">{followup.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div
        className="mx-auto w-full max-w-[900px] px-2 sm:px-4"
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
      >
        {rowVirtualizer.getVirtualItems().map((vi) => {
          const m = items[vi.index];
          if (!m) return null;
          const mine = m.role === "user";
          const sys = m.role === "system";
          const embedded = m.contentType === "embed" && m.embed;
          const prev = vi.index > 0 ? items[vi.index - 1] : null;
          const showDaySep = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
          const gapMin = prev ? minutesBetween(prev.createdAt, m.createdAt) : 999;
          const sameSenderId =
            Boolean(m.senderId) &&
            Boolean(prev?.senderId) &&
            String(prev?.senderId) === String(m.senderId) &&
            prev?.role === m.role;
          const sameSenderLegacy = !m.senderId && prev && prev.role === m.role;
          const sameSender = sameSenderId || sameSenderLegacy;
          const prevEmb = prev && prev.contentType === "embed" && prev.embed;
          const curEmb = embedded;
          const groupWithPrev =
            Boolean(prev) &&
            sameSender &&
            gapMin <= 5 &&
            !showDaySep &&
            !prevEmb &&
            !curEmb &&
            !sys &&
            prev.role !== "system";

          const showMetaRow = !sys && !embedded && !groupWithPrev;
          const showLeadAvatar = embedded ? true : !sys && !groupWithPrev;

          const t = formatMessageTime(m.createdAt);
          const mid = String(m.id ?? "");
          const isTmp = mid.startsWith("tmp-");
          const showAdminDel = Boolean(canAdminDelete && mid && !isTmp && onAdminDeleteMessage);

          const peerHandle = streamHandle(m.senderUsername, m.senderName, m.senderId);
          const selfUsername = viewerUsername?.trim() || m.senderUsername?.trim() || null;
          const selfHandle = streamHandle(selfUsername, m.senderName, currentUserId ?? m.senderId);
          const userHandle = mine ? selfHandle : peerHandle;
          const profileHref =
            mine && selfUsername
              ? profileHrefFromUsername(selfUsername)
              : !mine && m.senderUsername?.trim()
                ? profileHrefFromUsername(m.senderUsername)
                : null;
          const senderForParty = mine ? (currentUserId ?? m.senderId) : m.senderId;
          const dealParty = buyerSellerPill(senderForParty, dealKind, dealListingOwnerId);
          const badgeCode = dealParty
            ? dealParty
            : mine
              ? viewerRoleBadge || m.roleBadge || "GLADIATOR"
              : m.roleBadge;
          const isAIMessage = m.isAI || false;
          const initial = userHandle.replace(/^@/, "").slice(0, 1).toUpperCase() || "?";

          /** Embed rows: attribute the chat message to whoever sent it, not embed.proposer (deal party). */
          const displayHandle = userHandle;
          const displayHref = profileHref;
          const avatarSrc = mine ? viewerAvatarUrl || null : m.senderAvatarUrl || null;

          return (
            <div
              key={String(m.id ?? `${vi.index}-${m.createdAt}`)}
              ref={rowVirtualizer.measureElement}
              data-index={vi.index}
              data-chat-message-id={mid || undefined}
              className="group/msg absolute left-0 top-0 w-full px-1"
              style={{ transform: `translateY(${vi.start}px)` }}
            >
              {showDaySep ? (
                <div className="text-on-surface-variant/70 flex justify-center py-4 text-center text-[11px] font-semibold uppercase tracking-wide">
                  {daySeparatorLabel(m.createdAt)}
                </div>
              ) : null}

              {embedded ? (
                <div className="relative flex gap-4 pb-1 pt-0.5">
                  {showAdminDel ? (
                    <button
                      type="button"
                      className="text-rose-500 hover:bg-surface-container-high absolute right-0 top-0 z-10 rounded p-1 opacity-0 transition-opacity group-hover/msg:opacity-100"
                      aria-label="Delete message (admin)"
                      onClick={() => onAdminDeleteMessage?.(mid)}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        delete_forever
                      </span>
                    </button>
                  ) : null}
                  <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
                    {showLeadAvatar ? (
                      avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-outline-variant"
                          unoptimized
                        />
                      ) : (
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                          isAIMessage 
                            ? "bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/30" 
                            : "bg-surface-container-high text-on-surface-variant ring-2 ring-outline-variant"
                        }`}>
                          {isAIMessage ? "AI" : displayHandle.replace(/^@/, "").slice(0, 1).toUpperCase() || "?"}
                        </span>
                      )
                    ) : (
                      <span className="block h-2 w-10 shrink-0" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                      {displayHref ? (
                        <Link
                          href={displayHref}
                          className={`text-[16px] font-semibold hover:underline ${
                          mine ? "text-amber-500" : "text-on-surface"
                        }`}
                        >
                          {displayHandle}
                        </Link>
                      ) : (
                        <span className={`text-[16px] font-semibold ${
                          mine ? "text-amber-500" : isAIMessage ? "text-purple-500 dark:text-purple-300" : "text-on-surface"
                        }`}>{displayHandle}</span>
                      )}
                      <RolePill code={buyerSellerPill(m.senderId, dealKind, dealListingOwnerId)} isAI={isAIMessage} />
                      {t ? (
                        <time
                          dateTime={m.createdAt}
                          className="text-on-surface-variant text-[11px] font-medium"
                        >
                          {t}
                        </time>
                      ) : null}
                    </div>
                    <div className="text-on-surface-variant text-[15px] leading-[1.45]">
                      <ChatMessageEmbed
                        embed={m.embed!}
                        currentUserId={currentUserId}
                        accessToken={accessToken}
                        onRefresh={onRefresh}
                        threadId={threadId}
                        transport={transport}
                      />
                    </div>
                  </div>
                </div>
              ) : sys ? (
                <div className="relative py-2">
                  {showAdminDel ? (
                    <button
                      type="button"
                      className="text-rose-500 hover:bg-surface-container-high absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity group-hover/msg:opacity-100"
                      aria-label="Delete message (admin)"
                      onClick={() => onAdminDeleteMessage?.(mid)}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        delete_forever
                      </span>
                    </button>
                  ) : null}
                  <div className="flex items-center justify-center gap-3 px-2">
                    <div className="border-outline-variant h-px max-w-[72px] flex-1 border-t" aria-hidden />
                    <span className="text-on-surface-variant max-w-[min(100%,480px)] text-center text-[12px] font-medium italic leading-snug">
                      {attachmentCaptionPlain(m)}
                    </span>
                    <div className="border-outline-variant h-px max-w-[72px] flex-1 border-t" aria-hidden />
                  </div>
                </div>
              ) : (
                <div className={`relative flex gap-4 pb-2 pt-0.5 ${mine ? "flex-row-reverse" : ""}`}>
                  {showAdminDel ? (
                    <button
                      type="button"
                      className="text-rose-500 hover:bg-surface-container-high absolute right-0 top-0 z-10 rounded p-1 opacity-0 transition-opacity group-hover/msg:opacity-100"
                      aria-label="Delete message (admin)"
                      onClick={() => onAdminDeleteMessage?.(mid)}
                    >
                      <span className="material-symbols-outlined text-[18px]" aria-hidden>
                        delete_forever
                      </span>
                    </button>
                  ) : null}
                  <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
                    {showLeadAvatar ? (
                      avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt=""
                          width={40}
                          height={40}
                          className={`h-10 w-10 rounded-full object-cover ring-2 ${
                            mine ? "ring-amber-500/30" : isAIMessage ? "ring-purple-500/30" : "ring-outline-variant"
                          }`}
                          unoptimized
                        />
                      ) : (
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                          mine 
                            ? "bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/30" 
                            : isAIMessage
                              ? "bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/30"
                              : "bg-surface-container-high text-on-surface-variant ring-2 ring-outline-variant"
                        }`}>
                          {isAIMessage ? "AI" : initial}
                        </span>
                      )
                    ) : (
                      <span className="block h-2 w-10 shrink-0" aria-hidden />
                    )}
                  </div>
                  <div className={`min-w-0 flex-1 pt-0.5 ${mine ? "items-end flex flex-col" : ""}`}>
                    {showMetaRow ? (
                      <div className={`mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0 ${mine ? "flex-row-reverse" : ""}`}>
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className={`text-[16px] font-semibold hover:underline ${
                              mine ? "text-amber-500" : isAIMessage ? "text-purple-500 dark:text-purple-300" : "text-on-surface"
                            }`}
                          >
                            {userHandle}
                          </Link>
                        ) : (
                          <span className={`text-[16px] font-semibold ${
                            mine ? "text-amber-500" : isAIMessage ? "text-purple-500 dark:text-purple-300" : "text-on-surface"
                          }`}>{userHandle}</span>
                        )}
                        <RolePill code={badgeCode} isAI={isAIMessage} />
                        {t ? (
                          <time
                            dateTime={m.createdAt}
                            className="text-on-surface-variant text-[11px] font-medium"
                          >
                            {t}
                          </time>
                        ) : null}
                      </div>
                    ) : null}
                    <div className={`text-[15px] leading-[1.45] max-w-[85%] rounded-2xl px-4 py-3 ${
                      mine 
                        ? "bg-amber-500 text-black rounded-br-md" 
                        : isAIMessage
                          ? "bg-purple-500/10 border border-purple-500/20 text-on-surface rounded-bl-md"
                          : "bg-surface-container border border-outline-variant text-on-surface rounded-bl-md"
                    }`}>
                      {m.fileUrl && m.contentType === "image" ? (
                        <Image
                          src={m.fileUrl}
                          alt=""
                          width={800}
                          height={600}
                          className="mb-1 max-h-64 w-auto max-w-full rounded-lg object-contain"
                          unoptimized
                        />
                      ) : null}
                      {m.fileUrl && m.contentType !== "image" ? (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`mb-1 inline-flex items-center gap-1 text-sm font-semibold underline-offset-2 hover:underline ${
                            mine ? "text-black/80" : "text-sky-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]" aria-hidden>
                            draft
                          </span>
                          {m.fileName || "Download attachment"}
                        </a>
                      ) : null}
                      {(() => {
                        const plain = attachmentCaptionPlain(m);
                        if (!plain) return null;
                        return <p className="whitespace-pre-wrap break-words">{plain}</p>;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
