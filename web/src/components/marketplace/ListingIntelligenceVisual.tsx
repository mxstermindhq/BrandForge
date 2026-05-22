"use client";

import type { ListingIntelligence } from "@/lib/listing-intelligence-types";
import type { ListingTrustMetrics } from "@/lib/trust-thresholds";
import { filterListingTrust } from "@/lib/trust-thresholds";

type ListingIntelligenceVisualProps = {
  intelligence: ListingIntelligence;
  category: string;
  deliveryLabel: string;
  tagline: string;
  trust?: ListingTrustMetrics | null;
};

/** Meaning-only blocks. Real trust metrics only when sample thresholds met. */
export function ListingIntelligenceVisual({
  intelligence,
  category,
  deliveryLabel,
  tagline,
  trust: rawTrust,
}: ListingIntelligenceVisualProps) {
  const trust = filterListingTrust(rawTrust ?? null);

  return (
    <div className="mp-outcome-panel" aria-label="Listing details">
      <p className="mp-outcome-lead">{tagline}</p>
      <dl className="mp-outcome-grid">
        <div>
          <dt>Category</dt>
          <dd>{category}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{deliveryLabel}</dd>
        </div>
        <div>
          <dt>Best for</dt>
          <dd>{intelligence.impactScale}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{intelligence.deliveryFormat}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{intelligence.executionSpeed}</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>Level {intelligence.complexityScore}</dd>
        </div>
      </dl>
      {trust ? (
        <ul className="mp-trust-facts mt-4">
          {trust.purchases != null ? <li>{trust.purchases} completed purchases</li> : null}
          {trust.averageRating != null ? <li>★ {trust.averageRating} average rating</li> : null}
          {trust.repeatBuyerPct != null ? <li>{trust.repeatBuyerPct}% repeat buyers</li> : null}
          {trust.deliveryReliabilityHours != null ? (
            <li>~{trust.deliveryReliabilityHours}h avg delivery time</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
