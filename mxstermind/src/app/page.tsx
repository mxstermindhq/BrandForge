import type { Metadata } from "next";
import Link from "next/link";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
  PortfolioCard,
} from "@/components/content";
import { PORTFOLIO_HUB_CARDS } from "@/content/hubs/portfolio-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/config/site";

const HOME_FAQ = [
  {
    question: "What is mxstermind?",
    answer:
      "A selective studio for established businesses and serious founders — bespoke design, engineering, and growth. No packages. Custom scope only.",
  },
  {
    question: "How is mxstermind different from BrandForge?",
    answer:
      "BrandForge.gg ships productized packages for operators who want speed. mxstermind quotes custom engagements when scope crosses product, Web3, automation, and growth.",
  },
  {
    question: "How do I start an engagement?",
    answer: "Apply on /apply/ or message Discord. Share outcome, deadline, and budget band — reply within 24 hours.",
  },
  {
    question: "What budget should we plan for?",
    answer:
      "Most bespoke builds start above package tiers — often $5k–$50k+ USD. Fixed quote after scoping conversation.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "mxstermind — Bespoke Design, Engineering & Growth",
  description:
    "Selective studio for scaling companies. Custom scope — brand, product, Web3, automation. Apply on Discord or Telegram.",
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
        eyebrow="Bespoke studio"
        title={
          <>
            Outcomes for companies that{" "}
            <em className="text-accent-bright not-italic">outgrew templates.</em>
          </>
        }
        subhead="mxstermind takes selective engagements — brand, full-stack engineering, Web3, and growth architecture. No packages. Fixed scope after fit."
        primaryCta={{ label: "Apply on Discord", href: SITE.discord }}
        secondaryCta={{ label: "View process", href: "/process/" }}
      />

      <section className="border-b border-b1 py-[var(--spacing-section)]">
        <div className="content-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">Selected work</p>
          <h2 className="mt-3 font-serif text-3xl font-light">Proof, not promises</h2>
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
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">For operators on a budget</p>
            <h2 className="mt-3 font-serif text-2xl font-light">Need packages instead?</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              BrandForge publishes fixed tiers for brand, web, and growth — quote in 24 hours. Same team, faster path when scope is defined.
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
              Stack documentation, AI systems, blockchain, automation, and architecture writeups from shipped work.
            </p>
            <Link href="/developers/" className="mt-6 inline-block font-mono text-[11px] text-accent-bright hover:text-text">
              Explore developers →
            </Link>
          </div>
        </div>
      </section>

      <FAQBlock items={HOME_FAQ} title="Questions serious buyers ask" />
      <CTASection
        title="Apply when the outcome is worth custom scope"
        subhead="Discord or Telegram — outcome, deadline, budget band. Reply within 24 hours."
        discordLabel="Apply on Discord"
      />
    </PageShell>
  );
}
