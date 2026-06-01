"use client";

import { useEffect, useState } from "react";

type UseDeferredMountOptions = {
  /** Fallback delay when requestIdleCallback is unavailable. */
  fallbackMs?: number;
};

/** Defers mounting heavy client-only layers until the main thread is idle. */
export function useDeferredMount(options: UseDeferredMountOptions = {}): boolean {
  const { fallbackMs = 1200 } = options;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: fallbackMs });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => setReady(true), Math.min(fallbackMs, 400));
    return () => window.clearTimeout(id);
  }, [fallbackMs]);

  return ready;
}
