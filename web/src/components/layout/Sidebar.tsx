"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useMemo } from "react";
import { NAV } from "@/config/sidebar-nav";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { cn } from "@/lib/cn";

const navInactive =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-body text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-on-surface";
const navActive =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-body font-500 text-on-surface bg-surface-container-highest transition-colors duration-150";

export function Sidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { session } = useAuth();
  const { me } = useAuthMe();
  const { data: bootstrap } = useBootstrap();
  const emailUsername = session?.user?.email?.split("@")[0] || "";
  const profileUsername = me?.profile?.username || "";
  const fullName = me?.profile?.full_name || "";
  const label =
    fullName ||
    (profileUsername.length > 2 ? profileUsername : null) ||
    emailUsername ||
    "Guest";
  const avatarUrl = me?.profile?.avatar_url ?? null;
  const userId = session?.user?.id ? String(session.user.id) : null;
  const onlineIds = bootstrap?.onlineUserIds;
  const showUserOnlinePulse = Boolean(
    userId && Array.isArray(onlineIds) && onlineIds.some((id) => String(id) === userId),
  );

  const chatThreads = useMemo(() => {
    if (!session) return [];
    return getSortedHumanThreads(bootstrap?.humanChats);
  }, [session, bootstrap?.humanChats]);

  return (
    <aside
      className={cn(
        "relative z-30 flex h-full min-h-0 w-[240px] min-w-[240px] shrink-0 flex-col border-r border-outline-variant bg-surface-container",
        className,
      )}
    >
      <div className="shrink-0 px-4 py-6">
        <div className="mb-2 hidden items-start md:flex">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onNavigate}
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-lg">
              <img
                src="/brandforge-logo-full.png"
                alt="BrandForge"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-headline font-700 tracking-[-0.02em] text-on-surface transition-colors group-hover:text-primary">
                BrandForge
              </span>
              <span className="text-[11px] tracking-wide text-on-surface-variant/70">
                World of BrandForge
              </span>
            </div>
          </Link>
        </div>
        <div className="mb-4 flex items-center justify-between px-2 md:hidden">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onNavigate}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-high">
              <img
                src="/brandforge-logo-full.png"
                alt="BrandForge"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="truncate text-[15px] font-headline font-700 tracking-[-0.02em] text-on-surface">
              BrandForge
            </span>
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Close menu"
            onClick={onNavigate}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-3 pb-4"
        aria-label="Main navigation"
      >
        <div className="space-y-0.5">
          {NAV.map((block, bi) => (
            <div
              key={bi}
              className={cn(
                block.section ? "mt-4 border-t border-outline-variant/40 pt-4 first:mt-0 first:border-0 first:pt-0" : "",
              )}
            >
              {block.section ? (
                <p className="px-2.5 pb-1 pt-5 text-[10px] font-headline font-600 tracking-[0.08em] text-on-surface-variant/60 first:pt-0">
                  {block.section.toUpperCase()}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {block.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          active ? navActive : navInactive,
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        )}
                      >
                        <span
                          className="material-symbols-outlined shrink-0 text-[18px] leading-none"
                          style={{ fontSize: 18 }}
                          aria-hidden
                        >
                          {item.materialIcon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {session ? (
          <div className="mt-4 border-t border-outline-variant/40 pt-4">
            <p className="px-2.5 pb-2 text-[10px] font-headline font-600 tracking-[0.08em] text-on-surface-variant/60">
              SQUADS
            </p>
            <Link
              href="/chat"
              onClick={onNavigate}
              className="mx-2.5 mb-2 inline-flex min-h-[36px] w-[calc(100%-1.25rem)] items-center justify-center rounded-lg bg-foreground px-3 py-2 text-[12px] font-semibold text-background transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              New Chat
            </Link>
            <p className="px-2.5 pb-1 text-[10px] font-headline font-600 tracking-[0.08em] text-on-surface-variant/60">
              Chat history
            </p>
            <ul className="max-h-44 space-y-1 overflow-y-auto px-2.5 pr-1" aria-label="Recent chats list">
              {chatThreads.length > 0 ? (
                chatThreads.slice(0, 8).map((thread) => {
                  const tid = String(thread.id);
                  const threadActive = pathname === `/chat/${tid}` || pathname.startsWith(`/chat/${tid}/`);
                  const unread = Boolean(thread.hasUnread);
                  return (
                    <li key={tid}>
                      <Link
                        href={`/chat/${tid}`}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                          threadActive
                            ? "bg-surface-container-high font-600 text-on-surface"
                            : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface",
                          unread && !threadActive ? "font-600 text-on-surface" : "",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            unread ? "bg-red-500" : "bg-transparent",
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">{thread.t || "Deal room"}</span>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="px-2 py-1 text-[11px] text-on-surface-variant/70">No recent chats</li>
              )}
            </ul>
          </div>
        ) : null}
      </nav>

      <div
        className="mt-auto shrink-0 border-t border-outline-variant bg-surface-container-high/50 px-4 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {session ? (
          <UserMenu
            name={label}
            avatarUrl={avatarUrl}
            profileUsername={profileUsername || null}
            showOnlinePulse={showUserOnlinePulse}
          />
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="btn-primary flex min-h-11 w-full justify-center font-headline"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
