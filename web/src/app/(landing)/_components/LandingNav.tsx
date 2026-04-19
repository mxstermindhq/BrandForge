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
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#explore-world", label: "Explore the World" },
];

function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith('#')) {
    e.preventDefault();
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
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-lg">
            <img 
              src="/brandforge-logo-full.png" 
              alt="BrandForge" 
              className="w-full h-full object-contain scale-125"
            />
          </div>
          <span className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
            World of BrandForge
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {/* Try BrandForge with Tooltip */}
              <div className="relative group">
                <Link
                  href="/login#email"
                  className="relative px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 text-on-primary rounded-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">⚔️</span>
                  Try BrandForge
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </Link>
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 shadow-xl">
                    <p className="text-xs text-on-surface-variant text-center">
                      <span className="text-primary font-semibold">Join the Arena!</span> Free to start. Build your rep, unlock AI squads, and rank up from Challenger to Legendary.
                    </p>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-container-high border-t border-l border-outline-variant rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Sign In */}
              <Link
                href="/login#email"
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
