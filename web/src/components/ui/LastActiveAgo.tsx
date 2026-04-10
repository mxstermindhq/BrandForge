"use client";

import { useEffect, useState } from "react";
import { formatLastActiveAgo } from "@/lib/relative-time";

type Props = {
  iso: string | null | undefined;
  className?: string;
};

export function LastActiveAgo({ iso, className = "" }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const text = formatLastActiveAgo(iso);
  if (!text) return null;
  return (
    <span className={className} title={iso || undefined}>
      {text}
    </span>
  );
}
