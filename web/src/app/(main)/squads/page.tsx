import type { Metadata } from "next";
import { CollabSquadBuilder } from "@/components/CollabSquadBuilder";

export const metadata: Metadata = {
  title: "Squads | BrandForge",
  description: "Build teams and collaborate on projects with the BrandForge squad system.",
  openGraph: { url: "https://brandforge.gg/squads" },
};

export default function SquadsPage() {
  return <CollabSquadBuilder />;
}
