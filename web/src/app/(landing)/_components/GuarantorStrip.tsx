"use client";

import { CONTACT } from "@/content/landing-directory";
import { ContactCTA } from "./ContactCTA";

export function GuarantorStrip() {
  return (
    <section className="border-t border-outline-variant bg-gradient-to-r from-primary/10 via-surface-container to-tertiary/5 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 font-headline text-2xl font-bold text-primary">
          M
        </div>
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">
            {CONTACT.guarantor} is your manager & guarantor
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">{CONTACT.guarantorNote}</p>
        </div>
        <p className="text-sm text-on-surface-variant">
          No noisy marketplace inbox. Reach out once, we scope the need, and introduce the right people fast.
        </p>
        <ContactCTA subject="BrandForge — project intake" label="Start conversation" variant="primary" />
      </div>
    </section>
  );
}
