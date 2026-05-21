import type { Metadata } from "next";
import { ForgePage } from "@/components/forge/ForgePage";

export const metadata: Metadata = {
  title: "API",
  description: "BrandForge API reference",
};

export default function APIPage() {
  return (
    <ForgePage
      title="API"
      eyebrow="Developers"
      description="Build on the forge — listings, talent, and health endpoints."
      narrow
    >
      <div className="forge-surface-card mb-6">
        <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">Authentication</h2>
        <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
          Bearer token on protected routes. Public catalog endpoints use anon keys where configured.
        </p>
        <code className="mt-4 block rounded-lg border border-[var(--forge-border)] bg-[var(--forge-surface-2)] p-4 font-mono text-xs text-[var(--forge-gold)]">
          Authorization: Bearer YOUR_ACCESS_TOKEN
        </code>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="forge-surface-card">
          <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">Talent</h2>
          <p className="mt-2 text-sm text-[var(--forge-text-muted)]">Curated operators directory.</p>
          <code className="mt-3 block text-xs text-[var(--forge-ember)]">GET /api/talent</code>
        </div>
        <div className="forge-surface-card">
          <h2 className="font-headline text-lg font-semibold text-[var(--forge-text)]">Health</h2>
          <p className="mt-2 text-sm text-[var(--forge-text-muted)]">Service heartbeat.</p>
          <code className="mt-3 block text-xs text-[var(--forge-ember)]">GET /api/health</code>
        </div>
      </div>
    </ForgePage>
  );
}
