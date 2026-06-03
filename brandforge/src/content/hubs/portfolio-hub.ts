import {
  PORTFOLIO_PROJECTS,
  PORTFOLIO_SLUGS,
  type PortfolioSlug,
} from "@/content/portfolio/projects";
import type { PortfolioCardData } from "@/types/content";

export { PORTFOLIO_SLUGS, type PortfolioSlug };

export const PORTFOLIO_HUB_CARDS: readonly PortfolioCardData[] = PORTFOLIO_PROJECTS.map((p) => ({
  slug: p.slug,
  tag: p.category,
  name: p.name,
  description: p.description,
  chips: p.tags,
  href: `/portfolio/${p.slug}/`,
}));

export const PORTFOLIO_HUB_FAQ = [
  {
    question: "Are these live projects I can verify?",
    answer:
      "Live entries link to production URLs or app stores. Archived projects were delivered then discontinued by clients — still proof of range. Upcoming entries are in active development.",
  },
  {
    question: "Can BrandForge build something similar?",
    answer: "Yes. Send references on Discord or Telegram — fixed USD quote within 24 hours.",
  },
  {
    question: "Why show archived work?",
    answer:
      "Archived projects prove delivery depth across Web3, gaming, AI, and enterprise — even when clients later shut down or went silent.",
  },
  {
    question: "Who builds portfolio projects?",
    answer: "One coordinated BrandForge team — design, development, and growth under one roof.",
  },
] as const;
