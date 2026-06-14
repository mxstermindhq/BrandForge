import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES, BlogHubGrid } from "@/components/blog/BlogHubGrid";
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
] as const;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const SLUG_TO_CATEGORY: Record<string, string> = {
  discord: "Discord",
  web3: "Web3",
  forums: "Forums",
  guides: "Guides",
  seo: "SEO",
  automation: "Automation",
};

export function generateStaticParams(): { slug: string }[] {
  return BLOG_CATEGORIES.filter((c) => c !== "All").map((cat) => ({
    slug: cat.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) return {};

  return buildPageMetadata({
    title: `${category} Guides — BrandForge Blog`,
    description: `Operator guides on ${category.toLowerCase()} — brand, growth, and delivery from BrandForge.`,
    path: `/blog/category/${slug}/`,
  });
}

export default async function BlogCategoryPage({ params }: CategoryPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const category = SLUG_TO_CATEGORY[slug];
  if (!category) notFound();

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
        { label: category, href: `/blog/category/${slug}/` },
      ]}
      path={`/blog/category/${slug}/`}
      faqs={faqs}
    >
      <PageHero
        eyebrow="Blog"
        title={`${category} guides`}
        subhead="Filtered operator notes — browse all topics on the main blog hub."
      />
      <BlogHubGrid posts={BLOG_INDEX} activeCategory={category} />
      <FAQBlock items={faqs} pageSlug={`/blog/category/${slug}/`} />
      <CTASection title="Want this on your project?" subhead="Quote on Discord in 24 hours." />
    </PageShell>
  );
}
