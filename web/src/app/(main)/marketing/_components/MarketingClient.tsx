"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useBootstrap } from "@/hooks/useBootstrap";
import { apiFetch } from "@/lib/api";

type ChannelId = "manual" | "x" | "linkedin" | "substack";

type Draft = {
  id: string;
  channel: ChannelId;
  body: string;
  updatedAt: string;
};

const PROVIDER_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  substack: "Substack",
};

const DRAFTS_KEY = "mx-marketing-drafts";
const CHANNEL_TABS = [
  { id: "manual" as const, label: "Manual copy" },
  { id: "x" as const, label: "X" },
  { id: "linkedin" as const, label: "LinkedIn" },
  { id: "substack" as const, label: "Substack" },
];

function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((d) => d && typeof d === "object")
      .map((d) => d as Draft)
      .filter((d) => d.id && d.body != null && d.channel);
  } catch {
    return [];
  }
}

function saveDrafts(list: Draft[]) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(list.slice(0, 24)));
  } catch {
    /* quota / private mode */
  }
}

function newDraftId() {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MarketingClient() {
  const { data } = useBootstrap();
  const socialConnections = (
    (data?.socialConnections as { provider?: string; display_name?: string | null; status?: string }[]) ?? []
  ).filter((c) => c.status === "active");

  const composerId = useId();
  const composerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [channel, setChannel] = useState<ChannelId>("manual");
  const [body, setBody] = useState("");
  const [draftId, setDraftId] = useState<string>(() => newDraftId());
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [apiOk, setApiOk] = useState(true);
  const [copyErr, setCopyErr] = useState<string | null>(null);
  const [scheduleHint, setScheduleHint] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(loadDrafts().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)));
  }, []);

  const persistDraft = useCallback((next: { id: string; channel: ChannelId; body: string }) => {
    const row: Draft = {
      id: next.id,
      channel: next.channel,
      body: next.body,
      updatedAt: new Date().toISOString(),
    };
    setDrafts((prev) => {
      const others = prev.filter((d) => d.id !== row.id);
      const merged = [row, ...others].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      saveDrafts(merged);
      return merged;
    });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!body.trim()) return;
      persistDraft({ id: draftId, channel, body });
    }, 400);
    return () => window.clearTimeout(t);
  }, [body, channel, draftId, persistDraft]);

  const channelLabel = useMemo(() => CHANNEL_TABS.find((c) => c.id === channel)?.label ?? channel, [channel]);

  const measureLatency = useCallback(async () => {
    const t0 = performance.now();
    try {
      // Same path as apiFetch elsewhere: dev uses same-origin `/api/*` → Next rewrites to Node (avoids CORS to :3000).
      const { ok } = await apiFetch<unknown>("/api/marketplace-stats", { method: "GET", cache: "no-store" });
      setApiOk(ok);
      setPingMs(Math.round(performance.now() - t0));
    } catch {
      setApiOk(false);
      setPingMs(null);
    }
  }, []);

  useEffect(() => {
    void measureLatency();
    const id = window.setInterval(() => void measureLatency(), 30_000);
    return () => window.clearInterval(id);
  }, [measureLatency]);

  function scrollToComposer() {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startNewDraft() {
    setDraftId(newDraftId());
    setBody("");
    setChannel("manual");
    setCopyErr(null);
    setScheduleHint(null);
    queueMicrotask(() => bodyRef.current?.focus());
  }

  function openDraft(d: Draft) {
    setDraftId(d.id);
    setChannel(d.channel);
    setBody(d.body);
    setCopyErr(null);
    setScheduleHint(null);
    scrollToComposer();
  }

  async function copyBody() {
    setCopyErr(null);
    const text = body.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setCopyErr("Clipboard blocked. Select text and copy manually, or retry.");
    }
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-2 md:px-8 md:pt-4">
      <div
        role="status"
        className="border-amber-500/30 bg-amber-500/[0.08] mb-8 rounded-2xl border px-4 py-4 md:px-6 md:py-5"
      >
        <p className="font-headline text-amber-200/95 text-[10px] font-black uppercase tracking-[0.2em]">
          Under development
        </p>
        <p className="text-on-surface mt-2 max-w-3xl text-sm leading-relaxed md:text-[15px]">
          Marketing distribution is not production-ready: scheduling, API sends, and channel automation are still being
          built. Drafts below save only in this browser — nothing is published to LinkedIn, X, or other networks from
          here yet.
        </p>
      </div>

      <header className="flex flex-col gap-6 border-b border-outline-variant/15 pb-10 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="font-headline text-secondary text-[10px] font-black uppercase tracking-[0.28em]">
            Marketing · Distribution
          </p>
          <h1 className="font-display bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl lg:text-[2.75rem]">
            Amplify your reach
          </h1>
          <p className="text-on-surface-variant max-w-xl text-sm font-light leading-relaxed md:text-base">
            Preview-only composer for now. When this ships, you&apos;ll connect accounts under{" "}
            <Link href="/settings?tab=social" className="text-secondary font-semibold hover:underline">
              Settings → Social media
            </Link>{" "}
            and approve each send.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={startNewDraft}
            className="border-outline-variant/40 text-on-surface font-headline hover:border-primary/45 min-h-[52px] rounded-xl border bg-transparent px-5 text-xs font-black uppercase tracking-wider transition-colors"
          >
            New draft
          </button>
          <button
            type="button"
            onClick={scrollToComposer}
            className="bg-primary-container text-on-primary-container font-headline shadow-glow flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-xs font-black uppercase tracking-wider transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden>
              rocket_launch
            </span>
            Open composer
          </button>
        </div>
      </header>

      <section className="border-outline-variant/20 bg-surface-container-low/35 mt-10 rounded-2xl border p-6 md:p-8">
        <h2 className="font-display text-on-surface text-lg font-bold">Connected channels</h2>
        {socialConnections.length === 0 ? (
          <p className="text-on-surface-variant mt-1 text-sm font-light">
            None yet.{" "}
            <Link href="/settings?tab=social" className="text-secondary font-bold hover:underline">
              Connect LinkedIn or X
            </Link>{" "}
            to enable posting (with your explicit approval per send).
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {socialConnections.map((c) => {
              const id = String(c.provider || "");
              const label = PROVIDER_LABEL[id] || id;
              return (
                <li
                  key={id}
                  className="border-outline-variant/15 flex items-center justify-between rounded-xl border bg-surface-container-high/30 px-4 py-3"
                >
                  <div>
                    <p className="font-headline text-on-surface text-sm font-bold">{label}</p>
                    {c.display_name ? (
                      <p className="text-on-surface-variant mt-0.5 text-xs">{c.display_name}</p>
                    ) : null}
                  </div>
                  <span className="text-secondary font-headline text-[10px] font-black uppercase tracking-wider">
                    Ready
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {drafts.length > 0 ? (
        <section className="border-outline-variant/20 bg-surface-container-low/25 mt-8 rounded-2xl border p-6 md:p-8" aria-label="Draft queue">
          <h2 className="font-display text-on-surface text-lg font-bold">Draft queue</h2>
          <p className="text-on-surface-variant mt-1 text-xs">
            Most recent first. Selecting a draft loads it in the composer.
          </p>
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto scrollbar-thin md:max-h-72">
            {drafts.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => openDraft(d)}
                  className={`hover:bg-surface-container-high/50 w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    d.id === draftId ? "border-primary/40 bg-primary/5" : "border-outline-variant/15 bg-surface-container-high/20"
                  }`}
                >
                  <span className="text-on-surface line-clamp-1 text-sm font-medium">
                    {d.body.trim().slice(0, 72) || "(Empty draft)"}
                  </span>
                  <span className="text-on-surface-variant mt-1 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wider">
                    <span>{CHANNEL_TABS.find((c) => c.id === d.channel)?.label ?? d.channel}</span>
                    <span>·</span>
                    <time dateTime={d.updatedAt}>{new Date(d.updatedAt).toLocaleString()}</time>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <section
          ref={composerRef}
          id="marketing-composer"
          className="border-outline-variant/20 bg-surface-container-low/35 scroll-mt-24 rounded-2xl border p-6 md:p-8"
          aria-label="Content composer"
        >
          <h2 className="font-display text-on-surface text-lg font-bold">Composer</h2>
          <p className="text-on-surface-variant mt-1 text-xs">
            Channel tabs set intent for when scheduling is wired to the API.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CHANNEL_TABS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannel(c.id)}
                className={`font-headline min-h-[44px] rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  channel === c.id
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 bg-surface-container-high/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label
            htmlFor={`${composerId}-body`}
            className="mt-5 block font-headline text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
          >
            Message
          </label>
          <textarea
            ref={bodyRef}
            id={`${composerId}-body`}
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Announce a drop, share a case study, or paste your thread draft."
            className="border-outline-variant/35 bg-surface-container-high/50 focus:border-primary/50 text-on-surface placeholder:text-on-surface-variant/50 mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
          />
          {copyErr ? (
            <div className="border-error/40 bg-error-container/15 mt-4 rounded-xl border px-4 py-3" role="alert">
              <p className="text-error text-sm">{copyErr}</p>
              <button
                type="button"
                onClick={() => void copyBody()}
                className="text-secondary font-headline mt-2 text-xs font-bold uppercase tracking-wider underline"
              >
                Retry copy
              </button>
            </div>
          ) : null}
          {scheduleHint ? (
            <div className="border-outline-variant/30 bg-surface-container-high/40 mt-4 rounded-xl border px-4 py-3 text-sm text-on-surface" role="status">
              {scheduleHint}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setScheduleHint(
                  "Scheduling is not connected in this build. Save drafts here; API wiring will use the same channel intent.",
                )
              }
              className="font-headline bg-primary-container text-on-primary-container min-h-[48px] rounded-xl px-5 text-[10px] font-black uppercase tracking-wider shadow-ambient transition-all hover:brightness-110"
            >
              Schedule send
            </button>
            <button
              type="button"
              onClick={() => void copyBody()}
              className="font-headline border-outline-variant/40 text-on-surface hover:border-primary/45 min-h-[48px] rounded-xl border bg-transparent px-5 text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
          <p className="text-on-surface-variant mt-3 text-[10px]">
            Drafts autosave to this browser ({draftId.slice(0, 12)}…).
          </p>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Feed-style preview">
          <h2 className="font-display text-on-surface mb-3 text-lg font-bold">Preview</h2>
          <p className="text-on-surface-variant mb-4 text-xs">Plain preview — matches feed card width and tone.</p>
          <article
            className={`surface-card border-outline-variant/10 hover:border-outline-variant/25 border-l-[3px] pl-5 transition-[border-color] duration-200 motion-reduce:transition-none ${
              channel === "linkedin"
                ? "border-l-secondary/50 bg-secondary/5"
                : "border-l-primary/45 bg-primary/5"
            } max-w-xl`}
          >
            <div className="flex gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-container-high ring-1 ring-outline-variant/20">
                <span className="text-primary flex h-full items-center justify-center font-headline text-sm font-bold">
                  You
                </span>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-wider">
                  {channelLabel} · Draft
                </p>
                <p className="text-on-surface whitespace-pre-wrap text-sm leading-relaxed">
                  {body.trim() || "Your message will appear here — write in the composer."}
                </p>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <div className="border-outline-variant/25 bg-surface-container-high/90 fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border px-4 py-2.5 text-[10px] shadow-ambient backdrop-blur-md md:gap-x-6 md:px-6">
        <span className="text-on-surface-variant font-mono">
          API latency {pingMs != null ? `${pingMs}ms` : "—"}
        </span>
        <span className="text-on-surface-variant hidden sm:inline">·</span>
        <span className={`font-headline font-black uppercase tracking-wider ${apiOk ? "text-secondary" : "text-error"}`}>
          {apiOk ? "API reachable" : "API unreachable"}
        </span>
      </div>
    </div>
  );
}
