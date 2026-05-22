"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { ForgeSiteShell } from "@/app/(landing)/_components/forge/ForgeSiteShell";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { isOnboardingFinished } from "@/lib/onboarding-status";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function DashboardPage() {
  const { session, authReady } = useAuth();
  const { me, loading: meLoading } = useAuthMe();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !session) router.replace("/login?next=/dashboard");
  }, [authReady, session, router]);

  useEffect(() => {
    if (!meLoading && me && !isOnboardingFinished(me)) router.replace("/onboarding");
  }, [me, meLoading, router]);

  return (
    <ForgeSiteShell subtleBg>
      <OnboardingGate />
      <main className="forge-page pb-20">
        <div className="forge-container">
          {meLoading || !session ? (
            <p className="py-20 text-center text-sm text-[var(--forge-text-muted)]">Loading dashboard…</p>
          ) : (
            <DashboardClient />
          )}
        </div>
      </main>
    </ForgeSiteShell>
  );
}
