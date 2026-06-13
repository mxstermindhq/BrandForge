import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Membership — BrandForge Insider & Pro",
  description:
    "Free Insider Discord role or paid Pro for priority support, templates, and early store access.",
  path: "/membership/",
});

const MEMBERSHIP_FAQ = [
  {
    question: "What is BrandForge Insider?",
    answer: "Free Discord role for operators who download resources or join the community — announcements and showcase access.",
  },
  {
    question: "What is BrandForge Pro?",
    answer: "Paid monthly tier — priority Discord support, early template drops, and workshop recordings. Stripe subscription coming soon.",
  },
  {
    question: "How is this different from packages?",
    answer: "Membership is community + assets. Packages are scoped client delivery with fixed deliverables.",
  },
] as const;

const TIERS = [
  {
    name: "Insider",
    price: "Free",
    features: ["Discord Ecosystem Member role", "Weekly digest in #announcements", "Community showcase submissions"],
    cta: "Join Discord",
    campaign: "membership-insider",
  },
  {
    name: "Pro",
    price: "$29/mo",
    features: [
      "Priority support thread",
      "Early store template access",
      "Workshop recordings",
      "Monthly office hours",
    ],
    cta: "Join waitlist on Discord",
    campaign: "membership-pro-waitlist",
  },
] as const;

export default function MembershipPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Membership", href: "/membership/" },
      ]}
      path="/membership/"
      faqs={MEMBERSHIP_FAQ}
    >
      <PageHero
        eyebrow="Membership"
        title={
          <>
            Stay in the loop. <em className="text-accent-bright not-italic">Ship with the squad.</em>
          </>
        }
        subhead="Community tiers for operators — not a replacement for client packages."
      />

      <section className="py-16">
        <div className="content-wrap grid gap-6 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <article key={tier.name} className="rounded-md border border-b1 bg-s1 p-8">
              <h2 className="text-xl font-bold">{tier.name}</h2>
              <p className="mt-2 font-mono text-2xl font-bold text-accent-bright">{tier.price}</p>
              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                {tier.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <a
                href={discordHref(tier.campaign)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
                {...ctaTrackAttrs("discord", tier.campaign)}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <FAQBlock items={MEMBERSHIP_FAQ} pageSlug="/membership/" />
      <CTASection title="Need delivery?" subhead="Packages start at $300 — quote in 24h." campaign="membership-footer" />
    </PageShell>
  );
}
