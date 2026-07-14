import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";
import { metadataApiBase } from "@/lib/metadata-api";

export const metadata: Metadata = {
  title: "Status",
  description: "BrandForge system status",
};

export default async function StatusPage() {
  let apiOk = false;
  try {
    const res = await fetch(`${metadataApiBase()}/api/health`, { signal: AbortSignal.timeout(3000), next: { revalidate: 30 } });
    apiOk = res.ok;
  } catch {
    apiOk = false;
  }

  const services = [
    { name: "Web", status: "operational" },
    { name: "API", status: apiOk ? "operational" : "degraded" },
    { name: "Marketplace", status: apiOk ? "operational" : "degraded" },
  ];

  return (
    <ForgePage title="System status" eyebrow="Ops" narrow>
      <div className="mb-8 flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${apiOk ? "bg-[var(--forge-fire)]" : "bg-amber-500"}`}
        />
        <span className="text-[var(--forge-text-muted)]">
          {apiOk ? "Core services operational" : "API health check failed"}
        </span>
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="forge-surface-card flex items-center justify-between">
            <span className="font-medium text-[var(--forge-text)]">{service.name}</span>
            <span className="text-sm capitalize text-[var(--forge-gold)]">{service.status}</span>
          </div>
        ))}
      </div>
    </ForgePage>
  );
}
