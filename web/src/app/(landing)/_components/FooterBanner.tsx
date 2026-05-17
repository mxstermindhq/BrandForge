"use client";

import { CONTACT } from "@/content/landing-directory";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

export function FooterBanner() {
  return (
    <section className="relative overflow-hidden border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}>
      <IslamicPattern className="pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="font-headline text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">Ready to build something real?</h2>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)]">One conversation. We handle the rest.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-6 text-sm">
            Start a conversation →
          </a>
          <a href="#packages" className="btn-secondary min-h-11 px-6 text-sm">
            Explore services ↑
          </a>
        </div>
      </div>
    </section>
  );
}
