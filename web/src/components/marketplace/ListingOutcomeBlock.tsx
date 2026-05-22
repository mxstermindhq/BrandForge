import type { ListingIntelligence } from "@/lib/listing-intelligence-types";

type ListingOutcomeBlockProps = {
  tagline: string;
  category: string;
  deliveryLabel: string;
  intelligence: ListingIntelligence | null;
  compact?: boolean;
};

/** Structured listing meaning — no decorative metrics or trust fiction. */
export function ListingOutcomeBlock({
  tagline,
  category,
  deliveryLabel,
  intelligence,
  compact = false,
}: ListingOutcomeBlockProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Category", value: category },
    { label: "Delivery", value: deliveryLabel },
  ];

  if (intelligence) {
    rows.push(
      { label: "Best for", value: intelligence.impactScale },
      { label: "Format", value: intelligence.deliveryFormat },
      { label: "Timeline", value: intelligence.executionSpeed },
    );
  }

  if (compact) {
    return (
      <div className="mp-outcome-strip" aria-label="Listing summary">
        <p className="mp-outcome-tagline line-clamp-2">{tagline}</p>
        <div className="mp-outcome-chips">
          <span>{category}</span>
          <span>{deliveryLabel}</span>
          {intelligence ? <span>{intelligence.impactScale}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mp-outcome-panel" aria-label="What you get">
      <p className="mp-outcome-lead">{tagline}</p>
      <dl className="mp-outcome-grid">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
