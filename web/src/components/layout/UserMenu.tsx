"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon, Bell, LogOut } from "lucide-react";

interface UserMenuProps {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  showOnlinePulse?: boolean;
  notificationCount?: number;
}

export function UserMenu({
  name,
  email,
  notificationCount = 5,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Main user bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Username */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 text-left truncate text-[14px] font-body font-500 text-on-surface hover:text-on-surface/80 transition-colors"
          title={email ?? undefined}
        >
          {name}
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} className="text-sky-500" />
            )}
          </button>

          {/* Notifications */}
          <Link
            href="/inbox"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:text-critical hover:bg-critical-container/30 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-xl border border-outline-variant/60 bg-surface-container-highest py-1 shadow-lg">
          <Link
            href="/settings"
            className="block min-h-[44px] px-3 py-2.5 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/plans"
            className="block min-h-[44px] px-3 py-2.5 text-[13px] text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setOpen(false)}
          >
            Billing
          </Link>
          <button
            type="button"
            className="w-full min-h-[44px] px-3 py-2.5 text-left text-[13px] text-critical transition-colors hover:bg-critical-container/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
