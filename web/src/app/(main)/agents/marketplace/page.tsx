import type { Metadata } from "next";
import { AgentMarketplace } from "@/components/agents/AgentMarketplace";

export const metadata: Metadata = {
  title: "AI agent marketplace",
  description: "Deploy AI agents for SEO, content, ads, and prospecting — infrastructure for agencies.",
  openGraph: { url: "https://brandforge.gg/agents/marketplace" },
};

export default function AgentMarketplacePage() {
  return (
    <div className="page-root text-on-surface">
      <div className="page-content pb-12">
        <p className="section-label !mb-2">BrandForge</p>
        <h1 className="page-title max-w-2xl">AI agent marketplace</h1>
        <p className="page-subtitle mt-2 max-w-2xl">
          Browse public agent templates. Deployments, billing, and ROI dashboards ship in the next iterations.
        </p>
        <div className="mt-10">
          <AgentMarketplace />
        </div>
      </div>
    </div>
  );
}
