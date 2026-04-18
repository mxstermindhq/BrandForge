import type { Metadata } from "next";
import {
  LandingHero,
  FeaturesGrid,
  HowItWorks,
  WorldOfBrandForge,
  FinalCTA,
  AskAICards,
  PlansShowcase,
} from "./_components";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "World of BrandForge — AI-Powered Professional Marketplace",
  description:
    "Enter the World of BrandForge. AI agents, deal rooms, smart matching, and a competitive ranking system. " +
    "Execute projects end-to-end with human and AI squads.",
  keywords: [
    "AI marketplace",
    "professional services",
    "deal rooms",
    "smart matching",
    "AI agents",
    "outcome squads",
    "BrandForge",
    "contract generator",
    "escrow marketplace",
    "competitive ranking",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "World of BrandForge — AI-Powered Professional Marketplace",
    description:
      "Enter the World of BrandForge. AI agents, deal rooms, smart matching, and competitive ranking.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "World of BrandForge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World of BrandForge",
    description: "AI agents, deal rooms, and competitive ranking for professionals.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "World of BrandForge",
  url: "https://brandforge.gg",
  description: "AI-powered professional marketplace with deal rooms, smart matching, and competitive ranking.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://brandforge.gg/services?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background">
        {/* HERO - Main value proposition */}
        <section id="hero" className="relative">
          <LandingHero />
        </section>

        {/* PRICING - Plans */}
        <section id="pricing" className="relative border-t border-outline-variant/40">
          <PlansShowcase />
        </section>

        {/* PRODUCT - Core offering */}
        <section id="product" className="relative border-t border-outline-variant/40">
          <WorldOfBrandForge />
        </section>

        {/* SOLUTION - Features */}
        <section id="solution" className="relative border-t border-outline-variant/40">
          <FeaturesGrid />
        </section>

        {/* SOCIAL PROOF - Ask AI */}
        <section className="relative border-t border-outline-variant/40">
          <AskAICards />
        </section>

        {/* HOW IT WORKS - Step by step */}
        <section id="how-it-works" className="relative border-t border-outline-variant/40">
          <HowItWorks />
        </section>

        {/* CTA - Final call to action */}
        <section className="relative border-t border-outline-variant/40">
          <FinalCTA />
        </section>
      </main>
    </>
  );
}
