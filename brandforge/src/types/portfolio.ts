import type { FaqItem } from "@/types/content";

export type ProjectStatus = "live" | "upcoming" | "archived";

export type MockupType = "browser" | "phone" | "tablet";

export type PortfolioProject = {
  slug: string;
  name: string;
  category: string;
  status: ProjectStatus;
  description: string;
  tags: readonly string[];
  mockupType: MockupType;
  brandGradient: readonly [string, string];
  url?: string;
  ogImageUrl?: string;
  budgetPublic?: string;
  timeline: string;
  teamSize: string;
  outcomeMetric: string;
  brief: readonly string[];
  built: readonly string[];
  stack: readonly string[];
  outcome: readonly string[];
  relatedServices: readonly { label: string; href: string }[];
  vouch?: { quote: string; who: string; from: string };
  confidentialNote?: string;
  featured?: boolean;
  nicheTags?: readonly string[];
};

export type PortfolioDetail = {
  slug: string;
  meta: { title: string; description: string };
  name: string;
  tag: string;
  status: ProjectStatus;
  mockupType: MockupType;
  brandGradient: readonly [string, string];
  ogImageUrl?: string;
  liveUrl?: string;
  liveLabel?: string;
  context: readonly string[];
  problem: readonly string[];
  delivered: readonly string[];
  stack: readonly string[];
  timeline: string;
  teamSize: string;
  budgetPublic?: string;
  outcomeMetric: string;
  outcome: readonly string[];
  visuals: readonly { label: string; caption: string; mockupType?: MockupType }[];
  vouch?: { quote: string; who: string; from: string };
  relatedServices: readonly { label: string; href: string }[];
  faqs: readonly FaqItem[];
  confidentialNote?: string;
};
