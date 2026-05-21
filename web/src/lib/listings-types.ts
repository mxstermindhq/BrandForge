export type ListingTerm = "short" | "long";

export type ListingSort = "newest" | "price-asc" | "price-desc" | "ending";

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
  listingType: "short_term" | "long_term";
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
};

export type MarketplaceListingsResponse = {
  listings: MarketplaceListing[];
  total: number;
  term?: "short_term" | "long_term";
  error?: string;
};
