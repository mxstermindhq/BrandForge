"use client";

import { useEffect } from "react";

/** Lightweight offline shell — pre-caches core routes (< 5KB). */
export function ServiceWorkerRegister(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* optional */
    });
  }, []);

  return null;
}
