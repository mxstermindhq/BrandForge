import { buildPortfolioDetail } from "@/content/portfolio/build-detail";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import type { PortfolioDetail } from "@/types/portfolio";

export const PORTFOLIO_DETAILS: readonly PortfolioDetail[] = PORTFOLIO_PROJECTS.map((p) =>
  buildPortfolioDetail(p),
);

export function getPortfolioBySlug(slug: string): PortfolioDetail | undefined {
  return PORTFOLIO_DETAILS.find((d) => d.slug === slug);
}

export function getAllPortfolioSlugs(): readonly string[] {
  return PORTFOLIO_DETAILS.map((d) => d.slug);
}
