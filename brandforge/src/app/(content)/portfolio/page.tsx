import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell } from "@/components/content";
import { PortfolioFilterGrid } from "@/components/portfolio/PortfolioFilterGrid";
import { PORTFOLIO_HUB_FAQ } from "@/content/portfolio/faq";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio — Shipped Work | BrandForge",
  description:
    "Live, upcoming, and archived projects: hosting, mobile apps, gaming commerce, creator platforms, AI, and Web3 — verified case studies.",
  path: "/portfolio/",
});

export default function PortfolioHubPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio/" },
      ]}
      path="/portfolio/"
      faqs={PORTFOLIO_HUB_FAQ}
    >
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Work we&apos;ve <em className="text-accent-bright not-italic">shipped.</em>
          </>
        }
        subhead="Filter by Live, Upcoming, or Archived. Every card links to a full case study with scope, stack, visuals, and outcomes — not stock mockups."
      />

      <PortfolioFilterGrid />

      <FAQBlock items={PORTFOLIO_HUB_FAQ} pageSlug="/portfolio/" />
      <CTASection
        title="Want results like these?"
        subhead="Send your niche and references on Discord or Telegram."
        discordLabel="Get a quote on Discord"
        telegramLabel="Message on Telegram"
      />
    </PageShell>
  );
}
