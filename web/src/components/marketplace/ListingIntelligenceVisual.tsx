"use client";

import type { ListingIntelligence } from "@/lib/listing-intelligence-types";

type ListingIntelligenceVisualProps = {
  intelligence: ListingIntelligence;
  category: string;
  trust?: {
    views?: number;
    purchases?: number;
    conversionRate?: number;
    averageRating?: number;
  } | null;
};

function radialMetric(label: string, value: number, max: number) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="vi-radial" title={`${label}: ${value}`}>
      <div
        className="vi-radial-ring"
        style={{ background: `conic-gradient(var(--forge-gold) ${pct}%, rgba(255,255,255,0.08) 0)` }}
      />
      <span className="vi-radial-label">{label}</span>
      <span className="vi-radial-value">{value}</span>
    </div>
  );
}

function domainInsights(category: string, intel: ListingIntelligence) {
  const c = category.toLowerCase();
  if (c.includes("seo") || c.includes("marketing") || c.includes("growth")) {
    return [
      { label: "Reach", value: intel.complexityScore * 18 },
      { label: "ROI", value: intel.roiPotential === "High" ? 85 : intel.roiPotential === "Medium" ? 62 : 40 },
      { label: "Speed", value: intel.executionSpeed === "24h" ? 90 : intel.executionSpeed === "48h" ? 75 : 55 },
    ];
  }
  if (c.includes("brand") || c.includes("design")) {
    return [
      { label: "Fit", value: intel.impactScale === "Enterprise" ? 88 : 72 },
      { label: "Scale", value: intel.complexityScore * 16 },
      { label: "Impact", value: intel.roiPotential === "High" ? 82 : 58 },
    ];
  }
  if (c.includes("ai") || c.includes("automation")) {
    return [
      { label: "Time saved", value: intel.roiPotential === "High" ? 90 : 65 },
      { label: "Complexity", value: intel.complexityScore * 20 },
      { label: "Deploy", value: intel.executionSpeed === "24h" ? 88 : 60 },
    ];
  }
  if (c.includes("video") || c.includes("content")) {
    return [
      { label: "Output", value: intel.impactScale === "Creator" ? 85 : 70 },
      { label: "Frequency", value: intel.executionSpeed === "7d" ? 72 : 58 },
      { label: "Reach", value: intel.complexityScore * 17 },
    ];
  }
  return [
    { label: "Value", value: intel.roiPotential === "High" ? 80 : 55 },
    { label: "Speed", value: intel.executionSpeed === "24h" ? 88 : 62 },
    { label: "Fit", value: intel.complexityScore * 18 },
  ];
}

export function ListingIntelligenceVisual({ intelligence, category, trust }: ListingIntelligenceVisualProps) {
  const insights = domainInsights(category, intelligence);

  return (
    <div className="vi-visual-panel" aria-label="Listing value insights">
      <div className="vi-visual-head">
        <span className="vi-panel-title">Value insight</span>
        <span className="vi-chip">{intelligence.domain}</span>
        <span className="vi-chip">{intelligence.impactScale}</span>
      </div>
      <div className="vi-radial-grid">
        {insights.map((m) => (
          <div key={m.label}>{radialMetric(m.label, m.value, 100)}</div>
        ))}
      </div>
      <div className="vi-meta-row">
        <span>Delivery {intelligence.executionSpeed}</span>
        <span>ROI {intelligence.roiPotential}</span>
        {trust?.purchases != null ? <span>{trust.purchases} purchases</span> : null}
        {trust?.views != null ? <span>{trust.views} views</span> : null}
        {trust?.averageRating != null ? <span>★ {trust.averageRating}</span> : null}
        {trust?.conversionRate != null ? <span>{trust.conversionRate}% conv.</span> : null}
      </div>
    </div>
  );
}
