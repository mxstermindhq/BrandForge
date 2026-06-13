/** Shared content types for marketing pages, blog, and schema. */

export type FaqItem = {
  question: string;
  answer: string;
};

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type ServiceCardData = {
  slug: string;
  icon: string;
  title: string;
  description: string;
  href: string;
};

export type PortfolioCardData = {
  slug: string;
  tag: string;
  name: string;
  description: string;
  chips: readonly string[];
  href: string;
  imageAlt?: string;
};

export type VouchCardData = {
  id: string;
  from: string;
  stars: number;
  text: string;
  who: string;
  amount?: string;
  role?: string;
  portfolioSlug?: string;
  avatarInitial?: string;
};

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  href: string;
  category?: string;
  tags?: readonly string[];
};

export type RoadmapStepData = {
  stage: number;
  slug: string;
  title: string;
  summary: string;
  checklist: readonly string[];
  nextHref?: string;
  nextLabel?: string;
  serviceHref?: string;
  serviceLabel?: string;
};

export type DevCardData = {
  slug: string;
  title: string;
  description: string;
  tags: readonly string[];
  href: string;
};

export type EthicsSectionData = {
  id: string;
  title: string;
  body: readonly string[];
};

export type PageSeoMeta = {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: readonly string[];
};

export type SchemaPageType =
  | "home"
  | "default"
  | "service"
  | "portfolio"
  | "blog"
  | "roadmap"
  | "ethics"
  | "article";

export type SchemaInjectorProps = {
  pageType: SchemaPageType;
  path: string;
  breadcrumbs: readonly BreadcrumbItem[];
  faqs?: readonly FaqItem[];
  serviceName?: string;
  serviceDescription?: string;
  creativeWork?: {
    name: string;
    description: string;
    url: string;
  };
  article?: {
    headline: string;
    description: string;
    datePublished: string;
    url: string;
  };
};
