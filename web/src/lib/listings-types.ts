export type { ListingTerm, ListingTier } from "@/lib/package-tiers";
export { normalizeListingTerm, normalizeListingType, PACKAGE_TIERS } from "@/lib/package-tiers";

export type ListingSort = "newest" | "price-asc" | "price-desc" | "ending";

import type { ListingIntelligence } from "@/lib/listing-intelligence-types";
import type { ListingTier } from "@/lib/package-tiers";

export type MarketplaceListing = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  price: number;
  priceLabel: string;
  deliveryDays: number;
  deliveryLabel: string;
  listingType: ListingTier;
  packageSlot?: "starter" | "partner" | "partner_scale";
  endsAt: string | null;
  billingInterval: string | null;
  ownerId: string | null;
  ownerUsername: string | null;
  ownerName: string;
  ownerAvatar: string | null;
  coverUrl: string | null;
  thumbGradient: string;
  createdAt: string | null;
  serviceUrl: string;
  isOfficial?: boolean;
  catalogSlug?: string;
  intelligence?: ListingIntelligence | Record<string, unknown> | null;
};

export type MarketplaceListingsResponse = {
  listings: MarketplaceListing[];
  total: number;
  term?: ListingTier;
  error?: string;
};
