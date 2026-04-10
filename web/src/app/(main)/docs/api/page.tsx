import type { Metadata } from "next";
import Link from "next/link";
import { API_REFERENCE } from "@/content/api-reference";
import { COMPANY_PRODUCT_BLURB } from "@/content/legal-copy";

export const metadata: Metadata = {
  title: "API",
  description: "JSON API for the BrandForge marketplace and workspace backend.",
};

function defaultApiBase(): string {
  const b = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
  return b.replace(/\/$/, "");
}

export default function ApiDocsPage() {
  const base = defaultApiBase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 pb-24 md:px-6">
      <header className="mb-12">
        <p className="font-headline text-secondary mb-2 text-[10px] font-black uppercase tracking-[0.35em]">
          Developers
        </p>
        <h1 className="font-display from-on-surface to-secondary bg-gradient-to-r bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl">
          API reference
        </h1>
        <p className="text-on-surface-variant mt-4 max-w-2xl text-sm font-light leading-relaxed md:text-base">
          {COMPANY_PRODUCT_BLURB} This document describes the HTTP JSON API served by the BrandForge Node server (not
          Supabase REST). The Next.js web app proxies browser calls to your configured origin.
        </p>
        <div className="border-outline-variant/20 bg-surface-container-low/50 mt-6 rounded-xl border px-4 py-3 font-mono text-xs text-on-surface md:text-sm">
          <span className="text-on-surface-variant">Base URL · </span>
          {base}
        </div>
      </header>

      <section className="mb-10 space-y-3 text-sm">
        <h2 className="font-headline text-on-surface text-xs font-black uppercase tracking-[0.2em]">Who &amp; why</h2>
        <p className="text-on-surface-variant font-light leading-relaxed">
          Integrators, partners, and internal tools use this API to automate listing management, read marketplace stats,
          drive project workflows, and connect AI agents—always with explicit user consent and valid Bearer tokens where
          required.
        </p>
        <p className="text-on-surface-variant font-light leading-relaxed">
          <Link href="/terms" className="text-secondary font-semibold hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-secondary font-semibold hover:underline">
            Privacy
          </Link>{" "}
          apply to all usage. Do not scrape the product UI; call these endpoints instead.
        </p>
      </section>

      <div className="space-y-12">
        {API_REFERENCE.map((section) => (
          <section key={section.title}>
            <h2 className="font-headline text-on-surface mb-1 text-sm font-bold uppercase tracking-wider">
              {section.title}
            </h2>
            {section.description ? (
              <p className="text-on-surface-variant mb-4 text-sm font-light leading-relaxed">{section.description}</p>
            ) : null}
            {section.endpoints.length > 0 ? (
              <ul className="border-outline-variant/15 divide-outline-variant/10 divide-y overflow-hidden rounded-xl border">
                {section.endpoints.map((e) => (
                  <li key={`${e.method}-${e.path}`} className="bg-surface-container-low/20 flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="bg-primary/15 text-primary font-mono rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                        {e.method}
                      </span>
                      <code className="text-on-surface text-xs break-all sm:text-sm">{e.path}</code>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-on-surface text-sm leading-snug">{e.summary}</p>
                      <p className="text-on-surface-variant/80 mt-1 text-[10px] uppercase tracking-wide">
                        Auth: {e.auth}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <p className="text-on-surface-variant mt-14 border-t border-outline-variant/15 pt-8 text-xs font-light">
        Paths with <code className="text-secondary/90">:id</code> denote URL parameters. Trailing details (e.g.{" "}
        <code className="text-secondary/90">/bids</code>) must match exactly. For the canonical route list, see{" "}
        <code className="text-secondary/90">server.js</code> in the repository.
      </p>
    </div>
  );
}
