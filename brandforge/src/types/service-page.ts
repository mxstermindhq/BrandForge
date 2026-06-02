import type { FaqItem } from "@/types/content";
import type { ServiceSlug } from "@/content/hubs/services-hub";

export type ServiceProcessStep = {
  title: string;
  body: string;
};

export type ServicePortfolioLink = {
  label: string;
  href: string;
  blurb: string;
};

export type ServiceBlogLink = {
  label: string;
  href: string;
};

export type ServiceDetail = {
  slug: ServiceSlug;
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subhead: string;
  };
  icp: readonly string[];
  included: readonly string[];
  process: readonly ServiceProcessStep[];
  portfolio: readonly ServicePortfolioLink[];
  blogLinks: readonly ServiceBlogLink[];
  pricing: {
    range: string;
    note: string;
  };
  body: readonly string[];
  faqs: readonly FaqItem[];
};
