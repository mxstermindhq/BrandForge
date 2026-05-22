export type { ProfileTrustMetrics, ListingTrustMetrics } from "@/lib/trust-thresholds";

export type MarketplaceReview = {
  id: string;
  orderId: string;
  rating: number;
  headline: string;
  body: string;
  deliveryScore: number;
  communicationScore: number;
  valueScore: number;
  wouldRecommend: boolean;
  createdAt: string;
  verifiedPurchase: boolean;
  reviewerName: string;
  reviewerUsername: string | null;
  reviewerAvatar: string | null;
};
