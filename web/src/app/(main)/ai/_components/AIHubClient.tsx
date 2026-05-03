"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { Sparkles, MessageCircle, FileText, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";

type AIStatus = {
  chat: {
    configured: boolean;
    providerId: string;
    model: string;
    aiProviderEnv: string;
  };
  providers: Record<string, boolean>;
  image: { configured: boolean };
};

export function AIHubClient() {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiGetJson<AIStatus>("/api/ai/status", null);
        if (cancelled) return;
        setStatus(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unable to load AI status");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <PageRouteLoading title="AI Hub" subtitle="Checking AI services and tools." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-3xl border border-outline-variant bg-surface-container p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">AI Hub</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Your AI command center</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              One place to see what AI is configured, which models are ready, and which tools will help you move briefs, proposals, deals, and match-making faster.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-outline-variant bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">Chat model</p>
              <p className="mt-2 text-lg font-semibold text-on-surface">{status?.chat.model || "Unknown"}</p>
              <p className="mt-1 text-sm text-on-surface-variant">Provider: {status?.chat.providerId || "auto"}</p>
            </div>
            <div className="rounded-2xl border border-outline-variant bg-background p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-on-surface-variant">Provider status</p>
              <div className="mt-2 space-y-2 text-sm text-on-surface">
                <div className="flex items-center justify-between">
                  <span>Chat configured</span>
                  <span className={status?.chat.configured ? "text-emerald-400" : "text-rose-400"}>
                    {status?.chat.configured ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Image AI</span>
                  <span className={status?.image.configured ? "text-emerald-400" : "text-rose-400"}>
                    {status?.image.configured ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-700">
          <p className="font-semibold">AI status error</p>
          <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            title: "Brief Generator",
            icon: FileText,
            href: "/ai/brief-generator",
          },
          {
            title: "Proposal Writer",
            icon: TrendingUp,
            href: "/ai/proposal-writer",
          },
          {
            title: "Career Assistant",
            icon: Lightbulb,
            href: "/ai/career-assistant",
          },
          {
            title: "AI Chat",
            icon: MessageCircle,
            href: "/ai/chat",
          },
        ].map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-3xl border border-outline-variant bg-surface-container p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <tool.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-on-surface">{tool.title}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <span>Open tool</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant bg-surface-container p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Matching</p>
            <p className="mt-2 text-lg font-semibold text-on-surface">Smart Match funnel</p>
            <p className="mt-1 text-sm text-on-surface-variant">Scan briefs and specialists with AI so you can focus on the best deal first.</p>
          </div>
          <Link
            href="/marketplace?view=smart-match"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Start Smart Match
          </Link>
        </div>
      </div>
    </div>
  );
}
