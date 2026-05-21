"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

const ALLOWED_WHILE_ONBOARDING = new Set([
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
    if (ALLOWED_WHILE_ONBOARDING.has(pathname)) return;

    if (me.pendingOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (me.pendingSellerSetup) {
      router.replace("/onboarding/service");
    }
  }, [authLoading, meLoading, user, me, pathname, router]);

  return null;
}
