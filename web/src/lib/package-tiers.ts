/** BrandForge package tiers — enforced on seller publish and official catalog. */

export type ListingTier = "starter" | "partner";

export type ListingTerm = ListingTier;

export const PACKAGE_TIERS = {
  starter: {
    label: "Starter",
    description: "Fixed-scope deliverable — buy once, clear outcome.",
    minUsd: 300,
    maxUsd: 1500,
    defaultUsd: 597,
  },
  partner: {
    label: "Partner",
    description: "Ongoing partnership or high-ticket engagement.",
    minUsd: 500,
    maxUsd: 15000,
    coreMaxUsd: 2000,
    defaultUsd: 1499,
  },
} as const;

/** Three slots per marketplace category: 1 starter + 2 partner price bands. */
export const SLOTS_PER_CATEGORY = 3 as const;

export function normalizeListingTerm(raw: string | null | undefined): ListingTerm {
  const v = String(raw || "").toLowerCase();
  if (v === "partner" || v === "long" || v === "long_term" || v === "subscriptions") return "partner";
  if (v === "starter" || v === "short" || v === "short_term") return "starter";
  return "starter";
}

export function normalizeListingType(raw: string | null | undefined): ListingTier {
  const v = String(raw || "").toLowerCase();
  if (v === "partner" || v === "long_term") return "partner";
  if (v === "starter" || v === "short_term") return "starter";
  return "starter";
}

export function priceInTier(price: number, tier: ListingTier, slot?: "core" | "scale"): boolean {
  if (!Number.isFinite(price) || price <= 0) return false;
  if (tier === "starter") {
    return price >= PACKAGE_TIERS.starter.minUsd && price <= PACKAGE_TIERS.starter.maxUsd;
  }
  if (slot === "scale") {
    return price > PACKAGE_TIERS.partner.coreMaxUsd && price <= PACKAGE_TIERS.partner.maxUsd;
  }
  return price >= PACKAGE_TIERS.partner.minUsd && price <= PACKAGE_TIERS.partner.maxUsd;
}

export function formatTierPriceLabel(
  price: number,
  tier: ListingTier,
  billingInterval?: string | null,
): string {
  const base = `$${Math.round(price).toLocaleString()}`;
  if (tier === "partner" && billingInterval) {
    return `${base}/${billingInterval}`;
  }
  return base;
}
