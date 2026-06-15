import type { FaqItem } from "@/types/content";

export type BlogContentBlock =
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "solution"; title: string; paragraphs: readonly string[] }
  | { type: "stat"; stat: string; copyLabel?: string; context?: string }
  | {
      type: "statsBox";
      items: readonly { label: string; value: string }[];
    };

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  subtitle?: string;
  author?: string;
  pullQuote?: string;
  datePublished: string;
  readingTime: string;
  series?: string;
  category?: string;
  tags?: readonly string[];
  ogImage?: string;
  heroImage?: string;
  sections: readonly {
    heading: string;
    paragraphs?: readonly string[];
    blocks?: readonly BlogContentBlock[];
    codeSnippets?: readonly { language: string; code: string; showLineNumbers?: boolean }[];
  }[];
  faqs: readonly FaqItem[];
  relatedServices?: readonly { label: string; href: string }[];
  relatedPortfolio?: readonly string[];
  relatedNiches?: readonly string[];
  relatedBlog?: readonly { slug: string; title: string }[];
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
