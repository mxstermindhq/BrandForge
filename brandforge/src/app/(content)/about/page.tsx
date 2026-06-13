import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell, TrustBar } from "@/components/content";
import { HERO_STATS, VOUCHES } from "@/content/home";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About BrandForge — Design, Dev & Growth Team",
  description:
    "BrandForge is a fixed-package studio for forum operators, Web3 founders, and digital sellers. 50+ projects, escrow-friendly, quote in 24h.",
  path: "/about/",
});

const ABOUT_FAQ = [
  {
    question: "Who founded BrandForge and who does the work?",
    answer:
      "BrandForge is operated by mxstermind — a studio that has delivered 50+ projects across Web3, gaming communities, SaaS, and e-commerce. The same senior team executes package work; we do not white-label to unknown freelancers after payment.",
  },
  {
    question: "Where is BrandForge based?",
    answer:
      "We work remote-first with clients worldwide. Communication happens on Discord and Telegram — the channels forum operators and crypto founders already use daily.",
  },
  {
    question: "Why fixed packages instead of hourly billing?",
    answer:
      "Operators hate surprise invoices. Packages set honest ranges; you get a fixed quote after scope review. That model matches how forum sellers and founders actually buy creative work.",
  },
  {
    question: "When should I use mxstermind instead of BrandForge?",
    answer:
      "Choose BrandForge for bounded scope with fast turnaround. Choose mxstermind.com when you need bespoke teams, complex integrations, or outcome-based engagements above package tiers.",
  },
] as const;

export default function AboutPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about/" },
      ]}
      path="/about/"
      faqs={ABOUT_FAQ}
    >
      <PageHero
        eyebrow="About"
        title={
          <>
            Built for operators who <em className="text-accent-bright not-italic">ship.</em>
          </>
        }
        subhead="BrandForge exists because forum sellers, Discord server owners, and Web3 founders kept paying three vendors for brand, website, and growth — then chasing handoffs for weeks."
      />
      <TrustBar items={HERO_STATS} />

      <section className="py-16">
        <div className="content-wrap max-w-3xl space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            We are not a generalist agency pitching Fortune 500 decks. BrandForge is the execution layer
            of mxstermind — design, development, and growth packages with fixed USD pricing, escrow
            support, and delivery measured in days, not quarters.
          </p>
          <p>
            Our portfolio includes cascade.markets, drain.cx, CarSpotLive on the App Store, ValAccs.com,
            dyotravel.com, a SUI blockchain app rebuilt in two weeks, and automation platforms scoped
            above $4,000. We understand middleman culture, crypto payment, and the reputation cost of
            missing a deadline.
          </p>
          <p>
            You will not find a contact form on this site. Discord and Telegram are the only intake
            channels — because that is how our clients already work.
          </p>
        </div>
      </section>

      <section className="border-t border-b1 py-16">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">What clients say</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {VOUCHES.slice(0, 4).map((v) => (
              <blockquote key={v.id} className="rounded-md border border-b1 bg-s1 p-5 text-sm">
                <p className="text-text-secondary">&ldquo;{v.text}&rdquo;</p>
                <footer className="mt-3 font-mono text-[10px] text-accent-bright">{v.who}</footer>
              </blockquote>
            ))}
          </div>
          <Link href="/#vouches" className="mt-6 inline-block font-mono text-[10px] text-accent-bright">
            More vouches on home →
          </Link>
        </div>
      </section>

      <FAQBlock items={ABOUT_FAQ} pageSlug="/about/" />
      <CTASection
        title="Work with BrandForge"
        subhead="Open Discord or Telegram — we reply with a fixed quote within 24 hours."
      />
    </PageShell>
  );
}
