import type { Metadata } from "next";
import { CTASection, FAQBlock, PageHero, PageShell, PortfolioCard } from "@/components/content";
import { PORTFOLIO_HUB_CARDS, PORTFOLIO_HUB_FAQ } from "@/content/hubs/portfolio-hub";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Portfolio — Case Studies | mxstermind",
  description:
    "Web3, mobile, fintech, and automation case studies — cascade.markets, SUI rebuild, crypto trading platform, and more.",
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
        title="Shipped under real constraints"
        subhead="Permissioned case studies from Founder OS implementations — Web3, mobile, fintech, and automation."
      />
      <section className="py-12">
        <div className="content-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_HUB_CARDS.map((project) => (
            <PortfolioCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <FAQBlock items={PORTFOLIO_HUB_FAQ} />
      <CTASection title="Discuss similar work" subhead="Send the closest case study plus your deadline on Discord." />
    </PageShell>
  );
}
