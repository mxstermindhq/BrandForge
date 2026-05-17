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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#A67C2E]/16 bg-[#FCFAF5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A67C2E]/28 bg-[#A67C2E]/10 text-sm font-semibold text-[#5C4620]">
            BF
          </div>
          <span className="font-headline text-xl font-semibold text-[#1F2937] transition-colors group-hover:text-[#8A6A27]">
            BrandForge
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#F3EDE0] hover:text-[#1F2937]"
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
