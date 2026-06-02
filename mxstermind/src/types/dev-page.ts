import type { FaqItem } from "@/types/content";
import type { DevSlug } from "@/content/developers/pages";

export type DevPageDetail = {
  slug: DevSlug;
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  subhead: string;
  overview: readonly string[];
  technologies: readonly { name: string; reason: string }[];
  projectExample: { name: string; href: string; summary: string };
  decisions: readonly { title: string; body: string }[];
  codeSnippet?: string;
  commercialBenefit: readonly string[];
  faqs: readonly FaqItem[];
};
