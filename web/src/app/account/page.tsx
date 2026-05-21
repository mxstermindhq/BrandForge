"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ForgePage } from "@/components/forge/ForgePage";
import { profilePath } from "@/lib/reserved-paths";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function AccountPage() {
  const { session, signOut, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading } = useAuthMe();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!meLoading && me?.pendingOnboarding) router.replace("/onboarding");
    if (!meLoading && me?.pendingSellerSetup) router.replace("/onboarding/service");
  }, [me, meLoading, router]);

  if (authLoading || meLoading) {
    return (
      <ForgePage title="Account" narrow>
        <p className="text-sm text-[var(--forge-text-muted)]">Loading account…</p>
      </ForgePage>
    );
  }

  const username = me?.profile?.username;
  const profileUrl = username ? profilePath(username) : null;

  return (
    <ForgePage
      title="Your forge"
      eyebrow="Seller account"
      description={
        me?.sellerAccess
          ? "Profile and listings are live. Edit your public page or add another service."
          : "Complete onboarding to unlock seller tools."
      }
      narrow
    >
      <div className="forge-page-card mx-auto max-w-md space-y-6">
        <div>
          <p className="forge-section-eyebrow">Signed in as</p>
          <p className="font-headline text-xl text-[var(--forge-text)]">{me?.profile?.full_name || user?.email}</p>
          {username ? (
            <p className="mt-1 text-sm text-[var(--forge-gold)]">@{username}</p>
          ) : null}
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--forge-text-muted)]">Published listings</dt>
            <dd className="font-medium text-[var(--forge-text)]">{me?.publishedServiceCount ?? 0}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--forge-text-muted)]">Seller access</dt>
            <dd className="font-medium text-[var(--forge-text)]">{me?.sellerAccess ? "Active" : "Locked"}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          {profileUrl ? (
            <Link href={profileUrl} className="forge-btn forge-btn-primary justify-center">
              View public profile
            </Link>
          ) : null}
          <Link href="/account/profile" className="forge-btn forge-btn-secondary justify-center">
            Edit profile
          </Link>
          <Link href="/account/listings" className="forge-btn forge-btn-secondary justify-center">
            Manage listings
          </Link>
          <Link href="/onboarding/service" className="forge-btn forge-btn-ghost justify-center">
            Add listing
          </Link>
          <Link href="/#browse" className="forge-btn forge-btn-ghost justify-center">
            Browse marketplace
          </Link>
          <button type="button" className="forge-btn forge-btn-ghost justify-center" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
    </ForgePage>
  );
}
