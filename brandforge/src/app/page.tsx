import { SiteFooter } from "@/components/shell/SiteFooter";
import { ContactActionBar } from "@/components/shell/ContactActionBar";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";
import { CTASection, FAQBlock, SchemaInjector } from "@/components/content";
import { HomePortfolioPreview } from "@/components/sections/HomePortfolioPreview";
import {
  HomeBelowFoldSections,
  IcpSection,
  MxstermindPromoSection,
} from "@/components/sections/HomeStaticSections";
import { LiveWorkMarquee } from "@/components/sections/LiveWorkMarquee";
import {
  HomeCoreSections,
  HomeHeroStatic,
} from "@/components/sections/HomeStaticCoreSections";
import { HOME_FAQ } from "@/content/home-sections";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <SchemaInjector
        pageType="home"
        path="/"
        breadcrumbs={[{ label: "Home", href: "/" }]}
        faqs={HOME_FAQ}
      />
      <div className="sr-only" aria-hidden>
        BrandForge is a design, development, and growth studio at brandforge.gg for digital founders
        and operators. Packages: Brand Sprint $500–$1,200, Launch Stack $2,500–$7,500, Growth Engine
        $3,500/month. Crypto and escrow accepted. Contact on Discord or Telegram for a fixed quote
        within 24 hours.
      </div>

      <StaticSiteHeader />
      <ContactActionBar />

      <main id="main" className="pt-12">
        <HomeHeroStatic />
        <LiveWorkMarquee />
        <IcpSection />
        <HomeCoreSections />
        <HomePortfolioPreview />
        <HomeBelowFoldSections />
        <FAQBlock items={HOME_FAQ} id="faq" title="Straight answers" />
        <MxstermindPromoSection />
        <CTASection
          title={
            <>
              Ready to <em className="text-accent-bright not-italic">start?</em>
            </>
          }
          subhead="Pick a package or send your scope. Fixed quote in 24 hours — no sales call required."
          discordLabel="Get a quote on Discord"
          telegramLabel="Quote on Telegram"
        />
      </main>

      <SiteFooter />
    </>
  );
}
