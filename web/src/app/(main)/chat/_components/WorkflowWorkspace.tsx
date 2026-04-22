"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Send,
  Sparkles,
  UserPlus,
  Users,
  WandSparkles,
} from "lucide-react";
import { apiGetJson } from "@/lib/api";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { safeImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/AuthProvider";

type ChatMode = "human" | "ai" | "agents";

type ThreadRow = {
  id?: string;
  t?: string;
  s?: string;
  lastMessageAt?: string | null;
  hasUnread?: boolean;
};

type ThreadMessage = {
  id?: string;
  content?: string;
  sender_id?: string | null;
  created_at?: string;
};

type ProfileRow = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
};

const MODE_OPTIONS: Array<{
  id: ChatMode;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}> = [
  {
    id: "human",
    label: "Chat with humans",
    description: "Marketplace conversations start from bids or offers.",
    icon: MessageSquare,
  },
  {
    id: "ai",
    label: "Ask AI",
    description: "Use a model directly in the same workspace.",
    icon: Sparkles,
  },
  {
    id: "agents",
    label: "Plan with agents",
    description: "Assemble specialist agents around the request.",
    icon: BriefcaseBusiness,
  },
];

const MODEL_OPTIONS = [
  "GPT-5.4",
  "GPT-5.4 Mini",
  "Claude Sonnet",
  "Gemini Pro",
];

const AGENT_OPTIONS = [
  "No agent",
  "CRO Agent",
  "Launch Agent",
  "Research Agent",
  "Copy Agent",
];

const FALLBACK_THREADS: ThreadRow[] = [
  { id: "offer-landing", t: "Landing page offer", s: "Offer sent for homepage rebuild", lastMessageAt: new Date().toISOString() },
  { id: "bid-refresh", t: "Site refresh bid", s: "Bid needs response", lastMessageAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "agency-sequence", t: "Email sequence bid", s: "Waiting on offer terms", lastMessageAt: new Date(Date.now() - 7200000).toISOString() },
];

const SUGGESTIONS: Record<
  ChatMode,
  Array<{ title: string; body: string; cta: string; href?: string }>
> = {
  human: [
    {
      title: "Start from a bid",
      body: "Human chats are attached to marketplace bids so both sides can negotiate from a real request.",
      cta: "Open marketplace",
      href: "/marketplace",
    },
    {
      title: "Turn a bid into an offer",
      body: "Draft the offer terms, scope, and timing before you invite the other person into the thread.",
      cta: "Prepare offer",
    },
    {
      title: "Invite a teammate",
      body: "Bring another user into the same chat when you need a closer, designer, or project lead.",
      cta: "Invite users",
    },
  ],
  ai: [
    {
      title: "Draft a homepage fast",
      body: "Use the selected model to draft copy, CTA structure, and landing-page sections from one prompt.",
      cta: "Generate draft",
    },
    {
      title: "Summarize the marketplace context",
      body: "Ask AI to turn bids, offers, and notes into one clean brief before you reply.",
      cta: "Create summary",
    },
    {
      title: "Write better replies",
      body: "Generate reply options for human chats without leaving the thread.",
      cta: "Suggest replies",
    },
  ],
  agents: [
    {
      title: "Plan an agent lane",
      body: "Split the work into research, copy, design, and launch steps in one coordinated plan.",
      cta: "Build plan",
    },
    {
      title: "Send tasks to specialists",
      body: "Pick an agent for the thread, keep the marketplace context, and decide what humans still own.",
      cta: "Assign agent",
    },
    {
      title: "Prepare handoff to humans",
      body: "Use the same plan to hand work back to real users once the agent work is ready.",
      cta: "Create handoff",
    },
  ],
};

function relativeTime(value: string | null | undefined) {
  if (!value) return "now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function displayName(profile: ProfileRow) {
  return profile.full_name || profile.username || "BrandForge user";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function WorkflowWorkspace({ threadId }: { threadId?: string }) {
  const { accessToken, session } = useAuth();
  const { data: bootstrap } = useBootstrap();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [mode, setMode] = useState<ChatMode>(threadId ? "human" : "ai");
  const [composerText, setComposerText] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [selectedAgent, setSelectedAgent] = useState(AGENT_OPTIONS[0]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);

  const threads = useMemo(() => {
    const rows = getSortedHumanThreads(bootstrap?.humanChats) as ThreadRow[];
    return rows.length ? rows : FALLBACK_THREADS;
  }, [bootstrap?.humanChats]);

  const activeThread = useMemo(
    () => threads.find((thread) => String(thread.id) === String(threadId)) || threads[0] || null,
    [threadId, threads],
  );

  const candidateProfiles = useMemo(() => {
    const raw = (Array.isArray(bootstrap?.profiles) ? bootstrap?.profiles : []) as ProfileRow[];
    return raw.filter((profile) => String(profile.id || "") !== String(session?.user?.id || ""));
  }, [bootstrap?.profiles, session?.user?.id]);

  useEffect(() => {
    setMode(threadId ? "human" : "ai");
  }, [threadId]);

  useEffect(() => {
    if (!threadId || !accessToken) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await apiGetJson<{ messages?: ThreadMessage[] }>(
          `/api/chat/${encodeURIComponent(threadId)}?limit=6`,
          accessToken,
        );
        if (!cancelled) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch {
        if (!cancelled) setMessages([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [threadId, accessToken]);

  const modeConfig = MODE_OPTIONS.find((option) => option.id === mode) || MODE_OPTIONS[0];
  const promptSeed = useMemo(() => {
    if (mode === "human") {
      return activeThread?.t || "Reply to this bid or offer";
    }
    if (mode === "agents") {
      return "Plan a launch workflow with specialist agents";
    }
    return "Ask AI to draft or improve the landing page";
  }, [activeThread?.t, mode]);

  const syncedNote = useMemo(() => {
    if (mode === "human") {
      if (messages.length) return `Loaded ${messages.length} recent messages from this marketplace thread.`;
      return "Human chats should start from marketplace bids or offers.";
    }
    if (mode === "agents") {
      return `Selected agent: ${selectedAgent}. Keep humans in the loop for marketplace handoff.`;
    }
    return `Selected model: ${selectedModel}. Use the same chatbox for drafting and revisions.`;
  }, [messages.length, mode, selectedAgent, selectedModel]);

  const invitedPeople = useMemo(
    () =>
      candidateProfiles.filter((profile) => selectedInviteIds.includes(String(profile.id || ""))),
    [candidateProfiles, selectedInviteIds],
  );

  const inviteSummary =
    invitedPeople.length > 0 ?
      `${invitedPeople.length} invited`
    : "Invite users";

  const toggleInvite = (profileId: string) => {
    setSelectedInviteIds((current) =>
      current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId],
    );
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#0a0d16] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(90,83,255,0.12),transparent_28%),linear-gradient(180deg,#0a0d16_0%,#090c14_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[#11141d]/88 px-5 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-violet-400/20 bg-violet-500/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                  {mode === "human" ? "Human" : mode === "agents" ? "Agents" : "AI"}
                </span>
                {threadId ? (
                  <span className="text-xs text-white/36">{relativeTime(activeThread?.lastMessageAt)}</span>
                ) : null}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {threadId ? activeThread?.t || "Marketplace chat" : "New chat"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
                {modeConfig.description} The marketplace stays in the loop, human chats stay tied to bids and offers, and the same thread can still use models and agents.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/78 transition hover:bg-white/[0.08]"
              >
                <UserPlus className="h-4 w-4" />
                {inviteSummary}
              </button>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/78">
                <Sparkles className="h-4 w-4" />
                <select
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className="bg-transparent outline-none"
                >
                  {MODEL_OPTIONS.map((modelOption) => (
                    <option key={modelOption} value={modelOption} className="bg-[#11141d] text-white">
                      {modelOption}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-white/34" />
              </label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/78">
                <BriefcaseBusiness className="h-4 w-4" />
                <select
                  value={selectedAgent}
                  onChange={(event) => setSelectedAgent(event.target.value)}
                  className="bg-transparent outline-none"
                >
                  {AGENT_OPTIONS.map((agentOption) => (
                    <option key={agentOption} value={agentOption} className="bg-[#11141d] text-white">
                      {agentOption}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-white/34" />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm transition",
                    active ?
                      "border-violet-400/26 bg-violet-500/[0.14] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/64 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </header>

        <section className="rounded-[32px] border border-violet-400/18 bg-[#11141d]/92 p-5 shadow-[0_32px_90px_rgba(0,0,0,0.36)] backdrop-blur sm:p-6">
          <div className="rounded-[28px] border border-violet-400/28 bg-[linear-gradient(180deg,#151927_0%,#111522_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/34">
                  {mode === "human" ? "Marketplace thread" : mode === "agents" ? "Agent planning lane" : "AI chatbox"}
                </p>
                <p className="mt-2 text-sm text-white/54">{syncedNote}</p>
              </div>
              {threadId ? (
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50">
                  {activeThread?.s || "Connected to live thread"}
                </div>
              ) : null}
            </div>

            <textarea
              value={composerText}
              onChange={(event) => setComposerText(event.target.value)}
              placeholder={promptSeed}
              className="min-h-[160px] w-full resize-none bg-transparent text-[20px] font-medium leading-8 text-white outline-none placeholder:text-white/28"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/72 transition hover:bg-white/[0.08]">
                  <Paperclip className="h-4 w-4" />
                  Attach
                </button>
                {mode === "human" ? (
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/72 transition hover:bg-white/[0.08]"
                  >
                    <Users className="h-4 w-4" />
                    Marketplace
                  </Link>
                ) : null}
                {mode !== "human" ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/60">
                    <Bot className="h-4 w-4" />
                    {mode === "agents" ? selectedAgent : selectedModel}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_16px_40px_rgba(108,76,255,0.42)] transition hover:scale-[1.02]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {SUGGESTIONS[mode].map((card) => (
            card.href ? (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-[28px] border border-white/8 bg-[#11141d]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition hover:border-violet-400/24 hover:bg-[#141826]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/[0.14] text-violet-100">
                  <WandSparkles className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/58">{card.body}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
                  {card.cta}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ) : (
              <button
                key={card.title}
                type="button"
                onClick={() => {
                  if (card.cta === "Invite users") {
                    setInviteOpen(true);
                    return;
                  }
                  setComposerText(card.title);
                }}
                className="group rounded-[28px] border border-white/8 bg-[#11141d]/90 p-5 text-left shadow-[0_22px_60px_rgba(0,0,0,0.24)] transition hover:border-violet-400/24 hover:bg-[#141826]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/[0.14] text-violet-100">
                  <WandSparkles className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/58">{card.body}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
                  {card.cta}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </button>
            )
          ))}
        </section>
      </div>

      {inviteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-[#10141f] p-5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/34">Invite people</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  Add users to this chat
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Invite other users into the same chat, keep the marketplace context, and use the same workspace for AI or agents when needed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/66 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {candidateProfiles.length > 0 ? (
                candidateProfiles.slice(0, 10).map((profile) => {
                  const profileId = String(profile.id || "");
                  const checked = selectedInviteIds.includes(profileId);
                  const name = displayName(profile);
                  const avatar = safeImageSrc(profile.avatar_url);
                  return (
                    <button
                      key={profileId || name}
                      type="button"
                      onClick={() => toggleInvite(profileId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition",
                        checked ?
                          "border-violet-400/26 bg-violet-500/[0.12]"
                        : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.06] text-sm font-semibold text-white">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                            unoptimized
                          />
                        ) : (
                          initials(name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{name}</p>
                        <p className="mt-1 truncate text-xs text-white/42">
                          {profile.headline || profile.username || "Marketplace user"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border",
                          checked ? "border-violet-300 bg-violet-400 text-[#0d1020]" : "border-white/14 text-transparent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-sm text-white/46">
                  No additional users are available in bootstrap data yet, but the invite flow is ready for marketplace profiles.
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <p className="text-sm text-white/48">
                {selectedInviteIds.length > 0 ?
                  `${selectedInviteIds.length} user${selectedInviteIds.length === 1 ? "" : "s"} selected`
                : "Select users to invite"}
              </p>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_36px_rgba(108,76,255,0.36)]"
              >
                Confirm invites
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
