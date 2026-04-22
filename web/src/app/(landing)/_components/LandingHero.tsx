"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface LandingHeroProps {
  selectedPlan?: string | null;
}

export function LandingHero({ selectedPlan }: LandingHeroProps = {}) {
  const router = useRouter();
  const { signInWithGoogle, signInWithOtp, configured, session, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Redirect authenticated users to chat
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
      // Redirect happens via useEffect above when session updates
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  const emailInputRef = useRef<HTMLInputElement>(null);

  function scrollToAndFocusEmail() {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 500);
  }

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

  // Show loading while checking auth
  if (authReady && session) {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Redirecting to chat...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background - WoW Fantasy Theme */}
      <div className="absolute inset-0 bg-background">
        {/* Deep blue mist (Alliance) */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        {/* Golden glow (Sunwell style) */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl animate-pulse" />
        {/* Reddish ember (Horde accent) */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTAgMGg2MHY2MEgwVjB6IiBmaWxsPSIjZDRhZjM3Ii8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-high border border-primary/30 mb-10 mt-8">
          <span className="material-symbols-outlined text-primary text-sm">⚔️</span>
          <span className="text-sm font-body text-primary">
            The Professional OS for the AI Era
          </span>
        </div>

        {/* Headline - WoW Style */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-bold text-on-surface mb-6 tracking-tight drop-shadow-lg">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f5e6bc] via-[#d4af37] to-[#8b6914]">
            World of BrandForge
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-4 font-body">
          AI agents, deal rooms, and smart matching.
          <br />
          Execute projects end-to-end with human and AI squads.
        </p>

        <p className="text-lg text-on-surface-variant/70 max-w-xl mx-auto mb-8">
          Enter a competitive marketplace where reputation matters. Rank up from Challenger to Undisputed.
        </p>

        {/* Try BrandForge Button */}
        <button
          onClick={scrollToAndFocusEmail}
          className="group relative px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 text-on-primary rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto mb-16"
        >
          <span>Try BrandForge</span>
          <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">arrow_downward</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </button>

        {/* Auth Card */}
        <div id="auth-section" className="max-w-md mx-auto">
          <div className="surface-card p-8 sm:p-10">
            <h2 className="text-xl font-headline font-semibold text-on-surface mb-2">
              Enter the Arena
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Sign in with Google or email to start your journey
            </p>

            {/* Google Sign In */}
            <button
              onClick={onGoogleSignIn}
              disabled={busy || !configured}
              className="w-full flex items-center justify-center gap-3 btn-secondary min-h-12 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-container-high px-2 text-on-surface-variant">or</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={onEmailSubmit} className="space-y-4">
              <div>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={busy}
                />
              </div>
              <button
                type="submit"
                disabled={busy || !configured}
                className="w-full btn-primary min-h-12"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Continue with Email"
                )}
              </button>
            </form>

            {notice && (
              <p className="mt-4 text-sm text-success font-body" role="status">
                {notice}
              </p>
            )}
            {err && (
              <p className="mt-4 text-sm text-error font-body" role="alert">
                {err}
              </p>
            )}

            <p className="mt-6 text-xs text-on-surface-variant/70">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">
            keyboard_arrow_down
          </span>
        </div>
      </div>
    </section>
  );
}
