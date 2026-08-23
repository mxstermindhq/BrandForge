"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#money", label: "The money" },
  { href: "#plan", label: "The plan" },
  { href: "#copilot", label: "The copilot" },
  { href: "#how", label: "How it starts" },
];

export function ThreadNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`tl-nav${scrolled ? " tl-nav-scrolled" : ""}`}>
      <div className="tl-shell tl-nav-inner">
        <Link href="/" className="tl-nav-brand">
          <span className="tl-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <rect x="3" y="3" width="11" height="11" rx="3" fill="#2563EB" />
              <rect x="10" y="10" width="11" height="11" rx="3" fill="#0A1D2E" />
            </svg>
          </span>
          <span className="tl-nav-word">BrandForge</span>
        </Link>

        <nav className="tl-nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="tl-nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="tl-nav-actions">
          <a href="/signin" className="tl-nav-signin">
            Sign in
          </a>
          <a href="/signin" className="tl-btn tl-btn-primary tl-btn-small">
            Start a thread
          </a>
        </div>
      </div>
    </header>
  );
}
