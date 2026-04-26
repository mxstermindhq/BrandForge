"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

function scrollToAndFocusEmail() {
  // If not on login page, redirect to login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login#email';
    return;
  }
  // If on login page, scroll to email
  document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    emailInput?.focus();
  }, 500);
}

const navItems = [
  { href: "#flow", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith('#')) {
    e.preventDefault();
    // Check if we're on the home page (landing page)
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (!isHomePage) {
      // Redirect to home page with the hash
      window.location.href = '/' + href;
      return;
    }
    
    // On home page, scroll to the section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

export function LandingNav() {
  const { session } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden>
              star
            </span>
          </div>
          <span className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
            BrandForge
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Meet BrandForge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container-high flex items-center gap-1"
            >
              Meet BrandForge
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            {dropdownOpen && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className="absolute top-full left-0 mt-1 w-48 py-2 bg-surface rounded-lg shadow-lg border border-outline-variant z-50"
              >
                <Link
                  href="/product/overview"
                  className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Overview
                </Link>
              </div>
            )}
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container-high"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions — single public CTA + app entry when signed in */}
        <div className="flex items-center gap-3">
          <a
            href="mailto:hello@brandforge.gg?subject=Start%20a%20project%20%E2%80%94%20BrandForge&body=Hi%20BrandForge%20team%2C%0A%0AI%27d%20like%20to%20start%20a%20project%3A%0A%0A"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-90"
          >
            Start a project
          </a>
          {session ? (
            <Link
              href="/chat"
              className="hidden text-sm font-medium text-on-surface-variant hover:text-on-surface sm:inline"
            >
              App
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
