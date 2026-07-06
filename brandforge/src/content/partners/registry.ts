export type PartnerTier = "affiliate" | "tool" | "collaborator";

export type PartnerEntry = {
  slug: string;
  name: string;
  tier: PartnerTier;
  description: string;
  whyRecommend: string;
  href: string;
  affiliate: boolean;
  refCode?: string;
  logo?: string;
};

export const PARTNER_TIERS = {
  affiliate: {
    label: "Affiliates",
    description: "Earn 20% per qualified referral — apply via Discord with audience niche and expected volume.",
  },
  tool: {
    label: "Tools we recommend",
    description: "Hosting, design, and ops tools we use on client projects. Affiliate links disclosed.",
  },
  collaborator: {
    label: "Collaborators",
    description: "Agencies, communities, and creators we co-market with — joint case studies and cross-promo.",
  },
} as const;

export const PARTNERS: readonly PartnerEntry[] = [
  {
    slug: "cloudflare",
    name: "Cloudflare",
    tier: "tool",
    description: "CDN, Workers, and static hosting for BrandForge and client sites.",
    whyRecommend: "Sub-100ms TTFB globally on static export — our default deploy target.",
    href: "https://www.cloudflare.com/",
    affiliate: false,
  },
  {
    slug: "lemon-squeezy",
    name: "Lemon Squeezy",
    tier: "tool",
    description: "Digital product checkout with tax and delivery for the BrandForge store.",
    whyRecommend: "Static-export friendly — no backend required for template sales.",
    href: "https://www.lemonsqueezy.com/",
    affiliate: false,
  },
  {
    slug: "figma",
    name: "Figma",
    tier: "tool",
    description: "Brand and UI design handoff for all identity packages.",
    whyRecommend: "Every BrandForge brand kit ships with organized Figma source files.",
    href: "https://www.figma.com/",
    affiliate: false,
  },
  {
    slug: "n8n",
    name: "n8n",
    tier: "tool",
    description: "Workflow automation for Automator tier and ops dashboards.",
    whyRecommend: "Self-hostable automation for Automator tier and ops dashboards.",
    href: "https://n8n.io/",
    affiliate: false,
  },
  {
    slug: "whiteskyhosting",
    name: "WhiteSky Hosting",
    tier: "collaborator",
    description: "VPS and game server hosting partner — forum-native buyers.",
    whyRecommend: "Co-delivered hosting storefront — /portfolio/whiteskyhosting/.",
    href: "https://whiteskyhosting.com/",
    affiliate: true,
    refCode: "brandforge",
  },
  {
    slug: "community-agencies",
    name: "Community Agencies",
    tier: "collaborator",
    description: "Discord-first agencies white-labeling BrandForge delivery.",
    whyRecommend: "Refer clients for package work — revenue share on qualified deals.",
    href: "https://discord.gg/a8Nz2R6M55",
    affiliate: true,
    refCode: "partner-agency",
  },
] as const;

export const AFFILIATE_PROGRAM = {
  commission: "20%",
  payout: "PayPal or crypto — manual monthly reconciliation",
  applyCampaign: "partners-affiliate-apply",
  trackingNote: "Unique ?ref=partnername on inbound links — tracked as partner_referral in GA4.",
} as const;
