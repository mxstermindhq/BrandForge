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
      <PageHero eyebrow="BrandForge editorial" title={post.title} subhead={post.metaDescription} />
      <BlogArticle post={post} />
      <CTASection title="Apply this to your build" subhead="Discord or Telegram — name this article." />
    </PageShell>
  );
}
