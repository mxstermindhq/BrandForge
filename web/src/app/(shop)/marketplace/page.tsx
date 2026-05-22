import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingBrowse } from "@/components/marketplace/ListingBrowse";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse short-term listings and long-term subscriptions from verified sellers.",
};

export default function MarketplacePage() {
  return (
    <main>
      <section className="mp-hero-bar">
        <div className="forge-container">
          <p className="forge-section-eyebrow">Execution marketplace</p>
          <h1 className="forge-section-title">Browse the forge</h1>
          <p className="forge-section-desc">
            Short-term projects and long-term subscriptions — instant crypto checkout.
          </p>
        </div>
      </section>
      <Suspense fallback={<section className="forge-section forge-section-alt" />}>
        <ListingBrowse />
      </Suspense>
    </main>
  );
}
