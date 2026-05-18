import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DirectoryHero,
  OperationalPulse,
  TalentDirectory,
  GuarantorStrip,
  TrustStandards,
  FooterBanner,
  FAQSection,
  LandingFooter,
} from "./_components";
import { getLandingOperators } from "@/lib/operators.server";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandforge.gg"),
  title: "BrandForge — AI-Native Growth Operators & Builders",
  description:
    "Hire vetted AI automation engineers, content operators, developers, and growth specialists. Done-for-you packages for startups, creators, and online brands.",
  keywords: [
    "AI automation",
    "growth operators",
    "hire developers",
    "UGC creators",
    "startup MVP",
    "TikTok growth",
    "funnel builder",
    "BrandForge",
    "professional directory",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brandforge.gg",
    siteName: "BrandForge",
    title: "BrandForge — AI-Native Operators for Modern Brands",
    description:
      "Curated talent + done-for-you packages. AI, growth, content, and automation — managed by mxstermind.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BrandForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — AI-Native Operators",
    description: "Hire vetted operators. Book outcome-focused packages.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BrandForge",
  url: "https://brandforge.gg",
  description:
    "Premium directory of AI-native growth operators and done-for-you packages for startups, creators, and online brands.",
};

export default async function LandingPage() {
  const operators = await getLandingOperators();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-background text-on-surface">
        <DirectoryHero />
        <Suspense fallback={<div className="px-4 py-16 text-sm text-[var(--color-text-secondary)]">Loading directory…</div>}>
          <TalentDirectory operators={operators} />
        </Suspense>
        <OperationalPulse />
        <GuarantorStrip />
        <TrustStandards />
        <FooterBanner />
        <section id="faq" className="border-t border-outline-variant">
          <FAQSection />
        </section>
        <LandingFooter />
      </main>
    </>
  );
}
