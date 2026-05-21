import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "Status",
  description: "BrandForge system status",
};

const services = [
  { name: "Marketplace", status: "operational", uptime: "99.9%" },
  { name: "Web", status: "operational", uptime: "99.9%" },
  { name: "API", status: "operational", uptime: "99.8%" },
  { name: "Discord bot", status: "operational", uptime: "99.5%" },
];

export default function StatusPage() {
  return (
    <ForgePage title="System status" eyebrow="Ops" narrow>
      <div className="mb-8 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-[var(--forge-fire)] shadow-[0_0_12px_var(--forge-glow)]" />
        <span className="text-[var(--forge-text-muted)]">All systems operational</span>
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className="forge-surface-card flex items-center justify-between">
            <span className="font-medium text-[var(--forge-text)]">{service.name}</span>
            <div className="text-right text-sm">
              <span className="text-[var(--forge-gold)] capitalize">{service.status}</span>
              <span className="ml-3 text-[var(--forge-text-muted)]">{service.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </ForgePage>
  );
}
