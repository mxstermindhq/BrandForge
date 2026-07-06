import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import type { PortfolioProject } from "@/types/portfolio";

/** Related projects by shared tags, category, or niche tags. */
export function getRelatedProjects(
  current: PortfolioProject,
  limit = 3,
): readonly PortfolioProject[] {
  const scored = PORTFOLIO_PROJECTS.filter((p) => p.slug !== current.slug).map((p) => {
    let score = 0;
    for (const tag of p.tags) {
      if (current.tags.includes(tag)) score += 2;
    }
    if (p.category === current.category) score += 1;
    for (const niche of p.nicheTags ?? []) {
      if (current.nicheTags?.includes(niche)) score += 3;
    }
    return { project: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.project);
}

/** Map portfolio tags to niche /for/* pages. */
export const NICHE_LINKS_BY_TAG: Record<string, { label: string; href: string }> = {
  SaaS: { label: "SaaS startups", href: "/for/saas-startups/" },
  Gaming: { label: "Gaming servers", href: "/for/gaming-server-owners/" },
  Web3: { label: "Web3 projects", href: "/for/web3-crypto-projects/" },
  "E-commerce": { label: "E-commerce brands", href: "/for/ecommerce-brands/" },
  Discord: { label: "Gaming communities", href: "/for/gaming-server-owners/" },
  Mobile: { label: "Mobile app founders", href: "/for/mobile-app-founders/" },
  n8n: { label: "Automation ops", href: "/for/automation-ops-teams/" },
  Forum: { label: "Forum sellers", href: "/for/forum-sellers/" },
};

export function nicheLinksForProject(project: PortfolioProject): readonly { label: string; href: string }[] {
  const seen = new Set<string>();
  const links: { label: string; href: string }[] = [];
  for (const tag of project.tags) {
    const link = NICHE_LINKS_BY_TAG[tag];
    if (link && !seen.has(link.href)) {
      seen.add(link.href);
      links.push(link);
    }
  }
  for (const niche of project.nicheTags ?? []) {
    const href = `/for/${niche}/`;
    if (!seen.has(href)) {
      seen.add(href);
      links.push({ label: niche.replace(/-/g, " "), href });
    }
  }
  return links;
}

export const FEATURED_PROJECT_SLUGS = [
  "carspotlive",
  "drain-cx",
  "cascade-markets",
  "whiteskyhosting",
] as const;

export function isFeaturedProject(slug: string): boolean {
  return (FEATURED_PROJECT_SLUGS as readonly string[]).includes(slug);
}
