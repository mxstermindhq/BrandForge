import type { Metadata } from "next";
import { AGIAgents } from "@/components/agents/AGIAgents";

export const metadata: Metadata = {
  title: "AGI Agents | BrandForge",
  description: "Deploy customizable AI agents to execute tasks end-to-end. Browse templates or create your own agents.",
  openGraph: { url: "https://brandforge.gg/agents" },
};

export default function AgentsPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <AGIAgents />
      </div>
    </div>
  );
}
