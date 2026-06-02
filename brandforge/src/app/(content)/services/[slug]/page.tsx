import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/content";
import { ServicePageTemplate } from "@/components/content/ServicePageTemplate";
import { SERVICE_SLUGS } from "@/content/hubs/services-hub";
import { getAllServiceSlugs, getServiceBySlug } from "@/content/services/details";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return buildPageMetadata({
    title: service.meta.title,
    description: service.meta.description,
    path: `/services/${slug}/`,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service || !SERVICE_SLUGS.includes(service.slug)) {
    notFound();
  }

  const path = `/services/${slug}/`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Services", href: "/services/" },
        { label: service.hero.eyebrow, href: path },
      ]}
      path={path}
      schemaType="service"
      serviceName={service.hero.eyebrow}
      serviceDescription={service.meta.description}
      faqs={service.faqs}
    >
      <ServicePageTemplate service={service} />
    </PageShell>
  );
}
