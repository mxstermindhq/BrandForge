"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Send,
  Paperclip,
  ChevronDown,
  X,
  Mic,
  Store,
  ClipboardList,
  Briefcase,
  ArrowRight,
  Star,
  Upload,
  Sparkles,
} from "lucide-react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { useAuth } from "@/providers/AuthProvider";
import { ChatMessageEmbed } from "@/components/messages/ChatEmbeds";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "peer" | "system" | "ai" | "agent";

export type MessageRow = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  embed?: Record<string, unknown> | null;
};

type RecipientType = "ai" | "agent" | "people";

type Recipient = {
  type: RecipientType;
  id: string;
  label: string;
  sublabel?: string;
};

type SocialImportPayload = {
  linkedin?: string;
  x?: string;
  github?: string;
  instagram?: string;
  website?: string;
  focus?: string;
};

const AI_MODELS: Recipient[] = [
  { type: "ai", id: "sonnet-4-6",  label: "Claude Sonnet 4.6", sublabel: "Fast · balanced" },
  { type: "ai", id: "opus-4-6",    label: "Claude Opus 4.6",   sublabel: "Powerful · Think mode" },
  { type: "ai", id: "haiku-4-5",   label: "Claude Haiku 4.5",  sublabel: "Quick · lightweight" },
  { type: "ai", id: "gpt-4o",      label: "GPT-4o",            sublabel: "OpenAI" },
  { type: "ai", id: "gemini-25",   label: "Gemini 2.5 Pro",    sublabel: "Google" },
];

const AI_AGENTS: Recipient[] = [
  { type: "agent", id: "marketing", label: "Marketing Agent", sublabel: "Copy · campaigns · GTM" },
];

const DEFAULT_PEOPLE_RECIPIENT: Recipient = {
  type: "people",
  id: "",
  label: "People",
  sublabel: "Select deal room",
};

const MOCK_PEOPLE_KEYS = new Set([
  "alex rivera",
  "priya nair",
  "jordan wu",
  "h1",
  "h2",
  "h3",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(value?: string | null) {
  if (!value) return "now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function isMockPersonThread(thread: { id?: string; t?: string; peerUsername?: string | null }) {
  const id = String(thread.id || "").trim().toLowerCase();
  const title = String(thread.t || "").trim().toLowerCase();
  const peer = String(thread.peerUsername || "").trim().toLowerCase();
  if (/^h\d+$/.test(id)) return true;
  if (MOCK_PEOPLE_KEYS.has(id)) return true;
  if (MOCK_PEOPLE_KEYS.has(title)) return true;
  if (MOCK_PEOPLE_KEYS.has(peer)) return true;
  return false;
}

function mapApiMessage(row: Record<string, unknown>): MessageRow {
  const id = String(row.id || crypto.randomUUID());
  const roleRaw = String(row.role || row.senderType || "");
  const role: MessageRow["role"] =
    roleRaw === "user" || roleRaw === "peer" || roleRaw === "system" ||
    roleRaw === "ai" || roleRaw === "agent" ? roleRaw
    : String(row.senderId || row.sender_id || "") ? "peer"
    : "system";
  const text = String(row.text || row.content || row.body || "").trim();
  const createdAt = String(row.createdAt || row.created_at || new Date().toISOString());
  const senderId = row.senderId || row.sender_id;
  const senderName = row.senderName || row.sender_name ||
    (row.sender as Record<string, unknown> | undefined)?.fullName ||
    (row.sender as Record<string, unknown> | undefined)?.username;
  const senderAvatar = row.senderAvatar || row.sender_avatar ||
    (row.sender as Record<string, unknown> | undefined)?.avatarUrl;
  const embed = row.embed && typeof row.embed === "object" ? (row.embed as Record<string, unknown>) : null;
  return {
    id, role, text, createdAt,
    senderId: senderId ? String(senderId) : null,
    senderName: senderName ? String(senderName) : null,
    senderAvatar: senderAvatar ? String(senderAvatar) : null,
    embed,
  };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarIcon({ role, senderName, senderAvatar }: { role: MessageRole; senderName?: string | null; senderAvatar?: string | null }) {
  const avatar = safeImageSrc(senderAvatar || null);
  const name = senderName || "User";

  if (role === "ai") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
        ✦
      </div>
    );
  }
  if (role === "agent") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
        ⚡
      </div>
    );
  }
  if (avatar) {
    return <Image src={avatar} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" unoptimized />;
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-semibold text-on-surface-variant border border-outline-variant/50">
      {initials(name)}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMine,
  currentUserId,
  accessToken,
  threadId,
  onRefresh,
}: {
  message: MessageRow;
  isMine: boolean;
  currentUserId: string | null | undefined;
  accessToken: string | null | undefined;
  threadId?: string;
  onRefresh: () => void;
}) {
  const isSystem = message.role === "system";
  const isAI     = message.role === "ai";
  const isAgent  = message.role === "agent";
  const name     = message.senderName || (isAI ? "Claude" : isAgent ? "Marketing Agent" : "User");

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full border border-outline-variant/50 bg-surface-container px-3 py-1 text-[11px] text-on-surface-variant">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("group flex items-end gap-2.5", isMine && "flex-row-reverse")}>
      <AvatarIcon role={message.role} senderName={message.senderName} senderAvatar={message.senderAvatar} />

      <div className={cn("flex max-w-[68%] flex-col gap-1", isMine && "items-end")}>
        {/* Sender + time */}
        <div className={cn("flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100", isMine && "flex-row-reverse")}>
          <span className="text-[10px] font-medium text-on-surface-variant">{name}</span>
          <span className="text-[10px] text-on-surface-variant/50">{relativeTime(message.createdAt)}</span>
        </div>

        {/* Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed",
          isMine
            ? "rounded-br-[6px] bg-blue-500 text-white"
            : isAI
            ? "rounded-bl-[6px] border border-outline-variant/60 bg-surface-container-low text-on-surface"
            : isAgent
            ? "rounded-bl-[6px] border border-amber-500/20 bg-amber-500/5 text-on-surface"
            : "rounded-bl-[6px] border border-outline-variant/60 bg-surface-container-low text-on-surface"
        )}>
          {message.text}
          {message.embed ? (
            <ChatMessageEmbed
              embed={message.embed}
              currentUserId={currentUserId}
              accessToken={accessToken}
              onRefresh={onRefresh}
              threadId={threadId}
              transport="unified"
            />
          ) : null}
        </div>

        {/* Timestamp — always shown below */}
        <span className={cn("text-[10px] text-on-surface-variant/40 px-1", isMine && "text-right")}>
          {relativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ recipient }: { recipient: Recipient }) {
  return (
    <div className="flex items-end gap-2.5">
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border text-sm",
        recipient.type === "agent"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
          : "border-blue-500/20 bg-blue-500/10 text-blue-400"
      )}>
        {recipient.type === "agent" ? "⚡" : "✦"}
      </div>
      <div className="rounded-2xl rounded-bl-[6px] border border-outline-variant/60 bg-surface-container-low px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-on-surface-variant/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recipient Picker ─────────────────────────────────────────────────────────

type PickerCategory = "people" | "models" | "agents";

function RecipientPicker({
  value,
  peopleRecipients,
  onChange,
  onClose,
}: {
  value: Recipient;
  peopleRecipients: Recipient[];
  onChange: (r: Recipient) => void;
  onClose: () => void;
}) {
  const initialTab = useMemo<PickerCategory>(() => {
    if (value.type === "people") return "people";
    if (value.type === "agent") return "agents";
    return "models";
  }, [value.type]);

  const [tab, setTab] = useState<PickerCategory>(initialTab);
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabs: { id: PickerCategory; label: string; items: Recipient[] }[] = [
    { id: "people", label: "People", items: peopleRecipients },
    { id: "models", label: "Models", items: AI_MODELS },
    { id: "agents", label: "Agents", items: AI_AGENTS },
  ];

  const activeItems = tabs.find(t => t.id === tab)?.items ?? [];

  return (
    <div className="absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
      <div className="flex items-center justify-end border-b border-outline-variant/60 px-2 py-2">
        <button
          type="button"
          onClick={onClose}
          className="ml-1 shrink-0 rounded p-1 text-on-surface-variant transition hover:text-on-surface"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto bg-surface-container py-1">
        {activeItems.length > 0 ? (
          activeItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { onChange(item); onClose(); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-container-high",
                value.id === item.id && "bg-blue-500/5"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs",
                  item.type === "agent"
                    ? "bg-amber-500/10 text-amber-400"
                    : item.type === "people"
                      ? "bg-surface-container-high text-on-surface-variant text-[9px] font-bold"
                      : "bg-blue-500/10 text-blue-400"
                )}
              >
                {item.type === "agent" ? "⚡" : item.type === "people" ? initials(item.label) : "✦"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-on-surface">{item.label}</p>
                {item.sublabel && <p className="text-[10px] text-on-surface-variant">{item.sublabel}</p>}
              </div>
              {value.id === item.id && <span className="text-xs text-blue-400">✓</span>}
            </button>
          ))
        ) : (
          <p className="px-4 py-3 text-xs text-on-surface-variant">No chats yet.</p>
        )}
      </div>
    </div>
  );
}

// ─── Chat hub landing (empty thread) ───────────────────────────────────────────

type MiniLbRow = {
  rank: number;
  username: string | null;
  displayName: string;
  dealWins: number;
  ratingAvg: number | null;
  dealVolume: number;
};

function HubTabBar({
  recipient,
  onSelectRecipientType,
}: {
  recipient: Recipient;
  onSelectRecipientType: (type: RecipientType) => void;
}) {
  return (
    <div className="flex shrink-0 rounded-xl border border-outline-variant/60 bg-surface-container-low p-1">
      {(["people", "ai", "agent"] as RecipientType[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelectRecipientType(t)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm",
            recipient.type === t ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {t === "people" ? "People" : t === "ai" ? "AI Models" : "AI Agents"}
        </button>
      ))}
    </div>
  );
}

function ChatLeaderboardPreview() {
  const [rows, setRows] = useState<MiniLbRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiGetJson<Record<string, unknown>>("/api/leaderboard/performance?limit=6", null);
        if (cancelled) return;
        const raw = Array.isArray(data.entries) ? data.entries : Array.isArray(data.users) ? data.users : [];
        const out: MiniLbRow[] = [];
        for (const row of raw) {
          if (!row || typeof row !== "object") continue;
          const r = row as Record<string, unknown>;
          const rank = Number(r.rank);
          if (!Number.isFinite(rank) || rank <= 0) continue;
          out.push({
            rank,
            username: r.username != null ? String(r.username).trim() : null,
            displayName: String(r.displayName ?? r.fullName ?? r.username ?? "Member").trim(),
            dealWins: Number(r.dealWins) || 0,
            ratingAvg: r.ratingAvg != null && Number.isFinite(Number(r.ratingAvg)) ? Number(r.ratingAvg) : null,
            dealVolume: Number(r.dealVolume) || 0,
          });
        }
        setRows(out);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low/80 p-4 text-left">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Top professionals</p>
        <Link href="/leaderboard" className="text-xs font-semibold text-sky-500 hover:text-sky-400">
          View all →
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-high/60" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-on-surface-variant">Rankings will appear as members close deals.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((p) => (
            <li key={`${p.rank}-${p.username || "x"}`}>
              {p.username ? (
                <Link
                  href={`/p/${encodeURIComponent(p.username)}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-outline-variant hover:bg-surface-container-high/40"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        p.rank === 1
                          ? "bg-amber-500/20 text-amber-400"
                          : p.rank === 2
                            ? "bg-zinc-400/20 text-zinc-300"
                            : "bg-surface-container-high text-on-surface-variant",
                      )}
                    >
                      {p.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-sky-400">{p.displayName}</p>
                      <p className="truncate text-[11px] text-on-surface-variant">@{p.username}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px]">
                    <span className="font-semibold text-emerald-400 tabular-nums">{p.dealWins} deals</span>
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3 w-3" aria-hidden />
                      <span className="tabular-nums">{p.ratingAvg != null ? p.ratingAvg.toFixed(1) : "—"}</span>
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center justify-between px-2 py-2 text-sm text-on-surface-variant">
                  <span>{p.displayName}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  recipient,
  onSelectRecipientType,
  onImportProfile,
}: {
  recipient: Recipient;
  onSelectRecipientType: (type: RecipientType) => void;
  onImportProfile: (payload: SocialImportPayload) => Promise<void>;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [submittingImport, setSubmittingImport] = useState(false);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [form, setForm] = useState<SocialImportPayload>({});

  const isPeople = recipient.type === "people";

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto px-4 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Chat with people</p>
          <HubTabBar recipient={recipient} onSelectRecipientType={onSelectRecipientType} />
        </div>

        {!isPeople ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-500/25 bg-gradient-to-b from-blue-500/5 to-transparent px-4 py-10 text-center">
            <Sparkles className="mb-3 h-10 w-10 text-blue-400" aria-hidden />
            <h2 className="text-xl font-semibold text-on-surface sm:text-2xl">
              {recipient.type === "ai" ? "Ask an AI model" : "Run an AI agent"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              Your conversation opens here. Choose a model from the toolbar below, type your prompt, and press send — this
              space stays focused on the thread.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-outline-variant bg-gradient-to-br from-surface-container-low via-surface to-surface-container-low px-4 py-5 shadow-sm sm:px-6 sm:py-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                World of professional
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Your professional operating system</h2>
              <p className="mt-2 max-w-2xl text-sm text-on-surface-variant sm:text-base">
                Connect with top professionals, post requests, offer services, and close deals — all in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
                >
                  Explore marketplace <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/requests/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20"
                >
                  + Post a request
                </Link>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant sm:text-sm">
              Open a deal room from the sidebar, or discover pros in the marketplace. Click any professional below to view
              their profile.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/marketplace"
                className="group relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/15 to-surface-container-low p-4 text-left transition hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="mb-2 inline-flex rounded-lg bg-teal-500/20 p-2 text-teal-300">
                  <Store className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-on-surface">Browse Marketplace</p>
                <p className="mt-1 text-xs text-on-surface-variant">Find &amp; bid on projects</p>
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-teal-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
              <Link
                href="/requests/new"
                className="group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-surface-container-low p-4 text-left transition hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div className="mb-2 inline-flex rounded-lg bg-violet-500/20 p-2 text-violet-300">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-on-surface">Post a Request</p>
                <p className="mt-1 text-xs text-on-surface-variant">Get proposals fast</p>
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-violet-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
              <Link
                href="/services/new"
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-surface-container-low p-4 text-left transition hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="mb-2 inline-flex rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
                  <Briefcase className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-on-surface">Offer a Service</p>
                <p className="mt-1 text-xs text-on-surface-variant">List your expertise</p>
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-emerald-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex w-full flex-col items-start gap-1 rounded-2xl border border-sky-500/35 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 p-4 text-left transition hover:border-sky-400/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <Upload className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Import your profile</p>
                  <p className="text-xs text-on-surface-variant">Pull headline, skills, and links from LinkedIn, X, or GitHub.</p>
                </div>
              </div>
              <span className="mt-2 text-xs font-semibold text-sky-400 sm:mt-0">Get started →</span>
            </button>

            <ChatLeaderboardPreview />
          </>
        )}
      </div>

      {importOpen ? (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 px-4"
          onMouseDown={(e) => e.currentTarget === e.target && !submittingImport && setImportOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-4 text-left">
            <p className="text-lg font-semibold text-on-surface">Import profile from social</p>
            <p className="mt-1 text-xs text-on-surface-variant">Paste 1-3 links. We auto-fill your profile draft.</p>
            <div className="mt-3 space-y-2">
              {(["linkedin", "x", "github", "website", "instagram"] as const).map((k) => (
                <input
                  key={k}
                  value={String(form[k] || "")}
                  onChange={(e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))}
                  placeholder={`${k} URL or handle`}
                  className="input"
                />
              ))}
              <input
                value={String(form.focus || "")}
                onChange={(e) => setForm((prev) => ({ ...prev, focus: e.target.value }))}
                placeholder="Primary focus (e.g. UI/UX, Growth, Fullstack)"
                className="input"
              />
            </div>
            {importErr ? <p className="mt-2 text-xs text-error">{importErr}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-ghost px-4 py-2 text-sm" disabled={submittingImport} onClick={() => setImportOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-primary px-4 py-2 text-sm"
                disabled={submittingImport}
                onClick={async () => {
                  setImportErr(null);
                  setSubmittingImport(true);
                  try {
                    await onImportProfile(form);
                    setImportOpen(false);
                    setForm({});
                  } catch (e) {
                    setImportErr(e instanceof Error ? e.message : "Import failed");
                  } finally {
                    setSubmittingImport(false);
                  }
                }}
              >
                {submittingImport ? "Importing..." : "Import profile"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DealRoomContextSidebar({
  recipientLabel,
  messageCount,
  lastActivity,
  progress,
  onChatDeposit,
  depositBusy,
}: {
  recipientLabel: string;
  messageCount: number;
  lastActivity?: string | null;
  progress: Array<{ id: string; label: string; done: boolean }>;
  onChatDeposit?: () => void;
  depositBusy?: boolean;
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-outline-variant bg-surface-container-low">
      <div className="border-b border-outline-variant/60 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
          Deal context
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-on-surface">{recipientLabel}</p>
        <p className="mt-1 text-[11px] text-on-surface-variant">
          {messageCount} messages · last activity {relativeTime(lastActivity || undefined)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-outline-variant/50 bg-surface-container p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            Workflow progress
          </p>
          <ul className="mt-2 space-y-2">
            {progress.map((step) => (
              <li key={step.id} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    step.done
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                      : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {step.done ? "✓" : "•"}
                </span>
                <span className={step.done ? "text-on-surface" : "text-on-surface-variant"}>{step.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-surface-container p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            Quick links
          </p>
          <div className="mt-2 space-y-1.5">
            <a href="/requests/new" className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface">
              Create request
            </a>
            <a href="/services/new" className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface">
              Create service
            </a>
            <a href="/marketplace" className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface">
              Open marketplace
            </a>
            {onChatDeposit ? (
              <button
                type="button"
                disabled={depositBusy}
                onClick={() => onChatDeposit()}
                className="mt-1 w-full rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-left text-xs font-semibold text-amber-700 transition hover:bg-amber-500/15 disabled:opacity-50 dark:text-amber-200"
              >
                {depositBusy ? "Opening checkout…" : "Deposit / checkout (Stripe)"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Input Bar ────────────────────────────────────────────────────────────────

function InputBar({
  inputText,
  setInputText,
  sending,
  onSend,
  onKeyDown,
  inputRef,
  recipient,
  peopleRecipients,
  onChangeRecipient,
  isHumanThread,
  locked,
  hasThread,
  onAttachClick,
  attachDisabled,
}: {
  inputText: string;
  setInputText: (v: string) => void;
  sending: boolean;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  recipient: Recipient;
  peopleRecipients: Recipient[];
  onChangeRecipient: (r: Recipient) => void;
  isHumanThread: boolean;
  locked: boolean;
  hasThread: boolean;
  onAttachClick?: () => void;
  attachDisabled?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Auto-resize
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputText, inputRef]);

  const isPeople = recipient.type === "people";

  return (
    <div className="relative z-20 bg-surface/50 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl">
        <div ref={pickerRef} className="relative">
          {/* No overflow-hidden here — it clips the recipient popover (bottom-full). */}
          <div className="overflow-visible rounded-2xl border border-outline-variant bg-surface-container shadow-sm">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={locked}
              placeholder={
                locked
                  ? recipient.type === "people" && !hasThread && !recipient.id
                    ? "Choose a deal room above to send a message."
                    : "Locked — feature under development."
                  : hasThread
                  ? "Reply in deal room..."
                  : isPeople
                  ? "Type your message…"
                  : recipient.type === "agent"
                  ? "Give the agent an objective..."
                  : "Ask anything..."
              }
              className={cn(
                "max-h-40 min-h-[48px] w-full resize-none rounded-t-2xl bg-transparent px-4 py-3 text-[13.5px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/50 outline-none",
                locked ? "cursor-not-allowed opacity-70" : ""
              )}
              rows={1}
            />

            {/* Toolbar */}
            <div className="flex items-center gap-1 rounded-b-2xl px-3 py-2">
              <div className="relative z-10 flex shrink-0 items-center gap-0.5">
                {pickerOpen && !hasThread && recipient.type !== "people" && (
                  <RecipientPicker
                    value={recipient}
                    peopleRecipients={peopleRecipients}
                    onChange={onChangeRecipient}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
                <button
                  type="button"
                  disabled={locked || attachDisabled}
                  onClick={() => onAttachClick?.()}
                  className="rounded-lg p-1.5 text-on-surface-variant/60 transition hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Attach image or PDF"
                  title={attachDisabled ? "Open a deal room to attach files" : "JPEG, PNG, GIF, WebP, or PDF (max ~4.5MB)"}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                {!hasThread && !(recipient.type === "people") && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(v => !v)}
                    className={cn(
                      "flex max-w-[min(200px,calc(100vw-8rem))] items-center gap-1 rounded-lg border px-2 py-1 text-left text-xs font-medium transition hover:bg-surface-container-high",
                      recipient.type === "agent"
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                        : "border-blue-500/30 bg-blue-500/5 text-blue-400"
                    )}
                    aria-expanded={pickerOpen}
                    aria-haspopup="listbox"
                    aria-label="Choose recipient"
                  >
                    <span className="shrink-0">{recipient.type === "agent" ? "⚡" : "✦"}</span>
                    <span className="min-w-0 truncate">{recipient.label}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                  </button>
                )}
              </div>
              <div className="flex-1" />
              <span className="mr-2 text-[10px] text-on-surface-variant/40">
                {sending ? "Sending…" : "↵ send  ⇧↵ newline"}
              </span>
              <button
                type="button"
                disabled={sending || locked}
                onClick={() => {
                  if (inputText.trim()) onSend();
                }}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                  inputText.trim() && !sending
                    ? "bg-blue-500 text-white shadow-sm hover:bg-blue-400"
                    : "bg-surface-container-high text-on-surface-variant/70"
                )}
              >
                {sending
                  ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : inputText.trim()
                    ? <Send className="h-3.5 w-3.5" />
                    : <Mic className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>
        </div>
        {!isHumanThread ? (
          <div className="mt-2 h-4 shrink-0 px-1" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  );
}

// ─── SimpleChat ───────────────────────────────────────────────────────────────

export function SimpleChat({ threadId: initialThreadId }: { threadId?: string }) {
  const router = useRouter();
  const { accessToken, session } = useAuth();
  const { data: bootstrap } = useBootstrap();

  const activeThreadId = initialThreadId || "";
  const [messages,  setMessages]  = useState<MessageRow[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sending,   setSending]   = useState(false);
  const [recipient, setRecipient] = useState<Recipient>(DEFAULT_PEOPLE_RECIPIENT);
  const [showDealContext, setShowDealContext] = useState(false);

  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const sendGuardRef = useRef(false);
  const sendingRef = useRef(false);
  const [depositBusy, setDepositBusy] = useState(false);

  const peopleRecipients = useMemo<Recipient[]>(() => {
    const seen = new Set<string>();
    return getSortedHumanThreads(bootstrap?.humanChats)
      .filter((thread) => Boolean(thread.id))
      .filter((thread) => !isMockPersonThread(thread))
      .filter((thread) => {
        const id = String(thread.id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((thread) => {
        const title = String(thread.t || "").trim();
        const peer = String(thread.peerUsername || "").trim();
        return {
          type: "people" as const,
          id: String(thread.id),
          label: title || (peer ? `@${peer}` : "Deal chat"),
          sublabel: peer ? `@${peer}` : "Deal room",
        };
      });
  }, [bootstrap?.humanChats]);

  useEffect(() => {
    if (!activeThreadId) return;
    const match = peopleRecipients.find((p) => String(p.id) === String(activeThreadId));
    if (match) setRecipient(match);
  }, [activeThreadId, peopleRecipients]);

  // Load messages
  useEffect(() => {
    if (!activeThreadId || !accessToken) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        if (cancelled) return;
        const raw = Array.isArray(data.activeChat?.messages) ? data.activeChat?.messages : data.messages;
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeThreadId, accessToken]);

  // Scroll to bottom
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Send message
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    if (sendGuardRef.current) return;
    sendGuardRef.current = true;

    try {
      if (!activeThreadId) {
        if (recipient.type === "people") {
          if (!recipient.id) return;
          setInputText("");
          setSending(true);
          try {
            await apiMutateJson(
              "/api/chat/messages",
              "POST",
              { conversationId: recipient.id, text, role: "user" },
              accessToken,
            );
            router.push(`/chat/${encodeURIComponent(recipient.id)}`);
          } catch {
            setInputText(text);
          } finally {
            setSending(false);
          }
          return;
        }

        setInputText("");
        setSending(true);
        const userMsg: MessageRow = {
          id: `tmp-${Date.now()}`,
          role: "user",
          text,
          createdAt: new Date().toISOString(),
          senderId: session?.user?.id || null,
        };
        setMessages(prev => [...prev, userMsg]);
        try {
          const created = await apiMutateJson<Record<string, unknown>>(
            "/api/chat",
            "POST",
            {
              type: recipient.type === "agent" ? "agent" : "ai",
              title: recipient.label,
              subtitle: recipient.sublabel || null,
              metadata: {
                source: "simple-chat",
                recipientType: recipient.type,
                modelId: recipient.id,
                modelLabel: recipient.label,
              },
            },
            accessToken,
          );
          const createdChat =
            (created.chat as Record<string, unknown> | undefined) ||
            (created.thread as Record<string, unknown> | undefined);
          const newThreadId = String(
            created.conversationId ||
              created.chatId ||
              created.id ||
              createdChat?.id ||
              "",
          ).trim();
          if (!newThreadId) throw new Error("Failed to create chat");

          await apiMutateJson(
            "/api/chat/messages",
            "POST",
            { conversationId: newThreadId, text, role: "user" },
            accessToken,
          );
          router.push(`/chat/${encodeURIComponent(newThreadId)}`);
        } catch {
          setMessages(prev => prev.filter(m => m.id !== userMsg.id));
          setInputText(text);
        } finally {
          setSending(false);
        }
        return;
      }

      setInputText("");
      setSending(true);
      const optimistic: MessageRow = {
        id: `tmp-${Date.now()}`,
        role: "user",
        text,
        createdAt: new Date().toISOString(),
        senderId: session?.user?.id || null,
      };
      setMessages(prev => [...prev, optimistic]);
      try {
        await apiMutateJson(
          "/api/chat/messages",
          "POST",
          { conversationId: activeThreadId, text, role: "user" },
          accessToken,
        );
        const refreshed = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        const raw = refreshed.activeChat?.messages || [];
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        setInputText(text);
      } finally {
        setSending(false);
      }
    } finally {
      sendGuardRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentUserId = session?.user?.id;
  const hasThread     = Boolean(activeThreadId);
  const isHumanThread = useMemo(
    () => Boolean(activeThreadId && peopleRecipients.some((p) => String(p.id) === String(activeThreadId))),
    [activeThreadId, peopleRecipients],
  );
  const lockedComposer = hasThread
    ? !isHumanThread
    : recipient.type === "people"
      ? !recipient.id
      : true;
  const selectRecipientType = (type: RecipientType) => {
    if (type === "people") {
      setRecipient(DEFAULT_PEOPLE_RECIPIENT);
      return;
    }
    if (type === "agent") {
      setRecipient(AI_AGENTS[0]);
      return;
    }
    setRecipient(AI_MODELS[0]);
  };
  const handleRecipientChange = (next: Recipient) => {
    setRecipient(next);
    if (!hasThread && next.type === "people" && next.id) {
      router.push(`/chat/${encodeURIComponent(next.id)}`);
    }
  };
  const activeHumanRecipient = useMemo(
    () => peopleRecipients.find((p) => String(p.id) === String(activeThreadId)),
    [peopleRecipients, activeThreadId],
  );
  const messageBlob = useMemo(
    () =>
      messages
        .map((m) => `${m.text} ${m.embed && typeof m.embed.type === "string" ? m.embed.type : ""}`.toLowerCase())
        .join(" "),
    [messages],
  );
  const dealProgress = useMemo(
    () => [
      { id: "offer", label: "Offer accepted", done: /(offer accepted|bid accepted|accept)/.test(messageBlob) },
      { id: "contract", label: "Contract drafted", done: /(contract|draft contract|signed)/.test(messageBlob) },
      { id: "milestones", label: "Milestones set", done: /(milestone|deliverable|artifact)/.test(messageBlob) },
      { id: "payment", label: "Payment requested", done: /(payment|invoice|paid)/.test(messageBlob) },
      { id: "updates", label: "Follow-ups and updates", done: /(follow up|follow-up|update)/.test(messageBlob) },
    ],
    [messageBlob],
  );

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  const startChatDeposit = useCallback(async () => {
    if (!activeThreadId || !accessToken) return;
    setDepositBusy(true);
    try {
      const res = await apiMutateJson<{ url?: string }>(
        "/api/checkout/chat-deposit",
        "POST",
        { conversationId: activeThreadId, amountUsd: 25 },
        accessToken,
      );
      if (res && typeof res === "object" && "url" in res && res.url) {
        window.open(String(res.url), "_blank", "noopener,noreferrer");
      }
    } catch {
      /* non-blocking */
    } finally {
      setDepositBusy(false);
    }
  }, [activeThreadId, accessToken]);

  const importProfileFromSocial = useCallback(
    async (payload: SocialImportPayload) => {
      if (!accessToken) {
        router.push(`/login?next=${encodeURIComponent("/chat")}`);
        return;
      }
      await apiMutateJson("/api/profile/import-social", "POST", payload, accessToken);
    },
    [accessToken, router],
  );

  const refreshCurrentThread = useCallback(() => {
    if (!activeThreadId || !accessToken) return;
    void (async () => {
      try {
        const refreshed = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        const raw = Array.isArray(refreshed.activeChat?.messages)
          ? refreshed.activeChat?.messages
          : refreshed.messages;
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch {
        // keep current stream
      }
    })();
  }, [activeThreadId, accessToken]);

  const onAttachFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file || !activeThreadId || !accessToken) return;
      const okMime =
        /^image\/(jpeg|png|gif|webp)$/i.test(file.type) || file.type === "application/pdf";
      if (!okMime) {
        window.alert("Allowed types: JPEG, PNG, GIF, WebP, or PDF.");
        return;
      }
      if (file.size > 4_500_000) {
        window.alert("File is too large (max about 4.5MB).");
        return;
      }
      setSending(true);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(new Error("Could not read file"));
          r.readAsDataURL(file);
        });
        await apiMutateJson(
          `/api/chats/${encodeURIComponent(activeThreadId)}/files`,
          "POST",
          { dataUrl, fileName: file.name, caption: "" },
          accessToken,
        );
        const refreshed = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        const raw = Array.isArray(refreshed.activeChat?.messages)
          ? refreshed.activeChat?.messages
          : refreshed.messages;
        setMessages(Array.isArray(raw) ? raw.map(mapApiMessage) : []);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setSending(false);
        if (attachRef.current) attachRef.current.value = "";
      }
    },
    [activeThreadId, accessToken],
  );

  useEffect(() => {
    if (!activeThreadId || !accessToken || !isHumanThread) return;
    const tick = window.setInterval(async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      if (sendingRef.current) return;
      try {
        const data = await apiGetJson<{
          activeChat?: { messages?: Array<Record<string, unknown>> };
          messages?: Array<Record<string, unknown>>;
        }>(`/api/chat/${encodeURIComponent(activeThreadId)}/messages?limit=80`, accessToken);
        const raw = Array.isArray(data.activeChat?.messages) ? data.activeChat?.messages : data.messages;
        if (Array.isArray(raw)) setMessages(raw.map(mapApiMessage));
      } catch {
        /* ignore poll errors */
      }
    }, 12_000);
    return () => window.clearInterval(tick);
  }, [activeThreadId, accessToken, isHumanThread]);

  useEffect(() => {
    setShowDealContext(false);
  }, [activeThreadId]);

  return (
    <div className="page-root relative flex min-h-0 flex-1 text-on-surface">
      <input
        ref={attachRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        onChange={e => void onAttachFiles(e.target.files)}
      />
      {isHumanThread ? (
        <button
          type="button"
          onClick={() => setShowDealContext((v) => !v)}
          className="border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-on-surface absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition-colors"
          aria-label={showDealContext ? "Hide deal context panel" : "Show deal context panel"}
          title={showDealContext ? "Hide deal context panel" : "Show deal context panel"}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden>
            {showDealContext ? "right_panel_close" : "right_panel_open"}
          </span>
        </button>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Message stream */}
        <div ref={streamRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-on-surface-variant" />
                Loading…
              </div>
            </div>
          ) : !hasThread && messages.length === 0 ? (
            <EmptyState
              recipient={recipient}
              onSelectRecipientType={selectRecipientType}
              onImportProfile={importProfileFromSocial}
            />
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-2xl space-y-4">
                <p className="text-sm text-on-surface-variant">No messages yet. Start the conversation.</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5">
              {messages.map(message => {
                const isMine = message.role === "user" || String(message.senderId) === String(currentUserId);
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={isMine}
                    currentUserId={currentUserId}
                    accessToken={accessToken}
                    threadId={activeThreadId || undefined}
                    onRefresh={refreshCurrentThread}
                  />
                );
              })}
              {sending && (recipient.type === "ai" || recipient.type === "agent") && !hasThread && (
                <TypingIndicator recipient={recipient} />
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <InputBar
          inputText={inputText}
          setInputText={setInputText}
          sending={sending}
          onSend={sendMessage}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          recipient={recipient}
          peopleRecipients={peopleRecipients}
          onChangeRecipient={handleRecipientChange}
          isHumanThread={isHumanThread}
          locked={lockedComposer}
          hasThread={hasThread}
          onAttachClick={() => attachRef.current?.click()}
          attachDisabled={!activeThreadId}
        />
      </div>

      {isHumanThread && showDealContext ? (
        <DealRoomContextSidebar
          recipientLabel={activeHumanRecipient?.label || "Deal room"}
          messageCount={messages.filter((m) => m.role !== "system").length}
          lastActivity={messages[messages.length - 1]?.createdAt || null}
          progress={dealProgress}
          onChatDeposit={startChatDeposit}
          depositBusy={depositBusy}
        />
      ) : null}
    </div>
  );
}