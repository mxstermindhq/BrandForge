import type { Metadata } from "next";
import { ForgeButton } from "@/components/marketplace/ForgeButton";
import { StellarForgeCanvas } from "@/app/(landing)/_components/forge/StellarForgeCanvas";

export const metadata: Metadata = {
  title: "Mxstermind — Founder Operating System",
  description: "Graduate from packages to the Founder OS — monetization, ops, and growth systems at mxstermind.com.",
};

export default function MxstermindBridgePage() {
  return (
    <main className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <StellarForgeCanvas variant="collapse" className="h-full w-full" />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(80, 120, 255, 0.15) 0%, rgba(3, 3, 5, 0.92) 70%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7eb8ff]">Sister brand · Water / Intelligence</p>
        <h1 className="mt-4 max-w-2xl font-headline text-4xl font-semibold text-[var(--forge-text)] sm:text-5xl">
          Need talent?
          <br />
          <span className="text-[#7eb8ff]">Go to Mxstermind</span>
        </h1>
        <p className="mt-6 max-w-lg text-base text-[var(--forge-text-muted)]">
          BrandForge is the execution marketplace — buy products and services instantly. mxstermind is the
          Founder Operating System: monetization rails, ops workflows, and growth infrastructure when you
          outgrow packages.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ForgeButton href="https://mxstermind.com" variant="primary" external dataTrack="mxstermind_cta">
            Open Mxstermind →
          </ForgeButton>
          <ForgeButton href="/#browse" variant="secondary">
            Back to marketplace
          </ForgeButton>
        </div>
        <p className="mt-8 text-xs text-[var(--forge-text-muted)]">
          Fire meets water — same grid, same motion, different elemental identity.
        </p>
      </div>
    </main>
  );
}
