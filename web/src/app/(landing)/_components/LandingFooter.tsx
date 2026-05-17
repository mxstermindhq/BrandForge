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
    <footer className="border-t border-[#C9A84C]/20 bg-[#090F1D]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 font-headline text-sm font-semibold text-[#F5F0E8]">
                BF
              </div>
              <span className="font-headline text-xl font-semibold text-[#F5F0E8]">BrandForge</span>
            </Link>
            <p className="mb-6 max-w-md text-sm text-[#C9BEAA]">
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
                className="inline-flex min-h-10 items-center rounded-lg border border-[#C9A84C]/35 bg-[#101b32] px-4 text-sm font-semibold text-[#F5F0E8] transition hover:border-[#C9A84C]/60"
              >
                Discord
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F5F0E8]">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[#C9BEAA] transition hover:text-[#C9A84C]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#F5F0E8]">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[#C9BEAA] transition hover:text-[#C9A84C]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#C9A84C]/20 pt-8 md:flex-row">
          <p className="text-sm text-[#C9BEAA]">© 2026 BrandForge. All rights reserved.</p>
          <p className="text-sm text-[#C9BEAA]">
            Contact:{" "}
            <a href={CONTACT.telegram} className="text-[#C9A84C] hover:underline" target="_blank" rel="noopener noreferrer">
              {CONTACT.telegramHandle}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
