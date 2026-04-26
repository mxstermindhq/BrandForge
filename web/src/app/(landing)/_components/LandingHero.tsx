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
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-high border border-primary/30 mb-10 mt-8">
          <span className="material-symbols-outlined text-primary text-sm">star</span>
          <span className="text-sm font-body text-primary">
            Client-first project execution
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-bold text-on-surface mb-6 tracking-tight drop-shadow-lg">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#dbeafe] via-[#60a5fa] to-[#1d4ed8]">
            Hire faster. Sign faster. Ship faster.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-4 font-body">
          Write the brief, receive offers, negotiate in chat, and sign contracts in one place.
          <br />
          AI copilots help your team move from request to delivery without chaos.
        </p>

        <p className="text-lg text-on-surface-variant/70 max-w-xl mx-auto mb-8">
          Built for clients who care about speed, quality, and clear accountability.
        </p>

        <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-3 sm:mb-14">
          <a
            href="mailto:hello@brandforge.gg?subject=Start%20a%20project%20%E2%80%94%20BrandForge&body=Hi%20BrandForge%20team%2C%0A%0AI%27d%20like%20to%20start%20a%20project%3A%0A%0A"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-on-primary shadow-md transition hover:opacity-90"
          >
            Start a project
          </a>
          <button
            type="button"
            onClick={scrollToAndFocusEmail}
            className="text-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
          >
            Or sign in to your workspace
          </button>
        </div>

        {/* Auth Card */}
        <div id="auth-section" className="max-w-md mx-auto">
          <div className="surface-card p-8 sm:p-10">
            <h2 className="text-xl font-headline font-semibold text-on-surface mb-2">
              Start with your client account
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Access marketplace, AI tools, and deal rooms in one workspace.
            </p>

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

            <p className="mt-4 text-center text-xs text-on-surface-variant/80">Or</p>
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={busy || !configured}
              className="mt-2 w-full rounded-lg border border-outline-variant/80 bg-transparent py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
            >
              Continue with Google
            </button>

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
