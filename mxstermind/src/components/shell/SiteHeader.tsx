"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SITE } from "@/config/site";

const NAV = [
  { href: "/services/", label: "Services" },
  { href: "/portfolio/", label: "Portfolio" },
  { href: "/developers/", label: "Developers" },
  { href: "/process/", label: "Process" },
  { href: "/apply/", label: "Apply" },
  { href: "/blog/", label: "Blog" },
] as const;

export function SiteHeader(): React.JSX.Element {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = (): void => {
      header.dataset.scrolled = window.scrollY > 48 ? "true" : "false";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[300] border-b border-transparent bg-transparent backdrop-blur-[18px] transition-[border-color,background-color] duration-500 ease-out data-[scrolled=true]:border-b1 data-[scrolled=true]:bg-bg/90"
      data-scrolled="false"
    >
      <div className="content-wrap flex min-h-14 items-center justify-between gap-4 py-3.5">
        <Link href="/" className="font-serif text-xl font-light tracking-wide text-text" aria-label="mxstermind home">
          mxstermind
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-accent-bright"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={SITE.mxstermindBridge}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-accent-bright"
          >
            BrandForge ↗
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={SITE.brandforge}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-sm border border-b1 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-bright hover:border-accent sm:inline-block"
          >
            BrandForge ↗
          </Link>
          <Link
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm bg-accent px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-bg"
          >
            Discord
          </Link>
        </div>
      </div>
    </header>
  );
}
