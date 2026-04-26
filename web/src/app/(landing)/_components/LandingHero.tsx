"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { GoogleGIcon } from "@/components/icons/GoogleGIcon";

interface LandingHeroProps {
  selectedPlan?: string | null;
}

export function LandingHero({ selectedPlan: _selectedPlan }: LandingHeroProps = {}) {
  void _selectedPlan;
  const router = useRouter();
  const { signInWithGoogle, signInWithOtp, configured, session, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && session) {
      router.push("/chat");
    }
  }, [authReady, session, router]);

  async function onGoogleSignIn() {
    setErr(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash !== "#auth-section") return;
    const t = window.setTimeout(() => emailInputRef.current?.focus({ preventScroll: true }), 100);
    return () => window.clearTimeout(t);
  }, []);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!email.trim()) {
      setErr("Enter your email.");
      return;
    }
    setBusy(true);
    try {
      await signInWithOtp(email);
      setNotice("Check your email for the magic link to sign in.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not send email");
    } finally {
      setBusy(false);
    }
  }

  if (authReady && session) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-on-surface-variant">Redirecting to chat...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-tertiary/5 blur-3xl delay-1000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTAgMGg2MHY2MEgwVjB6IiBmaWxsPSIjZDRhZjM3Ii8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl pt-20 text-center">
        <h1 className="mb-5 font-headline text-5xl font-bold tracking-tight text-on-surface drop-shadow-lg sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-b from-[#dbeafe] via-[#60a5fa] to-[#1d4ed8] bg-clip-text text-transparent">
            Hire Fast. Build Faster.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl font-body text-xl text-on-surface-variant sm:mb-12 sm:text-2xl">
          Brief, negotiate, sign, and deliver — all in one place.
        </p>

        <div id="auth-section" className="mx-auto max-w-md">
          <div className="surface-card p-8 sm:p-10">
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={busy || !configured}
              className="flex w-full min-h-12 items-center justify-center gap-3 rounded-lg border border-outline-variant/80 bg-surface-container-low py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
            >
              <GoogleGIcon className="h-5 w-5 shrink-0" />
              Continue with Google
            </button>

            <p className="my-5 text-center text-xs font-medium uppercase tracking-wider text-on-surface-variant/70">
              Or
            </p>

            <form onSubmit={onEmailSubmit} className="space-y-4">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={busy}
              />
              <button type="submit" disabled={busy || !configured} className="btn-primary min-h-12 w-full">
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
                    Sending...
                  </span>
                ) : (
                  "Continue with Email"
                )}
              </button>
            </form>

            {notice ? (
              <p className="mt-4 font-body text-sm text-success" role="status">
                {notice}
              </p>
            ) : null}
            {err ? (
              <p className="mt-4 font-body text-sm text-error" role="alert">
                {err}
              </p>
            ) : null}

            <p className="mt-6 text-center text-xs text-on-surface-variant/80">
              By continuing, you acknowledge BrandForge&apos;s{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-16 animate-bounce">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">keyboard_arrow_down</span>
        </div>
      </div>
    </section>
  );
}
