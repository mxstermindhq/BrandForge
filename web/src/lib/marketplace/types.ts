/** Marketplace domain types — Supabase-ready shape. */

export type CategoryId =
  | "ai"
  | "discord"
  | "content"
  | "video"
  | "branding"
  | "landing"
  | "leads"
  | "business"
  | "monetization"
  | "marketing";

export type SortKey = "popular" | "price-asc" | "price-desc" | "fastest";

export interface Category {
  id: CategoryId;
  slug: string;
  name: string;
  description: string;
  productCount: number;
}

export interface SellerProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  responseTime: string;
  completionRate: number;
  productIds: string[];
  thumbGradient: string;
}

export interface Product {
  id: string;
  title: string;
  /** short_description */
  tagline: string;
  /** long_description */
  description: string;
  /** deliverables */
  includes: string[];
  deliverables: string[];
  useCases: string[];
  price: number;
  priceLabel: string;
  categoryId: CategoryId;
  deliveryHours: number;
  /** delivery_time */
  deliveryLabel: string;
  rating: number;
  reviewCount: number;
  sellerId: string;
  featured: boolean;
  popular: boolean;
  /** 1–100 */
  popularityScore: number;
  tags: string[];
  ctaText: string;
  thumbGradient: string;
}

export interface OfferBundle {
  id: string;
  title: string;
  tagline: string;
  price: number;
  priceLabel: string;
  originalPrice?: number;
  deliveryLabel: string;
  limited?: boolean;
  badge?: string;
  includes: string[];
  productIds: string[];
  thumbGradient: string;
}
