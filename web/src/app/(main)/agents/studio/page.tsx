import type { Metadata } from "next";
import { AgentStudio } from "@/components/agents/AgentStudio";

export const metadata: Metadata = {
  title: "Agent studio",
  description: "Visual workflow builder for agency AI agents (MVP canvas).",
  openGraph: { url: "https://brandforge.gg/agents/studio" },
};

export default function AgentStudioPage() {
  return (
    <div className="page-root text-on-surface">
      <div className="page-content pb-12">
        <p className="section-label !mb-2">BrandForge</p>
        <h1 className="page-title max-w-2xl">Agent studio</h1>
        <p className="page-subtitle mt-2 max-w-2xl">
          Build once, deploy to many clients. Persisting workflows to{" "}
          <code className="text-xs">agent_infra_workflows</code> is next.
        </p>
        <div className="mt-8">
          <AgentStudio />
        </div>
      </div>
    </div>
  );
}
