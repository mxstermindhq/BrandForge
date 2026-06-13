import type { Metadata } from "next";
import Link from "next/link";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { ResourceDownloadLink } from "@/components/marketing/ResourceDownloadLink";
import { PartnerCard } from "@/components/marketing/PartnerCard";
import {
  AFFILIATE_PROGRAM,
  PARTNERS,
  PARTNER_TIERS,
  type PartnerTier,
} from "@/content/partners/registry";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Partners & Affiliates — BrandForge",
  description:
    "Affiliate program, recommended tools, and collaborator partners. 20% referral commission — applications via Discord.",
  path: "/partners/",
});

const PARTNERS_FAQ = [
  {
    question: "How does the affiliate program work?",
    answer: `Earn ${AFFILIATE_PROGRAM.commission} on qualified referrals. Apply on Discord with audience niche. Track inbound with ?ref=yourcode — GA4 records partner_referral events.`,
  },
  {
    question: "Are affiliate links disclosed?",
    answer: "Yes. Every tool or partner link with a commercial relationship is marked on this page.",
  },
  {
    question: "How do payouts work?",
    answer: `${AFFILIATE_PROGRAM.payout}. Monthly report from GA4 + manual reconciliation.`,
  },
  {
    question: "Partner spotlight content?",
    answer: "Monthly co-marketing posts on /blog/ — see Partner Spotlight series.",
  },
] as const;

function TierSection({ tier }: { tier: PartnerTier }): React.JSX.Element | null {
  const meta = PARTNER_TIERS[tier];
  const items = PARTNERS.filter((p) => p.tier === tier);
  const showTier = tier === "affiliate" || items.length > 0;
  if (!showTier) return null;

  return (
    <section className="py-16">
      <div className="content-wrap">
        <h2 className="text-xl font-bold">{meta.label}</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">{meta.description}</p>
        {tier === "affiliate" ? (
          <a
            href={discordHref(AFFILIATE_PROGRAM.applyCampaign)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded bg-discord px-5 py-2.5 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", AFFILIATE_PROGRAM.applyCampaign)}
          >
            Apply for {AFFILIATE_PROGRAM.commission} affiliate program
          </a>
        ) : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {items.map((p) => (
            <PartnerCard key={p.slug} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PartnersPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Partners", href: "/partners/" },
      ]}
      path="/partners/"
      faqs={PARTNERS_FAQ}
    >
      <PageHero
        eyebrow="Partners v2"
        title={
          <>
            Grow with us. <em className="text-accent-bright not-italic">Earn with us.</em>
          </>
        }
        subhead="Affiliates, tools we trust, and collaborators — transparent tracking and monthly reporting."
      />

      <TierSection tier="affiliate" />
      <TierSection tier="tool" />
      <TierSection tier="collaborator" />

      <section className="border-t border-b1 bg-s1 py-16">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">Partner spotlight</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Monthly co-marketing on the blog — tools and agencies we work with in production.
          </p>
          <Link
            href="/blog/partner-spotlight-whitesky-hosting/"
            className="mt-4 inline-block font-mono text-[11px] text-accent-bright"
          >
            Read: WhiteSky Hosting + BrandForge →
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="content-wrap">
          <h2 className="text-xl font-bold">Free resources</h2>
          <ul className="mt-6 space-y-3">
            {[
              { name: "Discord Server Branding Checklist", file: "/downloads/discord-branding-checklist.pdf" },
              { name: "Web3 Brand Trust Framework", file: "/downloads/web3-brand-trust-framework.pdf" },
              { name: "Creator Economy Stack (joint)", file: "/downloads/creator-economy-stack.pdf" },
            ].map((r) => (
              <li key={r.file}>
                <ResourceDownloadLink href={r.file} name={r.name} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FAQBlock items={PARTNERS_FAQ} pageSlug="/partners/" />
      <CTASection
        title="Want to partner?"
        subhead="Discord intake — weekly partner review in /launch/ ops."
        campaign="partners-footer-cta"
      />
    </PageShell>
  );
}
