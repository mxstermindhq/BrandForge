import { SiteFooter } from "@/components/shell/SiteFooter";
import { ContactActionBar } from "@/components/shell/ContactActionBar";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";
import { SchemaInjector } from "@/components/content";
import { LazyWhenVisible } from "@/components/perf/LazyWhenVisible";
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
import { VOUCHES } from "@/content/home";
import dynamic from "next/dynamic";

const ClientLogoBar = dynamic(
  () => import("@/components/marketing/ClientLogoBar").then((m) => ({ default: m.ClientLogoBar })),
);

const FAQBlock = dynamic(
  () => import("@/components/content/FAQBlock").then((m) => ({ default: m.FAQBlock })),
  { loading: () => <div className="content-wrap py-24" aria-hidden /> },
);

const CTASection = dynamic(
  () => import("@/components/content/CTASection").then((m) => ({ default: m.CTASection })),
  { loading: () => <div className="py-24" aria-hidden /> },
);

const CRITICAL_HOME_CSS = `:root{--bg:#060608;--text:#e2e0ea;--t2:#a09cb8;--a:#7c3aed;--a2:#9d5fff;--b1:#181820;--max:1200px}body{background:var(--bg);color:var(--text);margin:0}.content-wrap{max-width:var(--max);margin-inline:auto;padding-inline:clamp(18px,4vw,32px)}#hero h1{font-weight:700;line-height:1.05}`;

export default function HomePage(): React.JSX.Element {
  const reviews = VOUCHES.slice(0, 8).map((v) => ({
    author: v.who,
    text: v.text,
    rating: v.stars,
  }));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CRITICAL_HOME_CSS }} />
      <SchemaInjector
        pageType="home"
        path="/"
        breadcrumbs={[{ label: "Home", href: "/" }]}
        faqs={HOME_FAQ}
        reviews={reviews}
      />
      <div className="sr-only" aria-hidden>
        BrandForge is a design, development, and growth studio at brandforge.gg for digital founders
        and operators. Packages: Blueprint $300–$500, Automator $1,500–$3,000/month, MVP Engine
        $5,000/month, AI and Community $7,500/month, Full-Stack Powerhouse $10,000+/month. Crypto
        and escrow accepted. Contact on Discord or Telegram for a fixed quote within 24 hours.
      </div>

      <StaticSiteHeader />
      <ContactActionBar />

      <main id="main" className="pt-12">
        <HomeHeroStatic />
        <LazyWhenVisible minHeight={120}>
          <ClientLogoBar />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={80}>
          <LiveWorkMarquee />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={400}>
          <IcpSection />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={720}>
          <HomeCoreSections />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={520} rootMargin="300px">
          <HomePortfolioPreview />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={400}>
          <HomeBelowFoldSections />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={480} rootMargin="200px">
          <FAQBlock items={HOME_FAQ} id="faq" title="Straight answers" pageSlug="/" />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={200}>
          <MxstermindPromoSection />
        </LazyWhenVisible>
        <LazyWhenVisible minHeight={320}>
          <CTASection
            title={
              <>
                Ready to <em className="text-accent-bright not-italic">start?</em>
              </>
            }
            subhead="Pick a package or send your scope. Fixed quote in 24 hours — no sales call required."
            discordLabel="Get a quote on Discord"
            telegramLabel="Quote on Telegram"
            campaign="home-footer-cta"
            showCalendly
          />
        </LazyWhenVisible>
      </main>

      <SiteFooter />
    </>
  );
}
