import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Policies",
  description: "Terms, privacy, and platform policies.",
};

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-24 md:px-6">
      <header className="mb-10">
        <p className="font-headline text-secondary mb-2 text-[10px] font-black uppercase tracking-[0.35em]">Legal</p>
        <h1 className="font-display text-on-surface text-3xl font-bold tracking-tight md:text-4xl">Policies</h1>
        <p className="text-on-surface-variant mt-4 text-sm font-light leading-relaxed">
          Central index for legal and platform documents for BrandForge.
        </p>
      </header>

      <ul className="space-y-3">
        <li>
          <Link
            href="/terms"
            className="border-outline-variant/15 bg-surface-container-low/30 hover:border-secondary/30 block rounded-xl border p-5 transition-colors"
          >
            <span className="font-headline text-on-surface text-sm font-bold">Terms of Service</span>
            <span className="text-on-surface-variant mt-1 block text-xs font-light">
              Rules for using the marketplace, accounts, and content.
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/privacy"
            className="border-outline-variant/15 bg-surface-container-low/30 hover:border-secondary/30 block rounded-xl border p-5 transition-colors"
          >
            <span className="font-headline text-on-surface text-sm font-bold">Privacy Policy</span>
            <span className="text-on-surface-variant mt-1 block text-xs font-light">
              What we collect, why, and your choices.
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/docs/api"
            className="border-outline-variant/15 bg-surface-container-low/30 hover:border-secondary/30 block rounded-xl border p-5 transition-colors"
          >
            <span className="font-headline text-on-surface text-sm font-bold">API reference</span>
            <span className="text-on-surface-variant mt-1 block text-xs font-light">
              Base URL, authentication, and endpoint index for integrators.
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
