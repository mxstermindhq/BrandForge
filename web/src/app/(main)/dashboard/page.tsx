import type { Metadata } from "next";
import { HomeHubClient } from "../_components/HomeHubClient";
import { DashboardQuest } from "./_components/DashboardQuest";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your BrandForge dashboard. Discover services, post briefs, and close deals in one thread.",
  openGraph: { url: "https://brandforge.gg/dashboard" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BrandForge Dashboard",
  url: "https://brandforge.gg/dashboard",
  description:
    "The professional marketplace and deal OS for the AI era. One identity, workspace, and economy.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://brandforge.gg/services?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function DashboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-root">
        <div className="page-content pb-10">
          <div className="mb-6">
            <p className="section-label !mb-3">Dashboard</p>
            <h1 className="page-title">Welcome back, champion.</h1>
            <p className="page-subtitle">
              Track your progress, complete quests, and climb the leaderboard.
            </p>
          </div>
          <DashboardQuest />
          <HomeHubClient />
        </div>
      </div>
    </>
  );
}
