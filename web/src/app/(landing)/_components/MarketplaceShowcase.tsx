"use client";

import Link from "next/link";

const realms = [
  {
    id: "marketplace",
    title: "The Marketplace",
    icon: "storefront",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
    description: "Offer services or request what you need. AI-powered matching connects buyers and sellers.",
    stats: [
      { label: "Active requests", value: "1.2K" },
      { label: "Services", value: "850" },
    ],
    preview: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container-high/50">
          <span className="material-symbols-outlined text-primary text-sm">design_services</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface">Logo Design</p>
            <p className="text-[10px] text-on-surface-variant">500 Honor</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-success" />
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container-high/50">
          <span className="material-symbols-outlined text-secondary text-sm">code</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface">Web Development</p>
            <p className="text-[10px] text-on-surface-variant">1.2K Honor</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-success" />
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container-high/50">
          <span className="material-symbols-outlined text-tertiary text-sm">campaign</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface">Marketing Campaign</p>
            <p className="text-[10px] text-on-surface-variant">800 Honor</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-success" />
        </div>
      </div>
    ),
  },
  {
    id: "deal-rooms",
    title: "Deal Rooms",
    icon: "chat",
    color: "from-secondary/20 to-secondary/5",
    borderColor: "border-secondary/30",
    description: "Negotiate, collaborate, and close deals in private, secure chat rooms.",
    stats: [
      { label: "Active deals", value: "324" },
      { label: "Closed today", value: "48" },
    ],
    preview: (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] text-primary font-bold">JD</span>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-surface-container-high/50 rounded-tl-none">
            <p className="text-xs text-on-surface">Interested in the logo package?</p>
          </div>
        </div>
        <div className="flex gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-[10px] text-secondary font-bold">ME</span>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-secondary/10 rounded-tr-none">
            <p className="text-xs text-on-surface">Yes, can we do 400 Honor?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] text-primary font-bold">JD</span>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-surface-container-high/50 rounded-tl-none">
            <p className="text-xs text-on-surface">Deal! 🤝</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "arena",
    title: "The Arena",
    icon: "emoji_events",
    color: "from-tertiary/20 to-tertiary/5",
    borderColor: "border-tertiary/30",
    description: "Compete in challenges, climb the ranks, and prove your skills against the best.",
    stats: [
      { label: "Active challenges", value: "56" },
      { label: "Prize pool", value: "50K" },
    ],
    preview: (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-surface-container-high/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">trophy</span>
            <span className="text-xs font-medium text-on-surface">Design Sprint</span>
          </div>
          <span className="text-xs text-primary font-bold">2.5K</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-surface-container-high/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-sm">code</span>
            <span className="text-xs font-medium text-on-surface">Hackathon</span>
          </div>
          <span className="text-xs text-primary font-bold">5K</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-surface-container-high/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-sm">campaign</span>
            <span className="text-xs font-medium text-on-surface">Marketing Battle</span>
          </div>
          <span className="text-xs text-primary font-bold">1K</span>
        </div>
        <div className="mt-2 p-2 rounded bg-gradient-to-r from-primary/20 to-transparent">
          <p className="text-[10px] text-center text-primary font-medium">
            🏆 3 days remaining
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "squads",
    title: "Outcome Squads",
    icon: "groups",
    color: "from-success/20 to-success/5",
    borderColor: "border-success/30",
    description: "Form squads with AI agents and professionals. Execute projects end-to-end.",
    stats: [
      { label: "Active squads", value: "128" },
      { label: "Members", value: "2.4K" },
    ],
    preview: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container-high/50">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary/30 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] text-primary">A</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-secondary/30 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] text-secondary">B</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-tertiary/30 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] text-tertiary">+3</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface">Alpha Squad</p>
            <p className="text-[10px] text-on-surface-variant">6 members • 12 projects</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-surface-container-high/50">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-success/30 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] text-success">X</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-warning/30 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] text-warning">Y</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-on-surface">Beta Crew</p>
            <p className="text-[10px] text-on-surface-variant">4 members • 8 projects</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 p-2 rounded bg-success/10">
          <span className="material-symbols-outlined text-success text-sm">smart_toy</span>
          <p className="text-xs text-on-surface">5 AI Agents active</p>
        </div>
      </div>
    ),
  },
];

export function MarketplaceShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            Four Realms. Infinite Possibilities.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Navigate between the Marketplace, Deal Rooms, Arena, and Outcome Squads. 
            Each realm offers unique powers to accelerate your success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {realms.map((realm) => (
            <div
              key={realm.id}
              className={`group relative surface-card rounded-xl border ${realm.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${realm.color} opacity-50`} />
              
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {realm.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-on-surface">{realm.title}</h3>
                      <div className="flex gap-3 mt-1">
                        {realm.stats.map((stat, i) => (
                          <span key={i} className="text-xs text-on-surface-variant">
                            <span className="font-medium text-on-surface">{stat.value}</span> {stat.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-on-surface-variant mb-4">{realm.description}</p>

                {/* Preview Card */}
                <div className="bg-surface/80 backdrop-blur-sm rounded-lg p-3 border border-outline-variant/50 mb-4">
                  {realm.preview}
                </div>

                {/* CTA */}
                <Link
                  href={`/${realm.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
                >
                  Enter {realm.title}
                  <span className="material-symbols-outlined text-base group-hover/link:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
