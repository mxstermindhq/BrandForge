import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { NICHE_PAGES, NICHE_SLUGS } from "@/content/niche/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Who We Serve — Niche Guides | BrandForge",
  description:
    "Tailored guides for gaming servers, Web3, SaaS, forums, e-commerce, creators, mobile apps, and ops automation teams.",
  path: "/for/",
});

const HUB_FAQ = [
  {
    question: "Which niche guide should I read first?",
    answer: "Pick the page closest to your business model — each links to relevant portfolio and services.",
  },
  {
    question: "Do all niches use the same packages?",
    answer: "Yes — five USD tiers with capacity limits; scope is quoted on Discord in 24 hours.",
  },
  {
    question: "Custom scope above packages?",
    answer: "mxstermind.com for premium bespoke; BrandForge packages stay fast and bounded.",
  },
  {
    question: "Not sure which niche fits?",
    answer: "Message on Discord with your URL and goal — we route you to the right tier.",
  },
] as const;

export default function NicheHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Who we serve", href: "/for/" },
      ]}
      path="/for/"
      faqs={HUB_FAQ}
    >
      <PageHero
        eyebrow="Who we serve"
        title={
          <>
            Eight niches. <em className="text-accent-bright not-italic">One squad.</em>
          </>
        }
        subhead="Operator guides with proof, packages, and FAQs — not generic agency fluff."
      />
      <section className="py-16">
        <div className="content-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NICHE_SLUGS.map((slug) => {
            const page = NICHE_PAGES[slug]!;
            return (
              <Link
                key={slug}
                href={`/for/${slug}/`}
                className="rounded-md border border-b1 bg-s1 p-6 transition-colors hover:border-accent"
              >
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted">{slug}</p>
                <h2 className="mt-2 text-lg font-bold">{page.headline}</h2>
                <p className="mt-3 text-sm text-text-secondary">{page.meta.description}</p>
                <p className="mt-4 font-mono text-[10px] text-accent-bright">Read guide →</p>
              </Link>
            );
          })}
        </div>
      </section>
      <FAQBlock items={HUB_FAQ} pageSlug="/for/" />
      <CTASection title="Not sure which guide fits?" subhead="Message on Discord — fixed quote in 24 hours." />
    </PageShell>
  );
}
