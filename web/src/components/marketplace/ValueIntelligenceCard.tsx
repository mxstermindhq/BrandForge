import type { ListingIntelligence } from "@/lib/listing-intelligence-types";

type ValueIntelligenceCardProps = {
  intelligence: ListingIntelligence;
  compact?: boolean;
};

const TRUST_CLASS: Record<string, string> = {
  Verified: "vi-trust-verified",
  Whitelisted: "vi-trust-whitelist",
  New: "vi-trust-new",
};

export function ValueIntelligenceCard({ intelligence, compact = false }: ValueIntelligenceCardProps) {
  const trustClass = TRUST_CLASS[intelligence.trustLevel] || "vi-trust-new";

  if (compact) {
    return (
      <div className="vi-strip" aria-label="Listing intelligence">
        <span className="vi-chip">{intelligence.domain}</span>
        <span className="vi-chip">{intelligence.impactScale}</span>
        <span className="vi-chip">{intelligence.executionSpeed}</span>
        <span className={`vi-chip ${trustClass}`}>{intelligence.trustLevel}</span>
      </div>
    );
  }

  return (
    <div className="vi-panel" aria-label="Value intelligence">
      <div className="vi-panel-head">
        <span className="vi-panel-title">Decision intelligence</span>
        <span className={`vi-trust-badge ${trustClass}`}>{intelligence.trustLevel}</span>
      </div>
      <dl className="vi-grid">
        <div>
          <dt>Domain</dt>
          <dd>{intelligence.domain}</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>{intelligence.impactScale}</dd>
        </div>
        <div>
          <dt>Speed</dt>
          <dd>{intelligence.executionSpeed}</dd>
        </div>
        <div>
          <dt>Complexity</dt>
          <dd>{intelligence.complexityScore}/5</dd>
        </div>
        <div>
          <dt>ROI</dt>
          <dd>{intelligence.roiPotential}</dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{intelligence.deliveryFormat}</dd>
        </div>
      </dl>
    </div>
  );
}
