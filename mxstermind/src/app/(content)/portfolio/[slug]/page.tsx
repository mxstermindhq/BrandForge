import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell, PortfolioPageTemplate } from "@/components/content";
import { getAllPortfolioSlugs, getPortfolioBySlug } from "@/content/portfolio/details";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllPortfolioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  if (!project) return {};
  return buildPageMetadata({
    title: project.meta.title,
    description: project.meta.description,
    path: `/portfolio/${slug}/`,
  });
}

export default async function PortfolioCasePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  if (!project) notFound();

  const path = `/portfolio/${slug}/`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio/" },
        { label: project.name, href: path },
      ]}
      path={path}
      schemaType="portfolio"
      faqs={project.faqs}
      creativeWork={{
        name: project.name,
        description: project.meta.description,
        url: `${SITE.url}${path}`,
      }}
    >
      <PortfolioPageTemplate project={project} />
    </PageShell>
  );
}
