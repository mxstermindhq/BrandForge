/** Minimum sample sizes before trust metrics render in UI. Below threshold = hide entirely. */

export const TRUST = {
  MIN_COMPLETED_ORDERS: 3,
  MIN_REVIEWS_FOR_RATING: 3,
  MIN_LISTING_PURCHASES: 3,
  MIN_REPEAT_BUYERS: 2,
  MIN_VIEWS_FOR_CONVERSION: 10,
} as const;

export type ProfileTrustMetrics = {
  completedOrders?: number;
  totalRevenueUsd?: number;
  repeatBuyers?: number;
  reviewCount?: number;
  averageRating?: number;
  avgDeliveryHours?: number;
  activeListings?: number;
  joinedAt?: string;
  isVerified?: boolean;
};

export type ListingTrustMetrics = {
  purchases?: number;
  repeatBuyerPct?: number;
  averageRating?: number;
  deliveryReliabilityHours?: number;
};

export function filterProfileTrust(raw: ProfileTrustMetrics | null): ProfileTrustMetrics | null {
  if (!raw) return null;
  const out: ProfileTrustMetrics = {};

  if (raw.joinedAt) out.joinedAt = raw.joinedAt;
  if (raw.totalRevenueUsd != null && raw.totalRevenueUsd > 0) out.totalRevenueUsd = raw.totalRevenueUsd;
  if (raw.activeListings != null && raw.activeListings > 0) out.activeListings = raw.activeListings;

  if (raw.completedOrders != null && raw.completedOrders >= TRUST.MIN_COMPLETED_ORDERS) {
    out.completedOrders = raw.completedOrders;
  }
  if (raw.reviewCount != null && raw.reviewCount >= TRUST.MIN_REVIEWS_FOR_RATING) {
    out.reviewCount = raw.reviewCount;
  }
  if (
    raw.averageRating != null &&
    raw.reviewCount != null &&
    raw.reviewCount >= TRUST.MIN_REVIEWS_FOR_RATING
  ) {
    out.averageRating = raw.averageRating;
  }
  if (raw.repeatBuyers != null && raw.repeatBuyers >= TRUST.MIN_REPEAT_BUYERS) {
    out.repeatBuyers = raw.repeatBuyers;
  }
  if (raw.avgDeliveryHours != null && raw.completedOrders != null && raw.completedOrders >= TRUST.MIN_COMPLETED_ORDERS) {
    out.avgDeliveryHours = raw.avgDeliveryHours;
  }
  if (
    raw.isVerified &&
    ((raw.completedOrders != null && raw.completedOrders >= TRUST.MIN_COMPLETED_ORDERS) ||
      (raw.reviewCount != null && raw.reviewCount >= TRUST.MIN_REVIEWS_FOR_RATING))
  ) {
    out.isVerified = true;
  }

  return Object.keys(out).length ? out : null;
}

export function filterListingTrust(raw: ListingTrustMetrics | null): ListingTrustMetrics | null {
  if (!raw) return null;
  const out: ListingTrustMetrics = {};

  if (raw.purchases != null && raw.purchases >= TRUST.MIN_LISTING_PURCHASES) {
    out.purchases = raw.purchases;
  }
  if (
    raw.averageRating != null &&
    raw.purchases != null &&
    raw.purchases >= TRUST.MIN_LISTING_PURCHASES
  ) {
    out.averageRating = raw.averageRating;
  }
  if (raw.repeatBuyerPct != null && raw.purchases != null && raw.purchases >= TRUST.MIN_LISTING_PURCHASES) {
    out.repeatBuyerPct = raw.repeatBuyerPct;
  }
  if (raw.deliveryReliabilityHours != null && raw.purchases != null && raw.purchases >= TRUST.MIN_LISTING_PURCHASES) {
    out.deliveryReliabilityHours = raw.deliveryReliabilityHours;
  }

  return Object.keys(out).length ? out : null;
}
