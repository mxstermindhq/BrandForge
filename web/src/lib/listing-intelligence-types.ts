export type ListingIntelligence = {
  domain: string;
  impactScale: string;
  executionSpeed: string;
  complexityScore: number;
  roiPotential: string;
  trustLevel: string;
  deliveryFormat: string;
};

export function normalizeListingIntelligence(raw: unknown): ListingIntelligence | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const domain = String(o.domain || "").trim();
  if (!domain) return null;
  return {
    domain,
    impactScale: String(o.impactScale || o.impact_scale || "Startup"),
    executionSpeed: String(o.executionSpeed || o.execution_speed || "7d"),
    complexityScore: Math.min(5, Math.max(1, Number(o.complexityScore ?? o.complexity_score) || 3)),
    roiPotential: String(o.roiPotential || o.roi_potential || "Medium"),
    trustLevel: String(o.trustLevel || o.trust_level || "New"),
    deliveryFormat: String(o.deliveryFormat || o.delivery_format || "Service"),
  };
}
