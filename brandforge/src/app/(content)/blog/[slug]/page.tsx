import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle, CTASection, PageHero, PageShell } from "@/components/content";
import { SITE } from "@/config/site";
import { BLOG_POSTS, BLOG_SLUGS } from "@/content/blog/index";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) return {};
  return buildPageMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${slug}/`,
    ogImage: post.ogImage,
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) notFound();

  const path = `/blog/${slug}/`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog/" },
        { label: post.title, href: path },
      ]}
      path={path}
      schemaType="article"
      faqs={post.faqs}
      article={{
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.datePublished,
        url: `${SITE.url}${path}`,
      }}
    >
      <PageHero
        eyebrow="BrandForge editorial"
        title={post.title}
        subhead={post.subtitle ?? post.metaDescription}
      />
      <BlogArticle post={post} />
      <CTASection
        title={
          slug === "the-state-of-things-2026"
            ? "Start building something that matters"
            : "Apply this to your build"
        }
        subhead={
          slug === "the-state-of-things-2026"
            ? "Join Discord for a fixed quote in 24 hours — mention The State of Things."
            : "Discord or Telegram — name this article."
        }
        discordLabel={slug === "the-state-of-things-2026" ? "Join Discord" : undefined}
        campaign={slug === "the-state-of-things-2026" ? "blog-state-of-things-cta" : undefined}
      />
    </PageShell>
  );
}
