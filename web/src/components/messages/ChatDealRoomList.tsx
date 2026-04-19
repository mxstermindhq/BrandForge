"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";
import { Search, MessageSquare } from "lucide-react";

export type { HumanChatThreadRow as ThreadRow } from "@/lib/human-chat-threads";

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
    if (h < 48) return `${h}h`;
    const days = Math.floor(h / 24);
    if (days < 14) return `${days}d`;
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

export function ChatDealRoomList({
  activeId,
  className = "",
}: {
  activeId?: string | null;
  className?: string;
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
    <aside className={`flex h-full min-h-0 w-[280px] min-w-[280px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/20 ${className}`}>
      <div className="shrink-0 border-b border-zinc-800 px-4 py-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Deal Rooms</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} aria-hidden/>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
            aria-label="Search deal rooms"/>
        </div>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2 px-2">
        {loading ? (
          <li className="px-3 py-8 text-center text-[12px] text-zinc-500">Loading…</li>
        ) : threads.length === 0 ? (
          <li className="py-16 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-zinc-700" aria-hidden/>
            <p className="text-[13px] font-semibold text-zinc-400 mb-1">No deal rooms yet</p>
            <p className="text-[12px] text-zinc-500">Start a negotiation from any service or request.</p>
          </li>
        ) : (
          threads.map((c) => {
            const id = String(c.id);
            const active = activeId === id;
            const rel = formatRelative(c.lastMessageAt ?? null);
            const dealLabel = (c.dealPhase || "NEGOTIATE").toUpperCase();
            const unread = Boolean(c.hasUnread);
            return (
              <li key={id}>
                <Link href={`/chat/${id}`}
                  className={`flex gap-3 rounded-lg px-3 py-3 transition-colors ${
                    active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}>
                  {c.peerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.peerAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-zinc-700"/>
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300 ring-1 ring-zinc-700">
                      {initials(c.t || "")}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`truncate text-[13px] ${unread ? "font-semibold text-white" : ""}`}>{c.t || "Deal room"}</p>
                      {rel ? <span className="shrink-0 text-[11px] text-zinc-500 tabular-nums">{rel}</span> : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-500">{c.s || "—"}</p>
                    <span className={`mt-1.5 inline-flex text-[10px] px-2 py-0.5 rounded-full ${
                      dealLabel === "AWARDED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                      dealLabel === "CLOSED" ? "bg-zinc-700 text-zinc-400" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>{dealLabel}</span>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
