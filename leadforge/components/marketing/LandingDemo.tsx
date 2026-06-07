"use client";

import { useEffect, useState } from "react";
import { CHANNEL_META } from "@/lib/constants";

type DemoPhase = "input" | "analyze" | "profile" | "scrape";

const DEMO_URL = "brandforge.gg";
const CYCLE_MS = 9000;

const MOCK_ICP = {
  company: "BrandForge",
  oneLiner:
    "Bootstrapped SaaS founders and indie hackers who need design, dev, and growth in one fixed-price engagement.",
  confidence: 82,
  titles: ["Solo Founder", "Indie Hacker", "Digital Operator"],
  signals: [
    "looking for a developer",
    "need a landing page",
    "recommend a dev agency",
    "building my MVP",
  ],
};

const MOCK_LEADS = [
  {
    platform: "linkedin",
    name: "Alex Chen",
    title: "Solo Founder · Pre-seed SaaS",
    score: 91,
    email: "alex@startup.io",
  },
  {
    platform: "reddit",
    name: "u/buildinpublic_dev",
    title: "r/SaaS · asking for agency recs",
    score: 87,
    email: "",
  },
  {
    platform: "twitter",
    name: "@indie_mvp",
    title: "Need dev partner for launch",
    score: 84,
    email: "founder@gmail.com",
  },
  {
    platform: "google",
    name: "Nova Labs",
    title: "Pre-launch · contact page",
    score: 79,
    email: "hello@novalabs.co",
  },
];

const PHASE_LABELS: Record<DemoPhase, string> = {
  input: "1 · Paste your site",
  analyze: "2 · AI analyzes buyers",
  profile: "3 · Perfect buyer profile",
  scrape: "4 · Scrape every platform",
};

const PHASES: DemoPhase[] = ["input", "analyze", "profile", "scrape"];

export function LandingDemo(): React.JSX.Element {
  const [phase, setPhase] = useState<DemoPhase>("input");
  const [typed, setTyped] = useState("");
  const [leadCount, setLeadCount] = useState(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhaseIndex((i) => {
        const next = (i + 1) % PHASES.length;
        setPhase(PHASES[next]);
        if (PHASES[next] === "input") {
          setTyped("");
          setLeadCount(0);
        }
        return next;
      });
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase !== "input") return;
    if (typed.length >= DEMO_URL.length) return;
    const t = setTimeout(() => {
      setTyped(DEMO_URL.slice(0, typed.length + 1));
    }, 80);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "scrape") return;
    setLeadCount(0);
    const timers = MOCK_LEADS.map((_, i) =>
      setTimeout(() => setLeadCount(i + 1), 600 + i * 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPhase(p);
                setActivePhaseIndex(i);
                if (p === "input") {
                  setTyped("");
                  setLeadCount(0);
                }
              }}
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide transition ${
                phase === p
                  ? "border-gold/40 bg-gold-bg text-gold"
                  : "border-border text-tx-muted hover:border-border-hover"
              }`}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-tx-muted">Live preview · loops automatically</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-border bg-bg-raised px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-3 font-mono text-[10px] text-tx-muted">leadforge.app/search</span>
        </div>

        <div className="grid min-h-[420px] gap-0 lg:grid-cols-5">
          <div className="border-b border-border p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] uppercase tracking-widest text-tx-muted">Your website</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2.5">
              <span className="text-tx-muted">https://</span>
              <span className="font-mono text-sm text-tx">
                {phase === "input" ? typed : DEMO_URL}
                {phase === "input" && typed.length < DEMO_URL.length && (
                  <span className="animate-pulse text-gold">|</span>
                )}
              </span>
            </div>

            {(phase === "analyze" || phase === "profile" || phase === "scrape") && (
              <div className="mt-4 animate-fade-up space-y-2">
                <div className="flex items-center gap-2 text-xs text-tx-muted">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                  {phase === "analyze" ? "Reading site & inferring buyers..." : "Analysis complete"}
                </div>
                {phase !== "analyze" && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600/80">
                      Ideal buyer
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-tx">{MOCK_ICP.oneLiner}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {MOCK_ICP.signals.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-400"
                        >
                          &ldquo;{s}&rdquo;
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase === "input" && typed.length === DEMO_URL.length && (
              <button
                type="button"
                className="mt-4 w-full rounded-lg bg-gold py-2 text-xs font-semibold text-bg"
              >
                Analyze website →
              </button>
            )}
          </div>

          <div className="p-5 lg:col-span-3">
            {phase === "input" && typed.length < DEMO_URL.length && (
              <div className="flex h-full flex-col items-center justify-center text-center text-tx-muted">
                <p className="font-display text-2xl font-light text-tx/40">Paste. Analyze. Scrape.</p>
                <p className="mt-2 max-w-xs text-xs">Watch the demo cycle — or click a step above.</p>
              </div>
            )}

            {phase === "analyze" && (
              <div className="flex h-full flex-col justify-center space-y-3">
                {["Homepage", "Pricing", "Services", "About"].map((page, i) => (
                  <div
                    key={page}
                    className="animate-fade-up flex items-center gap-3 rounded-lg border border-border bg-bg px-3 py-2"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-gold/60 transition-all duration-1000"
                        style={{ width: `${60 + i * 10}%` }}
                      />
                    </span>
                    <span className="font-mono text-[10px] text-tx-muted">{page}</span>
                  </div>
                ))}
              </div>
            )}

            {(phase === "profile" || phase === "scrape") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-tx-muted">
                    {phase === "scrape" ? "Leads streaming in" : "Buyer profile ready"}
                  </p>
                  {phase === "profile" && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                      {MOCK_ICP.confidence}% confidence
                    </span>
                  )}
                  {phase === "scrape" && (
                    <span className="font-mono text-[10px] text-gold">
                      {leadCount} / ∞ platforms
                    </span>
                  )}
                </div>

                {phase === "profile" && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg border border-border bg-bg p-2">
                      <p className="text-[9px] text-tx-muted">Titles</p>
                      <p className="mt-0.5 text-tx">{MOCK_ICP.titles.join(", ")}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-bg p-2">
                      <p className="text-[9px] text-tx-muted">Company</p>
                      <p className="mt-0.5 text-tx">{MOCK_ICP.company}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-bg p-2">
                      <p className="text-[9px] text-tx-muted">Intent signals</p>
                      <p className="mt-0.5 text-tx">{MOCK_ICP.signals.length} phrases</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {MOCK_LEADS.slice(0, phase === "profile" ? 0 : leadCount).map((lead, i) => {
                    const meta = CHANNEL_META[lead.platform];
                    return (
                      <div
                        key={lead.name}
                        className="animate-fade-up flex items-center gap-3 rounded-lg border border-border bg-bg px-3 py-2.5"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase"
                          style={{
                            color: meta.color,
                            backgroundColor: `${meta.color}18`,
                          }}
                        >
                          {meta.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-tx">{lead.name}</p>
                          <p className="truncate text-[10px] text-tx-muted">{lead.title}</p>
                        </div>
                        {lead.email && (
                          <span className="hidden rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400 sm:inline">
                            {lead.email}
                          </span>
                        )}
                        <span className="font-mono text-xs text-gold">{lead.score}</span>
                      </div>
                    );
                  })}
                </div>

                {phase === "scrape" && leadCount >= MOCK_LEADS.length && (
                  <p className="animate-fade-up pt-2 text-center font-mono text-[10px] text-tx-muted">
                    + LinkedIn, Reddit, X, Google, Instagram, TikTok, YouTube, Open Web…
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1">
        {PHASES.map((p, i) => (
          <span
            key={p}
            className={`h-1 rounded-full transition-all duration-500 ${
              activePhaseIndex === i ? "w-6 bg-gold" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
