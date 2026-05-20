import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DirectoryHero,
  ProcessTimeline,
  ProofStrip,
  OperationalPulse,
  TalentDirectory,
  GuarantorStrip,
  TrustStandards,
  FAQSection,
  LandingFooter,
} from "./_components";
import { StickyConversationCTA } from "@/components/directory/StickyConversationCTA";
import { getLandingOperators } from "@/lib/operators.server";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "BrandForge — Curated AI-Native Operators",
  description:
    "A verified directory of elite builders, designers, and growth operators. One conversation with mxstermind — scoped, trusted, no marketplace noise.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — Curated AI-Native Operators",
    description: "Browse vetted operators, services, and work. Start one conversation with mxstermind.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BrandForge" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BrandForge",
  url: "https://brandforge.gg",
  description: "Curated directory of AI-native operators — introduced by mxstermind.",
};

export default async function LandingPage() {
  const operators = await getLandingOperators();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-background text-on-surface">
        <DirectoryHero operators={operators} />
        <ProofStrip />
        <ProcessTimeline />
        <Suspense fallback={<div className="px-4 py-16 text-sm text-[var(--color-text-secondary)]">Loading directory…</div>}>
          <TalentDirectory operators={operators} />
        </Suspense>
        <OperationalPulse />
        <GuarantorStrip />
        <TrustStandards />
        <section id="faq" className="border-t border-outline-variant">
          <FAQSection />
        </section>
        <LandingFooter />
        <StickyConversationCTA />
      </main>
    </>
  );
}
