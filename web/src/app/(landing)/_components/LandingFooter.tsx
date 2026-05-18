"use client";

import Link from "next/link";
import { CONTACT } from "@/content/landing-directory";

const footerLinks = {
  explore: [
    { label: "Talent", href: "#talent" },
    { label: "Packages", href: "#packages" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border font-headline text-sm font-semibold" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-gold)" }}>
                BF
              </div>
              <span className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">BrandForge</span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-[var(--color-text-secondary)]">
              The operating system for modern internet brands. One conversation. Right team. Real outcomes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary min-h-10 text-sm"
              >
                Telegram {CONTACT.telegramHandle}
              </a>
              <a
                href={CONTACT.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-semibold transition"
                style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface-2)", color: "var(--color-text-primary)" }}
              >
                Discord
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-gold)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-gold)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row" style={{ borderColor: "var(--color-gold-border)" }}>
          <p className="text-sm text-[var(--color-text-secondary)]">© 2026 BrandForge. All rights reserved.</p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Contact:{" "}
            <a href={CONTACT.telegram} className="text-[var(--color-gold)] hover:underline" target="_blank" rel="noopener noreferrer">
              {CONTACT.telegramHandle}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
