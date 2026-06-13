import type { Metadata } from "next";
import { BlogFilterGrid } from "@/components/blog/BlogFilterGrid";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { BLOG_INDEX } from "@/content/blog/index";
import { buildPageMetadata } from "@/lib/seo/metadata";

const faqs = [
  {
    question: "Who publishes BrandForge blog posts?",
    answer: "BrandForge — with Article schema and FAQs on every post for AI extraction.",
  },
  {
    question: "Topics covered?",
    answer: "Brand, GEO, Discord, forums, mobile, CRO, and agency selection for operators.",
  },
  {
    question: "mxstermind blog?",
    answer: "Bespoke and Studio notes at mxstermind.com/blog — cross-linked where relevant.",
  },
  {
    question: "Suggest a topic?",
    answer: "Discord — we write from real delivery lessons.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Blog — Operator Guides | BrandForge",
  description:
    "GEO, Discord branding, forum marketing, mobile case studies, and agency selection — written for operators.",
  path: "/blog/",
});

export default function BlogHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
      ]}
      path="/blog/"
      faqs={faqs}
    >
      <PageHero
        eyebrow="Blog"
        title="Guides that ship — not filler"
        subhead="Long-form notes for forum sellers, Web3 founders, and community operators."
      />
      <BlogFilterGrid posts={BLOG_INDEX} />
      <FAQBlock items={faqs} pageSlug="/blog/" />
      <CTASection title="Want this on your project?" subhead="Quote on Discord in 24 hours." />
    </PageShell>
  );
}
