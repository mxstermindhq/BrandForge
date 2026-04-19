"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { Search, MessageSquare, MoreHorizontal } from "lucide-react";

function formatRelative(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function initials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ChatConversationList({
  activeId,
  className = "",
  onSelect,
}: {
  activeId?: string | null;
  className?: string;
  onSelect?: (id: string) => void;
}) {
  const { data, loading } = useBootstrap();
  const [q, setQ] = useState("");

  const threads = useMemo(() => {
    const sorted = getSortedHumanThreads(data?.humanChats);
    const nq = q.trim().toLowerCase();
    if (!nq) return sorted;
    return sorted.filter(
      (c) =>
        (c.t || "").toLowerCase().includes(nq) ||
        (c.s || "").toLowerCase().includes(nq),
    );
  }, [data?.humanChats, q]);

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      {/* CHATS Header */}
      <div className="px-4 py-2">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          CHATS ({threads.length})
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} aria-hidden/>
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search conversations..."
            className="w-full bg-zinc-100 dark:bg-zinc-900 border-0 rounded-lg py-2 pl-9 pr-3 text-[13px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1 px-2 space-y-0.5">
        {loading ? (
          <li className="px-3 py-8 text-center text-[12px] text-zinc-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
              Loading...
            </div>
          </li>
        ) : threads.length === 0 ? (
          <li className="py-8 text-center px-3">
            <MessageSquare size={24} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" aria-hidden/>
            <p className="text-[12px] text-zinc-500">No conversations yet</p>
            <p className="text-[11px] text-zinc-400 mt-1">Start a new chat</p>
          </li>
        ) : (
          threads.map((c) => {
            const id = String(c.id);
            const active = activeId === id;
            const rel = formatRelative(c.lastMessageAt ?? null);
            const unread = Boolean(c.hasUnread);
            
            const content = (
              <>
                {/* Avatar */}
                {c.peerAvatarUrl ? (
                  <img src={c.peerAvatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700 text-[11px] font-semibold text-white">
                    {initials(c.t || "")}
                  </div>
                )}
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-[13px] ${active ? "font-semibold text-zinc-900 dark:text-zinc-100" : unread ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {c.t || "Conversation"}
                    </p>
                    {rel ? <span className="shrink-0 text-[10px] text-zinc-400 tabular-nums">{rel}</span> : null}
                  </div>
                  <p className={`mt-0.5 truncate text-[12px] ${unread ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500"}`}>
                    {c.s || "No messages yet"}
                  </p>
                </div>
              </>
            );
            
            return (
              <li key={id}>
                {onSelect ? (
                  <button
                    onClick={() => onSelect(id)}
                    className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 transition text-left ${active ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}
                  >
                    {content}
                  </button>
                ) : (
                  <Link href={`/chat/${id}`} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${active ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
