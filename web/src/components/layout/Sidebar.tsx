"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { NAV } from "@/config/sidebar-nav";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads, unreadHumanChatCount } from "@/lib/human-chat-threads";
import { cn } from "@/lib/cn";

const navInactive =
  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white";
const navActive =
  "flex w-full items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.14] px-3.5 py-3 text-[14px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

function relativeTimeLabel(value: string | null | undefined) {
  if (!value) return "now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

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
  const visibleThreads = chatThreads.slice(0, 5);

  return (
    <aside
      className={cn(
        "relative z-30 flex h-full min-h-0 w-[272px] min-w-[272px] shrink-0 flex-col border-r border-white/7 bg-[#070910] text-white",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,92,255,0.18),transparent_28%),linear-gradient(180deg,#070910_0%,#05070d_100%)]" />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-4 py-6">
          <div className="mb-2 hidden md:block">
            <div className="mb-5 flex items-center justify-between">
              <Link
                href="/"
                className="group flex items-center gap-3"
                onClick={onNavigate}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-violet-400 to-indigo-500 text-white shadow-[0_16px_32px_rgba(109,78,255,0.36)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-semibold tracking-[-0.04em] text-white">
                      BrandForge
                    </span>
                    <span className="rounded-full border border-violet-400/20 bg-violet-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-100">
                      Pro
                    </span>
                  </div>
                  <p className="text-xs text-white/36">Workflow OS</p>
                </div>
              </Link>
            </div>

            <Link
              href="/chat"
              onClick={onNavigate}
              className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-4 text-sm font-medium text-white shadow-[0_22px_42px_rgba(88,54,255,0.35)] transition hover:translate-y-[-1px]"
            >
              <span className="inline-flex items-center gap-3">
                <Plus className="h-5 w-5" />
                New Chat
              </span>
              <span className="rounded-xl bg-white/10 px-2 py-1 text-[11px] text-white/82">⌘ K</span>
            </Link>
          </div>

          <div className="mb-4 flex items-center justify-between px-2 md:hidden">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2"
              onClick={onNavigate}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="truncate text-[15px] font-semibold tracking-[-0.03em] text-white">
                BrandForge
              </span>
            </Link>
            <button
              type="button"
              className="rounded-xl p-2 text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Close menu"
              onClick={onNavigate}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 pb-5"
          aria-label="Main navigation"
        >
          <div className="space-y-1.5">
            {NAV.map((block, bi) => (
              <div key={bi}>
                {block.section ? (
                  <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.22em] text-white/28">
                    {block.section}
                  </p>
                ) : null}
                <ul className="space-y-1.5">
                  {block.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(active ? navActive : navInactive)}
                        >
                          <span
                            className="material-symbols-outlined shrink-0 text-[18px] leading-none"
                            style={{ fontSize: 18 }}
                            aria-hidden
                          >
                            {item.materialIcon}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.href === "/chat" && chatUnread > 0 ? (
                            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {chatUnread > 9 ? "9+" : chatUnread}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between px-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/28">Chats</p>
              <Link href="/chat" onClick={onNavigate} className="text-xs text-white/34 transition hover:text-white/70">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {visibleThreads.length > 0 ? (
                visibleThreads.map((thread) => {
                  const href = `/chat/${thread.id}`;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={String(thread.id)}
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-2xl border px-3.5 py-3 transition",
                        active
                          ? "border-violet-400/22 bg-violet-500/[0.12]"
                          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("truncate text-sm", active ? "text-white" : "text-white/76")}>
                          {thread.t || "Deal room"}
                        </span>
                        <span className="shrink-0 text-xs text-white/34">
                          {relativeTimeLabel(thread.lastMessageAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-4 text-sm text-white/40">
                  Start a new chat to build your first execution lane.
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/28">Credits</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em] text-white">120</p>
                <p className="mt-1 text-xs text-white/34">Available this cycle</p>
              </div>
              <Link
                href="/plans"
                onClick={onNavigate}
                className="rounded-xl bg-violet-500/18 px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-500/26"
              >
                Top up
              </Link>
            </div>
          </div>
        </nav>

        <div
          className="mt-auto shrink-0 border-t border-white/7 bg-black/15 px-4 py-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {session ? (
            <UserMenu
              name={label}
              email={email}
              avatarUrl={avatarUrl}
              showOnlinePulse={showUserOnlinePulse}
            />
          ) : (
            <Link
              href="/login"
              onClick={onNavigate}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_32px_rgba(88,54,255,0.3)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
