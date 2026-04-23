"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Paperclip, ChevronDown, X, Mic } from "lucide-react";
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

/** CTAs for empty People chat — encourage starting real conversations */
const PEOPLE_START_CTAS: Array<{ icon: string; title: string; sub: string; href: string }> = [
  { icon: "📋", title: "Create a request", sub: "Describe the work and invite bids", href: "/requests/new" },
  { icon: "🛠️", title: "Offer a service", sub: "List what you deliver and get hired", href: "/services/new" },
  { icon: "🛍️", title: "Browse the marketplace", sub: "Find partners, compare offers", href: "/marketplace" },
  { icon: "🎯", title: "Place bids", sub: "Compete on open requests", href: "/bid" },
  { icon: "🏪", title: "Store & listings", sub: "Discover offers and buy", href: "/store" },
  { icon: "👥", title: "Join squads", sub: "Team up and coordinate deals", href: "/squads" },
];

const HUMAN_WORKFLOW_STEPS: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  quickActions?: string[];
}> = [
  {
    id: "offer",
    label: "DEAL START",
    title: "Bid received / Offer sent",
    description: "Start from a marketplace bid or direct offer and confirm direction quickly.",
    quickActions: ["Accept", "Counter offer", "Decline"],
  },
  {
    id: "contract",
    label: "CONTRACT",
    title: "Draft and sign contract",
    description: "Lock the scope, price, timeline, and responsibilities for both sides.",
    quickActions: ["Draft contract"],
  },
  {
    id: "milestones",
    label: "DELIVERY",
    title: "Set milestones and deliverables",
    description: "Track artifact handoff, status updates, and completion criteria by milestone.",
    quickActions: ["Set milestone", "Post update"],
  },
  {
    id: "payment",
    label: "PAYMENT",
    title: "Request and confirm payment",
    description: "Request payment at agreed milestones and mark receipts in-thread.",
    quickActions: ["Request payment"],
  },
  {
    id: "followup",
    label: "FOLLOW-UP",
    title: "Follow up and next steps",
    description: "Capture follow-ups, revisions, and support updates for transparency.",
    quickActions: ["Follow up"],
  },
];

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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  recipient,
  peopleRecipients,
  onSelectRecipientType,
  onOpenDealRoom,
  onOpenPath,
}: {
  recipient: Recipient;
  peopleRecipients: Recipient[];
  onSelectRecipientType: (type: RecipientType) => void;
  onOpenDealRoom: (recipient: Recipient) => void;
  onOpenPath: (path: string) => void;
}) {
  const isPeople = recipient.type === "people";

  if (isPeople) {
    return (
      <div className="flex h-full min-h-0 flex-col px-4 pb-6 pt-2">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-left">
          <header>
            <h2 className="text-lg font-bold tracking-tight text-on-surface">Hire People</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Open a deal room you already have, or start something new below — requests, services, bids, and offers all lead to real conversations.
            </p>
          </header>

          <section aria-labelledby="recent-deal-chats-heading">
            <h3
              id="recent-deal-chats-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
            >
              Recent deal chats
            </h3>
            <div className="mt-2 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
              {peopleRecipients.length === 0 ? (
                <p className="p-4 text-sm leading-relaxed text-on-surface-variant">
                  No deal rooms yet. Use the shortcuts below to post a request, list a service, browse the marketplace, or place bids — then message here.
                </p>
              ) : (
                <ul className="divide-y divide-outline-variant/60">
                  {peopleRecipients.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onOpenDealRoom(r)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-container-high"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-outline-variant/60 bg-surface-container text-[10px] font-bold text-on-surface-variant">
                          {initials(r.label)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-on-surface">{r.label}</p>
                          {r.sublabel ? (
                            <p className="truncate text-xs text-on-surface-variant">{r.sublabel}</p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-xs text-primary">Open</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section aria-labelledby="start-conversation-heading">
            <h3
              id="start-conversation-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
            >
              Start a conversation
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Create opportunities, respond to bids, make offers, and negotiate — everything here ties back to your deal rooms.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PEOPLE_START_CTAS.map((c) => (
                <button
                  key={c.href}
                  type="button"
                  onClick={() => onOpenPath(c.href)}
                  className="rounded-xl border border-outline-variant/60 bg-surface-container p-3.5 text-left transition hover:border-outline-variant hover:bg-surface-container-high"
                >
                  <span className="text-base text-on-surface-variant">{c.icon}</span>
                  <p className="mt-1.5 text-xs font-semibold leading-snug text-on-surface">{c.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">{c.sub}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-1.5 border-t border-outline-variant/50 pt-4">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              Other modes
            </span>
            <button
              type="button"
              onClick={() => onSelectRecipientType("people")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                recipient.type === "people"
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              People
            </button>
            <button
              type="button"
              onClick={() => onSelectRecipientType("ai")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                recipient.type === "ai"
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              AI Models
            </button>
            <button
              type="button"
              onClick={() => onSelectRecipientType("agent")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                recipient.type === "agent"
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              AI Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className={cn(
          "mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border text-xl",
          recipient.type === "agent"
            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
            : "border-blue-500/20 bg-blue-500/10 text-blue-400"
        )}>
          {recipient.type === "agent" ? "⚡" : "✦"}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-on-surface">
          {recipient.type === "agent" ? "Run it with an agent" : "What can I help with?"}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">Ask AI, Hire People, Run Agents</p>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectRecipientType("people")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              recipient.type === "people"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            People
          </button>
          <button
            type="button"
            onClick={() => onSelectRecipientType("ai")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              recipient.type === "ai"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            AI Models
          </button>
          <button
            type="button"
            onClick={() => onSelectRecipientType("agent")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              recipient.type === "agent"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            AI Agents
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
            Feature locked
          </p>
          <p className="mt-2 text-sm font-semibold text-on-surface">AI Models and AI Agents are under development.</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Messaging is currently disabled in this mode while core features are being finalized.
          </p>
        </div>
      </div>
    </div>
  );
}

function DealWorkflowCards({
  onQuickAction,
}: {
  onQuickAction: (text: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-3">
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
          Deal workflow
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">
          Keep client and specialist aligned from offer to delivery.
        </p>
      </div>
      <div className="space-y-2">
        {HUMAN_WORKFLOW_STEPS.map((step) => (
          <div
            key={step.id}
            className="rounded-xl border border-outline-variant/50 bg-surface-container p-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{step.label}</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{step.description}</p>
            {step.quickActions?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {step.quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => onQuickAction(action)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-semibold transition",
                      action === "Accept"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                        : action === "Counter offer"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : action === "Decline"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {action}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DealRoomContextSidebar({
  recipientLabel,
  messageCount,
  lastActivity,
  progress,
}: {
  recipientLabel: string;
  messageCount: number;
  lastActivity?: string | null;
  progress: Array<{ id: string; label: string; done: boolean }>;
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
                  disabled={locked}
                  className="rounded-lg p-1.5 text-on-surface-variant/60 transition hover:bg-surface-container-high hover:text-on-surface"
                  aria-label="Attach file"
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

  const openPath = (path: string) => {
    router.push(path);
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
  const openDealRoom = (next: Recipient) => {
    if (!next.id) return;
    setRecipient(next);
    router.push(`/chat/${encodeURIComponent(next.id)}`);
  };
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
  const handleHumanAction = (text: string) => {
    setInputText(text);
    queueMicrotask(() => inputRef.current?.focus());
  };
  const activeHumanRecipient = useMemo(
    () => peopleRecipients.find((p) => String(p.id) === String(activeThreadId)),
    [peopleRecipients, activeThreadId],
  );
  const messageBlob = useMemo(
    () =>
      messages
        .map((m) => `${m.text} ${m.embed?.type ?? ""}`.toLowerCase())
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
    setShowDealContext(false);
  }, [activeThreadId]);

  return (
    <div className="page-root relative flex min-h-0 flex-1 text-on-surface">
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
              peopleRecipients={peopleRecipients}
              onSelectRecipientType={selectRecipientType}
              onOpenDealRoom={openDealRoom}
              onOpenPath={openPath}
            />
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-full max-w-2xl space-y-4">
                {isHumanThread ? <DealWorkflowCards onQuickAction={handleHumanAction} /> : null}
                <p className="text-sm text-on-surface-variant">No messages yet. Start the conversation.</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5">
              {isHumanThread ? <DealWorkflowCards onQuickAction={handleHumanAction} /> : null}
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
          isHumanThread={isHumanThread}
          locked={lockedComposer}
          hasThread={hasThread}
        />
      </div>

      {isHumanThread && showDealContext ? (
        <DealRoomContextSidebar
          recipientLabel={activeHumanRecipient?.label || "Deal room"}
          messageCount={messages.filter((m) => m.role !== "system").length}
          lastActivity={messages[messages.length - 1]?.createdAt || null}
          progress={dealProgress}
        />
      ) : null}
    </div>
  );
}