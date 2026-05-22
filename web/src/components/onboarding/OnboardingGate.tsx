"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHasOwnListings } from "@/hooks/useHasOwnListings";
import { isOnboardingFinished } from "@/lib/onboarding-status";
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
  "/account",
  "/account/listings",
  "/account/profile",
  "/dashboard",
]);

export function OnboardingGate() {
  const { session, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading } = useAuthMe();
  const { hasListings, loading: listingsLoading } = useHasOwnListings();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || meLoading || listingsLoading || !user || !me?.enabled) return;
    if (ALLOWED_WHILE_ONBOARDING.has(pathname)) return;

    if (isOnboardingFinished(me) || hasListings) return;

    if (me.pendingOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (me.pendingSellerSetup) {
      router.replace("/onboarding/service");
    }
  }, [authLoading, meLoading, listingsLoading, user, me, hasListings, pathname, router]);

  return null;
}
