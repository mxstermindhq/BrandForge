import type { Metadata } from "next";
import { LeaderboardClient } from "./_components/LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Season 1 rankings. Top specialists by Neon Score, " +
    "Honor, Conquest, and win streaks. 24,500 USDT prize ladder.",
  openGraph: { url: "https://brandforge.gg/leaderboard" },
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
