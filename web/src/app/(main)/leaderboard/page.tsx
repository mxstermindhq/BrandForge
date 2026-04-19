import type { Metadata } from "next";
import { WoWRankingSystem } from "@/components/leaderboard/WoWRankingSystem";

export const metadata: Metadata = {
  title: "Arena Rankings | BrandForge",
  description:
    "World of BrandForge competitive rankings. Rise from Challenger to Undisputed. " +
    "Earn Honor, Conquest, and RP through successful deals. Seasonal prize pools.",
  openGraph: { url: "https://brandforge.gg/leaderboard" },
};

export default function LeaderboardPage() {
  return <WoWRankingSystem />;
}
