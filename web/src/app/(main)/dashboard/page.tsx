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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-1">Dashboard</div>
            <h1 className="text-3xl font-bold">Welcome back, champion</h1>
            <p className="text-zinc-400 mt-1">Track your progress, complete quests, and climb the leaderboard.</p>
          </div>
          <DashboardQuest />
          <HomeHubClient />
        </div>
      </div>
    </>
  );
}
