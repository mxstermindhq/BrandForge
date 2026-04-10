"use client";

import { useEffect, useState } from "react";
import { formatPostedAgo } from "@/lib/relative-time";

type Props = {
  iso: string | null | undefined;
  className?: string;
};

/** Re-renders periodically so “N minutes ago” stays fresh while the page is open. */
export function PostedAgo({ iso, className = "" }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const text = formatPostedAgo(iso);
  if (!text) return null;
  return (
    <span className={className} title={iso || undefined}>
      {text}
    </span>
  );
}
