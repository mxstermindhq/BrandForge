import type { Metadata } from "next";
import {
  LandingHero,
  PlansShowcase,
  FeaturesGrid,
  FAQSection,
  LandingFooter,
} from "./_components";
import { DealRoomShowcase } from "@/components/landing/DealRoomShowcase";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "BrandForge — Client-First Hiring Marketplace",
  description:
    "Hire proven specialists faster. Run offers, counters, contracts, and payments in one client-first flow with AI support.",
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
  name: "BrandForge",
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
      <main className="min-h-screen bg-background text-on-surface">
        <section id="hero" className="relative">
          <LandingHero />
        </section>

        <section id="pricing" className="relative border-t border-outline-variant">
          <PlansShowcase />
        </section>

        <FeaturesGrid />

        <section id="flow" className="relative border-t border-outline-variant">
          <DealRoomShowcase />
        </section>

        <section id="faq" className="relative border-t border-outline-variant">
          <FAQSection />
        </section>
        <LandingFooter />
      </main>
    </>
  );
}
