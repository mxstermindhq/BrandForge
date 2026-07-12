import type { Metadata } from "next";
import Link from "next/link";
import { ForgeHeader } from "@/components/shell/ForgeHeader";
import { ForgeFooter } from "@/components/shell/ForgeFooter";
import { SchemaInjector } from "@/components/content/SchemaInjector";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BrandForge terms of service — packages, revisions, refunds, payments, and delivery.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage(): React.JSX.Element {
  return (
    <>
      <SchemaInjector
        pageType="default"
        path="/terms/"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms", href: "/terms/" },
        ]}
      />
      <ForgeHeader />
      <main id="main" className="min-h-[60vh] mx-auto max-w-[760px] px-8 pb-24 pt-28">
        <nav className="mb-10 flex justify-between font-mono text-[11px] text-muted">
          <Link href="/" className="hover:text-text">
            ← BrandForge.gg
          </Link>
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
        </nav>
        <h1 className="text-[clamp(28px,4vw,40px)] font-bold">Terms of Service</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Last updated: May 27, 2026
        </p>
        <p className="mt-10 text-sm leading-relaxed text-text-secondary">
          These Terms govern purchases of design, development, and growth services from BrandForge at
          brandforge.gg. By requesting a quote or placing an order, you agree to these Terms.
        </p>
        <p className="mt-8 text-sm text-text-secondary">
          Questions:{" "}
          <a href={SITE.discord} className="text-accent hover:underline">
            Discord
          </a>{" "}
          or{" "}
          <a href={SITE.telegram} className="text-accent hover:underline">
            Telegram
          </a>
          .
        </p>
      </main>
      <ForgeFooter />
    </>
  );
}
