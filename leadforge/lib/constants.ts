import type {
  BuildQueryParams,
  LeadStatus,
  Platform,
  PricePack,
} from "@/types";

/** Base credits charged per delivered lead before platform/enrichment multipliers. */
export const CREDIT_COST_PER_LEAD = 1;

/** Welcome bonus credits granted on registration. */
export const WELCOME_CREDITS = 500;

export const PLATFORMS: readonly Platform[] = [
  {
    id: "google",
    name: "Google",
    icon: "🔍",
    description: "Open-web search across business sites and directories.",
    b2b: true,
    b2c: true,
    creditCost: 1,
    quality: 3,
  },
  {
    id: "web",
    name: "Open Web",
    icon: "🌐",
    description: "Generic websites with contact pages and emails.",
    b2b: true,
    b2c: true,
    creditCost: 1,
    quality: 3,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "👽",
    description: "Niche community members showing buyer intent.",
    b2b: false,
    b2c: true,
    creditCost: 1,
    quality: 4,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "▶️",
    description: "Creators and channels in your niche.",
    b2b: false,
    b2c: true,
    creditCost: 1,
    quality: 3,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    description: "Creator and consumer bios with contact info.",
    b2b: false,
    b2c: true,
    creditCost: 1,
    quality: 3,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    description: "Short-form creators and consumer profiles.",
    b2b: false,
    b2c: true,
    creditCost: 1,
    quality: 2,
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "𝕏",
    description: "Public profiles and founders posting in your space.",
    b2b: true,
    b2c: true,
    creditCost: 1,
    quality: 2,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    description: "Companies, founders, and decision makers (B2B).",
    b2b: true,
    b2c: false,
    creditCost: 2,
    quality: 5,
  },
];

export const PACKS: readonly PricePack[] = [
  { id: "starter", name: "Starter", credits: 300, priceUsd: 19, stripePriceId: "" },
  { id: "growth", name: "Growth", credits: 1000, priceUsd: 49, stripePriceId: "" },
  { id: "pro", name: "Pro", credits: 3000, priceUsd: 99, stripePriceId: "" },
  { id: "scale", name: "Scale", credits: 7500, priceUsd: 199, stripePriceId: "" },
];

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#5294e0",
  contacted: "#e0a052",
  qualified: "#52c07a",
  rejected: "#555555",
};

/** Sites we never treat as a lead source when parsing Google results. */
export const SCRAPE_DOMAIN_BLOCKLIST: readonly string[] = [
  "google.com",
  "youtube.com",
  "yelp.com",
  "facebook.com",
  "wikipedia.org",
  "amazon.com",
];

/** Generic mailbox prefixes we de-prioritise when ranking emails. */
export const GENERIC_EMAIL_PREFIXES: readonly string[] = [
  "noreply",
  "no-reply",
  "donotreply",
  "support",
  "info",
  "admin",
  "webmaster",
  "postmaster",
];

/** Role mailboxes that are still valuable for outreach. */
export const PREFERRED_EMAIL_PREFIXES: readonly string[] = [
  "ceo",
  "founder",
  "hello",
  "owner",
  "sales",
  "contact",
];

export const PROCESSING_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Rate-limit / runtime tuning (see Phase 0 reasoning).
export const GEMINI_DELAY_MS = 4200; // ~14 RPM, safely under the 15 RPM cap
export const GEMINI_TIMEOUT_MS = 15_000;
export const SCRAPE_TIMEOUT_MS = 8_000;
export const SCRAPE_CONCURRENCY = 5;
export const D1_BATCH_SIZE = 50;
/** Max leads enriched per queue invocation before re-enqueueing (stays under 30s CPU). */
export const ENRICH_CHUNK_SIZE = 5;
export const CSV_PAGE_SIZE = 200;

export type PlatformQueryBuilder = (params: BuildQueryParams) => string[];

/** Per-platform Google dork builders. Returns 2-3 variants for coverage. */
export const PLATFORM_QUERY_BUILDERS: Record<string, PlatformQueryBuilder> = {
  google: ({ niche, location }) => {
    const loc = location ? ` "${location}"` : "";
    return [
      `"${niche}"${loc} "contact" email -site:yelp.com`,
      `"${niche}"${loc} "get in touch" OR "email us"`,
    ];
  },
  web: ({ niche, location, targetDescription }) => {
    const loc = location ? ` "${location}"` : "";
    return [
      `"${niche}"${loc} contact email`,
      `${targetDescription}${loc} contact email`,
    ];
  },
  reddit: ({ niche }) => [
    `site:reddit.com "${niche}" contact OR email`,
    `site:reddit.com "${niche}" "looking for" OR "recommend"`,
  ],
  youtube: ({ niche }) => [
    `site:youtube.com "${niche}" "business email" OR contact`,
    `site:youtube.com/channel "${niche}"`,
  ],
  instagram: ({ niche, location }) => {
    const loc = location ? ` "${location}"` : "";
    return [`site:instagram.com "${niche}"${loc} email`];
  },
  tiktok: ({ niche }) => [`site:tiktok.com "${niche}" contact OR email`],
  twitter: ({ niche, location }) => {
    const loc = location ? ` "${location}"` : "";
    return [`(site:twitter.com OR site:x.com) "${niche}"${loc} email`];
  },
  linkedin: ({ niche, location }) => {
    const loc = location ? ` "${location}"` : "";
    return [
      `site:linkedin.com/company "${niche}"${loc}`,
      `site:linkedin.com/company "${niche}"${loc} "contact us" founder OR CEO`,
    ];
  },
};

export function getPlatformById(id: string): Platform | null {
  return PLATFORMS.find((p) => p.id === id) ?? null;
}

export function getPackById(packId: string): PricePack | null {
  return PACKS.find((p) => p.id === packId) ?? null;
}

/**
 * Campaign credit cost:
 *   baseCost = quantity × avgPlatformCostMultiplier
 *   enrichCost = enrich ? baseCost × 0.5 : 0
 *   total = ceil(baseCost + enrichCost)
 */
export function calculateCampaignCost(
  quantity: number,
  platformIds: string[],
  enrich: boolean,
): number {
  const selected = platformIds
    .map((id) => getPlatformById(id))
    .filter((p): p is Platform => p !== null);
  if (selected.length === 0) return 0;
  const avgMultiplier =
    selected.reduce((sum, p) => sum + p.creditCost, 0) / selected.length;
  const baseCost = quantity * avgMultiplier * CREDIT_COST_PER_LEAD;
  const enrichCost = enrich ? baseCost * 0.5 : 0;
  return Math.ceil(baseCost + enrichCost);
}
