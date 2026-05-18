"use client";

import Link from "next/link";
import { CONTACT } from "@/content/landing-directory";

const navItems = [
  { href: "#talent", label: "Talent" },
  { href: "#packages", label: "Services" },
  { href: "#trust", label: "Trust" },
  { href: "#faq", label: "FAQ" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  const isHome = window.location.pathname === "/" || window.location.pathname === "";
  if (!isHome) {
    window.location.href = "/" + href;
    return;
  }
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingNav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: "var(--color-gold-border)", background: "color-mix(in srgb, var(--color-bg) 92%, transparent)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-gold)" }}>
            BF
          </div>
          <span className="font-headline text-xl font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-gold)]">
            BrandForge
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <a href={CONTACT.discord} target="_blank" rel="noopener noreferrer" className="btn-secondary min-h-9 px-3 text-xs">
            Discord
          </a>
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-9 px-3 text-xs">
            Start conversation
          </a>
        </div>
      </div>
    </header>
  );
}
