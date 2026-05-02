"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const mainNav = [
  { href: "/feed", label: "Feed", icon: "dynamic_feed" },
  { href: "/marketplace", label: "Marketplace", icon: "storefront" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/leaderboard", label: "Leaderboard", icon: "trophy" },
];

const moreNav = [
  { href: "/agents", label: "Agents", icon: "smart_toy" },
  { href: "/squads", label: "Squads", icon: "groups" },
  { href: "/inbox", label: "Inbox", icon: "inbox" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function TopNavBar() {
  const pathname = usePathname();
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [moreOpen, setMoreOpen] = useState(false);

  const name = me?.profile?.username || session?.user?.email?.split("@")[0] || "Guest";
  const avatarUrl = me?.profile?.avatar_url;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Logo + Main Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href={session ? "/chat" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-lg">⭐</span>
            </div>
            <span className="font-headline font-bold text-lg text-on-surface hidden sm:block group-hover:text-primary transition-colors">
              BrandForge
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  moreNav.some(n => isActive(n.href))
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-base">more_horiz</span>
                <span className="hidden lg:inline">More</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>

              {moreOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-surface-container border border-outline-variant rounded-xl shadow-lg z-50">
                    {moreNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Actions + Account */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle size="sm" />
          
          {session ? (
            <>
              {/* Notifications */}
              <Link
                href="/inbox"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors relative"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-lg">
                  notifications
                </span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
              </Link>

              {/* User Menu */}
              <Link
                href="/settings"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors ml-1"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden ring-1 ring-outline-variant">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                  )}
                </div>
                <span className="text-sm font-medium text-on-surface hidden md:block max-w-[100px] truncate">
                  {name}
                </span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Sign In
              </Link>
              {/* Get Started with Tooltip */}
              <div className="relative group">
                <Link
                  href="/?signup=true"
                  className="relative px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 text-on-primary rounded-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">⚔️</span>
                  Get Started
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                </Link>
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-xs text-on-surface-variant text-center">
                      <span className="text-primary font-semibold">Join Free!</span> Build your rep & rank up from Challenger to Legendary.
                    </p>
                    <div className="absolute -top-1 right-8 w-2 h-2 bg-surface-container-high border-t border-l border-outline-variant rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
