import Link from "next/link";
import type { Metadata } from "next";
import { ForgeSiteShell } from "@/app/(landing)/_components/forge/ForgeSiteShell";

export const metadata: Metadata = {
  title: "404 — Not Found",
  description: "This page is not in the BrandForge forge.",
};

export default function NotFound() {
  return (
    <ForgeSiteShell subtleBg>
      <main className="forge-page forge-page-center">
        <div className="forge-container forge-page-inner forge-page-inner-narrow text-center">
          <p className="forge-section-eyebrow">404</p>
          <h1 className="forge-section-title forge-page-title">Lost in the void</h1>
          <p className="forge-section-desc mx-auto">
            This URL doesn&apos;t match a product, service, or operator. Head back to the forge.
          </p>
          <Link href="/marketplace" className="forge-btn forge-btn-primary mt-8 inline-flex">
            Explore Marketplace →
          </Link>
        </div>
      </main>
    </ForgeSiteShell>
  );
}
