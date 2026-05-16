"use client";

import Link from "next/link";
import { LandingProfileMenu } from "./LandingProfileMenu";
import { useLandingUI } from "./LandingUIProvider";

const navItems = [
  { href: "#talent", label: "Talent" },
  { href: "#packages", label: "Packages" },
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
  const { openProfileEditor } = useLandingUI();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 shadow-lg">
            <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden>
              bolt
            </span>
          </div>
          <span className="font-headline text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
            BrandForge
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LandingProfileMenu onEditProfile={openProfileEditor} />
      </div>
    </header>
  );
}
