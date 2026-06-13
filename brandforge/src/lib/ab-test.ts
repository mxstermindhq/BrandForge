"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function sessionKey(testId: string): string {
  return `bf-ab-${testId}`;
}

/** Client-side A/B variant — consistent per session via sessionStorage hash. */
export function useABTest<T extends string>(testId: string, variants: readonly T[]): T {
  const [variant, setVariant] = useState<T>(variants[0]!);

  useEffect(() => {
    if (variants.length < 2) return;
    const key = sessionKey(testId);
    const stored = sessionStorage.getItem(key) as T | null;
    if (stored && variants.includes(stored)) {
      setVariant(stored);
      trackEvent("ab_test_impression", { test_id: testId, variant: stored });
      return;
    }
    const seed = `${testId}-${sessionStorage.getItem("bf-session") ?? String(Date.now())}`;
    if (!sessionStorage.getItem("bf-session")) {
      sessionStorage.setItem("bf-session", String(Date.now()));
    }
    const picked = variants[hashString(seed) % variants.length]!;
    sessionStorage.setItem(key, picked);
    setVariant(picked);
    trackEvent("ab_test_impression", { test_id: testId, variant: picked });
  }, [testId, variants]);

  return variant;
}

export function trackAbConversion(testId: string, variant: string): void {
  trackEvent("ab_test_conversion", { test_id: testId, variant });
}
