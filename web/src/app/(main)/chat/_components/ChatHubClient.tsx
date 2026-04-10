"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useBootstrap } from "@/hooks/useBootstrap";
import { ChatDealRoomList } from "@/components/messages/ChatDealRoomList";

export function ChatHubClient() {
  const { session } = useAuth();
  const { err, loading, reload } = useBootstrap();

  if (!session) {
    return (
      <div className="page-content-sm py-16 text-center">
        <p className="text-[14px] font-body text-on-surface-variant">Sign in to open Chat.</p>
        <Link href={`/login?next=${encodeURIComponent("/chat")}`} className="btn-primary mt-6 inline-flex min-h-11 px-6">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] w-full min-w-0">
      <ChatDealRoomList />
      <div className="min-h-0 min-w-0 flex-1 border-l border-outline-variant/40 bg-background">
        {loading ? (
          <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 px-6 py-16" role="status">
            <div
              className="relative h-10 w-10 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
              aria-hidden
            />
            <p className="text-[12px] text-on-surface-variant">Loading…</p>
          </div>
        ) : err ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-16">
            <p className="max-w-md text-center text-[13px] text-critical" role="alert">
              {err}
            </p>
            <button
              type="button"
              onClick={() => void reload()}
              className="btn-ghost mt-4 text-[12px] font-headline font-600 uppercase tracking-wider"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="empty-state h-full py-24">
            <span className="material-symbols-outlined text-[40px] leading-none text-on-surface-variant/20" aria-hidden>
              star
            </span>
            <p className="empty-state-title">Select a deal room</p>
            <p className="empty-state-body">Negotiations, contracts, and payments stay in one thread.</p>
          </div>
        )}
      </div>
    </div>
  );
}
