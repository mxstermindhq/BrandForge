"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/hooks/useAuthMe";

/**
 * Redirects authenticated users from landing page to dashboard
 */
export function AuthRedirect() {
  const router = useRouter();
  const { authReady, accessToken, session } = useAuth();
  const { me, loading: meLoading } = useAuthMe();

  useEffect(() => {
    if (!authReady) return;
    if (!accessToken || !session?.user) return;
    if (meLoading) return;
    if (me?.pendingOnboarding === true) {
      router.replace("/welcome");
      return;
    }
    // Authenticated user with completed onboarding -> redirect to dashboard
    router.replace("/dashboard");
  }, [authReady, accessToken, session, me, meLoading, router]);

  return null;
}