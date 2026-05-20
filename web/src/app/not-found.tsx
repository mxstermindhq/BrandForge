import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Not Found",
  description: "This page is not in the BrandForge directory.",
};

export default function NotFound() {
  return (
    <div className="landing-layout flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">404</p>
        <h1 className="mt-4 font-headline text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Not in the directory
        </h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          This URL does not match a profile, service, or work piece. Head back to the curated roster.
        </p>
        <Link href="/#talent" className="btn-primary mt-8 inline-flex min-h-11 items-center px-6 text-sm">
          Browse operators →
        </Link>
      </div>
    </div>
  );
}
