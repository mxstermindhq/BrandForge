"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PlansShowcaseProps {
  selectedPlan?: string | null;
}

const individualPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    subtitle: "Start Building",
    blurb: "Free for everyone",
    features: [
      "Post briefs and receive offers",
      "Chat, negotiate, and sign contracts in one place",
      "Access the AI copilot for drafts and summaries",
      "Escrow-secured payments",
      "Build your Chronicle (verified delivery record)",
      "Join the BrandForge community",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    id: "starter",
    name: "Pro",
    subtitle: "For serious builders",
    price: "$13",
    period: "Per month billed monthly. No commitment · Cancel anytime",
    blurb: "Everything in Free, plus:",
    features: [
      "Multi-seat team access",
      "Custom contract templates",
      "Advanced AI copilot features",
      "Unlimited active deal rooms",
      "Priority matching with top specialists",
      "Enhanced Chronicle and ranking tools",
    ],
    cta: "Choose Pro",
    popular: false,
  },
  {
    id: "architect",
    name: "Max",
    subtitle: "For teams that operate at scale",
    price: "$29",
    period: "Per month billed monthly. No commitment · Cancel anytime",
    blurb: "Everything in Pro, plus:",
    features: [
      "White-label options",
      "API access",
      "Dedicated account manager",
      "Crypto treasury + Stripe escrow",
      "Custom onboarding",
      "Early access to new platform features",
      "Priority support at all times",
    ],
    cta: "Choose Max",
    popular: true,
  },
];

const teamEnterprisePlans = [
  {
    id: "scale",
    name: "Team",
    subtitle: "Built for internal teams",
    price: "Custom",
    period: "Annual contracts available",
    blurb: "Everything in Max, plus:",
    features: ["Workspace permissions", "Shared billing", "Team analytics", "Priority onboarding"],
    cta: "Talk to us",
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Security and procurement ready",
    price: "Custom",
    period: "Volume and compliance plans",
    blurb: "Everything in Team, plus:",
    features: ["SSO and audit controls", "Custom legal workflows", "Dedicated success lead", "Procurement support"],
    cta: "Contact sales",
    popular: false,
  },
];

export function PlansShowcase({ selectedPlan }: PlansShowcaseProps = {}) {
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);
  const [segment, setSegment] = useState<"individual" | "team">("individual");

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
  }: {
    tier: (typeof individualPlans)[0] | (typeof teamEnterprisePlans)[0];
  }) {
    return (
      <div
        id={`plan-${tier.id}`}
        className={`relative rounded-xl border p-5 transition-all hover:shadow-md ${
          "popular" in tier && tier.popular
            ? "border-primary bg-surface-container-high shadow-md shadow-primary/10"
            : "border-outline-variant bg-surface hover:border-outline"
        } ${highlightedPlan === tier.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
      >
        {"popular" in tier && tier.popular ? (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-on-primary">Popular</span>
          </div>
        ) : null}
        <h3 className="font-headline text-lg font-semibold text-on-surface">{tier.name}</h3>
        <p className="mt-1 text-xs font-medium text-on-surface-variant">{tier.subtitle}</p>
        <div className="mt-2 flex flex-col items-start gap-0.5">
          <span className="text-2xl font-bold text-on-surface">{tier.price}</span>
          {tier.period ? <span className="text-xs text-on-surface-variant">{tier.period}</span> : null}
        </div>
        <p className="mt-2 text-xs text-on-surface-variant">{tier.blurb}</p>
        <ul className="mt-4 space-y-2 text-sm">
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
            "popular" in tier && tier.popular ? "btn-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
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
          <p className="mx-auto mt-2 max-w-lg text-sm text-on-surface-variant">Choose your plan by account type.</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border border-outline-variant bg-surface-container p-1">
            <button
              type="button"
              onClick={() => setSegment("individual")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                segment === "individual" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setSegment("team")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                segment === "team" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Team & Enterprise
            </button>
          </div>
        </div>

        <div className={`mb-8 grid gap-4 ${segment === "individual" ? "sm:grid-cols-3" : "mx-auto max-w-3xl sm:grid-cols-2"}`}>
          {(segment === "individual" ? individualPlans : teamEnterprisePlans).map((tier) => (
            <PlanCard key={tier.id} tier={tier} />
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
