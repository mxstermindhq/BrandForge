import type { ListingIntelligence } from "@/lib/listing-intelligence-types";

type ValueIntelligenceCardProps = {
  intelligence: ListingIntelligence;
  compact?: boolean;
};

/** Listing metadata only — no synthetic trust badges. */
export function ValueIntelligenceCard({ intelligence, compact = false }: ValueIntelligenceCardProps) {
  if (compact) {
    return (
      <div className="vi-strip" aria-label="Listing details">
        <span className="vi-chip">{intelligence.domain}</span>
        <span className="vi-chip">{intelligence.impactScale}</span>
        <span className="vi-chip">{intelligence.executionSpeed}</span>
      </div>
    );
  }

  return (
    <div className="vi-panel" aria-label="Listing details">
      <div className="vi-panel-head">
        <span className="vi-panel-title">Service details</span>
      </div>
      <dl className="vi-grid">
        <div>
          <dt>Domain</dt>
          <dd>{intelligence.domain}</dd>
        </div>
        <div>
          <dt>Best for</dt>
          <dd>{intelligence.impactScale}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{intelligence.executionSpeed}</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>Level {intelligence.complexityScore}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{intelligence.deliveryFormat}</dd>
        </div>
      </dl>
    </div>
  );
}
