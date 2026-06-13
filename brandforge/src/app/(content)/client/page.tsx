import type { Metadata } from "next";
import { PageShell } from "@/components/content";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Client Portal | BrandForge",
  description: "Project status and delivery files for active clients.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: `${SITE.url}/client/` },
};

/** Scaffold — protect with Cloudflare Access. Status updated manually until portal backend ships. */
export default function ClientPortalPage(): React.JSX.Element {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Client", href: "/client/" },
      ]}
      path="/client/"
      showBreadcrumbs={false}
    >
      <div className="content-wrap py-24">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">Client portal</p>
        <h1 className="mt-3 text-2xl font-bold">Project status</h1>
        <p className="mt-4 max-w-xl text-sm text-text-secondary">
          Password-protected delivery hub (scaffold). Active clients receive a Cloudflare Access link or
          Discord thread with files. This page documents the future flow:
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
          <li>In Design — brand exploration and revisions</li>
          <li>In Review — client feedback window</li>
          <li>Delivered — download brand kit, guidelines, and assets</li>
        </ol>
        <p className="mt-8 font-mono text-[10px] text-muted">
          Feedback → Discord webhook or thread. Invoice status updated manually. See docs/API.md for
          webhook scaffold.
        </p>
      </div>
    </PageShell>
  );
}
