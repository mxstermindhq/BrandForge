"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Paperclip, ChevronDown, X } from "lucide-react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { useAuth } from "@/providers/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "peer" | "system" | "ai" | "agent";

export type MessageEmbed = {
  type: "bid" | "contract" | "deal_phase" | "service_offer" | "counter_offer";
  data: Record<string, unknown>;
};

export type MessageRow = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  embed?: MessageEmbed | null;
};

type RecipientType = "ai" | "agent" | "people";

type Recipient = {
  type: RecipientType;
  id: string;
  label: string;
  sublabel?: string;
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

const MOCK_PEOPLE_KEYS = new Set([
  "alex rivera",
  "priya nair",
  "jordan wu",
  "h1",
  "h2",
  "h3",
]);

const SUGGESTIONS = {
  ai: [
    { icon: "✦", title: "Draft a launch plan",        sub: "Strategy sprint" },
    { icon: "✦", title: "Write cold outreach copy",   sub: "That converts" },
    { icon: "✦", title: "Analyze market fit",         sub: "Opportunity scan" },
    { icon: "✦", title: "Break goal into tasks",      sub: "Execution roadmap" },
    { icon: "✦", title: "Review pricing strategy",    sub: "Freemium vs. paid" },
    { icon: "✦", title: "Rewrite this copy",          sub: "Marketing polish" },
  ],
  agent: [
    { icon: "⚡", title: "Build a GTM campaign",      sub: "End-to-end execution" },
    { icon: "⚡", title: "Run outreach sequence",      sub: "Draft, review, iterate" },
    { icon: "⚡", title: "Audit my brand voice",       sub: "Across all channels" },
    { icon: "⚡", title: "Plan a product launch",      sub: "90-day roadmap" },
    { icon: "⚡", title: "Competitive positioning",    sub: "Win the narrative" },
    { icon: "⚡", title: "Write a pitch deck",         sub: "Investor-ready" },
  ],
};

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
  const embed = row.embed
    ? { type: String((row.embed as Record<string, unknown>).type || "deal_phase") as MessageEmbed["type"], data: row.embed as Record<string, unknown> }
    : null;
  return {
    id, role, text, createdAt,
    senderId: senderId ? String(senderId) : null,
    senderName: senderName ? String(senderName) : null,
    senderAvatar: senderAvatar ? String(senderAvatar) : null,
    embed,
  };
}

// ─── Embed Card ───────────────────────────────────────────────────────────────

function EmbedCard({ embed }: { embed: MessageEmbed }) {
  const data = embed.data;

  if (embed.type === "bid" || embed.type === "service_offer") {
    const price = data.price != null ? Number(data.price) : null;
    const title = String(data.requestTitle || data.serviceTitle || "Deal");
    const proposer = data.proposer as { username?: string; fullName?: string } | undefined;
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          {embed.type === "bid" ? "Request Bid" : "Service Offer"}
        </p>
        <p className="mt-1 text-sm font-medium text-on-surface">{title}</p>
        {price != null && <p className="text-base font-bold text-on-surface">${price.toLocaleString()}</p>}
        {proposer && <p className="mt-1 text-xs text-on-surface-variant">From {proposer.fullName || proposer.username}</p>}
      </div>
    );
  }

  if (embed.type === "deal_phase") {
    const phase = String(data.phase || "update");
    const title = String(data.title || "Deal Update");
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          {phase.replace(/_/g, " ")}
        </p>
        <p className="mt-1 text-sm text-on-surface">{title}</p>
      </div>
    );
  }

  return null;
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

function MessageBubble({ message, isMine }: { message: MessageRow; isMine: boolean }) {
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
          {message.embed && <EmbedCard embed={message.embed} />}
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
      <div className="flex items-center justify-between border-b border-outline-variant/60 px-2 py-2">
        <div className="flex flex-1 gap-0.5 rounded-lg bg-surface-container-high p-0.5">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide transition",
                tab === id
                  ? "bg-surface-container text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {label}
            </button>
          ))}
        </div>
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  recipient,
  onSuggestion,
}: {
  recipient: Recipient;
  onSuggestion: (text: string) => void;
}) {
  const isPeople = recipient.type === "people";
  const suggs    = SUGGESTIONS[recipient.type === "agent" ? "agent" : "ai"];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className={cn(
          "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl",
          recipient.type === "agent"
            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
            : recipient.type === "people"
            ? "border-outline-variant bg-surface-container text-on-surface-variant text-sm font-bold"
            : "border-blue-500/20 bg-blue-500/10 text-blue-400"
        )}>
          {recipient.type === "agent" ? "⚡" : recipient.type === "people" ? initials(recipient.label) : "✦"}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-on-surface">
          {isPeople
            ? `Chat with ${recipient.label}`
            : recipient.type === "agent"
            ? "Run it with an agent"
            : "What can I help with?"}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {isPeople
            ? "This is a deal conversation. Negotiate, share files, and close contracts here."
            : "Ask AI, Hire People, Run Agents"}
        </p>

        {/* People CTA */}
        {isPeople && (
          <div className="mt-6 rounded-xl border border-outline-variant/60 bg-surface-container p-4 text-left">
            <p className="text-xs font-medium text-on-surface-variant">This conversation started from the marketplace.</p>
            <p className="mt-1 text-sm text-on-surface">Review the service offer above, negotiate terms, or send a counter-offer.</p>
          </div>
        )}

        {/* Suggestion cards */}
        {!isPeople && (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {suggs.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s.title)}
                className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3 text-left transition hover:border-outline hover:bg-surface-container"
              >
                <span className={cn("text-base", recipient.type === "agent" ? "text-amber-400" : "text-blue-400")}>{s.icon}</span>
                <p className="mt-1.5 text-xs font-medium leading-snug text-on-surface">{s.title}</p>
                <p className="mt-0.5 text-[10px] text-on-surface-variant">{s.sub}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
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
  hasThread,
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
  hasThread: boolean;
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
              placeholder={
                hasThread
                  ? "Reply in deal room..."
                  : isPeople
                  ? `Message ${recipient.label}...`
                  : recipient.type === "agent"
                  ? "Give the agent an objective..."
                  : "Ask anything..."
              }
              className="max-h-40 min-h-[48px] w-full resize-none rounded-t-2xl bg-transparent px-4 py-3 text-[13.5px] leading-relaxed text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              rows={1}
            />

            {/* Toolbar */}
            <div className="flex items-center gap-1 rounded-b-2xl px-3 py-2">
              <div className="relative z-10 flex shrink-0 items-center gap-0.5">
                {pickerOpen && !hasThread && (
                  <RecipientPicker
                    value={recipient}
                    peopleRecipients={peopleRecipients}
                    onChange={onChangeRecipient}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-on-surface-variant/60 transition hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                {!hasThread && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(v => !v)}
                    className={cn(
                      "flex max-w-[min(200px,calc(100vw-8rem))] items-center gap-1 rounded-lg border px-2 py-1 text-left text-xs font-medium transition hover:bg-surface-container-high",
                      recipient.type === "agent"
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                        : recipient.type === "people"
                          ? "border-outline-variant/80 bg-surface-container-high text-on-surface"
                          : "border-blue-500/30 bg-blue-500/5 text-blue-400"
                    )}
                    aria-expanded={pickerOpen}
                    aria-haspopup="listbox"
                    aria-label="Choose recipient"
                  >
                    <span className="shrink-0">{recipient.type === "agent" ? "⚡" : recipient.type === "people" ? "👤" : "✦"}</span>
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
                disabled={!inputText.trim() || sending}
                onClick={onSend}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                  inputText.trim() && !sending
                    ? "bg-blue-500 text-white shadow-sm hover:bg-blue-400"
                    : "cursor-not-allowed bg-surface-container-high text-on-surface-variant/40"
                )}
              >
                {sending
                  ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Send className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>
        </div>
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
  const [recipient, setRecipient] = useState<Recipient>(AI_MODELS[0]);

  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

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

    if (!activeThreadId) {
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
        if (recipient.type === "people") {
          if (!recipient.id) throw new Error("No chat selected");
          router.push(`/chat/${encodeURIComponent(recipient.id)}`);
          return;
        }
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
          accessToken
        );
        const createdChat = (created.chat as Record<string, unknown> | undefined) || (created.thread as Record<string, unknown> | undefined);
        const newThreadId = String(
          created.conversationId ||
          created.chatId ||
          created.id ||
          createdChat?.id ||
          ""
        ).trim();
        if (!newThreadId) throw new Error("Failed to create chat");

        await apiMutateJson(
          "/api/chat/messages",
          "POST",
          { conversationId: newThreadId, text, role: "user" },
          accessToken
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
        accessToken
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (text: string) => {
    setInputText(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const currentUserId = session?.user?.id;
  const hasThread     = Boolean(activeThreadId);
  const handleRecipientChange = (next: Recipient) => {
    setRecipient(next);
    if (!hasThread && next.type === "people" && next.id) {
      router.push(`/chat/${encodeURIComponent(next.id)}`);
    }
  };

  return (
    <div className="page-root flex min-h-0 flex-1 flex-col text-on-surface">
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
          <EmptyState recipient={recipient} onSuggestion={handleSuggestion} />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-on-surface-variant">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            {messages.map(message => {
              const isMine = message.role === "user" || String(message.senderId) === String(currentUserId);
              return <MessageBubble key={message.id} message={message} isMine={isMine} />;
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
        hasThread={hasThread}
      />
    </div>
  );
}