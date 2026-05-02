"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Bell, Check, X, Settings } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type NotificationType =
  | "NEW_MATCH"
  | "OFFER_RECEIVED"
  | "DEAL_ROOM_MESSAGE"
  | "ESCROW_FUNDED"
  | "DELIVERY_SUBMITTED"
  | "PAYMENT_RELEASED"
  | "DISPUTE_UPDATE"
  | "SKILL_ENDORSED"
  | "NEW_FOLLOWER"
  | "SAVED_SPECIALIST_AVAILABLE"
  | "TIER_LEVEL_UP"
  | "SQUAD_INVITATION"
  | "COLLAB_REQUEST";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  actor?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

const notificationConfig: Record<
  NotificationType,
  { icon: string; bgColor: string; urgency: "high" | "medium" | "low" }
> = {
  NEW_MATCH: { icon: "🎯", bgColor: "bg-sky-500/10", urgency: "medium" },
  OFFER_RECEIVED: { icon: "📨", bgColor: "bg-violet-500/10", urgency: "high" },
  DEAL_ROOM_MESSAGE: { icon: "💬", bgColor: "bg-emerald-500/10", urgency: "medium" },
  ESCROW_FUNDED: { icon: "🔒", bgColor: "bg-amber-500/10", urgency: "high" },
  DELIVERY_SUBMITTED: { icon: "📦", bgColor: "bg-blue-500/10", urgency: "high" },
  PAYMENT_RELEASED: { icon: "💰", bgColor: "bg-emerald-500/10", urgency: "high" },
  DISPUTE_UPDATE: { icon: "⚠️", bgColor: "bg-rose-500/10", urgency: "high" },
  SKILL_ENDORSED: { icon: "⭐", bgColor: "bg-amber-500/10", urgency: "low" },
  NEW_FOLLOWER: { icon: "👤", bgColor: "bg-slate-500/10", urgency: "low" },
  SAVED_SPECIALIST_AVAILABLE: { icon: "🟢", bgColor: "bg-green-500/10", urgency: "medium" },
  TIER_LEVEL_UP: { icon: "🏅", bgColor: "bg-yellow-500/10", urgency: "low" },
  SQUAD_INVITATION: { icon: "🤝", bgColor: "bg-indigo-500/10", urgency: "medium" },
  COLLAB_REQUEST: { icon: "🔗", bgColor: "bg-purple-500/10", urgency: "medium" },
};

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationBell() {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*, actor:actor_id(id, username, full_name, avatar_url)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || []).map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        is_read: n.is_read,
        created_at: n.created_at,
        action_url: n.action_url,
        actor: n.actor
          ? {
              id: n.actor.id,
              username: n.actor.username,
              full_name: n.actor.full_name,
              avatar_url: n.actor.avatar_url,
            }
          : undefined,
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Real-time subscription
  useEffect(() => {
    if (!session?.user) return;

    loadNotifications();

    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const subscription = supabase
      .channel(`notifications:${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session, loadNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Track read event
      if (supabase && session?.user) {
        await supabase.from("referral_events").insert({
          user_id: session.user.id,
          event_type: "read",
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [session]);

  const markAllAsRead = useCallback(async () => {
    if (!session?.user) return;

    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [session]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;

      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  if (!session?.user) return null;

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <h3 className="font-semibold text-on-surface">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="rounded p-1 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <Link
                href="/settings/notifications"
                className="rounded p-1 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                title="Notification settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                filter === "all"
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                filter === "unread"
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container-high" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-high" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container-high" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/50">
                {filteredNotifications.map((notification) => {
                  const config = notificationConfig[notification.type];
                  const content = (
                    <div
                      className={`flex items-start gap-3 p-4 transition ${
                        notification.is_read ? "bg-surface-container" : "bg-surface-container-high"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
                      >
                        <span className="text-lg">{config.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-on-surface">{notification.title}</p>
                        <p className="text-sm text-on-surface-variant line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  );

                  return (
                    <div key={notification.id} className="group relative">
                      {notification.action_url ? (
                        <Link
                          href={notification.action_url}
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                          className="block"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div onClick={() => !notification.is_read && markAsRead(notification.id)} className="cursor-pointer">
                          {content}
                        </div>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="absolute right-2 top-2 rounded p-1 opacity-0 transition hover:bg-surface-container-high group-hover:opacity-100"
                      >
                        <X className="h-4 w-4 text-on-surface-variant" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-outline-variant bg-surface-container-low p-3">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-primary hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
