import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "mxstermind privacy policy — what we collect when you apply or browse mxstermind.com.",
  alternates: { canonical: `${SITE.url}/privacy/` },
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-8 pb-24 pt-28">
        <nav className="mb-10 flex justify-between font-mono text-[11px] text-muted">
          <Link href="/" className="hover:text-text">
            ← mxstermind.com
          </Link>
          <Link href="/terms/" className="hover:text-text">
            Terms
          </Link>
        </nav>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-light">Privacy Policy</h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Last updated: May 19, 2026
        </p>
        <p className="mt-10 text-sm leading-relaxed text-text-secondary">
          mxstermind operates mxstermind.com. We collect messages you send on Discord or Telegram,
          intake details you provide during apply, anonymous analytics when enabled, and standard
          Cloudflare security logs. We do not sell personal information.
        </p>
        <h2 className="mt-8 font-serif text-lg text-accent-bright">Client data</h2>
        <p className="mt-3 text-sm text-text-secondary">
          During engagements we access only the systems required to deliver agreed milestones.
          Credentials and assets are handled least-privilege and revoked on handoff unless a retainer
          explicitly extends access.
        </p>
        <p className="mt-8 text-sm text-text-secondary">
          See also our{" "}
          <Link href="/terms/" className="text-accent-bright hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/ethics-standards/" className="text-accent-bright hover:underline">
            Ethics &amp; Standards
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
