export type ServiceDetail = {
  id: string;
  title: string;
  description: string;
  tagline: string;
  category: string;
  price: number;
  priceLabel: string;
  deliveryDays: number;
  deliveryLabel: string;
  listingType: "short_term" | "long_term";
  endsAt: string | null;
  billingInterval: string | null;
  deliverables: string[];
  useCases: string[];
  tags: string[];
  thumbGradient: string;
  ctaText: string;
  ownerUsername: string | null;
  ownerName: string;
  ownerId?: string | null;
  isOfficial?: boolean;
  status?: string;
};

export function normalizeServiceDetail(raw: Record<string, unknown>): ServiceDetail {
  const listingType =
    raw.listingType === "long_term" || raw.listing_type === "long_term" ? "long_term" : "short_term";
  const price = Number(raw.price ?? raw.base_price) || 0;
  const billingInterval =
    (raw.billingInterval as string) || (raw.billing_interval as string) || null;
  const deliveryDays = Math.max(1, Number(raw.deliveryDays ?? raw.delivery_days) || 1);
  const priceLabel =
    (raw.priceLabel as string) ||
    (listingType === "long_term" && billingInterval
      ? `$${price.toLocaleString()}/${billingInterval}`
      : `$${price.toLocaleString()}`);
  const deliveryLabel =
    (raw.deliveryLabel as string) ||
    (listingType === "long_term"
      ? `${billingInterval || "monthly"} subscription`
      : `${deliveryDays} day${deliveryDays === 1 ? "" : "s"}`);

  return {
    id: String(raw.id),
    title: String(raw.title || "Service"),
    description: String(raw.description || ""),
    tagline: String(raw.tagline || "").slice(0, 200) || String(raw.description || "").slice(0, 140),
    category: String(raw.category || raw.cat || "General"),
    price,
    priceLabel,
    deliveryDays,
    deliveryLabel,
    listingType,
    endsAt: (raw.endsAt as string) || (raw.ends_at as string) || null,
    billingInterval,
    deliverables: Array.isArray(raw.deliverables) ? (raw.deliverables as string[]) : [],
    useCases: Array.isArray(raw.useCases)
      ? (raw.useCases as string[])
      : Array.isArray(raw.use_cases)
        ? (raw.use_cases as string[])
        : [],
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    thumbGradient:
      (raw.thumbGradient as string) ||
      (raw.bg as string) ||
      "linear-gradient(135deg, #0a0505, #ff4d00, #ffb800)",
    ctaText: String(raw.ctaText || "Contact on Discord"),
    ownerUsername:
      (raw.ownerUsername as string) ||
      ((raw.owner as { username?: string })?.username ?? null),
    ownerName:
      String(raw.ownerName || raw.sel || (raw.owner as { full_name?: string })?.full_name || "Seller"),
    ownerId: (raw.ownerId as string) || (raw.owner_id as string) || null,
    isOfficial: Boolean(raw.isOfficial),
    status: raw.status as string | undefined,
  };
}
