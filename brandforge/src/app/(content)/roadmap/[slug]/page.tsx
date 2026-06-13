import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/content";
import { RoadmapStageTemplate } from "@/components/content/RoadmapStageTemplate";
import { ROADMAP_SLUGS, ROADMAP_STAGES } from "@/content/roadmap/stages";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return ROADMAP_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stage = ROADMAP_STAGES[slug];
  if (!stage) return {};
  return buildPageMetadata({
    title: stage.meta.title,
    description: stage.meta.description,
    path: `/roadmap/${slug}/`,
  });
}

export default async function RoadmapStagePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const stage = ROADMAP_STAGES[slug];
  if (!stage) notFound();

  const path = `/roadmap/${slug}/`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Roadmap", href: "/roadmap/" },
        { label: stage.title, href: path },
      ]}
      path={path}
      schemaType="roadmap"
      faqs={stage.faqs}
      howTo={{
        name: stage.title,
        description: stage.overview,
        steps: stage.checklist,
      }}
    >
      <RoadmapStageTemplate stage={stage} />
    </PageShell>
  );
}
