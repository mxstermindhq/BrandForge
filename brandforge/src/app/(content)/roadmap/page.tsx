import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CTASection, FAQBlock, InlineCTA, PageHero, PageShell, RoadmapStep } from "@/components/content";
import { RoadmapProcessDiagram } from "@/components/marketing/RoadmapProcessDiagram";
import { ROADMAP_HUB_FAQ, ROADMAP_STAGES, ROADMAP_SLUGS } from "@/content/roadmap/stages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Marketer Roadmap — Six Stages | BrandForge",
  description:
    "Pick your stage: validate, brand, launch, grow, scale, tools. Checklists and service links for operators.",
  path: "/roadmap/",
});

export default function RoadmapHubPage(): React.JSX.Element {
  const steps = ROADMAP_SLUGS.map((slug) => {
    const s = ROADMAP_STAGES[slug]!;
    return {
      stage: s.stage,
      slug: s.slug,
      title: s.title,
      summary: s.overview,
      checklist: s.checklist.slice(0, 4),
      nextHref: s.nextSlug ? `/roadmap/${s.nextSlug}/` : undefined,
      nextLabel: s.nextLabel,
      serviceHref: s.serviceHref,
      serviceLabel: s.serviceLabel,
    };
  });

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Roadmap", href: "/roadmap/" },
      ]}
      path="/roadmap/"
      schemaType="roadmap"
      faqs={ROADMAP_HUB_FAQ}
    >
      <PageHero
        eyebrow="Roadmap"
        title={
          <>
            Six stages. <em className="text-accent-bright not-italic">No guesswork.</em>
          </>
        }
        subhead="Where you are in the journey — validation, brand, launch, growth, automation, stack. Open your stage for the full checklist."
      />

      <Suspense fallback={<div className="py-12" aria-hidden />}>
        <RoadmapProcessDiagram />
      </Suspense>

      <section className="py-16">
        <div className="content-wrap space-y-6">
          {steps.map((step) => (
            <div key={step.slug} className="space-y-3">
              <RoadmapStep step={step} />
              <Link
                href={`/roadmap/${step.slug}/`}
                className="inline-block font-mono text-[10px] uppercase text-accent-bright hover:text-text"
              >
                Open full stage guide →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <InlineCTA
        headline="Not sure which stage you're in?"
        subhead="Tell us what you've shipped — we'll point you to the right roadmap stage and package on Discord or Telegram."
      />

      <FAQBlock items={ROADMAP_HUB_FAQ} pageSlug="/roadmap/" title="Roadmap FAQ" />
      <CTASection
        title="Not sure which stage?"
        subhead="Tell us what you shipped so far — we point you to the right page and package."
        campaign="roadmap-footer-cta"
      />
    </PageShell>
  );
}
