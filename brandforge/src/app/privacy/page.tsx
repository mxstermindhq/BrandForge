import type { Metadata } from "next";
import Link from "next/link";
import { SchemaInjector } from "@/components/content/SchemaInjector";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { ContactActionBar } from "@/components/shell/ContactActionBar";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BrandForge privacy policy — what we collect when you contact us or browse brandforge.gg.",
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <>
      <SchemaInjector
        pageType="default"
        path="/privacy/"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy", href: "/privacy/" },
        ]}
      />
      <StaticSiteHeader />
      <ContactActionBar />
      <main className="mx-auto max-w-[760px] px-8 pb-24 pt-36">
        <nav className="mb-10 flex justify-between font-mono text-[11px] text-muted">
          <Link href="/" className="hover:text-text" data-cursor="hover">
            ← BrandForge.gg
          </Link>
          <Link href="/terms" className="hover:text-text" data-cursor="hover">
            Terms
          </Link>
        </nav>
        <h1 className="text-[clamp(28px,4vw,40px)] font-bold">Privacy Policy</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Last updated: May 27, 2026
        </p>
        <p className="mt-10 text-sm leading-relaxed text-text-secondary">
          BrandForge operates brandforge.gg. We collect messages you send on Discord or Telegram,
          anonymous analytics when enabled, and standard Cloudflare security logs. We do not sell
          personal information.
        </p>
        <p className="mt-8 text-sm text-text-secondary">
          See also our{" "}
          <Link href="/terms" className="text-accent-bright hover:underline" data-cursor="hover">
            Terms of Service
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
