import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/content";
import { PortfolioPageTemplate } from "@/components/content/PortfolioPageTemplate";
import { PORTFOLIO_SLUGS } from "@/content/hubs/portfolio-hub";
import { getAllPortfolioSlugs, getPortfolioBySlug } from "@/content/portfolio/details";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllPortfolioSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  if (!project) return {};

  return buildPageMetadata({
    title: project.meta.title,
    description: project.meta.description,
    path: `/portfolio/${slug}/`,
  });
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);

  if (!project || !PORTFOLIO_SLUGS.includes(project.slug)) {
    notFound();
  }

  const path = `/portfolio/${slug}/`;
  const caseUrl = `${SITE.url}${path}`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio/" },
        { label: project.name, href: path },
      ]}
      path={path}
      schemaType="portfolio"
      creativeWork={{
        name: project.name,
        description: project.meta.description,
        url: project.liveUrl ?? caseUrl,
      }}
      faqs={project.faqs}
    >
      <PortfolioPageTemplate project={project} />
    </PageShell>
  );
}
