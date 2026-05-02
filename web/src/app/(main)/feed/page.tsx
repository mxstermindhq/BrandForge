import type { Metadata } from "next";
import { WorkFeedClient } from "./_components/WorkFeedClient";
import { JsonLdScript } from "@/components/JsonLdScript";
import { generateWebSiteJsonLd, generateBreadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Work Feed — Professional Activity · BrandForge",
  description:
    "See what professionals are working on. Deal wins, new briefs, portfolio drops, and collaboration opportunities on BrandForge.",
  keywords: [
    "professional network",
    "work feed",
    "deal wins",
    "project briefs",
    "collaboration",
    "freelance updates",
    "professional activity",
  ],
  openGraph: {
    type: "website",
    url: "https://brandforge.gg/feed",
    title: "BrandForge Work Feed — Professional Activity",
    description: "See deal wins, new briefs, and collaboration opportunities.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrandForge Work Feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge Work Feed",
    description: "Professional activity, deal wins, and collaboration opportunities.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://brandforge.gg/feed",
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

export default function WorkFeedPage() {
  const jsonLdData = [
    generateWebSiteJsonLd(),
    generateBreadcrumbJsonLd([
      { name: "Home", url: "https://brandforge.gg" },
      { name: "Work Feed", url: "https://brandforge.gg/feed" },
    ]),
  ];

  return (
    <>
      <JsonLdScript data={jsonLdData} />
      <WorkFeedClient />
    </>
  );
}
