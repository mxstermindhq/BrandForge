import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status | BrandForge",
  description: "BrandForge system status",
};

const services = [
  { name: "API", status: "operational", uptime: "99.9%" },
  { name: "Web App", status: "operational", uptime: "99.9%" },
  { name: "AI Agents", status: "operational", uptime: "99.5%" },
  { name: "Marketplace", status: "operational", uptime: "99.9%" },
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">System Status</h1>
        
        <div className="flex items-center gap-3 mb-12">
          <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
          <span className="text-lg text-on-surface-variant">All systems operational</span>
        </div>
        
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="surface-card p-6 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${service.status === "operational" ? "bg-success" : "bg-error"}`} />
                <span className="font-medium text-on-surface">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-on-surface-variant">{service.uptime} uptime</span>
                <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
