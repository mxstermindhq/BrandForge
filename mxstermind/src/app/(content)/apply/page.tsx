import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { SITE, telegramUrl } from "@/config/site";
import { buildPageMetadata } from "@/lib/seo/metadata";

const APPLY_FAQ = [
  {
    question: "What should I include in my application?",
    answer:
      "Outcome you need, target deadline, budget band, and links to references or existing product. Stack constraints and NDA requirements up front.",
  },
  {
    question: "How fast do you reply?",
    answer: "Within 24 hours on business days. Complex diligence may need an extra day — we will say so.",
  },
  {
    question: "What if mxstermind is not a fit?",
    answer: "We decline honestly and may point to BrandForge packages when scope fits a tier.",
  },
  {
    question: "Is there a form?",
    answer: "No. Discord and Telegram only — same channels as delivery.",
  },
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: "Apply — Start a Bespoke Engagement | mxstermind",
  description:
    "Apply on Discord or Telegram with outcome, deadline, and budget band. mxstermind replies within 24 hours.",
  path: "/apply/",
});

export default function ApplyPage(): React.JSX.Element {
  const telegramApply = telegramUrl(
    "Hi mxstermind — I'd like to apply for a bespoke engagement.\n\nOutcome:\nDeadline:\nBudget band:\nReferences:",
  );

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Apply", href: "/apply/" },
      ]}
      path="/apply/"
      faqs={APPLY_FAQ}
    >
      <PageHero
        eyebrow="Apply"
        title="Tell us what outcome you are buying"
        subhead="Four fields: outcome, deadline, budget band, references. No forms — Discord or Telegram."
        primaryCta={{ label: "Open Discord", href: SITE.discord }}
        secondaryCta={{ label: "Apply on Telegram", href: telegramApply }}
      />
      <section className="py-12">
        <div className="content-wrap max-w-2xl">
          <h2 className="font-serif text-xl font-light">Application template</h2>
          <pre className="mt-4 overflow-x-auto rounded-sm border border-b1 bg-s2 p-6 font-mono text-[11px] leading-relaxed text-text-secondary">
{`Outcome: [What changes for the business when this ships]
Deadline: [Hard date or window]
Budget band: [USD range you can approve]
References: [3 links you respect]
Constraints: [Stack, compliance, NDA — optional]`}
          </pre>
          <p className="mt-6 text-sm text-text-secondary">
            Read{" "}
            <Link href="/process/" className="text-accent-bright hover:text-text">
              process
            </Link>{" "}
            and{" "}
            <Link href="/ethics-standards/" className="text-accent-bright hover:text-text">
              ethics
            </Link>{" "}
            before applying. For package tiers, see{" "}
            <a href={SITE.packages} className="text-accent-bright hover:text-text" rel="noopener noreferrer">
              BrandForge packages
            </a>
            .
          </p>
        </div>
      </section>
      <FAQBlock items={APPLY_FAQ} />
      <CTASection title="Send the template today" subhead="We reply within 24 hours with fit and next steps." />
    </PageShell>
  );
}
