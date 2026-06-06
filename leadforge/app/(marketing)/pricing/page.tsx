import Link from "next/link";
import type { Metadata } from "next";
import { CREDIT_COST_PER_LEAD, PACKS, WELCOME_CREDITS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — LeadForge",
  description: "Simple credit packs. 1 credit ≈ 1 lead. No subscription required.",
};

export default function PricingPage(): React.JSX.Element {
  return (
    <div className="py-20">
      <div className="text-center">
        <h1 className="font-display text-5xl font-light">Simple credit pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-tx-muted">
          {CREDIT_COST_PER_LEAD} credit ≈ 1 delivered lead. Enrichment and premium
          sources cost a little more. New accounts get {WELCOME_CREDITS} free credits.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PACKS.map((pack, i) => (
          <div
            key={pack.id}
            className={`rounded-lg border bg-bg-surface p-7 ${
              i === 1 ? "border-gold" : "border-border"
            }`}
          >
            {i === 1 && (
              <p className="mb-3 inline-block rounded-full bg-gold-bg px-3 py-1 text-xs text-gold">
                Most popular
              </p>
            )}
            <h3 className="text-lg text-gold">{pack.name}</h3>
            <p className="mt-3 font-mono text-4xl">${pack.priceUsd}</p>
            <p className="mt-1 text-sm text-tx-muted">{pack.credits.toLocaleString()} credits</p>
            <p className="mt-1 text-xs text-tx-muted">
              ≈ ${(pack.priceUsd / pack.credits).toFixed(3)} per lead
            </p>
            <Link
              href="/auth/register"
              className="mt-6 block rounded bg-gold px-4 py-2.5 text-center text-sm font-medium text-bg hover:bg-gold-light"
            >
              Get {pack.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
