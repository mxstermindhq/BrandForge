export type ProfileTrustMetrics = {
  completedOrders?: number;
  totalRevenueUsd?: number;
  repeatBuyers?: number;
  reviewCount?: number;
  averageRating?: number;
  completionRate?: number;
  avgDeliveryHours?: number;
  activeListings?: number;
  joinedAt?: string;
  isVerified?: boolean;
  profileCompletionPercent?: number;
};

export type ListingTrustMetrics = {
  views?: number;
  saves?: number;
  purchases?: number;
  conversionRate?: number;
  repeatBuyerPct?: number;
  averageRating?: number;
};

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
