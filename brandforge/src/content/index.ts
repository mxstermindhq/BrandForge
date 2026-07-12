import { PORTFOLIO_PROJECTS, PORTFOLIO_SLUGS } from "./portfolio/projects";

export type ContentCategory = "static" | "portfolio";

export type ContentEntry = {
  slug: string;
  path: string;
  title: string;
  description: string;
  category: ContentCategory;
  lastModified: string;
  noindex?: boolean;
  tags?: readonly string[];
};

export const STATIC_CONTENT_ROUTES: readonly ContentEntry[] = [
  {
    slug: "home",
    path: "/",
    title: "BrandForge — Design, Development & Growth Studio",
    description: "Raw ideas forged into battle-ready brands. Fixed quote in 24 hours.",
    category: "static",
    lastModified: "2026-07-06",
  },
  {
    slug: "portfolio",
    path: "/portfolio/",
    title: "Portfolio | BrandForge",
    description: "Live and archived projects with outcomes.",
    category: "static",
    lastModified: "2026-07-06",
  },
  {
    slug: "privacy",
    path: "/privacy/",
    title: "Privacy Policy | BrandForge",
    description: "BrandForge privacy policy.",
    category: "static",
    lastModified: "2026-01-01",
  },
  {
    slug: "terms",
    path: "/terms/",
    title: "Terms | BrandForge",
    description: "BrandForge terms of service.",
    category: "static",
    lastModified: "2026-01-01",
  },
] as const;

function portfolioEntries(): ContentEntry[] {
  return PORTFOLIO_PROJECTS.map((p) => ({
    slug: p.slug,
    path: `/portfolio/${p.slug}/`,
    title: `${p.name} Case Study | BrandForge`,
    description: p.description.slice(0, 160),
    category: "portfolio" as const,
    lastModified: "2026-07-06",
    tags: p.tags,
  }));
}

export function getAllContentEntries(): ContentEntry[] {
  return [
    ...STATIC_CONTENT_ROUTES,
    ...portfolioEntries(),
  ].filter((e) => !e.noindex);
}

export const CONTENT_INDEX = getAllContentEntries();

export const CONTENT_STATS = {
  total: CONTENT_INDEX.length,
  blog: 0,
  portfolio: PORTFOLIO_SLUGS.length,
  niches: 0,
  services: 0,
  roadmap: 0,
  static: STATIC_CONTENT_ROUTES.length,
} as const;

export { PORTFOLIO_PROJECTS, PORTFOLIO_SLUGS } from "./portfolio/projects";
