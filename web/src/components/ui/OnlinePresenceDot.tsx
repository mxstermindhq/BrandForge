"use client";

import { cn } from "@/lib/cn";

/**
 * Small green pulse for “recently active / online” (server presence window).
 */
export function OnlinePresenceDot({
  active,
  className,
  label = "Online now",
}: {
  active: boolean;
  className?: string;
  /** Accessible name when active */
  label?: string;
}) {
  if (!active) return null;
  return (
    <span
      className={cn("relative inline-flex h-2 w-2 shrink-0", className)}
      title={label}
      aria-label={label}
      role="status"
    >
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/35"
        aria-hidden
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden />
    </span>
  );
}
