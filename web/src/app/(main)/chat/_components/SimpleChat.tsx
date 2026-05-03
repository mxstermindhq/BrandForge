"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Send, Plus, ChevronDown, X, Mic, Sparkles, Lock, Radio, ShieldCheck, Zap } from "lucide-react";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { useAuth } from "@/providers/AuthProvider";
import { ChatMessageEmbed } from "@/components/messages/ChatEmbeds";
import { AIAssistantPanel } from "@/components/deal-rooms/AIAssistantPanel";

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

type ChatRequestDraft = {
  title: string;
  desc: string;
  budget: string;
  successCriteria?: string;
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
  label: "Deal Rooms",
  sublabel: "Choose a deal room",
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

function suggestTitle(text: string) {
  const sentence = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!?\n]/)[0]
    ?.trim();
  if (!sentence) return "New project request";
  return sentence.length > 80 ? `${sentence.slice(0, 77)}...` : sentence;
}

function getBriefReadiness({
  brief,
  budget,
  timeline,
  successCriteria,
}: {
  brief: string;
  budget: string;
  timeline: string;
  successCriteria: string;
}) {
  const b = brief.trim();
  const hasBudget = Boolean(budget.trim());
  const hasTimeline = Boolean(timeline.trim());
  const hasOutcome = Boolean(successCriteria.trim());
  const hasConcreteScope = /\b(logo|brand|website|app|dashboard|copy|campaign|landing|prototype|video|design|build|audit|strategy)\b/i.test(b);
  const hasAudience = /\b(for|audience|customers|users|startup|team|brand|client|market)\b/i.test(b);
  const score =
    Math.min(
      100,
      25 +
        Math.min(25, Math.floor(b.length / 4)) +
        (hasConcreteScope ? 15 : 0) +
        (hasAudience ? 10 : 0) +
        (hasBudget ? 15 : 0) +
        (hasTimeline ? 5 : 0) +
        (hasOutcome ? 5 : 0),
    );

  return {
    score,
    items: [
      {
        done: hasConcreteScope,
        text: hasConcreteScope ? "Scope is specific enough to attract relevant bids." : "Name the exact deliverables you want.",
      },
      {
        done: hasAudience,
        text: hasAudience ? "Context is clear enough for specialists to tailor proposals." : "Add audience, industry, or buyer context.",
      },
      {
        done: hasBudget,
        text: hasBudget ? "Budget gives specialists a real quoting anchor." : "Add a budget range to unlock posting.",
      },
      {
        done: hasTimeline,
        text: hasTimeline ? "Timeline helps specialists judge availability." : "Timeline is optional, but improves fit.",
      },
      {
        done: hasOutcome,
        text: hasOutcome ? "Success criteria reduce revision risk." : "Add success criteria if quality matters more than speed.",
      },
    ],
  };
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

      <div className={cn("flex max-w-[84%] flex-col gap-1 sm:max-w-[72%]", isMine && "items-end")}>
        {/* Sender + time */}
        <div className={cn("flex items-center gap-1.5 px-1", isMine && "flex-row-reverse")}>
          <span className="text-[10px] font-medium text-on-surface-variant">{name}</span>
          <span className="text-[10px] text-on-surface-variant/50">{relativeTime(message.createdAt)}</span>
        </div>

        {/* Bubble */}
        <div className={cn(
          "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
          isMine
            ? "rounded-br-[6px] bg-blue-500 text-white"
            : isAI
            ? "rounded-bl-[6px] border border-blue-500/20 bg-blue-500/5 text-on-surface"
            : isAgent
            ? "rounded-bl-[6px] border border-orange-500/25 bg-orange-500/5 text-on-surface"
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

type PickerCategory = "people" | "models";

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
    return "models";
  }, [value.type]);

  const [tab, setTab] = useState<PickerCategory>(initialTab);
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabs: { id: PickerCategory; label: string; items: Recipient[] }[] = [
    { id: "people", label: "People", items: peopleRecipients },
    { id: "models", label: "Models", items: AI_MODELS },
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
          <p className="px-4 py-3 text-xs text-on-surface-variant">No deal rooms yet. Post a brief to get started.</p>
        )}
      </div>
    </div>
  );
}

// ─── Chat hub landing (empty thread) ───────────────────────────────────────────

function HubTabBar({
  recipient,
  onSelectRecipientType,
}: {
  recipient: Recipient;
  onSelectRecipientType: (type: RecipientType) => void;
}) {
  return (
    <div className="flex w-full rounded-xl border border-outline-variant/60 bg-surface-container-low p-1 sm:w-auto sm:shrink-0">
      {(["people", "ai", "agent"] as RecipientType[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onSelectRecipientType(t)}
          className={cn(
            "flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-semibold transition sm:flex-none sm:px-4 sm:text-sm",
            recipient.type === t ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {t === "people" ? "Deal Rooms" : t === "ai" ? "AI Models" : "AI Agents"}
        </button>
      ))}
    </div>
  );
}

function DistributionStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid rounded-2xl border border-outline-variant bg-surface-container-low",
        compact ? "grid-cols-3 gap-1.5 p-2 sm:gap-2 sm:p-3" : "gap-2 p-3 sm:grid-cols-3",
      )}
    >
      {[
        {
          icon: Radio,
          label: "Marketplace",
          text: "Listed on BrandForge for search and bids.",
          className: "text-emerald-500",
        },
        {
          icon: Zap,
          label: "Discord",
          text: "Broadcast to configured deal channels.",
          className: "text-purple-500",
        },
        {
          icon: ShieldCheck,
          label: "Telegram",
          text: "Sent to configured matching channels.",
          className: "text-orange-500",
        },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "rounded-xl bg-surface/60",
              compact ? "flex min-w-0 flex-col gap-1 p-2 sm:flex-row sm:items-start sm:gap-2" : "flex items-start gap-2 p-2",
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", item.className)} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-on-surface">{item.label}</p>
              <p className={cn("mt-0.5 text-[10px] leading-snug text-on-surface-variant", compact && "hidden sm:block")}>
                {item.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BriefReadinessCard({
  brief,
  budget,
  timeline,
  successCriteria,
  compact = false,
}: {
  brief: string;
  budget: string;
  timeline: string;
  successCriteria: string;
  compact?: boolean;
}) {
  const readiness = useMemo(
    () => getBriefReadiness({ brief, budget, timeline, successCriteria }),
    [brief, budget, timeline, successCriteria],
  );
  const visibleItems = compact ? readiness.items.slice(0, 3) : readiness.items;
  const nextItem = readiness.items.find((item) => !item.done) ?? readiness.items[0];

  return (
    <div className={cn("rounded-xl border border-primary/20 bg-primary/5", compact ? "p-2.5 sm:p-3" : "p-3")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Free brief audit</p>
          <p className={cn("mt-1 text-xs text-on-surface-variant", compact && "hidden sm:block")}>
            BrandForge posts strong briefs to the marketplace plus Discord and Telegram matching channels.
          </p>
        </div>
        <div className="shrink-0 rounded-full border border-primary/20 bg-surface px-3 py-1 text-xs font-bold text-primary">
          {readiness.score}%
        </div>
      </div>
      {compact ? (
        <>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-outline-variant/60 sm:hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${readiness.score}%` }} />
          </div>
          <p className="mt-2 flex gap-2 text-[11px] leading-relaxed text-on-surface-variant sm:hidden">
            <span
              className={cn(
                "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                nextItem.done ? "bg-emerald-500" : "bg-orange-500",
              )}
            />
            <span>{nextItem.text}</span>
          </p>
        </>
      ) : null}
      <ul className={cn("mt-3 grid gap-1.5", compact ? "hidden sm:grid sm:grid-cols-3" : "sm:grid-cols-2")}>
        {visibleItems.map((item) => (
          <li key={item.text} className="flex gap-2 text-[11px] leading-relaxed text-on-surface-variant">
            <span
              className={cn(
                "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full",
                item.done ? "bg-emerald-500" : "bg-orange-500",
              )}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickBriefWizard({
  onSubmitRequest,
  submitting,
}: {
  onSubmitRequest: (payload: ChatRequestDraft) => Promise<void>;
  submitting: boolean;
}) {
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);

  const canContinueFromBrief = brief.trim().length >= 20;
  const canPostBrief = Boolean(budget.trim());

  useEffect(() => {
    const el = briefRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [brief]);

  const submitBrief = async () => {
    if (!canPostBrief || submitting) return;
    setErr(null);
    try {
      const cleanBrief = brief.trim();
      const cleanTimeline = timeline.trim();
      const description = [cleanBrief, cleanTimeline ? `Timeline: ${cleanTimeline}` : ""]
        .filter(Boolean)
        .join("\n\n");
      await onSubmitRequest({
        title: suggestTitle(cleanBrief),
        desc: description,
        budget: budget.trim(),
        successCriteria: successCriteria.trim() || undefined,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not post brief");
    }
  };

  const StepIndicator = () => (
    <div className="mb-3 flex items-center gap-2 sm:mb-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn(
            "h-1 rounded-full transition-all",
            i <= currentStep ? "w-8 bg-primary" : "w-4 bg-outline-variant",
          )}
        />
      ))}
      <span className="ml-1 text-[10px] text-on-surface-variant">Step {currentStep + 1} of 2</span>
    </div>
  );

  if (submitting) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5">
        <StepIndicator />
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
          <p className="mt-4 text-sm font-semibold text-on-surface">Posting your brief…</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-on-surface-variant">
            Matching you with specialists. This takes a second.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-5">
      <StepIndicator />

      {currentStep === 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">What do you need?</h3>
          <textarea
            ref={briefRef}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe your project in plain language. e.g. I need a brand identity for a fintech startup — logo, palette, and type system."
            className="input min-h-[100px] max-h-[200px] w-full resize-none overflow-y-auto rounded-xl px-3 py-2.5"
          />
          <p className="text-[11px] text-on-surface-variant">Be specific — budget and timeline come next.</p>
          <BriefReadinessCard brief={brief} budget={budget} timeline={timeline} successCriteria={successCriteria} compact />
          <button
            type="button"
            disabled={!canContinueFromBrief}
            onClick={() => setCurrentStep(1)}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">Budget & timeline</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. $500 – $1,500"
              className="input w-full"
            />
            <input
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. 2 weeks"
              className="input w-full"
            />
          </div>
          <input
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            placeholder="How will you know it's done? e.g. 3 logo concepts delivered as SVG + brand guide PDF"
            className="input w-full"
          />
          {err ? <p className="text-xs text-error">{err}</p> : null}
          <BriefReadinessCard brief={brief} budget={budget} timeline={timeline} successCriteria={successCriteria} />
          <button
            type="button"
            disabled={!canPostBrief}
            onClick={() => void submitBrief()}
            className="btn-primary w-full py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post brief →
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(0)}
            className="text-xs text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
          >
            ← Back
          </button>
          <p className="text-center text-[11px] leading-relaxed text-on-surface-variant">
            Free to post and compare. Continue by funding the deal room when you choose a specialist.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  recipient,
  onSelectRecipientType,
  onCreateRequestFromChat,
  creatingRequest,
}: {
  recipient: Recipient;
  onSelectRecipientType: (type: RecipientType) => void;
  onCreateRequestFromChat: (payload: ChatRequestDraft) => Promise<void>;
  creatingRequest: boolean;
}) {
  const isPeople = recipient.type === "people";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col",
        isPeople ? "overflow-y-auto" : "overflow-y-auto",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col",
          isPeople ? "max-w-2xl justify-start gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-6" : "max-w-md gap-4 px-4 py-4",
        )}
      >
        <div className={cn("flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between", isPeople && "shrink-0")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Chat</p>
          <HubTabBar recipient={recipient} onSelectRecipientType={onSelectRecipientType} />
        </div>

        {!isPeople ? (
          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-outline-variant bg-surface-container-low p-5">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  recipient.type === "agent"
                    ? "border-orange-500/25 bg-orange-500/10 text-orange-500"
                    : "border-blue-500/25 bg-blue-500/10 text-blue-500",
                )}
              >
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-on-surface sm:text-xl">
                  {recipient.type === "ai" ? "Draft with AI" : "Run an AI agent"}
                </h2>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-on-surface-variant">
                  {recipient.type === "ai"
                    ? "Ask for a stronger brief, a proposal review, or negotiation prep. The first answer happens here."
                    : "Give the agent a focused growth or ops objective. It will return a usable first pass in chat."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              {(recipient.type === "ai"
                ? ["Turn this idea into a buyer-ready brief", "Review this proposal for risk"]
                : ["Draft outreach for this request", "Summarize next steps for a deal room"]
              ).map((prompt) => (
                <div key={prompt} className="rounded-xl border border-outline-variant/60 bg-surface px-3 py-2 text-on-surface-variant">
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-stretch gap-2 pb-3 sm:gap-3 sm:pb-4">
            <DistributionStrip compact />
            <QuickBriefWizard
              onSubmitRequest={onCreateRequestFromChat}
              submitting={creatingRequest}
            />
          </div>
        )}
      </div>
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
  chatId,
  dealContext,
}: {
  recipientLabel: string;
  messageCount: number;
  lastActivity?: string | null;
  progress: Array<{ id: string; label: string; done: boolean }>;
  onChatDeposit?: () => void;
  depositBusy?: boolean;
  chatId?: string;
  dealContext?: {
    type: "service";
    title: string;
    parties: Array<{ id: string; name: string; role: string }>;
  };
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

        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">Free start</p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-on-surface-variant">
            <li>Post the brief and compare bids for free.</li>
            <li>New requests and listings are broadcast to BrandForge plus Discord and Telegram matching channels.</li>
            <li>Continue by funding escrow when the deal is real.</li>
          </ul>
        </div>

        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">
            Paid continuation
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
            Escrow unlocks the working phase: payment, milestones, delivery, and review history stay attached to this room.
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-outline-variant/50 bg-surface-container p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            Quick links
          </p>
          <div className="mt-2 space-y-1.5">
            <Link
              href="/requests/new"
              className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              Create request
            </Link>
            <Link
              href="/services/new"
              className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              Create service
            </Link>
            <Link
              href="/marketplace"
              className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              Open marketplace
            </Link>
            <Link
              href="/plans?from=brief"
              className="block rounded-md px-2 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            >
              Plans for growth
            </Link>
            {onChatDeposit ? (
              <button
                type="button"
                disabled={depositBusy}
                onClick={() => onChatDeposit()}
                className="mt-1 w-full rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-left text-xs font-semibold text-amber-700 transition hover:bg-amber-500/15 disabled:opacity-50 dark:text-amber-200"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  {depositBusy ? "Opening secure checkout…" : "Fund this deal room"}
                </span>
              </button>
            ) : null}
          </div>
        </div>
        {chatId ? (
          <div className="mt-4 rounded-xl border border-outline-variant bg-surface-container p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Deal Room AI</p>
              <span className="text-[10px] text-success">Ready</span>
            </div>
            <div className="h-[420px] overflow-hidden rounded-2xl border border-outline-variant">
              <AIAssistantPanel chatId={chatId} dealContext={dealContext} />
            </div>
          </div>
        ) : null}
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
  errorToast,
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
  errorToast: string | null;
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
      {errorToast && (
        <div className="mx-auto mb-2 max-w-2xl">
          <div className="rounded-full border border-error/30 bg-error/10 px-3 py-1.5 text-center text-[11px] font-medium text-error">
            {errorToast}
          </div>
        </div>
      )}
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
                  aria-label="Add image or PDF"
                  title={attachDisabled ? "Open a deal room to attach files" : "JPEG, PNG, GIF, WebP, or PDF (max ~4.5MB)"}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.25} />
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
              <span className="mr-1 min-w-0 max-w-[min(200px,46vw)] text-right text-[9px] leading-snug text-on-surface-variant/55 sm:mr-2 sm:max-w-none sm:text-[10px]">
                {sending ? "Sending…" : "Brief · Negotiate · Sign · Deliver"}
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
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

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

        if (!accessToken) {
          router.push(`/login?next=${encodeURIComponent("/chat")}`);
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
          const aiRes = await apiMutateJson<{ reply?: string }>(
            "/api/ai/chat",
            "POST",
            {
              mode: recipient.type === "agent" ? "marketing" : "general",
              model: recipient.id,
              messages: [{ role: "user", content: text }],
            },
            accessToken,
          );
          const reply = String(aiRes.reply || "").trim() || "I could not generate a reply yet. Try a shorter, more specific prompt.";
          const replyMsg: MessageRow = {
            id: `ai-${Date.now()}`,
            role: recipient.type === "agent" ? "agent" : "ai",
            text: reply,
            createdAt: new Date().toISOString(),
            senderName: recipient.label,
          };
          setMessages(prev => [...prev, replyMsg]);
        } catch (e) {
          setMessages(prev => prev.filter(m => m.id !== userMsg.id));
          setInputText(text);
          setErrorToast(e instanceof Error ? e.message : "AI reply failed.");
          setTimeout(() => setErrorToast(null), 4000);
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
    ? false
    : recipient.type === "people"
      ? !recipient.id
      : false;
  const showComposer = hasThread || recipient.type !== "people";
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
  const dealContext = useMemo(
    () => ({
      type: "service" as const,
      title: activeHumanRecipient?.label || "Deal room",
      parties: [
        {
          id: String(currentUserId || ""),
          name: "You",
          role: "buyer",
        },
      ],
    }),
    [activeHumanRecipient?.label, currentUserId],
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
      const res = await apiMutateJson<{ url?: string; configured?: boolean; message?: string }>(
        "/api/checkout/chat-deposit",
        "POST",
        { conversationId: activeThreadId, amountUsd: 25 },
        accessToken,
      );
      if (res && typeof res === "object" && "url" in res && res.url) {
        window.open(String(res.url), "_blank", "noopener,noreferrer");
      } else {
        setErrorToast(res?.message || "Checkout is not configured yet.");
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch (e) {
      setErrorToast(e instanceof Error ? e.message : "Could not open checkout.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setDepositBusy(false);
    }
  }, [activeThreadId, accessToken]);

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
        setErrorToast("Allowed types: JPEG, PNG, GIF, WebP, or PDF.");
        setTimeout(() => setErrorToast(null), 4000);
        return;
      }
      if (file.size > 4_500_000) {
        setErrorToast("File is too large (max about 4.5MB).");
        setTimeout(() => setErrorToast(null), 4000);
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
        setErrorToast(e instanceof Error ? e.message : "Upload failed");
        setTimeout(() => setErrorToast(null), 4000);
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
    const canShowSidePanel =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches &&
      isHumanThread;
    setShowDealContext(canShowSidePanel);
  }, [activeThreadId, isHumanThread]);

  const createRequestFromChat = useCallback(
    async (payload: ChatRequestDraft) => {
      if (!accessToken) {
        router.push(`/login?next=${encodeURIComponent("/chat")}`);
        return;
      }
      setCreatingRequest(true);
      try {
        const res = await apiMutateJson<{ request?: { id?: string } }>(
          "/api/requests",
          "POST",
          payload,
          accessToken,
        );
        const newId = String(res?.request?.id || "").trim();
        if (!newId) {
          router.push("/marketplace");
          return;
        }
        try {
          const chatRes = await apiMutateJson<{ id?: string; conversationId?: string }>(
            "/api/chat",
            "POST",
            {
              type: "human",
              title: payload.title,
              subtitle: "Brief posted",
              metadata: {
                source: "quick-brief-wizard-v1",
                requestId: newId,
                requestTitle: payload.title,
                chatType: "request_brief",
              },
            },
            accessToken,
          );
          const newChatId = String(chatRes?.id || chatRes?.conversationId || "").trim();
          if (newChatId) {
            const briefBody = [
              `New brief: ${payload.title}`,
              payload.desc,
              `Budget: ${payload.budget}`,
              payload.successCriteria ? `Success criteria: ${payload.successCriteria}` : "",
              "Free next steps:",
              "- Compare specialist bids here before paying.",
              "- Keep scope, files, and decisions in this deal room.",
              "- This brief is broadcast to BrandForge plus configured Discord and Telegram matching channels.",
              "- Fund escrow only when you are ready to continue with a specialist.",
            ]
              .filter(Boolean)
              .join("\n\n");
            await apiMutateJson(
              `/api/chats/${encodeURIComponent(newChatId)}/messages`,
              "POST",
              { content: briefBody },
              accessToken,
            );
            router.push(`/chat/${encodeURIComponent(newChatId)}`);
            return;
          }
        } catch {
          // Fallback to request page if chat room could not be created.
        }
        router.push(`/requests/${encodeURIComponent(newId)}`);
      } finally {
        setCreatingRequest(false);
      }
    },
    [accessToken, router],
  );

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
        <div ref={streamRef} className={cn("flex-1 overflow-y-auto scroll-smooth px-4", showComposer ? "py-6" : "py-3")}>
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
              onCreateRequestFromChat={createRequestFromChat}
              creatingRequest={creatingRequest}
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

        {showComposer ? (
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
            errorToast={errorToast}
          />
        ) : null}
      </div>

      {isHumanThread && showDealContext ? (
        <DealRoomContextSidebar
          recipientLabel={activeHumanRecipient?.label || "Deal room"}
          messageCount={messages.filter((m) => m.role !== "system").length}
          lastActivity={messages[messages.length - 1]?.createdAt || null}
          progress={dealProgress}
          onChatDeposit={startChatDeposit}
          depositBusy={depositBusy}
          chatId={activeThreadId || undefined}
          dealContext={dealContext}
        />
      ) : null}
    </div>
  );
}
