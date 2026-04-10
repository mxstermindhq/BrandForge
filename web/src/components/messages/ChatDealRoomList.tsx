"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useBootstrap } from "@/hooks/useBootstrap";
import { getSortedHumanThreads } from "@/lib/human-chat-threads";

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
    <aside
      className={`flex h-full min-h-0 w-[260px] min-w-[260px] shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-low/30 ${className}`}
    >
      <div className="shrink-0 border-b border-outline-variant/40 px-4 py-4">
        <p className="section-label !mb-3">Deal rooms</p>
        <div className="relative">
          <span
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
            aria-hidden
          >
            search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search deal rooms..."
            className="input py-2 pl-9 text-[13px]"
            aria-label="Search deal rooms"
          />
        </div>
      </div>
      <ul className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto py-2 px-2">
        {loading ? (
          <li className="px-3 py-8 text-center text-[12px] text-on-surface-variant">Loading…</li>
        ) : threads.length === 0 ? (
          <li className="empty-state py-16">
            <span className="material-symbols-outlined empty-state-icon" aria-hidden>
              forum
            </span>
            <p className="text-[13px] font-headline font-600 text-on-surface">No deal rooms yet</p>
            <p className="empty-state-body text-[12px]">Start a negotiation from any service or request.</p>
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
                <Link
                  href={`/chat/${id}`}
                  className={`flex gap-3 rounded-lg px-2 py-3 transition-colors ${
                    active
                      ? "bg-surface-container-highest text-on-surface"
                      : "border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface"
                  }`}
                >
                  {c.peerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.peerAvatarUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-outline-variant"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-600 text-on-surface ring-1 ring-outline-variant">
                      {initials(c.t || "")}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`truncate text-[13px] font-body ${unread ? "font-600 text-on-surface" : ""}`}>
                        {c.t || "Deal room"}
                      </p>
                      {rel ? (
                        <span className="shrink-0 text-[11px] text-on-surface-variant tabular-nums">{rel}</span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-on-surface-variant">{c.s || "—"}</p>
                    <span className="pill-default mt-1.5 inline-flex text-[10px]">{dealLabel}</span>
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
