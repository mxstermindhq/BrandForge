"use client";

import Link from "next/link";
import { useBootstrap } from "@/hooks/useBootstrap";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

type Run = {
  id?: string;
  title?: string;
  status?: string;
  model?: string;
  startedAt?: string;
};

export function AgentsClient() {
  const { data, err, loading } = useBootstrap();
  const runs = (data?.agentRuns as Run[]) ?? [];

  if (loading) {
    return <PageRouteLoading title="Loading agents" variant="inline" />;
  }

  if (err) {
    return (
      <p className="text-error" role="alert">
        {err}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted mt-1 text-sm">
            Recent runs from your workspace. Create and patch runs via{" "}
            <code className="text-xs">POST /api/agent-runs</code>.
          </p>
        </div>
        <Link
          href="/studio"
          className="bg-accent text-background inline-flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold hover:opacity-90"
        >
          Open Studio
        </Link>
      </header>

      {runs.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted text-sm">No agent runs yet.</p>
          <Link href="/studio" className="text-accent mt-3 inline-block text-sm font-semibold hover:underline">
            Start in Studio
          </Link>
        </div>
      ) : (
        <ul className="border-border divide-border divide-y rounded-xl border">
          {runs.map((r) => (
            <li key={String(r.id)} className="hover:bg-muted/15 px-4 py-4">
              <p className="font-medium">{r.title || "Agent run"}</p>
              <p className="text-muted mt-1 text-xs">
                {r.status} · {r.model}
                {r.startedAt ? ` · ${String(r.startedAt).slice(0, 19)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
