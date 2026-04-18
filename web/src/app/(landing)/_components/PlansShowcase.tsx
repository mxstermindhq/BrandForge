"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PlansShowcaseProps {
  selectedPlan?: string | null;
}

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start building your reputation. Perfect for getting your first clients.",
    features: [
      "Public profile & portfolio",
      "List services & bid on requests",
      "Deal rooms & messaging",
      "Milestones & reviews",
      "Season leaderboard access",
      "Honor & Conquest credits",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For solo specialists ready to grow their presence and win more deals.",
    features: [
      "Everything in Free",
      "Priority listing placement",
      "Honor-week visibility boost",
      "Email support",
      "Higher AI copilot limits",
      "Advanced analytics",
    ],
    cta: "Start Growing",
    popular: false,
  },
  {
    id: "architect",
    name: "Architect",
    price: "$79",
    period: "/month",
    description: "For power sellers juggling multiple clients and complex projects.",
    features: [
      "Everything in Starter",
      "Multi-seat team access",
      "Priority support",
      "Custom contract templates",
      "Advanced AI features",
      "Reduced platform fees",
    ],
    cta: "Scale Up",
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$199",
    period: "/month",
    description: "For studios and agencies with procurement needs and custom workflows.",
    features: [
      "Everything in Architect",
      "Stripe escrow & crypto treasury",
      "Admin & dispute tools",
      "White-label options",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PlansShowcase({ selectedPlan }: PlansShowcaseProps = {}) {
  const [annual, setAnnual] = useState(false);
  const [highlightedPlan, setHighlightedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPlan) {
      setHighlightedPlan(selectedPlan);
      // Scroll to the selected plan card
      setTimeout(() => {
        const planCard = document.getElementById(`plan-${selectedPlan}`);
        if (planCard) {
          planCard.scrollIntoView({ behavior: "smooth", block: "center" });
          planCard.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            planCard.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 3000);
        }
      }, 500);
    }
  }, [selectedPlan]);

  const getPrice = (tier: typeof tiers[0]) => {
    if (tier.id === "free") return "$0";
    if (annual) {
      const yearlyPrice = tier.id === "starter" ? 290 : tier.id === "architect" ? 790 : 1990;
      return `$${Math.round(yearlyPrice / 12)}`;
    }
    return tier.price;
  };

  const getPeriod = (tier: typeof tiers[0]) => {
    if (tier.id === "free") return "forever";
    return annual ? "/month (billed annually)" : "/month";
  };

  return (
    <section className="py-28 px-6 sm:px-8 lg:px-12 bg-surface-container-low">
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Pricing
          </span>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label !mb-6">Simple Pricing</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-on-surface mb-6">
            Start Free. Scale As You Grow.
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Every plan includes our core marketplace features. No hidden fees. 
            Upgrade when you&apos;re ready to accelerate.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 bg-surface-container-high rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annual
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                annual
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-success">Save ~17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              id={`plan-${tier.id}`}
              key={tier.id}
              className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                tier.popular
                  ? "bg-surface-container-high border-primary shadow-lg shadow-primary/10"
                  : "bg-surface border-outline-variant hover:border-outline"
              } ${highlightedPlan === tier.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-on-primary">
                    <span className="material-symbols-outlined text-sm">star</span>
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="font-headline font-semibold text-on-surface mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-on-surface">{getPrice(tier)}</span>
                  <span className="text-sm text-on-surface-variant">{getPeriod(tier)}</span>
                </div>
                <p className="mt-3 text-sm text-on-surface-variant">{tier.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-success text-sm mt-0.5">
                      check
                    </span>
                    <span className="text-sm text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/login?plan=${tier.id}`}
                className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-all ${
                  tier.popular
                    ? "btn-primary"
                    : "btn-secondary bg-surface-container-high hover:bg-surface-container-high"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">verified</span>
            <span>No credit card required for Free</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">sync</span>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-success">lock</span>
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  );
}
