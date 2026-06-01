import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "BrandForge terms of service — packages, revisions, refunds, payments, and delivery.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage(): React.JSX.Element {
  return (
    <>
      <header className="flex items-center justify-between border-b border-b1 px-8 py-4">
        <Link href="/" className="font-mono text-[11px] text-muted hover:text-text">
          ← BrandForge.gg
        </Link>
        <Link href="/privacy" className="font-mono text-[11px] text-muted hover:text-text">
          Privacy
        </Link>
      </header>
      <main className="mx-auto max-w-[760px] px-8 py-14 pb-24">
        <h1 className="text-[clamp(28px,4vw,40px)] font-bold">Terms of Service</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Last updated: May 27, 2026
        </p>
        <p className="mt-10 text-sm leading-relaxed text-text-secondary">
          These Terms govern purchases of design, development, and growth services from BrandForge at
          brandforge.gg. By requesting a quote or placing an order, you agree to these Terms.
        </p>
        <h2 className="mt-8 text-lg text-accent-bright">Services &amp; packages</h2>
        <p className="mt-3 text-sm text-text-secondary">
          BrandForge offers fixed-scope packages (Brand Sprint, Launch Stack, Growth Engine) and custom
          scopes quoted in writing before work begins.
        </p>
        <p className="mt-8 text-sm text-text-secondary">
          Questions:{" "}
          <a href={SITE.discord} className="text-accent-bright hover:underline">
            Discord
          </a>{" "}
          or{" "}
          <a href={SITE.telegram} className="text-accent-bright hover:underline">
            Telegram
          </a>
          .
        </p>
      </main>
    </>
  );
}
