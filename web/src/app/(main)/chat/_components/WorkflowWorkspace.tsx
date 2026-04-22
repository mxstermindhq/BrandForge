"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Copy,
  FlaskConical,
  Mic,
  MoreHorizontal,
  Paperclip,
  PenTool,
  Rocket,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { apiGetJson } from "@/lib/api";
import { cn } from "@/lib/cn";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useAuth } from "@/providers/AuthProvider";

type ThreadRow = {
  id?: string;
  t?: string;
  lastMessageAt?: string | null;
};

type ThreadMessage = {
  id?: string;
  content?: string;
  sender_id?: string | null;
  created_at?: string;
};

const fallbackThreads: ThreadRow[] = [
  { id: "draft-landing", t: "Build me a landing page", lastMessageAt: new Date().toISOString() },
  { id: "site-convert", t: "My site doesn't convert", lastMessageAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "email-sequence", t: "Create an email sequence", lastMessageAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "lead-gen", t: "Automate my lead gen", lastMessageAt: new Date(Date.now() - 86400000).toISOString() },
];

const planChecklist = [
  "Hero section with strong headline",
  "Services and feature stack",
  "Social proof and testimonials",
  "CTA with fast next action",
  "FAQ and objections handling",
  "Footer with clear conversion paths",
];

const actionColumns = [
  {
    title: "AI Actions",
    tint: "from-emerald-500/16 via-emerald-400/6 to-transparent",
    border: "border-emerald-500/18",
    icon: Sparkles,
    items: [
      { label: "Generate full page", meta: "5 credits" },
      { label: "Create images", meta: "3 credits" },
      { label: "Write copy variations", meta: "2 credits" },
    ],
  },
  {
    title: "Human Actions",
    tint: "from-amber-500/14 via-amber-300/6 to-transparent",
    border: "border-amber-500/18",
    icon: PenTool,
    items: [
      { label: "Hire Designer", meta: "from €80" },
      { label: "Hire Copywriter", meta: "from €60" },
      { label: "Get feedback", meta: "from €40" },
    ],
  },
  {
    title: "Agent Actions",
    tint: "from-sky-500/14 via-sky-300/6 to-transparent",
    border: "border-sky-500/18",
    icon: Rocket,
    items: [
      { label: "Deploy website", meta: "€20" },
      { label: "Connect domain", meta: "€10" },
      { label: "Run SEO audit", meta: "€25" },
    ],
  },
];

const suggestions = [
  { icon: WandSparkles, title: "Convert more visitors", subtitle: "Run CRO Agent", price: "€25" },
  { icon: PenTool, title: "Improve UX", subtitle: "Hire UX Expert", price: "€90" },
  { icon: FlaskConical, title: "Set up A/B test", subtitle: "A/B Test Agent", price: "€40" },
];

const collaboratorStyles = [
  "from-fuchsia-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-lime-500",
];

function shortTimeLabel(value: string | null | undefined) {
  if (!value) return "just now";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function initials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function WorkflowWorkspace({ threadId }: { threadId?: string }) {
  const { accessToken, session } = useAuth();
  const { data: bootstrap } = useBootstrap();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [recentActivity, setRecentActivity] = useState([
    { title: "AI generated the draft", time: "2m ago" },
    { title: "Generated a conversion checklist", time: "7m ago" },
  ]);

  const liveThreads = useMemo(() => {
    const rows = getSortedHumanThreads(bootstrap?.humanChats) as ThreadRow[];
    return rows.length ? rows : fallbackThreads;
  }, [bootstrap?.humanChats]);

  const activeThread = useMemo(
    () => liveThreads.find((thread) => String(thread.id) === String(threadId)) || liveThreads[0],
    [liveThreads, threadId],
  );

  useEffect(() => {
    if (!threadId || !accessToken) {
      setMessages([]);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoadingMessages(true);
      try {
        const data = await apiGetJson<{ messages?: ThreadMessage[] }>(
          `/api/chat/${encodeURIComponent(threadId)}?limit=8`,
          accessToken,
        );
        if (!cancelled) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [threadId, accessToken]);

  const promptTitle = useMemo(() => {
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => String(message.sender_id || "") === String(session?.user?.id || ""));
    const latestContent =
      typeof latestUserMessage?.content === "string" ? latestUserMessage.content.trim() : "";
    return latestContent || activeThread?.t || "Build me a landing page for my agency";
  }, [activeThread?.t, messages, session?.user?.id]);

  const promptSummary = useMemo(() => {
    if (loadingMessages) return "Syncing the latest thread context.";
    if (messages.length) return `Thread synced with ${messages.length} recent messages.`;
    return "Execution Engine";
  }, [loadingMessages, messages.length]);

  const heroCopy = useMemo(() => {
    return {
      eyebrow: activeThread?.t ? "Live workspace" : "New brief",
      subhead:
        "We turn scattered requests into one execution lane with the plan, preview, people, and deployment actions in the same view.",
    };
  }, [activeThread?.t]);

  const topCollaborators = useMemo(() => {
    const emailName = session?.user?.email?.split("@")[0] || "owner";
    return [{ label: emailName }, { label: "Maya" }, { label: "Theo" }, { label: "Iris" }];
  }, [session?.user?.email]);

  const pipeline = useMemo(
    () => [
      { title: "Landing Page Draft", lane: "AI", status: "Done", tint: "emerald" },
      { title: "Design Upgrade", lane: "Human", status: threadId ? "In Progress" : "Queued", tint: "blue" },
      { title: "Copywriting", lane: "Human", status: "Pending", tint: "amber" },
      { title: "Deployment", lane: "Agent", status: "Pending", tint: "violet" },
    ],
    [threadId],
  );

  const sendComposer = () => {
    const trimmed = composerText.trim();
    if (!trimmed) return;
    setRecentActivity((current) => [{ title: `Queued "${trimmed}"`, time: "now" }, ...current.slice(0, 3)]);
    setComposerText("");
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#090b12] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(121,92,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(36,114,255,0.12),transparent_24%),linear-gradient(180deg,#090b12_0%,#070910_100%)]" />
      <div className="relative mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 py-5 sm:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_318px]">
        <section className="min-w-0 rounded-[30px] border border-white/8 bg-[#0d1018]/90 p-4 shadow-[0_32px_100px_rgba(0,0,0,0.42)] backdrop-blur xl:p-6">
          <header className="mb-5 flex flex-col gap-4 border-b border-white/7 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                  {activeThread?.t || "New Chat"}
                </h1>
                {threadId ? (
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-200">
                    Live
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-white/55">{promptSummary}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                {topCollaborators.map((person, index) => (
                  <div
                    key={person.label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br text-xs font-semibold text-white shadow-lg",
                      collaboratorStyles[index % collaboratorStyles.length],
                      index > 0 ? "-ml-2.5" : "",
                    )}
                    title={person.label}
                  >
                    {initials(person.label)}
                  </div>
                ))}
              </div>
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/8">
                Invite
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/8">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="rounded-[28px] border border-violet-400/22 bg-[#131721] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <textarea
              value={promptTitle}
              readOnly
              className="min-h-[70px] w-full resize-none bg-transparent text-lg font-medium leading-7 text-white outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                {[
                  { label: "Attach", icon: Paperclip },
                  { label: "Voice", icon: Mic },
                  { label: "Inspiration", icon: Sparkles },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/7 bg-white/[0.04] px-3.5 py-2 text-white/75 transition hover:bg-white/[0.07]"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_16px_40px_rgba(108,76,255,0.45)] transition hover:scale-[1.02]">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-[0_14px_32px_rgba(108,76,255,0.42)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <span className="font-semibold text-white">AI Assistant</span>
                <span>{shortTimeLabel(activeThread?.lastMessageAt)}</span>
              </div>
              <p className="max-w-3xl text-[15px] leading-7 text-white/80">
                I mapped the request into one execution board so we can move from prompt to launch
                without switching screens. The plan, draft preview, and action stack are ready below.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.6fr]">
            <article className="rounded-[26px] border border-white/8 bg-[#11151f] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">1. Plan</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">Execution checklist</h2>
                </div>
                <button className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/55 transition hover:bg-white/[0.07]">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-3">
                {planChecklist.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3.5 py-3 text-sm text-white/78">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="overflow-hidden rounded-[26px] border border-violet-400/18 bg-[#11151f] p-5 shadow-[0_20px_60px_rgba(6,8,15,0.46)]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">2. Draft</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">Preview lane</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/58">
                    A high-contrast landing system that mirrors the prompt and keeps the conversion
                    story focused.
                  </p>
                </div>
                <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                  Preview
                </span>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
                <div className="flex flex-col justify-between rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,#11151f_0%,#0d1018_100%)] p-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-violet-200/70">
                      {heroCopy.eyebrow}
                    </p>
                    <h3 className="mt-3 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-white">
                      We help brands grow{" "}
                      <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                        faster
                      </span>{" "}
                      with digital.
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-white/62">{heroCopy.subhead}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_36px_rgba(108,76,255,0.38)]">
                      Get started
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/78 transition hover:bg-white/[0.05]">
                      See our work
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-[#0c1018] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#090b12] shadow-[0_18px_44px_rgba(0,0,0,0.38)]">
                    <div className="relative min-h-[270px] overflow-hidden border-b border-white/6 px-6 py-6">
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(125,89,255,0.38),transparent_58%)]" />
                      <div className="absolute right-6 top-6 h-36 w-36 rounded-full bg-violet-500/12 blur-3xl" />
                      <div className="relative z-10 max-w-[250px]">
                        <p className="text-xs uppercase tracking-[0.18em] text-violet-200/70">Agency</p>
                        <h4 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.05em] text-white">
                          We help brands grow <span className="text-violet-300">faster</span> with digital.
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-white/58">
                          Web systems, conversion design, and launch support in one ship-ready lane.
                        </p>
                        <div className="mt-5 flex gap-2">
                          <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white">
                            Get Started
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/72">
                            See our work
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 bg-[#f4f1ec] px-4 py-4 text-slate-900">
                      {["Brand", "Web", "Growth", "Launch"].map((item) => (
                        <div key={item} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-semibold">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <article className="mt-5 rounded-[26px] border border-white/8 bg-[#11151f] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)]">
            <div className="flex flex-col gap-1 border-b border-white/7 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">3. Actions</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">What do you want to do next?</h2>
              </div>
              <p className="text-sm text-white/45">Move from draft to launch without leaving the thread.</p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {actionColumns.map(({ title, tint, border, icon: Icon, items }) => (
                <div
                  key={title}
                  className={cn(
                    "rounded-[24px] border bg-[linear-gradient(180deg,#11151f_0%,#0d1018_100%)] p-4",
                    border,
                  )}
                >
                  <div className={cn("rounded-[20px] bg-gradient-to-br p-4", tint)}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{title}</h3>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-white/7 bg-[#141925]/80 px-3.5 py-3 text-sm"
                        >
                          <span className="text-white/82">{item.label}</span>
                          <span className="text-white/48">{item.meta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="mt-5 flex flex-col gap-4">
            <p className="text-xs text-white/38">AI can make mistakes. Review important details before launch.</p>

            <div className="rounded-[26px] border border-white/8 bg-[#0f131d] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <div className="flex flex-col gap-4">
                <input
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendComposer();
                    }
                  }}
                  placeholder="Ask anything or request an action..."
                  className="w-full bg-transparent text-lg text-white outline-none placeholder:text-white/28"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/58">
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/7 bg-white/[0.03] px-3.5 py-2 transition hover:bg-white/[0.05]">
                      <Paperclip className="h-4 w-4" />
                      Attach
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/7 bg-white/[0.03] px-3.5 py-2 transition hover:bg-white/[0.05]">
                      <Sparkles className="h-4 w-4" />
                      Prompt library
                    </button>
                  </div>
                  <button
                    onClick={sendComposer}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_16px_40px_rgba(108,76,255,0.45)] transition hover:scale-[1.02]"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[26px] border border-white/8 bg-[#0d1018]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Task Pipeline</h2>
              <button className="text-sm text-violet-300 transition hover:text-violet-200">View all</button>
            </div>
            <div className="space-y-3">
              {pipeline.map((step) => (
                <div
                  key={step.title}
                  className={cn(
                    "rounded-[22px] border px-4 py-3",
                    step.tint === "emerald" && "border-emerald-500/18 bg-emerald-500/[0.07]",
                    step.tint === "blue" && "border-sky-500/18 bg-sky-500/[0.07]",
                    step.tint === "amber" && "border-amber-500/18 bg-amber-500/[0.08]",
                    step.tint === "violet" && "border-violet-500/18 bg-violet-500/[0.08]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{step.title}</p>
                      <p className="mt-1 text-xs text-white/45">{step.lane}</p>
                    </div>
                    <span className="text-xs font-medium text-white/58">{step.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/8 bg-[#0d1018]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Suggested for you</h2>
              <button className="text-sm text-white/35 transition hover:text-white/70">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {suggestions.map(({ icon: Icon, title, subtitle, price }) => (
                <div key={title} className="flex items-center gap-3 rounded-[22px] border border-white/7 bg-white/[0.03] px-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-violet-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-xs text-white/42">{subtitle}</p>
                  </div>
                  <span className="text-sm font-medium text-white">{price}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/8 bg-[#0d1018]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold tracking-[-0.03em] text-white">Payment & Credits</h2>
            <div className="space-y-3">
              <div className="rounded-[22px] border border-white/7 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/34">Credits balance</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">120</p>
                  </div>
                  <button className="rounded-xl bg-violet-500/18 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/26">
                    Top up
                  </button>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/7 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/34">Wallet balance</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">€48.50</p>
                  </div>
                  <button className="rounded-xl bg-white/[0.07] px-3 py-2 text-sm font-medium text-white/78 transition hover:bg-white/[0.1]">
                    Add funds
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-white/8 bg-[#0d1018]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Recent Activity</h2>
              <button className="text-sm text-violet-300 transition hover:text-violet-200">View all</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div key={`${entry.title}-${entry.time}`} className="flex items-center gap-3 rounded-[22px] border border-white/7 bg-white/[0.03] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_10px_24px_rgba(108,76,255,0.32)]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{entry.title}</p>
                    <p className="mt-1 text-xs text-white/42">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[22px] border border-white/7 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/34">Thread queue</p>
              <div className="mt-3 space-y-2">
                {liveThreads.slice(0, 4).map((thread) => (
                  <div key={String(thread.id)} className="flex items-center justify-between gap-3 rounded-2xl bg-[#131722] px-3 py-2.5 text-sm">
                    <span className="truncate text-white/78">{thread.t || "Conversation"}</span>
                    <span className="shrink-0 text-white/38">{shortTimeLabel(thread.lastMessageAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
