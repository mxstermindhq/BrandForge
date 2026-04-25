import type { Metadata } from "next";
import { PerformanceLeaderboard } from "@/components/leaderboard/WoWRankingSystem";

export const metadata: Metadata = {
  title: "Leaderboard | BrandForge",
  description:
    "Top professionals ranked by closed deals, marketplace volume, and client ratings — transparent signals for hiring.",
  openGraph: { url: "https://brandforge.gg/leaderboard" },
};

export default function LeaderboardPage() {
  return <PerformanceLeaderboard />;
}
