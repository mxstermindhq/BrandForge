"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";

/**
 * Forces first-time members onto /welcome until username + professional title are set.
 */
export function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { authReady, accessToken, session } = useAuth();
  const { me, loading: meLoading } = useAuthMe();

  useEffect(() => {
    if (!authReady) return;
    if (!accessToken || !session?.user) return;
    if (meLoading) return;
    if (me?.pendingOnboarding !== true) return;
    if (pathname === "/welcome") return;
    router.replace("/welcome");
  }, [authReady, accessToken, session, me, meLoading, pathname, router]);

  return null;
}
