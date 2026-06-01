import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BrandForge privacy policy — what we collect when you contact us or browse brandforge.gg.",
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage(): React.JSX.Element {
  return (
    <>
      <header className="flex items-center justify-between border-b border-b1 px-8 py-4">
        <Link href="/" className="font-mono text-[11px] text-muted hover:text-text">
          ← BrandForge.gg
        </Link>
        <Link href="/terms" className="font-mono text-[11px] text-muted hover:text-text">
          Terms
        </Link>
      </header>
      <main className="mx-auto max-w-[760px] px-8 py-14 pb-24">
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
          <Link href="/terms" className="text-accent-bright hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </main>
    </>
  );
}
