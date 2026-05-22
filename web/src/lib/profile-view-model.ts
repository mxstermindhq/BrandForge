import { talentInitials } from "@/lib/talent-types";
import type { ProfileTrustMetrics } from "@/lib/trust-thresholds";
import type { MarketplaceReview } from "@/lib/trust-types";
import { filterProfileTrust } from "@/lib/trust-thresholds";

export type ProfileServiceItem = {
  id: string;
  title: string;
  category: string;
  priceLabel: string;
  href: string;
  listingType: "short_term" | "long_term";
  tagline?: string;
};

export interface ProfileViewModel {
  username: string;
  name: string;
  initials: string;
  role: string;
  availability: "available-now" | "available" | "limited" | "unavailable";
  bio: string;
  startingPrice: string;
  pricingModel: string;
  skills: string[];
  proofLink: string;
  isVerified: boolean;
  services: ProfileServiceItem[];
  trust: ProfileTrustMetrics | null;
  reviews: MarketplaceReview[];
  avatarUrl?: string | null;
  faq?: Array<{ question: string; answer: string }>;
}

function normalizeAvailability(v: string | null | undefined): ProfileViewModel["availability"] {
  const n = String(v || "").toLowerCase();
  if (n === "available-now") return "available-now";
  if (n === "available") return "available";
  if (n === "limited" || n === "busy") return "limited";
  if (n === "unavailable") return "unavailable";
  return "available";
}

function mapPublicServices(
  username: string,
  rows: ApiProfileInput["publicServices"],
): ProfileServiceItem[] {
  if (!rows?.length) return [];
  return rows.map((s) => {
    const lt = s.listing_type === "long_term" ? "long_term" : "short_term";
    const price = Number(s.base_price) || 0;
    return {
      id: s.id,
      title: String(s.title || "Service"),
      category: String(s.category || "General"),
      priceLabel: `$${price.toLocaleString()}`,
      href: `/listing/${s.id}`,
      listingType: lt,
      tagline: String(s.description || "").slice(0, 100),
    };
  });
}

type ApiProfileInput = {
  username?: string | null;
  full_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  availability?: string | null;
  rate_label?: string | null;
  min_budget?: number | null;
  skills?: string[] | null;
  avatar_url?: string | null;
  publicServices?: Array<{
    id: string;
    title?: string;
    category?: string;
    base_price?: number;
    listing_type?: string;
    description?: string;
  }> | null;
};

export function mapApiProfileToViewModel(
  profile: ApiProfileInput,
  trust: ProfileTrustMetrics | null = null,
  reviews: MarketplaceReview[] = [],
): ProfileViewModel {
  const username = String(profile.username || "").replace(/^@+/, "") || "member";
  const name = profile.full_name?.trim() || username;
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean).slice(0, 8) : [];
  const services = mapPublicServices(username, profile.publicServices);
  const firstService = services[0];
  const filteredTrust = filterProfileTrust(trust);

  return {
    username,
    name,
    initials: talentInitials(name),
    role: profile.headline?.trim() || "Operator",
    availability: normalizeAvailability(profile.availability),
    bio: profile.bio?.trim() || "",
    startingPrice:
      profile.rate_label?.trim() ||
      (profile.min_budget ? `From $${profile.min_budget}` : firstService?.priceLabel || "Rate on request"),
    pricingModel: services.length ? "Browse listings below" : "Message to scope",
    skills,
    proofLink: `https://brandforge.gg/${encodeURIComponent(username)}`,
    isVerified: Boolean(filteredTrust?.isVerified),
    services,
    trust: filteredTrust,
    reviews,
    avatarUrl: profile.avatar_url,
  };
}
