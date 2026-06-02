import type { Metadata } from "next";
import {
  CTASection,
  FAQBlock,
  PageHero,
  PageShell,
  PortfolioCard,
} from "@/components/content";
import { PORTFOLIO_HUB_CARDS, PORTFOLIO_HUB_FAQ } from "@/content/hubs/portfolio-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio — Shipped Work | BrandForge",
  description:
    "Case studies: Cascade Markets, Drain.cx, CarSpotLive, ValAccs, Dyo Travel, SUI app, LinkedIn automation, WhiteSky Hosting.",
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
        subhead="Live URLs, App Store releases, and forum-verified delivery. Each case study documents scope, stack, timeline, and outcome — not mockups."
      />

      <section className="py-16">
        <div className="content-wrap grid gap-4 sm:grid-cols-2">
          {PORTFOLIO_HUB_CARDS.map((project) => (
            <PortfolioCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <FAQBlock items={PORTFOLIO_HUB_FAQ} />
      <CTASection
        title="Want results like these?"
        subhead="Send your niche and references on Discord or Telegram."
      />
    </PageShell>
  );
}
