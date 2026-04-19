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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-10 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-xs text-amber-400 uppercase tracking-[0.35em] mb-2">Developers</div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            API reference
          </h1>
          <p className="text-zinc-400 mt-4 max-w-2xl text-sm font-light leading-relaxed md:text-base">
            {COMPANY_PRODUCT_BLURB} This document describes the HTTP JSON API served by the BrandForge Node server (not
            Supabase REST). The Next.js web app proxies browser calls to your configured origin.
          </p>
          <div className="border-zinc-800 bg-zinc-900/50 mt-6 rounded-xl border px-4 py-3 font-mono text-xs text-zinc-300 md:text-sm">
            <span className="text-zinc-500">Base URL · </span>
            {base}
          </div>
        </header>

        <section className="mb-10 space-y-3 text-sm">
          <h2 className="text-white text-xs font-bold uppercase tracking-[0.2em]">Who &amp; why</h2>
          <p className="text-zinc-400 font-light leading-relaxed">
            Integrators, partners, and internal tools use this API to automate listing management, read marketplace stats,
            drive project workflows, and connect AI agents—always with explicit user consent and valid Bearer tokens where
            required.
          </p>
          <p className="text-zinc-400 font-light leading-relaxed">
            <Link href="/terms" className="text-amber-400 font-semibold hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-amber-400 font-semibold hover:underline">
              Privacy
            </Link>{" "}
            apply to all usage. Do not scrape the product UI; call these endpoints instead.
          </p>
        </section>

        <div className="space-y-12">
          {API_REFERENCE.map((section) => (
            <section key={section.title}>
              <h2 className="text-white mb-1 text-sm font-bold uppercase tracking-wider">
                {section.title}
              </h2>
              {section.description ? (
                <p className="text-zinc-400 mb-4 text-sm font-light leading-relaxed">{section.description}</p>
              ) : null}
              {section.endpoints.length > 0 ? (
                <ul className="border-zinc-800 divide-zinc-800 divide-y overflow-hidden rounded-xl border">
                  {section.endpoints.map((e) => (
                    <li key={`${e.method}-${e.path}`} className="bg-zinc-900/50 flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className="bg-amber-500/10 text-amber-400 font-mono rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                          {e.method}
                        </span>
                        <code className="text-zinc-300 text-xs break-all sm:text-sm">{e.path}</code>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-zinc-300 text-sm leading-snug">{e.summary}</p>
                        <p className="text-zinc-500 mt-1 text-[10px] uppercase tracking-wide">
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

      <p className="text-zinc-500 mt-14 border-t border-zinc-800 pt-8 text-xs font-light">
        Paths with <code className="text-amber-400">:id</code> denote URL parameters. Trailing details (e.g.{" "}
        <code className="text-amber-400">/bids</code>) must match exactly. For the canonical route list, see{" "}
        <code className="text-amber-400">server.js</code> in the repository.
      </p>
    </div>
    </div>
  );
}
