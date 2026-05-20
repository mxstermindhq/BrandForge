"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACT } from "@/content/landing-directory";

const navItems = [
  { href: "#talent", label: "Directory" },
  { href: "#trust", label: "Trust" },
  { href: "#faq", label: "FAQ" },
] as const;

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  const onHome = window.location.pathname === "/" || window.location.pathname === "";
  if (!onHome) {
    window.location.href = "/" + href;
    return;
  }
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-[box-shadow,background,border-color] duration-300"
      style={{
        borderBottom: `1px solid ${scrolled ? "var(--color-border)" : "transparent"}`,
        background: scrolled
          ? "color-mix(in srgb, var(--color-bg) 88%, transparent)"
          : "color-mix(in srgb, var(--color-bg) 72%, transparent)",
        backdropFilter: "blur(14px)",
        boxShadow: scrolled ? "0 8px 32px rgba(15, 23, 42, 0.06)" : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold tracking-tight transition-colors"
            style={{
              borderColor: "var(--color-gold-border)",
              background: "var(--color-gold-subtle)",
              color: "var(--color-gold)",
            }}
          >
            BF
          </div>
          <div className="min-w-0">
            <span className="block truncate font-headline text-lg font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-gold)]">
              BrandForge
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Curated directory
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Page sections">
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

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={CONTACT.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary hidden min-h-9 px-3 text-xs sm:inline-flex"
          >
            Discord
          </a>
          <a
            href={CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary min-h-9 px-4 text-xs"
          >
            Start conversation
          </a>
        </div>
      </div>
    </header>
  );
}
