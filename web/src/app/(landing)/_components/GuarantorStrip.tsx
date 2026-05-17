"use client";

import { CONTACT } from "@/content/landing-directory";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

export function GuarantorStrip() {
  return (
    <section className="relative border-t px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}>
      <IslamicPattern className="pointer-events-none absolute inset-0" opacity={0.03} />
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-3xl border font-headline text-5xl font-semibold"
          style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-text-primary)" }}
        >
          M
        </div>

        <div>
          <h2 className="font-headline text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
            {CONTACT.guarantor} is your guarantor.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
            Your word is your bond — and every deal is witnessed with clear scope and accountability. That's how this
            platform works. I personally review every project, select every operator, and manage every introduction. If
            something's off, I'm accountable — not a support ticket. One message starts it. I take it from there.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-6 text-sm">
              Message me → {CONTACT.telegramHandle}
            </a>
            <a href={CONTACT.discord} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-11 px-6 text-sm">
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
