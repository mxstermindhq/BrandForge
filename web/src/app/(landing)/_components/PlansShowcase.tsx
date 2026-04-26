"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PlansShowcaseProps {
  selectedPlan?: string | null;
}

const mainPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    blurb: "Solo workspace",
    features: ["Public profile", "List & bid", "Deal rooms"],
    cta: "Start free",
    popular: false,
  },
  {
    id: "starter",
    name: "Pro",
    price: "$29",
    period: "/mo",
    blurb: "Growing pipeline",
    features: ["Everything in Free", "Higher AI limits", "Visibility boosts"],
    cta: "Choose Pro",
    popular: false,
  },
  {
    id: "architect",
    name: "Max",
    price: "$79",
    period: "/mo",
    blurb: "Power sellers",
    features: ["Everything in Pro", "Team seats", "Priority support"],
    cta: "Choose Max",
    popular: true,
  },
];

const orgPlans = [
  {
    id: "scale",
    name: "Team",
    price: "Custom",
    blurb: "Shared pipeline & roles",
    features: ["Volume pricing", "Admin tools", "Slack-style handoffs"],
    cta: "Talk to us",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    blurb: "Compliance & procurement",
    features: ["SSO / audit", "Custom contracts", "Dedicated CSM"],
    cta: "Contact sales",
  },
];

export function PlansShowcase({ selectedPlan }: PlansShowcaseProps = {}) {
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlan) return;
    setHighlightedPlan(selectedPlan);
    const scrollTimer = window.setTimeout(() => {
      const el = document.getElementById(`plan-${selectedPlan}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-2", "ring-primary", "ring-offset-2");
      window.setTimeout(() => {
        el?.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 3000);
    }, 400);
    return () => window.clearTimeout(scrollTimer);
  }, [selectedPlan]);

  function PlanCard({
    tier,
    compact,
  }: {
    tier: (typeof mainPlans)[0] | (typeof orgPlans)[0];
    compact?: boolean;
  }) {
    const isOrg = !("popular" in tier);
    return (
      <div
        id={`plan-${tier.id}`}
        className={`relative rounded-xl border p-5 transition-all hover:shadow-md ${
          !isOrg && "popular" in tier && tier.popular
            ? "border-primary bg-surface-container-high shadow-md shadow-primary/10"
            : "border-outline-variant bg-surface hover:border-outline"
        } ${highlightedPlan === tier.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
      >
        {!isOrg && "popular" in tier && tier.popular ? (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-on-primary">Popular</span>
          </div>
        ) : null}
        <h3 className="font-headline text-lg font-semibold text-on-surface">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-on-surface">{tier.price}</span>
          {"period" in tier && tier.period ? (
            <span className="text-xs text-on-surface-variant">{tier.period}</span>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-on-surface-variant">{tier.blurb}</p>
        <ul className={`mt-4 space-y-2 ${compact ? "text-xs" : "text-sm"}`}>
          {tier.features.map((f, i) => (
            <li key={i} className="flex gap-2 text-on-surface">
              <span className="material-symbols-outlined shrink-0 text-sm text-success">check</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link
          href={tier.id === "enterprise" ? "mailto:hello@brandforge.gg?subject=Enterprise%20plan" : `/login?plan=${tier.id}`}
          className={`mt-5 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${
            !isOrg && "popular" in tier && tier.popular ? "btn-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          {tier.cta}
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-surface-container-low px-6 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="section-label !mb-3">Explore Plans</p>
          <h2 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">Individual, Team and Enterprise</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-on-surface-variant">Free, Pro, and Max for individuals. Team and Enterprise when you scale.</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {mainPlans.map((tier) => (
            <PlanCard key={tier.id} tier={tier} />
          ))}
        </div>

        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Team and Enterprise</p>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {orgPlans.map((tier) => (
            <PlanCard key={tier.id} tier={tier} compact />
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-[11px] leading-relaxed text-on-surface-variant/90">
          *Usage limits apply. Prices shown don&apos;t include applicable tax. Prices and plans are subject to change at
          BrandForge&apos;s discretion.
        </p>
      </div>
    </section>
  );
}
