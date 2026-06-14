import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { MXM_POSITIONING } from "@/config/positioning";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

const ABOUT_FAQ = [
  {
    question: "Who is mxstermind?",
    answer:
      "The Founder Operating System — monetization, ops, and growth infrastructure for founders who outgrew packages. Same team network as BrandForge.",
  },
  {
    question: "Where are you based?",
    answer: "Remote-first — EU and US timezone coverage for active OS clients.",
  },
  {
    question: "Do you take early-stage startups?",
    answer:
      "Often better served by BrandForge packages first. The Founder OS fits when you have revenue traction and systems complexity.",
  },
  {
    question: "How do I verify delivered work?",
    answer: "Public case studies at /portfolio/ and vouches in-thread. NDAs limit what we can publish.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: `About — ${MXM_POSITIONING.title} | mxstermind`,
  description: MXM_POSITIONING.shortDescription,
  path: "/about/",
});

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
        title="Built as a system, not a service menu"
        subhead="mxstermind is the Founder Operating System — economics, workflows, and growth wired together for operators scaling beyond packages."
      />
      <section className="py-12">
        <div className="content-wrap max-w-2xl space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            The same operators who built BrandForge packages for forum sellers and Web3 founders saw a
            pattern: revenue-validated founders needed an operating layer — monetization rails, ops
            automation, and growth systems — not another agency SOW every quarter.
          </p>
          <p>
            mxstermind is that layer. One OS mindset. Named contributors. Discord and Telegram as the
            system of record — no portal theatre.
          </p>
          <p>
            Bounded execution remains on{" "}
            <a href={SITE.brandforge} className="text-accent-bright hover:text-text" rel="noopener noreferrer">
              brandforge.gg
            </a>
            . The Founder OS lives here.
          </p>
          <Link href="/portfolio/" className="inline-block font-mono text-[11px] text-accent-bright hover:text-text">
            View portfolio →
          </Link>
        </div>
      </section>
      <FAQBlock items={ABOUT_FAQ} />
      <CTASection title={MXM_POSITIONING.ctaApply} subhead="Stage, revenue model, OS needs — reply within 24 hours." />
    </PageShell>
  );
}
