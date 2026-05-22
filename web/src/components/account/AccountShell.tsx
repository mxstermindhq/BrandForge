"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { profilePath } from "@/lib/reserved-paths";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

const NAV = [
  { href: "/account", label: "Overview", icon: "◆" },
  { href: "/dashboard", label: "Dashboard", icon: "▣" },
  { href: "/account/listings", label: "Offers", icon: "◎" },
  { href: "/account/profile", label: "Profile", icon: "◇" },
] as const;

type AccountShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AccountShell({ children, title, subtitle }: AccountShellProps) {
  const pathname = usePathname();
  const { session, signOut } = useAuth();
  const { me } = useAuthMe();
  const username = me?.profile?.username;
  const displayName = me?.profile?.full_name || session?.user?.email?.split("@")[0] || "Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="hub-layout">
      <aside className="hub-sidebar">
        <div className="hub-sidebar-profile">
          <div className="hub-avatar" aria-hidden>
            {me?.profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-headline text-lg font-semibold text-[var(--forge-text)]">{displayName}</p>
            {username ? (
              <p className="truncate text-sm text-[var(--forge-gold)]">@{username}</p>
            ) : (
              <p className="truncate text-sm text-[var(--forge-text-muted)]">{session?.user?.email}</p>
            )}
          </div>
        </div>

        <nav className="hub-nav" aria-label="Account">
          {NAV.map((item) => {
            const active =
              item.href === "/account"
                ? pathname === "/account"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hub-nav-link ${active ? "hub-nav-link-active" : ""}`}
              >
                <span className="hub-nav-icon" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hub-sidebar-footer">
          <Link href="/#browse" className="hub-nav-link">
            Browse marketplace
          </Link>
          {username ? (
            <Link href={profilePath(username)} className="hub-nav-link">
              Public profile
            </Link>
          ) : null}
          <button type="button" className="hub-nav-link w-full text-left" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="hub-main">
        {title ? (
          <header className="hub-header">
            <div>
              <h1 className="font-headline text-3xl font-semibold tracking-tight text-[var(--forge-text)] sm:text-4xl">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-[var(--forge-text-muted)]">{subtitle}</p> : null}
            </div>
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
}
