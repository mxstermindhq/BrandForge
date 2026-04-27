"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

const PlansFaq = dynamic(() => import("./PlansFaq").then((m) => ({ default: m.PlansFaq })), {
  loading: () => <PageRouteLoading title="Loading FAQ" variant="inline" />,
});

type Tier = {
  id: string;
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  highlights: string[];
  popular?: boolean;
};

/**
 * Copy matches shipped surface area: marketplace, profiles, messaging, credits/ledger, AI tools — not future Stripe SKUs.
 * Paid tier USD amounts must match `PLAN_SUBSCRIPTION_USD` in `src/server/platform-repository.js`.
 */
const tiers: Tier[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Prove pipeline on-platform: profile, listings, bids, delivery — wallet credits as implemented.",
    monthly: 0,
    yearly: 0,
    highlights: [
      "Public profile & portfolio (when enabled)",
      "Explore, search, and share discovery links",
      "List services, bid, message, and run project rooms",
      "Milestones, reviews, and ops summaries in-app",
      "Season leaderboard + credits per current policy",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    blurb: "Solo specialists who want stronger discovery when honor-week and placement flags are on.",
    monthly: 29,
    yearly: 290,
    highlights: [
      "Everything in Free",
      "Listing visibility & honor-week placement (when enabled)",
      "Email support",
      "Same API — limits follow server policy when billing is wired",
    ],
  },
  {
    id: "pro",
    name: "Architect",
    blurb: "High-volume sellers juggling bids, deliveries, and AI copilot — higher limits when quotas apply.",
    monthly: 79,
    yearly: 790,
    highlights: [
      "Everything in Starter",
      "Multi-seat coordination (productized when org billing lands)",
      "Operations / credit summaries in-app",
      "Higher AI copilot allowances when quotas are enforced per plan",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    blurb: "Studios needing procurement, compliance, and custom payout flows.",
    monthly: 199,
    yearly: 1990,
    highlights: [
      "Everything in Architect",
      "Stripe escrow & crypto treasury paths (as configured on the API)",
      "Admin workflows and dispute tooling (role-gated)",
      "Custom integrations — talk to us",
    ],
  },
];

function plansEntryFromQuery(raw: string | null): "growth" | "fab" | "direct" {
  const v = (raw || "").trim().toLowerCase();
  if (v === "growth" || v === "fab") return v;
  return "direct";
}

export function PlansClient() {
  const { session, accessToken } = useAuth();
  const searchParams = useSearchParams();
  const plansEntry = useMemo(() => plansEntryFromQuery(searchParams.get("from")), [searchParams]);
  const paidReturn = useMemo(() => (searchParams.get("paid") || "").trim().toLowerCase(), [searchParams]);
  const [annual, setAnnual] = useState(false);
  const [planCheckoutTierId, setPlanCheckoutTierId] = useState<string | null>(null);
  const [planPayError, setPlanPayError] = useState<string | null>(null);
  const prices = useMemo(
    () =>
      tiers.map((t) => {
        const isFree = t.monthly === 0 && t.yearly === 0;
        return {
          ...t,
          isFree,
          displayPrice: isFree ? null : annual ? t.yearly : t.monthly,
          suffix: isFree ? "" : annual ? "/yr" : "/mo",
        };
      }),
    [annual],
  );

  async function startPlanCryptoCheckout(tierId: string) {
    setPlanPayError(null);
    setPlanCheckoutTierId(tierId);
    try {
      const out = await apiMutateJson<{ checkoutLink?: string | null }>(
        "/api/plans/crypto-intent",
        "POST",
        { tierId, billingPeriod: annual ? "yearly" : "monthly" },
        accessToken,
      );
      const url = out && typeof out === "object" && out.checkoutLink ? String(out.checkoutLink).trim() : "";
      if (!url) throw new Error("Checkout link unavailable — confirm NOWPayments is configured on the API.");
      window.location.assign(url);
    } catch (e) {
      setPlanPayError(e instanceof Error ? e.message : "Could not start checkout.");
      setPlanCheckoutTierId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface" data-plans-entry={plansEntry}>
      <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {paidReturn === "1" ? (
          <p className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400 mb-6 rounded-xl border px-4 py-3 text-center text-sm">
            Payment successful! Welcome to BrandForge Pro.
          </p>
        ) : null}
        {paidReturn === "cancel" ? (
          <p className="mb-6 rounded-xl border border-outline-variant bg-surface-container text-on-surface-variant px-4 py-3 text-center text-sm">
            Checkout was cancelled. You can try again when you are ready.
          </p>
        ) : null}
        {planPayError ? (
          <p className="border-rose-500/50 bg-rose-500/10 text-rose-400 mb-6 rounded-xl border px-4 py-3 text-center text-sm">
            {planPayError}
          </p>
        ) : null}
        <header className="text-center">
          {plansEntry !== "direct" ? (
            <p id="plans-entry-attribution" className="sr-only">
              {plansEntry === "growth"
                ? "You opened Plans from the in-app growth banner."
                : "You opened Plans from the floating Plans button."}
            </p>
          ) : null}
          <div className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant">Plans</div>
          <h1 className="text-4xl font-bold tracking-tight" {...(plansEntry !== "direct" ? { "aria-describedby": "plans-entry-attribution" } : {})}>
            Simple pricing. No surprises.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Free to start. Upgrade when you need more.
          </p>

          <div className="relative mx-auto mt-10 flex h-12 w-[280px] rounded-full border border-outline-variant bg-surface-container p-1">
            <span
              className={`pointer-events-none absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                annual ? "left-[calc(50%+2px)]" : "left-1"
              }`}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`relative z-10 flex-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                !annual ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`relative z-10 flex-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                annual ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Yearly
            </button>
          </div>
        </header>

        <ul className="mt-14 grid list-none gap-6 md:grid-cols-2 xl:grid-cols-4">
          {prices.map((t) => {
            const isFeatured = Boolean(t.popular);
            return (
              <li
                key={t.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:border-outline ${
                  isFeatured
                    ? "border-primary/50 ring-2 ring-primary/20 md:scale-[1.02] bg-surface-container"
                    : "border-outline-variant bg-surface-container-low"
                }`}
              >
              {t.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary">
                  Most popular
                </span>
              ) : null}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                {t.name}
              </p>
              {t.isFree ? (
                <p className="mt-3 text-3xl font-bold tabular-nums">Free</p>
              ) : (
                <p className="mt-3 text-3xl font-bold tabular-nums">
                  ${t.displayPrice}
                  <span className="text-base font-normal text-on-surface-variant">{t.suffix}</span>
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-on-surface-variant">
                {t.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="font-bold text-primary">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
              {t.isFree ? (
                <Link
                  href="/login"
                  className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-outline-variant px-4 text-sm font-bold text-on-surface transition-all duration-300 hover:bg-surface-container"
                >
                  Start free
                </Link>
              ) : session ? (
                <div className="mt-8 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={Boolean(planCheckoutTierId)}
                    onClick={() => void startPlanCryptoCheckout(t.id)}
                    className={`inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-bold transition-all duration-300 disabled:opacity-60 ${
                      isFeatured
                        ? "bg-primary text-on-primary hover:opacity-90"
                        : "border border-outline-variant text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {planCheckoutTierId === t.id ? "Opening checkout…" : "Pay with crypto"}
                  </button>
                  <Link
                    href="/settings"
                    className="text-center text-xs font-medium text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
                  >
                    Billing &amp; account settings
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login?next=/plans"
                  className={`mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm font-bold transition-all duration-300 ${
                    isFeatured
                      ? "bg-primary text-on-primary hover:opacity-90"
                      : "border border-outline-variant text-on-surface hover:bg-surface-container"
                  }`}
                >
                  Sign in to upgrade
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <PlansFaq />

      <div className="mt-12 rounded-2xl border border-outline-variant bg-surface-container-low p-8 text-center transition-all duration-300 hover:border-outline">
        <p className="text-lg font-semibold">Ready when you are</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          Earn trust and deals on Free first; when Checkout lands, upgrading stays on the same account and keeps your
          reputation and project history intact.
        </p>
        <Link
          href={session ? "/services/new" : "/"}
          className="btn-primary mt-6 inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-bold transition-all duration-300"
        >
          {session ? "List a service" : "Explore the marketplace"}
        </Link>
      </div>
    </div>
    </div>
  );
}
