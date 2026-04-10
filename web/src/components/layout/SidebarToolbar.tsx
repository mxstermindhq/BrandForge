"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationTargetHref } from "@/lib/notification-href";

/**
 * Notifications — deal rooms live under Chat in the main sidebar.
 */
export function SidebarToolbar() {
  const router = useRouter();
  const { items, unreadCount, reload, markRead, markAllRead, deleteAll } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [notifOpen]);

  return (
    <div className="flex w-full items-center justify-end gap-1">
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => {
            setNotifOpen((o) => !o);
            void reload();
          }}
          className="relative rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          aria-expanded={notifOpen}
          aria-haspopup="true"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontSize: 18 }} aria-hidden>
            notifications
          </span>
          {unreadCount > 0 ? (
            <span className="bg-secondary-container text-on-secondary-container absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full px-0.5 text-[9px] font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
        {notifOpen ? (
          <div
            className="border-outline-variant/50 bg-surface-container-highest absolute bottom-full left-0 z-[80] mb-2 flex max-h-[min(70vh,520px)] w-[min(calc(100vw-1.5rem),300px)] min-w-[min(100%,260px)] flex-col rounded-xl border shadow-ambient ring-1 ring-black/20"
            role="region"
            aria-label="Notifications list"
          >
            <div className="border-outline-variant/40 text-on-surface shrink-0 border-b px-3 py-2.5">
              <p className="font-headline text-[11px] font-bold uppercase tracking-wider">Notifications</p>
            </div>
            {items.length === 0 ? (
              <p className="text-on-surface-variant px-4 py-8 text-center text-sm leading-relaxed">
                No notifications yet.
              </p>
            ) : (
              <>
                <ul className="scrollbar-thin max-h-[min(55vh,400px)] space-y-px overflow-y-auto overscroll-contain py-1">
                  {items.map((n) => {
                    const href = notificationTargetHref(n);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            void (async () => {
                              await markRead(n.id);
                              setNotifOpen(false);
                              if (href) router.push(href);
                            })();
                          }}
                          className={`hover:bg-surface-container-low w-full px-4 py-3 text-left text-sm transition-colors focus-visible:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
                            n.is_read
                              ? "text-on-surface-variant bg-transparent"
                              : "text-on-surface border-l-secondary bg-secondary/8 border-l-2"
                          } ${href ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <span className="line-clamp-2 font-semibold leading-snug">
                            {n.title || n.type || "Notification"}
                          </span>
                          {n.message ? (
                            <span className="text-on-surface-variant mt-1 line-clamp-2 text-xs leading-snug">
                              {n.message}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-outline-variant/40 bg-surface-container-high flex shrink-0 flex-wrap gap-2 border-t px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="text-on-surface hover:text-secondary font-headline rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && !window.confirm("Delete all notifications?")) return;
                      void deleteAll();
                    }}
                    className="text-on-surface hover:text-error font-headline rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Clear all
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
