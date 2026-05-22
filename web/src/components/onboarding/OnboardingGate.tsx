"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isOnboardingFinished } from "@/lib/onboarding-status";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

const ALLOWED_WHILE_INCOMPLETE = new Set([
  "/onboarding",
  "/onboarding/service",
  "/login",
  "/auth/callback",
  "/terms",
  "/privacy",
  "/help",
]);

export function OnboardingGate() {
  const { session, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading } = useAuthMe();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || meLoading || !user || !me?.enabled) return;
    if (isOnboardingFinished(me)) return;
    if (ALLOWED_WHILE_INCOMPLETE.has(pathname)) return;
    if (pathname.startsWith("/account") || pathname === "/dashboard") return;

    router.replace("/onboarding");
  }, [authLoading, meLoading, user, me, pathname, router]);

  return null;
}
