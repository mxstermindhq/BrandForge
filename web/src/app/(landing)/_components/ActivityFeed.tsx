"use client";

import { useState, useEffect } from "react";
import { Trophy, DollarSign, Users, Star, ArrowUp, Loader2 } from "lucide-react";
import { apiGetJson } from "@/lib/api";

interface ApiActivity {
  id: string;
  type: "rank_up" | "deal_closed" | "review" | "squad_join" | "deal" | "achievement";
  user: string;
  userId?: string;
  avatar?: string;
  action: string;
  detail: string;
  amount?: number;
  timestamp: string;
  createdAt?: string;
}

interface Activity {
  id: string;
  type: string;
  user: string;
  avatar: string;
  action: string;
  detail: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  rank_up: { icon: <Trophy size={14} />, color: "text-amber-400 bg-amber-500/10" },
  achievement: { icon: <Trophy size={14} />, color: "text-amber-400 bg-amber-500/10" },
  deal_closed: { icon: <DollarSign size={14} />, color: "text-emerald-400 bg-emerald-500/10" },
  deal: { icon: <DollarSign size={14} />, color: "text-emerald-400 bg-emerald-500/10" },
  review: { icon: <Star size={14} />, color: "text-purple-400 bg-purple-500/10" },
  squad_join: { icon: <Users size={14} />, color: "text-sky-400 bg-sky-500/10" },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

function deduplicateActivities(activities: Activity[]): Activity[] {
  const seen = new Set<string>();
  return activities.filter((activity) => {
    // Create a unique key from user + action + detail (within last 5 minutes)
    const key = `${activity.user}:${activity.action}:${activity.detail}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function transformApiActivity(apiActivity: ApiActivity): Activity {
  const type = apiActivity.type;
  const iconConfig = iconMap[type] || { icon: <ArrowUp size={14} />, color: "text-on-surface-variant bg-surface-container-high" };
  
  return {
    id: apiActivity.id || `${apiActivity.user}-${Date.now()}`,
    type: apiActivity.type,
    user: apiActivity.user,
    avatar: apiActivity.avatar || getInitials(apiActivity.user),
    action: apiActivity.action,
    detail: apiActivity.detail,
    time: formatTimeAgo(apiActivity.timestamp || apiActivity.createdAt || new Date().toISOString()),
    icon: iconConfig.icon,
    color: iconConfig.color,
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  // Fetch real data from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiGetJson<ApiActivity[]>("/api/activity/recent", null);
        if (data && Array.isArray(data)) {
          const transformed = data.map(transformApiActivity);
          const deduplicated = deduplicateActivities(transformed);
          setActivities(deduplicated.slice(0, 5)); // Keep only 5 most recent
        }
      } catch (error: unknown) {
        // Silently handle 404 - endpoint may not be implemented yet
        const apiError = error as { status?: number };
        if (apiError?.status !== 404) {
          console.error("Failed to fetch activities:", error);
        }
        // Leave activities empty - will show "No recent activity" state
      } finally {
        setLoading(false);
        setLastFetch(new Date());
      }
    };

    fetchActivities();

    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh "time ago" text
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) =>
        prev.map((activity) => ({
          ...activity,
          time: formatTimeAgo(activity.id.includes("-") ? activity.id.split("-").slice(1).join("-") || new Date().toISOString() : new Date().toISOString()),
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-surface/50 border border-outline-variant rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">Live Activity</span>
          </div>
          <Loader2 size={12} className="text-on-surface-variant animate-spin" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/40 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-container-high" />
              <div className="flex-1 h-4 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-surface/50 border border-outline-variant rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs text-on-surface-variant uppercase tracking-wider">Live Activity</span>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant text-center py-4">No recent activity</p>
      </div>
    );
  }

  return (
    <div
      className="bg-surface/50 border border-outline-variant rounded-xl p-4 backdrop-blur-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">Live Activity</span>
        </div>
        {isPaused ? (
          <span className="text-[10px] text-on-surface-variant/60">Paused</span>
        ) : (
          <span className="text-[10px] text-on-surface-variant/60">
            {Math.floor((Date.now() - lastFetch.getTime()) / 1000)}s ago
          </span>
        )}
      </div>

      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={`${activity.id}-${index}`}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-500 ${
              index === 0 ? "bg-surface-container-high/50 border border-outline-variant/50" : "bg-surface-container-low/40"
            }`}
            style={{
              animation: index === 0 ? "fadeInDown 0.5s ease-out" : undefined,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-xs font-medium text-on-surface-variant shrink-0">
              {activity.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-on-surface-variant truncate">
                <span className="font-medium text-on-surface">@{activity.user}</span>{" "}
                {activity.action}{" "}
                <span className={`${activity.color.split(" ")[0]} font-medium`}>
                  {activity.detail}
                </span>
              </p>
            </div>
            <div className={`p-1.5 rounded ${activity.color}`}>
              {activity.icon}
            </div>
            <span className="text-[10px] text-on-surface-variant/60 shrink-0">{activity.time}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
