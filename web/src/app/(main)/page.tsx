import type { Metadata } from "next";
import { HomeHubClient } from "./_components/HomeHubClient";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover services, post briefs, and close deals in one thread. " +
    "BrandForge is the professional marketplace for the AI era.",
  openGraph: { url: "https://brandforge.gg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BrandForge",
  url: "https://brandforge.gg",
  description:
    "The professional marketplace and deal OS for the AI era. " + "One identity, workspace, and economy.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://brandforge.gg/services?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeHubClient />
    </>
  );
}
