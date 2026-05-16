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
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/15">
                <span className="material-symbols-outlined text-[24px] text-primary" aria-hidden>
                  bolt
                </span>
              </div>
              <span className="font-headline text-xl font-bold text-on-surface">BrandForge</span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-on-surface-variant">
              The operating system for modern internet brands — curated operators, done-for-you packages, managed by{" "}
              {CONTACT.guarantor}.
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
                className="inline-flex min-h-10 items-center rounded-lg border border-[#5865F2]/40 bg-[#5865F2]/10 px-4 text-sm font-semibold text-on-surface transition hover:bg-[#5865F2]/20"
              >
                Discord
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-on-surface-variant transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-on-surface-variant transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/50 pt-8 md:flex-row">
          <p className="text-sm text-on-surface-variant">© {new Date().getFullYear()} BrandForge. All rights reserved.</p>
          <p className="text-sm text-on-surface-variant">
            Contact:{" "}
            <a href={CONTACT.telegram} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {CONTACT.telegramHandle}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
