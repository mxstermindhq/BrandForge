import type { FaqItem } from "@/types/content";

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  readingTime: string;
  series?: string;
  category?: string;
  tags?: readonly string[];
  ogImage?: string;
  sections: readonly {
    heading: string;
    paragraphs: readonly string[];
    codeSnippets?: readonly { language: string; code: string; showLineNumbers?: boolean }[];
  }[];
  faqs: readonly FaqItem[];
  relatedServices?: readonly { label: string; href: string }[];
  relatedPortfolio?: readonly string[];
  relatedNiches?: readonly string[];
};

export type BlogIndexEntry = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  href: string;
  category: string;
  tags: readonly string[];
};
