"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { CreateListingForm } from "@/components/account/CreateListingForm";
import { isOnboardingFinished } from "@/lib/onboarding-status";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function NewListingPage() {
  const { session, authReady } = useAuth();
  const { me, loading: meLoading } = useAuthMe();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !session) router.replace("/login?next=/account/listings/new");
  }, [authReady, session, router]);

  useEffect(() => {
    if (!meLoading && me && !isOnboardingFinished(me)) router.replace("/onboarding");
  }, [me, meLoading, router]);

  if (!session || meLoading || !me) {
    return (
      <main className="forge-page flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-[var(--forge-text-muted)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="forge-page pb-20">
      <div className="forge-container">
        <AccountShell
          title="Create an offer"
          subtitle="Optional — publish a Starter or Partner package when you're ready to sell."
        >
          <Link href="/account/listings" className="forge-back-link mb-4 inline-block">
            ← Back to offers
          </Link>
          <CreateListingForm showSkip />
        </AccountShell>
      </div>
    </main>
  );
}
