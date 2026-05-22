"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountHome } from "@/components/account/AccountHome";
import { isOnboardingFinished } from "@/lib/onboarding-status";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function AccountPage() {
  const { session, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading } = useAuthMe();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!meLoading && me && !isOnboardingFinished(me)) {
      router.replace("/onboarding");
    }
  }, [me, meLoading, router]);

  if (authLoading || meLoading || !me || !isOnboardingFinished(me)) {
    return (
      <main className="forge-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--forge-text-muted)]">Loading your account…</p>
      </main>
    );
  }

  return (
    <main className="forge-page pb-20">
      <div className="forge-container">
        <AccountHome />
      </div>
    </main>
  );
}
