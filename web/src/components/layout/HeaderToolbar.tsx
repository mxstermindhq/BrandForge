"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";

export function HeaderToolbar() {
  const { session } = useAuth();
  const { me } = useAuthMe();

  // Get user info
  const name = me?.profile?.username || session?.user?.email?.split("@")[0] || "Guest";
  const avatarUrl = me?.profile?.avatar_url;

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/?signup=true"
          className="btn-primary text-sm px-4 py-2"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Inbox Icon */}
      <Link
        href="/inbox"
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors relative"
        title="Inbox"
      >
        <span className="material-symbols-outlined text-on-surface-variant">inbox</span>
        {/* Badge - would show unread count */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
      </Link>

      {/* Notifications Icon */}
      <Link
        href="/inbox?tab=alerts"
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-high transition-colors relative"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {/* Badge - would show notification count */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
      </Link>

      {/* User Profile */}
      <Link
        href="/settings"
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors ml-2"
      >
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden ring-1 ring-outline-variant">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
          )}
        </div>
        <span className="text-sm font-medium text-on-surface hidden sm:block max-w-[100px] truncate">
          {name}
        </span>
      </Link>
    </div>
  );
}
