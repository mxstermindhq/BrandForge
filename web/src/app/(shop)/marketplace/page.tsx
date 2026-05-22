import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingBrowse } from "@/components/marketplace/ListingBrowse";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Starter ($300–$1.5k) and Partner ($500–$15k) packages — three tiers per category, crypto checkout.",
};

export default function MarketplacePage() {
  return (
    <main>
      <section className="mp-hero-bar">
        <div className="forge-container">
          <p className="forge-section-eyebrow">Execution marketplace</p>
          <h1 className="forge-section-title">Browse the forge</h1>
          <p className="forge-section-desc">
            Starter and Partner packages — three offers per category, instant crypto checkout.
          </p>
        </div>
      </section>
      <Suspense fallback={<section className="forge-section forge-section-alt" />}>
        <ListingBrowse />
      </Suspense>
    </main>
  );
}
