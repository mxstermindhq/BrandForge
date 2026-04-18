import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Deployment",
    description: `Agent deployment ${id} — ROI and run history.`,
    robots: { index: false, follow: true },
  };
}

export default async function AgentDeploymentPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="page-root text-on-surface">
      <div className="page-content max-w-xl pb-12">
        <p className="section-label !mb-2">Agents</p>
        <h1 className="page-title">Deployment</h1>
        <p className="text-on-surface-variant font-body mt-2 text-sm">
          ID: <code className="text-on-surface">{id}</code>
        </p>
        <p className="page-subtitle mt-4">
          Run history, cost, and ROI charts will read from <code className="text-xs">agent_infra_execution_runs</code> and{" "}
          <code className="text-xs">agent_infra_roi</code>. This page is a placeholder until those APIs are wired.
        </p>
        <Link href="/agents/marketplace" className="btn-secondary mt-8 inline-flex min-h-11 items-center px-5">
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
