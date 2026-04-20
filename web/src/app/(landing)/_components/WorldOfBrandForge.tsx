"use client";

import { useState } from "react";

const worldPreviews: Record<string, JSX.Element> = {
  marketplace: (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">design_services</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Logo Design</p>
            <p className="text-xs text-on-surface-variant">AI-powered • 24h delivery</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-primary">$500</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">code</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Full-Stack Dev</p>
            <p className="text-xs text-on-surface-variant">React + Node • Squad</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-primary">$2.5K</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary">campaign</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Marketing Strategy</p>
            <p className="text-xs text-on-surface-variant">AI Agent • Instant</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-primary">$800</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-success text-sm">check_circle</span>
        <span>Smart Match: 98% match found for &quot;Web Design&quot;</span>
      </div>
    </div>
  ),
  "deal-rooms": (
    <div className="space-y-3 p-4">
      <div className="text-center mb-4">
        <span className="text-xs text-on-surface-variant uppercase tracking-wide">Project: Website Redesign</span>
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">JD</span>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-surface-container-high/50 rounded-tl-none">
          <p className="text-sm text-on-surface">Can you deliver in 2 weeks?</p>
          <p className="text-xs text-on-surface-variant mt-1">Just now</p>
        </div>
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-secondary">ME</span>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-secondary/10 rounded-tr-none">
          <p className="text-sm text-on-surface">Yes! My AI agents will assist. Final price: $3,000</p>
          <p className="text-xs text-on-surface-variant mt-1">Just now</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-success/10 rounded-lg">
        <span className="material-symbols-outlined text-success text-sm">check_circle</span>
        <span className="text-xs text-success font-medium">Deal closed • Payment in escrow</span>
      </div>
    </div>
  ),
  arena: (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50 border-l-4 border-primary">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-warning text-xl">emoji_events</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Design Sprint Championship</p>
            <p className="text-xs text-on-surface-variant">Ends in 2 days • 1,240 participants</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">$10K</p>
          <p className="text-xs text-success">+500 Honor</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-surface-container-high/30">
          <p className="text-xs text-on-surface-variant">Your Rank</p>
          <p className="text-lg font-bold text-primary">#42</p>
        </div>
        <div className="p-2 rounded-lg bg-surface-container-high/30">
          <p className="text-xs text-on-surface-variant">Honor</p>
          <p className="text-lg font-bold text-secondary">2.4K</p>
        </div>
        <div className="p-2 rounded-lg bg-surface-container-high/30">
          <p className="text-xs text-on-surface-variant">Conquest</p>
          <p className="text-lg font-bold text-tertiary">850</p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-amber-500 text-sm">stars</span>
        <span>Next tier: Duelist (3K Honor needed)</span>
      </div>
    </div>
  ),
  squads: (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/50">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-surface flex items-center justify-center">
              <span className="text-xs text-primary font-bold">A</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-surface flex items-center justify-center">
              <span className="text-xs text-secondary font-bold">B</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-success/30 border-2 border-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-success">smart_toy</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">Alpha Squad</p>
            <p className="text-xs text-on-surface-variant">8 members • 5 AI agents</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Active</span>
      </div>
      <div className="p-3 rounded-lg bg-surface-container-high/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-on-surface-variant">Current Project</span>
          <span className="text-xs text-success">75% complete</span>
        </div>
        <p className="text-sm font-medium text-on-surface">E-commerce Platform</p>
        <div className="mt-2 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-success rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          12 Projects Done
        </span>
        <span className="flex items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">trophy</span>
          3 Championships
        </span>
      </div>
    </div>
  ),
};

const worlds = [
  {
    id: "marketplace",
    title: "Marketplace",
    icon: "storefront",
    description: "Post a brief or browse specialists. Ranked by verified outcomes, not self-promotion.",
    color: "from-blue-500/20 to-cyan-500/20",
    features: ["Verified specialist directory", "Outcome-based ranking", "Smart matching"],
  },
  {
    id: "deal-rooms",
    title: "Deal Rooms",
    icon: "chat",
    description: "Negotiate, review bids, and close deals in one thread. AI drafts. You decide.",
    color: "from-purple-500/20 to-pink-500/20",
    features: ["One-click contracts", "Escrow & milestones", "AI-assisted negotiation"],
  },
  {
    id: "arena",
    title: "The Index",
    icon: "emoji_events",
    description: "Your reputation, calculated from verified on-platform activity. Portable. Exportable. Trusted.",
    color: "from-amber-500/20 to-orange-500/20",
    features: ["Close rate & reliability", "Verified client reviews", "Portable Chronicle"],
  },
  {
    id: "squads",
    title: "Teams",
    icon: "groups",
    description: "Assemble specialists and AI agents into teams that execute full-scope projects.",
    color: "from-emerald-500/20 to-teal-500/20",
    features: ["Human + AI specialists", "Project-matched teams", "End-to-end delivery"],
  },
];

export function WorldOfBrandForge() {
  const [activeWorld, setActiveWorld] = useState("marketplace");
  const world = worlds.find((w) => w.id === activeWorld) || worlds[0];

  return (
    <section id="explore-world" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label !mb-4">Platform</p>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            One platform. Four workflows.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Find work, close it, deliver it, and build a reputation the market actually trusts.
          </p>
        </div>

        {/* World Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {worlds.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveWorld(w.id)}
              className={`p-6 rounded-xl border transition-all duration-300 text-left ${
                activeWorld === w.id
                  ? "bg-surface-container-high border-primary shadow-lg shadow-primary/10"
                  : "bg-surface-container-low border-outline-variant hover:border-outline"
              }`}
            >
              <span
                className={`material-symbols-outlined text-3xl mb-3 ${
                  activeWorld === w.id ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {w.icon}
              </span>
              <h3
                className={`font-headline font-semibold ${
                  activeWorld === w.id ? "text-on-surface" : "text-on-surface-variant"
                }`}
              >
                {w.title}
              </h3>
            </button>
          ))}
        </div>

        {/* Active World Detail */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${world.color} border border-outline-variant p-8 sm:p-12`}
        >
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">{world.icon}</span>
                <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
                  {world.title}
                </h3>
              </div>
              <p className="text-lg text-on-surface-variant mb-6">{world.description}</p>
              <ul className="space-y-3">
                {world.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-success text-lg">check_circle</span>
                    <span className="text-on-surface font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl bg-surface border border-outline-variant shadow-2xl overflow-hidden">
                {worldPreviews[world.id]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
