"use client";

/** Passthrough wrapper — keeps member/landing layouts stable without marketplace UI state. */
export function LandingUIProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
