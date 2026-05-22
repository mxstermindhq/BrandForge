/** BrandForge package tiers — keep in sync with web/src/lib/package-tiers.ts */

const PACKAGE_TIERS = {
  starter: { label: 'Starter', minUsd: 300, maxUsd: 1500, coreMaxUsd: 1500 },
  partner: { label: 'Partner', minUsd: 500, maxUsd: 15000, coreMaxUsd: 2000 },
};

function normalizeListingTerm(raw) {
  const v = String(raw || '').toLowerCase();
  if (v === 'partner' || v === 'long' || v === 'long_term' || v === 'subscriptions') return 'partner';
  if (v === 'starter' || v === 'short' || v === 'short_term') return 'starter';
  return 'starter';
}

function normalizeListingType(raw) {
  const v = String(raw || '').toLowerCase();
  if (v === 'partner' || v === 'long_term') return 'partner';
  if (v === 'starter' || v === 'short_term') return 'starter';
  return 'starter';
}

function priceInTier(price, tier, slot) {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return false;
  if (tier === 'starter') {
    return n >= PACKAGE_TIERS.starter.minUsd && n <= PACKAGE_TIERS.starter.maxUsd;
  }
  if (slot === 'scale') {
    return n > PACKAGE_TIERS.partner.coreMaxUsd && n <= PACKAGE_TIERS.partner.maxUsd;
  }
  return n >= PACKAGE_TIERS.partner.minUsd && n <= PACKAGE_TIERS.partner.maxUsd;
}

function inferPartnerSlot(price) {
  const n = Number(price);
  if (n > PACKAGE_TIERS.partner.coreMaxUsd) return 'scale';
  return 'core';
}

function formatTierPriceLabel(price, tier, billingInterval) {
  const base = `$${Math.round(Number(price) || 0).toLocaleString()}`;
  if (tier === 'partner' && billingInterval) return `${base}/${billingInterval}`;
  return base;
}

function validateListingPrice(price, listingType) {
  const tier = normalizeListingType(listingType);
  const slot = tier === 'partner' ? inferPartnerSlot(price) : null;
  if (!priceInTier(price, tier, slot === 'scale' ? 'scale' : slot === 'core' ? 'core' : undefined)) {
    if (tier === 'starter') {
      return `Starter packages must be priced between $${PACKAGE_TIERS.starter.minUsd} and $${PACKAGE_TIERS.starter.maxUsd}.`;
    }
    return `Partner packages must be between $${PACKAGE_TIERS.partner.minUsd} and $${PACKAGE_TIERS.partner.coreMaxUsd}, or $${PACKAGE_TIERS.partner.coreMaxUsd + 1}–$${PACKAGE_TIERS.partner.maxUsd} for scale engagements.`;
  }
  return null;
}

module.exports = {
  PACKAGE_TIERS,
  normalizeListingTerm,
  normalizeListingType,
  priceInTier,
  inferPartnerSlot,
  formatTierPriceLabel,
  validateListingPrice,
};
