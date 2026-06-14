import type { Metadata } from "next";
import Link from "next/link";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
  PortfolioCard,
} from "@/components/content";
import { MXM_POSITIONING } from "@/config/positioning";
import { PORTFOLIO_HUB_CARDS } from "@/content/hubs/portfolio-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/config/site";

const HOME_FAQ = [
  {
    question: "What is mxstermind?",
    answer:
      "A Founder Operating System — monetization rails, ops workflows, growth stack, and economics for founders who outgrew fixed packages. Not an agency retainer.",
  },
  {
    question: "How is mxstermind different from BrandForge?",
    answer: MXM_POSITIONING.vsBrandForge,
  },
  {
    question: "How do I get access?",
    answer:
      "Apply on /apply/ or message Discord. Share your stage, revenue model, and what you need from the OS — reply within 24 hours.",
  },
  {
    question: "Who is the Founder OS for?",
    answer: MXM_POSITIONING.audience,
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: `mxstermind — ${MXM_POSITIONING.title}`,
  description: MXM_POSITIONING.tagline,
  path: "/",
});

export default function HomePage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[{ label: "Home", href: "/" }]}
      path="/"
      schemaType="home"
      faqs={HOME_FAQ}
      showBreadcrumbs={false}
    >
      <PageHero
        eyebrow={MXM_POSITIONING.title}
        title={
          <>
            Run your business like a{" "}
            <em className="text-accent-bright not-italic">system</em> — not a side project.
          </>
        }
        subhead={MXM_POSITIONING.tagline}
        primaryCta={{ label: MXM_POSITIONING.ctaPrimary, href: SITE.discord }}
        secondaryCta={{ label: "How the OS works", href: "/process/" }}
      />

      <section className="border-b border-b1 py-[var(--spacing-section)]">
        <div className="content-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">OS modules</p>
          <h2 className="mt-3 font-serif text-3xl font-light">Monetization · Ops · Growth</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
            The Founder OS connects economics, automation, and growth infrastructure — built from
            shipped work in portfolio case studies, not slide decks.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Monetization OS",
                body: "Member tiers, pricing rails, checkout, and revenue ops for communities and products.",
              },
              {
                title: "Ops OS",
                body: "Workflows, dashboards, CRM sync, and handoffs that replace spreadsheet chaos.",
              },
              {
                title: "Growth OS",
                body: "SEO, GEO, content systems, and launch loops tied to measurable outcomes.",
              },
            ].map((m) => (
              <article key={m.title} className="rounded-md border border-b1 bg-s2 p-6">
                <h3 className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm text-text-secondary">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-b1 py-[var(--spacing-section)]">
        <div className="content-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">Selected work</p>
          <h2 className="mt-3 font-serif text-3xl font-light">Proof behind the OS</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_HUB_CARDS.slice(0, 3).map((project) => (
              <PortfolioCard key={project.slug} project={project} />
            ))}
          </div>
          <Link href="/portfolio/" className="mt-8 inline-block font-mono text-[11px] text-accent-bright hover:text-text">
            View all case studies →
          </Link>
        </div>
      </section>

      <section className="py-[var(--spacing-section)]">
        <div className="content-wrap grid gap-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Execution layer</p>
            <h2 className="mt-3 font-serif text-2xl font-light">Need packages first?</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              BrandForge publishes fixed tiers for brand, web, and growth — quote in 24 hours. Many
              founders start there, then graduate to the Founder OS when economics and ops complexity
              grow.
            </p>
            <a
              href={SITE.brandforge}
              className="mt-6 inline-block font-mono text-[11px] text-accent-bright hover:text-text"
              rel="noopener noreferrer"
            >
              brandforge.gg →
            </a>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Technical depth</p>
            <h2 className="mt-3 font-serif text-2xl font-light">Developer platform</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Stack documentation, AI systems, blockchain, automation, and architecture from shipped
              OS implementations.
            </p>
            <Link href="/developers/" className="mt-6 inline-block font-mono text-[11px] text-accent-bright hover:text-text">
              Explore developers →
            </Link>
          </div>
        </div>
      </section>

      <FAQBlock items={HOME_FAQ} title="Questions founders ask" />
      <CTASection
        title={MXM_POSITIONING.ctaApply}
        subhead="Discord or Telegram — stage, revenue model, and OS needs. Reply within 24 hours."
        discordLabel={MXM_POSITIONING.ctaPrimary}
      />
    </PageShell>
  );
}
