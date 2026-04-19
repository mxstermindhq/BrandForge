import type { Metadata } from "next";
import { OutcomeSquads } from "@/components/squads/OutcomeSquads";

export const metadata: Metadata = {
  title: "Outcome Squads | BrandForge",
  description: "Assemble human and AI agents into powerful squads. Execute projects end-to-end with your dream team.",
  openGraph: { url: "https://brandforge.gg/squads" },
};

export default function SquadsPage() {
  return <OutcomeSquads />;
}
