import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { SITE } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

const ABOUT_FAQ = [
  {
    question: "Who is mxstermind?",
    answer:
      "A selective studio for established businesses and serious founders — same team network as BrandForge, bespoke intake and scope.",
  },
  {
    question: "Where are you based?",
    answer: "Remote-first — EU and US timezone coverage on active engagements.",
  },
  {
    question: "Do you take early-stage startups?",
    answer: "Sometimes — if scope is bounded and budget matches complexity. Many early operators are better served by BrandForge packages.",
  },
  {
    question: "How do I verify delivered work?",
    answer: "Public case studies at /portfolio/ and vouches in-thread. NDAs limit what we can publish.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "About — Studio Story | mxstermind",
  description:
    "mxstermind is the bespoke studio arm — custom design, engineering, and growth for scaling companies.",
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
        title="Editorial studio, production discipline"
        subhead="mxstermind exists for buyers who need custom scope — not another template agency or hourly dev shop."
      />
      <section className="py-12">
        <div className="content-wrap max-w-2xl space-y-6 text-sm leading-relaxed text-text-secondary">
          <p>
            The same operators who built BrandForge packages for forum sellers and Web3 founders saw a pattern: established
            businesses arrived with cross-functional scope — mobile plus backend plus brand — that did not fit a cart checkout.
          </p>
          <p>
            mxstermind is the selective front door for those engagements. One scope document. Named contributors. Discord and
            Telegram as the system of record — no portal theatre.
          </p>
          <p>
            Productized work remains on{" "}
            <a href={SITE.brandforge} className="text-accent-bright hover:text-text" rel="noopener noreferrer">
              brandforge.gg
            </a>
            . Bespoke work lives here.
          </p>
          <Link href="/portfolio/" className="inline-block font-mono text-[11px] text-accent-bright hover:text-text">
            View portfolio →
          </Link>
        </div>
      </section>
      <FAQBlock items={ABOUT_FAQ} />
      <CTASection title="Apply when fit is bespoke" subhead="Outcome, deadline, budget band — reply within 24 hours." />
    </PageShell>
  );
}
