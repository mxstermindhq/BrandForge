import type { BlogPost } from "@/content/blog/types";

type RelatedLink = { label: string; href: string };

const CATEGORY_DEFAULTS: Record<
  string,
  { services: RelatedLink[]; portfolio: string[]; niches: string[] }
> = {
  Discord: {
    services: [
      { label: "Discord branding", href: "/services/discord-branding/" },
      { label: "Social media", href: "/services/social-media/" },
    ],
    portfolio: ["drain-cx"],
    niches: ["gaming-server-owners", "content-creators"],
  },
  Web3: {
    services: [
      { label: "Brand identity", href: "/services/brand-identity/" },
      { label: "Web design", href: "/services/web-design/" },
    ],
    portfolio: ["cascade-markets", "sui-blockchain-app"],
    niches: ["web3-crypto-projects"],
  },
  Forums: {
    services: [
      { label: "Brand identity", href: "/services/brand-identity/" },
      { label: "Web design", href: "/services/web-design/" },
    ],
    portfolio: ["valaccs"],
    niches: ["forum-sellers", "ecommerce-brands"],
  },
  SEO: {
    services: [{ label: "SEO & growth", href: "/services/seo-growth/" }],
    portfolio: [],
    niches: ["saas-startups"],
  },
  Automation: {
    services: [{ label: "Automation", href: "/services/automation/" }],
    portfolio: ["linkedin-automation"],
    niches: ["automation-ops-teams", "saas-startups"],
  },
  Guides: {
    services: [
      { label: "Brand identity", href: "/services/brand-identity/" },
      { label: "Web design", href: "/services/web-design/" },
    ],
    portfolio: ["whiteskyhosting"],
    niches: ["saas-startups"],
  },
  "Thought Leadership": {
    services: [
      { label: "Brand identity", href: "/services/brand-identity/" },
      { label: "Web design", href: "/services/web-design/" },
      { label: "Automation", href: "/services/automation/" },
    ],
    portfolio: [],
    niches: ["saas-startups", "web3-crypto-projects"],
  },
};

const TAG_NICHE: Record<string, string> = {
  discord: "gaming-server-owners",
  web3: "web3-crypto-projects",
  crypto: "web3-crypto-projects",
  forums: "forum-sellers",
  forum: "forum-sellers",
  geo: "saas-startups",
  seo: "saas-startups",
  n8n: "automation-ops-teams",
  automation: "automation-ops-teams",
  mobile: "mobile-app-founders",
};

/** Fallback related links for legacy posts without explicit related* fields. */
export function defaultRelatedForPost(post: BlogPost): {
  services: readonly RelatedLink[];
  portfolio: readonly string[];
  niches: readonly string[];
} {
  const cat = post.category ?? "Guides";
  const base = CATEGORY_DEFAULTS[cat] ?? CATEGORY_DEFAULTS.Guides!;

  const nicheSet = new Set(base.niches);
  for (const tag of post.tags ?? []) {
    const niche = TAG_NICHE[tag.toLowerCase()];
    if (niche) nicheSet.add(niche);
  }

  return {
    services: post.relatedServices ?? base.services,
    portfolio: post.relatedPortfolio ?? base.portfolio,
    niches: post.relatedNiches ?? [...nicheSet],
  };
}
