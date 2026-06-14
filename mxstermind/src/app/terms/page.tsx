import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "mxstermind terms — Founder OS access, milestones, payments, and delivery standards.",
  alternates: { canonical: `${SITE.url}/terms/` },
};

export default function TermsPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-8 pb-24 pt-28">
        <nav className="mb-10 flex justify-between font-mono text-[11px] text-muted">
          <Link href="/" className="hover:text-text">
            ← mxstermind.com
          </Link>
          <Link href="/privacy/" className="hover:text-text">
            Privacy
          </Link>
        </nav>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-light">Terms of Service</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Last updated: May 19, 2026
        </p>
        <p className="mt-10 text-sm leading-relaxed text-text-secondary">
          These Terms govern Founder Operating System access and implementation engagements from mxstermind at
          mxstermind.com. By applying or signing a scope document, you agree to these Terms.
        </p>
        <h2 className="mt-8 font-serif text-lg text-accent-bright">Engagements &amp; scope</h2>
        <p className="mt-3 text-sm text-text-secondary">
          mxstermind is the Founder Operating System — not a shopping-cart package store. Every OS engagement begins with fit review,
          then a fixed USD scope document with milestones, deliverables, and revision boundaries.
          Work outside scope requires a written change order.
        </p>
        <h2 className="mt-8 font-serif text-lg text-accent-bright">Payments</h2>
        <p className="mt-3 text-sm text-text-secondary">
          Milestone deposits are due before work begins on each phase. Crypto and escrow are
          supported when agreed in writing. Final asset transfer follows payment per the signed scope.
        </p>
        <h2 className="mt-8 font-serif text-lg text-accent-bright">Productized packages</h2>
        <p className="mt-3 text-sm text-text-secondary">
          Fixed-scope packages for operators live at{" "}
          <a href={SITE.packages} className="text-accent-bright hover:underline" rel="noopener noreferrer">
            brandforge.gg/packages
          </a>
          . Those Terms apply to BrandForge orders, not mxstermind Founder OS work.
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
      <SiteFooter />
    </>
  );
}
