import type { FaqItem } from "@/types/content";
import type { PortfolioSlug } from "@/content/hubs/portfolio-hub";

export type PortfolioVisual = {
  label: string;
  caption: string;
};

export type PortfolioDetail = {
  slug: PortfolioSlug;
  meta: {
    title: string;
    description: string;
  };
  name: string;
  tag: string;
  liveUrl?: string;
  liveLabel?: string;
  context: readonly string[];
  problem: readonly string[];
  delivered: readonly string[];
  stack: readonly string[];
  timeline: string;
  teamSize: string;
  outcome: readonly string[];
  visuals: readonly PortfolioVisual[];
  vouch?: {
    quote: string;
    who: string;
    from: string;
  };
  relatedServices: readonly { label: string; href: string }[];
  faqs: readonly FaqItem[];
};
