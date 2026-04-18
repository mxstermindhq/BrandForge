"use client";

import { useCallback, useEffect, useState } from "react";

type AgentTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  price_monthly: number;
  sales_count: number;
  avg_roi_generated: number;
  rating: number;
  agency: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    current_tier: string;
  };
};

const CATEGORIES: { id: string; label: string; materialIcon: string }[] = [
  { id: "all", label: "All agents", materialIcon: "apps" },
  { id: "seo", label: "SEO & content", materialIcon: "search" },
  { id: "ads", label: "Advertising", materialIcon: "campaign" },
  { id: "email", label: "Email & CRM", materialIcon: "mail" },
  { id: "prospecting", label: "B2B prospecting", materialIcon: "person_search" },
  { id: "automation", label: "Automation", materialIcon: "auto_awesome" },
];

function tierTextClass(tier: string): string {
  const t = tier.toLowerCase();
  if (t === "undisputed") return "text-[color:var(--tier-undisputed,#a78bfa)]";
  if (t === "gladiator") return "text-[color:var(--tier-gladiator,#f59e0b)]";
  if (t === "duelist") return "text-[color:var(--tier-duelist,#94a3b8)]";
  if (t === "rival") return "text-[color:var(--tier-rival,#cd7f32)]";
  return "text-on-surface-variant";
}

export function AgentMarketplace() {
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (cat: string) => {
    setLoading(true);
    setErr(null);
    try {
      const q = new URLSearchParams();
      q.set("category", cat);
      const r = await fetch(`/api/agents/marketplace?${q.toString()}`, { credentials: "include" });
      const j = (await r.json()) as { data?: AgentTemplate[]; error?: string };
      if (!r.ok) throw new Error(j.error || r.statusText);
      setAgents(Array.isArray(j.data) ? j.data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load marketplace");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(category);
  }, [category, load]);

  const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString()}/mo`;

  return (
    <div>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 whitespace-nowrap transition-colors ${
              category === cat.id
                ? "border-primary bg-primary/15 text-on-surface"
                : "border-outline-variant/60 bg-surface-container text-on-surface-variant hover:border-outline"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{cat.materialIcon}</span>
            <span className="font-headline text-sm font-600">{cat.label}</span>
          </button>
        ))}
      </div>

      {err ? (
        <p className="text-error font-body text-sm" role="alert">
          {err}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-container-low h-64 animate-pulse rounded-xl border border-outline-variant/40" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <p className="text-on-surface-variant font-body text-sm">
          No public agent templates yet. Apply the Supabase migration{" "}
          <code className="text-xs">20260413_agent_infrastructure.sql</code> and refresh.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border-outline-variant/60 bg-surface-container overflow-hidden rounded-xl border transition-colors hover:border-primary/35"
            >
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[24px]">{agent.icon}</span>
                  </div>
                  <div className="bg-surface-container-high flex items-center gap-1 rounded-lg px-2 py-1">
                    <span className="material-symbols-outlined text-on-surface-variant text-[14px]">
                      trending_up
                    </span>
                    <span className="font-headline text-on-surface text-xs font-600">
                      {agent.avg_roi_generated}% ROI
                    </span>
                  </div>
                </div>

                <h3 className="font-headline text-on-surface mb-2 text-lg font-700">{agent.name}</h3>
                <p className="text-on-surface-variant font-body mb-4 line-clamp-2 text-sm">
                  {agent.description || "—"}
                </p>

                <div className="text-on-surface-variant mb-4 flex items-center gap-4 font-body text-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                    {agent.sales_count} sales
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    {agent.rating.toFixed(1)}
                  </span>
                </div>

                <div className="bg-surface-container-low flex items-center gap-3 rounded-lg p-3">
                  {agent.agency.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={agent.agency.avatar_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-surface-container-highest flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="font-headline text-xs font-700">
                        {agent.agency.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-on-surface truncate text-sm font-600">
                      {agent.agency.display_name}
                    </p>
                    <p
                      className={`font-headline text-xs font-600 uppercase tracking-wider ${tierTextClass(agent.agency.current_tier)}`}
                    >
                      {agent.agency.current_tier}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-outline-variant/40 flex items-center justify-between border-t px-5 py-4">
                <span className="font-headline text-on-surface text-xl font-700">
                  {formatPrice(agent.price_monthly)}
                </span>
                <button
                  type="button"
                  className="btn-primary font-headline rounded-lg px-4 py-2 text-sm font-600"
                  disabled
                  title="Deployments — coming next"
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
