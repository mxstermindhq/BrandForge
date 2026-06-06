"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";
import { apiFetch, ApiError } from "@/lib/client/api";
import type { CreditBalance, UserPublic } from "@/types";

interface MeData {
  user: UserPublic;
  credits: CreditBalance;
}

interface MeContextValue {
  me: MeData;
  refresh: () => Promise<void>;
}

const MeContext = React.createContext<MeContextValue | null>(null);

export function useMe(): MeContextValue {
  const ctx = React.useContext(MeContext);
  if (!ctx) throw new Error("useMe must be used within AppShell");
  return ctx;
}

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "◇" },
  { href: "/campaigns", label: "Campaigns", icon: "◈" },
  { href: "/leads", label: "Leads", icon: "☷" },
  { href: "/billing", label: "Billing", icon: "◎" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = React.useState<MeData | null>(null);
  const [failed, setFailed] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const data = await apiFetch<MeData>("/api/auth/me");
    setMe(data);
  }, []);

  React.useEffect(() => {
    refresh().catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      } else {
        setFailed(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout(): Promise<void> {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — clear client state regardless
    }
    router.replace("/auth/login");
    router.refresh();
  }

  if (failed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-tx-muted">
        Failed to load your session. <Link href="/auth/login" className="ml-1 text-gold">Sign in</Link>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gold">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const nav = me.user.is_admin
    ? [...NAV, { href: "/admin", label: "Admin", icon: "⚙" }]
    : NAV;

  return (
    <MeContext.Provider value={{ me, refresh }}>
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-bg-surface p-5 md:flex">
          <Link href="/dashboard" className="font-display text-xl text-gold">
            ⬡ LeadForge
          </Link>
          <nav className="mt-8 flex-1 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition ${
                    active ? "bg-gold-bg text-gold" : "text-tx-muted hover:bg-bg-raised hover:text-tx"
                  }`}
                >
                  <span className="w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border pt-4">
            <p className="truncate text-sm text-tx">{me.user.name}</p>
            <p className="truncate text-xs text-tx-muted">{me.user.email}</p>
            <button
              onClick={logout}
              className="mt-3 text-xs text-tx-muted hover:text-status-rejected"
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col md:ml-60">
          <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-border bg-bg/80 px-6 backdrop-blur">
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/dashboard" className="font-display text-lg text-gold">
                ⬡ LeadForge
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/billing"
                className="flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm hover:border-gold"
              >
                <span className="text-gold">◎</span>
                <span className="font-mono">{me.credits.balance.toLocaleString()}</span>
                <span className="text-tx-muted">credits</span>
              </Link>
              <Link
                href="/campaigns/new"
                className="rounded bg-gold px-4 py-1.5 text-sm font-medium text-bg hover:bg-gold-light"
              >
                New campaign
              </Link>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </MeContext.Provider>
  );
}
