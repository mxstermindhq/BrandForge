import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevPageTemplate, PageHero, PageShell } from "@/components/content";
import { DEV_SLUGS, getDevPage } from "@/content/developers/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return DEV_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDevPage(slug);
  if (!page) return {};
  return buildPageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/developers/${slug}/`,
  });
}

export default async function DeveloperPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const page = getDevPage(slug);
  if (!page) notFound();

  const path = `/developers/${slug}/`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developers", href: "/developers/" },
        { label: page.title, href: path },
      ]}
      path={path}
      faqs={page.faqs}
    >
      <PageHero eyebrow={page.eyebrow} title={page.title} subhead={page.subhead} />
      <DevPageTemplate page={page} />
    </PageShell>
  );
}
