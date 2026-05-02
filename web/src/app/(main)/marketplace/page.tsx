import type { Metadata } from "next";
import { UnifiedMarketplace } from "./_components/UnifiedMarketplace";
import { JsonLdScript } from "@/components/JsonLdScript";
import { generateWebSiteJsonLd, generateBreadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Marketplace — Discover Specialists & Briefs · BrandForge",
  description:
    "Discover top specialists and post project briefs on BrandForge. AI-powered matching, escrow-secured deals, and verified professional services.",
  keywords: [
    "freelance marketplace",
    "hire specialists",
    "professional services",
    "project briefs",
    "verified talent",
    "escrow payments",
    "BrandForge marketplace",
  ],
  openGraph: {
    type: "website",
    url: "https://brandforge.gg/marketplace",
    title: "BrandForge Marketplace — Discover Specialists & Briefs",
    description:
      "Find verified specialists or post your project. AI-powered matching with escrow-secured deals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrandForge Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge Marketplace",
    description: "Discover specialists and post project briefs with escrow-secured deals.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://brandforge.gg/marketplace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

export default function MarketplacePage() {
  const jsonLdData = [
    generateWebSiteJsonLd(),
    generateBreadcrumbJsonLd([
      { name: "Home", url: "https://brandforge.gg" },
      { name: "Marketplace", url: "https://brandforge.gg/marketplace" },
    ]),
  ];

  return (
    <>
      <JsonLdScript data={jsonLdData} />
      <UnifiedMarketplace />
    </>
  );
}
