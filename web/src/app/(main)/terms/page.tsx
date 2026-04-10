import type { Metadata } from "next";
import Link from "next/link";
import { TERMS_LAST_UPDATED, termsSections } from "@/content/legal-copy";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms governing use of the BrandForge platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-24 md:px-6">
      <header className="mb-10">
        <p className="font-headline text-secondary mb-2 text-[10px] font-black uppercase tracking-[0.35em]">Legal</p>
        <h1 className="font-display text-on-surface text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
        <p className="text-on-surface-variant mt-3 text-sm">Last updated {TERMS_LAST_UPDATED}</p>
      </header>

      <p className="text-on-surface-variant border-outline-variant/15 mb-10 rounded-xl border bg-surface-container-low/30 p-4 text-sm font-light leading-relaxed">
        This is template language for development. Replace with counsel-reviewed Terms before production use.
      </p>

      <div className="space-y-10">
        {termsSections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-headline text-on-surface mb-3 text-sm font-bold uppercase tracking-wider">
              {s.heading}
            </h2>
            <div className="space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-on-surface-variant text-sm font-light leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-on-surface-variant mt-12 text-sm">
        <Link href="/privacy" className="text-secondary font-semibold hover:underline">
          Privacy policy
        </Link>
        {" · "}
        <Link href="/docs/api" className="text-secondary font-semibold hover:underline">
          API reference
        </Link>
      </p>
    </div>
  );
}
