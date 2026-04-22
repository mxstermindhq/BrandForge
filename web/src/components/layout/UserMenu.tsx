"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Bell, ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/cn";

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
  avatarUrl,
  showOnlinePulse = false,
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition hover:bg-white/[0.05]"
        title={email ?? undefined}
      >
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-11 w-11 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-sm font-semibold text-slate-900">
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          {showOnlinePulse ? (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#070910] bg-emerald-400" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="truncate text-xs text-white/40">{email || "Workspace access"}</p>
        </div>
        <ChevronRight className={cn("h-4 w-4 text-white/30 transition", open ? "rotate-90" : "")} />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-[22px] border border-white/10 bg-[#10141f] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.36)] backdrop-blur">
          <div className="grid grid-cols-2 gap-2 p-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.08]"
              title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {resolvedTheme === "dark" ? <Sun size={16} className="text-amber-300" /> : <Moon size={16} className="text-sky-300" />}
              Theme
            </button>
            <Link
              href="/inbox"
              className="relative flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-white/76 transition hover:bg-white/[0.08]"
              onClick={() => setOpen(false)}
            >
              <Bell size={16} />
              Inbox
              {notificationCount > 0 ? (
                <span className="ml-auto rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              ) : null}
            </Link>
          </div>
          <div className="mt-2 grid gap-2 px-1">
            <Link
              href="/settings"
              className="rounded-2xl px-3 py-3 text-sm text-white/76 transition hover:bg-white/[0.05]"
              onClick={() => setOpen(false)}
            >
              Account settings
            </Link>
            <Link
              href="/plans"
              className="rounded-2xl px-3 py-3 text-sm text-white/76 transition hover:bg-white/[0.05]"
              onClick={() => setOpen(false)}
            >
              Billing & plans
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm text-rose-200 transition hover:bg-rose-500/[0.08]"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
