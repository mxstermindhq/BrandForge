"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ForgePage } from "@/components/forge/ForgePage";
import { useHasOwnListings } from "@/hooks/useHasOwnListings";
import { isOnboardingFinished } from "@/lib/onboarding-status";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";

export default function OnboardingProfilePage() {
  const { session, accessToken, authReady } = useAuth();
  const user = session?.user ?? null;
  const authLoading = !authReady;
  const { me, loading: meLoading, reload } = useAuthMe();
  const { hasListings, loading: listingsLoading } = useHasOwnListings();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/onboarding");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (meLoading || listingsLoading) return;
    if (isOnboardingFinished(me) || hasListings) {
      router.replace("/account");
      return;
    }
    if (!meLoading && me?.profile?.username) setUsername(me.profile.username);
    if (!meLoading && me?.profile?.headline) setHeadline(me.profile.headline);
    if (me?.profile?.onboarding_completed_at && me.pendingSellerSetup) {
      router.replace("/onboarding/service");
    }
  }, [me, meLoading, listingsLoading, hasListings, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    const { ok, data } = await apiFetch<{ error?: string }>("/api/onboarding/complete", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ username: username.trim(), headline: headline.trim() }),
    });
    setBusy(false);
    if (!ok) {
      setError((data as { error?: string })?.error || "Could not save profile");
      return;
    }
    await reload();
    router.push(hasListings ? "/account" : "/onboarding/service");
  }

  if (authLoading || meLoading || listingsLoading) {
    return (
      <ForgePage title="Loading…" narrow>
        <p className="text-sm text-[var(--forge-text-muted)]">Preparing your forge profile…</p>
      </ForgePage>
    );
  }

  if (hasListings) {
    return (
      <ForgePage title="You're all set" narrow>
        <p className="text-sm text-[var(--forge-text-muted)]">Redirecting to your account…</p>
        <button type="button" className="forge-btn forge-btn-primary mt-4" onClick={() => router.replace("/account")}>
          Go to account
        </button>
      </ForgePage>
    );
  }

  return (
    <ForgePage
      title="Complete your profile"
      eyebrow="Step 1 of 2"
      description="Set your public handle and title before you list a service."
      narrow
    >
      <form onSubmit={submit} className="forge-page-card mx-auto max-w-md space-y-5">
        <div>
          <label className="forge-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="forge-input mt-2 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@+/, "").toLowerCase())}
            placeholder="yourname"
            minLength={2}
            maxLength={31}
            pattern="[a-z0-9][a-z0-9_-]{0,30}"
            required
          />
          <p className="mt-1 text-xs text-[var(--forge-text-muted)]">brandforge.gg/yourname</p>
        </div>
        <div>
          <label className="forge-label" htmlFor="headline">
            Professional title
          </label>
          <input
            id="headline"
            className="forge-input mt-2 w-full"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="AI automation · Discord growth"
            maxLength={200}
            required
          />
        </div>
        {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}
        <button type="submit" className="forge-btn forge-btn-primary w-full" disabled={busy}>
          {busy ? "Saving…" : "Continue → list your first service"}
        </button>
      </form>
    </ForgePage>
  );
}
