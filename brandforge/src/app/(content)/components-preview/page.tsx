import {
  BlogCard,
  CTASection,
  DevCard,
  EthicsSection,
  FAQBlock,
  PageHero,
  PageShell,
  PortfolioCard,
  RoadmapStep,
  ServiceCard,
  TrustBar,
  VouchCard,
} from "@/components/content";
import { VOUCHES } from "@/content/home";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Component Preview — BrandForge",
  description: "Internal preview of shared content components for QA.",
  path: "/components-preview/",
});

const SAMPLE_FAQ = [
  {
    question: "How do I get a fixed quote from BrandForge?",
    answer:
      "Open Discord or Telegram and send your project scope, deadline, and references. BrandForge replies within 24 hours with a fixed USD quote. Escrow and crypto are accepted on every order.",
  },
] as const;

const ETHICS_SAMPLE = [
  {
    id: "client",
    title: "Client Standards",
    body: [
      "We respond to active projects within one business day on Discord or Telegram.",
      "Scope changes are documented before additional billing.",
    ],
  },
] as const;

/** Dev-only component verification page — excluded from sitemap in Phase 11. */
export default function ComponentsPreviewPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Components", href: "/components-preview/" },
      ]}
      path="/components-preview/"
      faqs={SAMPLE_FAQ}
    >
      <PageHero
        eyebrow="QA"
        title={
          <>
            Shared <em className="text-accent-bright not-italic">components</em>
          </>
        }
        subhead="Phase 1 library — all patterns render here for verification."
      />
      <TrustBar />
      <section className="py-16">
        <div className="content-wrap grid gap-4 sm:grid-cols-2">
          <ServiceCard
            service={{
              slug: "brand-identity",
              icon: "◈",
              title: "Brand Identity",
              description: "Logo, systems, guidelines.",
              href: "/services/brand-identity/",
            }}
          />
          <PortfolioCard
            project={{
              slug: "cascade-markets",
              tag: "Web3",
              name: "Cascade Markets",
              description: "Prediction market landing.",
              chips: ["Web3", "Landing"],
              href: "/portfolio/cascade-markets/",
            }}
          />
        </div>
      </section>
      <section className="content-wrap py-8">
        <VouchCard vouch={VOUCHES[0]!} />
      </section>
      <section className="content-wrap py-8">
        <BlogCard
          post={{
            slug: "sample",
            title: "Sample Blog Post",
            excerpt: "Excerpt for card layout.",
            date: "May 2026",
            readingTime: "8 min",
            href: "/blog/",
          }}
        />
      </section>
      <section className="content-wrap py-8">
        <DevCard
          card={{
            slug: "tech-stack",
            title: "Tech Stack",
            description: "Documented engineering choices.",
            tags: ["Next.js", "R3F"],
            href: "/developers/tech-stack/",
          }}
        />
      </section>
      <section className="content-wrap py-8">
        <RoadmapStep
          step={{
            stage: 1,
            slug: "validate",
            title: "Validate Your Idea",
            summary: "Test demand before you spend on brand or dev.",
            checklist: ["Define ICP", "Run 5 buyer interviews", "Ship a smoke-test landing"],
            nextHref: "/roadmap/build-your-brand/",
          }}
        />
      </section>
      <section className="content-wrap py-8">
        <EthicsSection sections={ETHICS_SAMPLE} />
      </section>
      <FAQBlock items={SAMPLE_FAQ} />
      <CTASection title="Ready to start?" subhead="Discord or Telegram — quote in 24 hours." />
    </PageShell>
  );
}
