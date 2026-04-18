"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGetJson, apiMutateJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

interface Notification {
  id: string;
  type: "bid" | "message" | "contract" | "milestone" | "payment" | "escrow" | "system" | "alert";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  priority: "low" | "medium" | "high" | "critical";
  metadata?: {
    dealId?: string;
    senderName?: string;
    amount?: number;
    actionRequired?: boolean;
  };
}

interface AISummary {
  unreadCount: number;
  highPriorityCount: number;
  actionRequiredCount: number;
  summary: string;
  suggestedActions: string[];
}

export function UserInbox() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "mentions" | "alerts">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAISummary, setShowAISummary] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const [notifsData, summaryData] = await Promise.all([
          apiGetJson<{ notifications: Notification[] }>("/api/notifications", accessToken),
          apiGetJson<AISummary>("/api/notifications/ai-summary", accessToken),
        ]);
        setNotifications(notifsData.notifications);
        setAiSummary(summaryData);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, [accessToken]);

  async function markAsRead(id: string) {
    try {
      await apiMutateJson(`/api/notifications/${id}/read`, "POST", {}, accessToken);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await apiMutateJson("/api/notifications/read-all", "POST", {}, accessToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  async function generateAISummary() {
    setShowAISummary(true);
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "mentions") return n.type === "message" || n.type === "bid";
    if (activeTab === "alerts") return n.priority === "high" || n.priority === "critical";
    return true;
  });

  const getNotificationIcon = (type: Notification["type"]) => {
    const icons = {
      bid: "local_offer",
      message: "chat",
      contract: "description",
      milestone: "flag",
      payment: "payments",
      escrow: "account_balance",
      system: "info",
      alert: "notifications_active",
    };
    return icons[type];
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    const colors = {
      low: "text-on-surface-variant",
      medium: "text-primary",
      high: "text-amber-400",
      critical: "text-error",
    };
    return colors[priority];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined text-2xl text-on-surface">inbox</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-on-error text-[10px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Inbox</h1>
            <p className="text-sm text-on-surface-variant">
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateAISummary}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI Summary
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary px-3 py-2 text-sm"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* AI Summary Card */}
      {showAISummary && aiSummary && (
        <div className="surface-card p-5 mb-6 border-primary/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h3 className="font-headline font-semibold text-on-surface">AI Inbox Summary</h3>
            </div>
            <button
              onClick={() => setShowAISummary(false)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm text-on-surface mb-4">{aiSummary.summary}</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-surface-container-low text-center">
              <p className="text-2xl font-bold text-primary">{aiSummary.unreadCount}</p>
              <p className="text-xs text-on-surface-variant">Unread</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low text-center">
              <p className="text-2xl font-bold text-amber-400">{aiSummary.highPriorityCount}</p>
              <p className="text-xs text-on-surface-variant">High Priority</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low text-center">
              <p className="text-2xl font-bold text-error">{aiSummary.actionRequiredCount}</p>
              <p className="text-xs text-on-surface-variant">Action Required</p>
            </div>
          </div>
          {aiSummary.suggestedActions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-2">
                Suggested Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {aiSummary.suggestedActions.map((action, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: "all", label: "All", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "mentions", label: "Mentions", count: notifications.filter((n) => n.type === "message" || n.type === "bid").length },
          { id: "alerts", label: "Alerts", count: notifications.filter((n) => n.priority === "high" || n.priority === "critical").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-outline"
            }`}
          >
            <span className="font-medium">{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? "bg-on-primary/20" : "bg-surface-container-high"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`surface-card p-4 transition-all ${
              !notification.read ? "border-primary/30 bg-primary/5" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                notification.read ? "bg-surface-container-high" : "bg-primary/10"
              }`}>
                <span className={`material-symbols-outlined ${
                  notification.read ? "text-on-surface-variant" : "text-primary"
                }`}>
                  {getNotificationIcon(notification.type)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${notification.read ? "text-on-surface" : "text-on-surface font-bold"}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      <span className={`material-symbols-outlined text-sm ${getPriorityColor(notification.priority)}`}>
                        {notification.priority === "critical" ? "error" : notification.priority === "high" ? "warning" : "info"}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">{notification.message}</p>
                    {notification.metadata?.actionRequired && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-error/10 border border-error/30 text-error text-xs font-medium">
                        <span className="material-symbols-outlined text-xs">error</span>
                        Action Required
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-3">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View Details
                    </Link>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-on-surface-variant hover:text-on-surface"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 surface-card">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">inbox</span>
            </div>
            <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">No notifications</h3>
            <p className="text-sm text-on-surface-variant">
              {activeTab === "all" 
                ? "You're all caught up!" 
                : `No ${activeTab} notifications found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
