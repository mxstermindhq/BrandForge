"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NAV, NAV_FOOTER } from "@/config/sidebar-nav";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads, unreadHumanChatCount } from "@/lib/human-chat-threads";
import { cn } from "@/lib/cn";

const CHAT_NAV_LS = "bf-sidebar-chats-open";

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
  const { session, signOut } = useAuth();
  const { me } = useAuthMe();
  const { data: bootstrap } = useBootstrap();
  const emailUsername = session?.user?.email?.split("@")[0] || "";
  const profileUsername = me?.profile?.username || "";
  const fullName = me?.profile?.full_name || "";
  // Use full name if available, otherwise use username (if not too short), otherwise email username
  const label =
    fullName ||
    (profileUsername.length > 2 ? profileUsername : null) ||
    emailUsername ||
    "Guest";
  const email = session?.user?.email ?? null;
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
  const chatUnread = useMemo(() => unreadHumanChatCount(chatThreads), [chatThreads]);
  const chatNavActive = pathname === "/chat" || pathname.startsWith("/chat/");

  const [chatListOpen, setChatListOpen] = useState(true);
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(CHAT_NAV_LS) === "0") setChatListOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleChatList = () => {
    setChatListOpen((prev) => {
      const next = !prev;
      try {
        if (typeof window !== "undefined") window.localStorage.setItem(CHAT_NAV_LS, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "relative z-30 flex h-full min-h-0 w-[280px] min-w-[280px] shrink-0 flex-col border-r border-outline-variant bg-surface-container",
        className,
      )}
    >
      {/* Logo Section - BrandForge Logo */}
      <div className="shrink-0 px-4 py-6">
        <div className="mb-2 hidden md:block">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group"
            onClick={onNavigate}
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-lg">
              <img 
                src="/brandforge-logo-full.png" 
                alt="BrandForge" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-headline font-700 tracking-[-0.02em] text-on-surface group-hover:text-primary transition-colors">BrandForge</span>
              <span className="text-[11px] text-on-surface-variant/70 tracking-wide">World of BrandForge</span>
            </div>
          </Link>
        </div>
        <div className="mb-4 flex items-center justify-between px-2 md:hidden">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onNavigate}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0">
              <img 
                src="/brandforge-logo-full.png" 
                alt="BrandForge" 
                className="w-full h-full object-contain"
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

                  if (item.href === "/chat" && session) {
                    return (
                      <li key={item.href} className="space-y-0.5">
                        <div className="flex min-w-0 items-stretch gap-0.5">
                          <Link
                            href="/chat"
                            onClick={onNavigate}
                            className={cn(
                              chatNavActive ? navActive : navInactive,
                              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-w-0 flex-1",
                            )}
                          >
                            <span
                              className="material-symbols-outlined shrink-0 text-[18px] leading-none"
                              style={{ fontSize: 18 }}
                              aria-hidden
                            >
                              {item.materialIcon}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {/* AI indicator for Chat */}
                            {item.isAI && (
                              <span className="flex h-4 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 text-[9px] font-bold text-primary">
                                <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                                AI
                              </span>
                            )}
                            {chatUnread > 0 ? (
                              <span
                                className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow-sm ring-1 ring-red-900/25"
                                aria-label={`${chatUnread} unread chats`}
                              >
                                {chatUnread > 9 ? "9+" : chatUnread}
                              </span>
                            ) : null}
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleChatList();
                            }}
                            className="text-on-surface-variant hover:bg-surface-container-high flex w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                            aria-expanded={chatListOpen}
                            aria-label={chatListOpen ? "Hide deal room shortcuts" : "Show deal room shortcuts"}
                          >
                            <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
                              {chatListOpen ? "expand_less" : "expand_more"}
                            </span>
                          </button>
                        </div>
                        {chatListOpen && chatThreads.length > 0 ? (
                          <ul
                            className="border-outline-variant/35 mt-0.5 ml-2 space-y-px border-l border-dashed pl-2"
                            aria-label="Deal room shortcuts"
                          >
                            {chatThreads.slice(0, 6).map((t) => {
                              const tid = String(t.id);
                              const tActive =
                                pathname === `/chat/${tid}` || pathname.startsWith(`/chat/${tid}/`);
                              const unread = Boolean(t.hasUnread);
                              return (
                                <li key={tid}>
                                  <Link
                                    href={`/chat/${tid}`}
                                    onClick={onNavigate}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-1 text-[11px] leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                                      tActive
                                        ? "bg-surface-container-high font-600 text-on-surface"
                                        : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface",
                                      unread && !tActive ? "font-600 text-on-surface" : "",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "h-1.5 w-1.5 shrink-0 rounded-full",
                                        unread ? "bg-red-500" : "bg-transparent",
                                      )}
                                      aria-hidden
                                    />
                                    <span className="min-w-0 flex-1 truncate">{t.t || "Deal room"}</span>
                                  </Link>
                                </li>
                              );
                            })}
                            <li>
                              <Link
                                href="/chat"
                                onClick={onNavigate}
                                className="text-on-surface-variant hover:text-secondary block py-1.5 pl-3 text-[10px] font-headline font-bold uppercase tracking-wider"
                              >
                                All rooms →
                              </Link>
                            </li>
                          </ul>
                        ) : null}
                      </li>
                    );
                  }

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
      </nav>

      {/* Bottom Section - User Menu */}
      <div
        className="mt-auto shrink-0 border-t border-outline-variant bg-surface-container-high/50 px-4 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
                
        {session ? (
          <UserMenu name={label} email={email} avatarUrl={avatarUrl} showOnlinePulse={showUserOnlinePulse} />
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
