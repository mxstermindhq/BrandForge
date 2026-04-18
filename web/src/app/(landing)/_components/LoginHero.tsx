"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export interface LoginHeroProps {
  selectedPlan?: string | null;
}

export function LoginHero({ selectedPlan }: LoginHeroProps = {}) {
  const router = useRouter();
  const { signInWithGoogle, signInWithOtp, configured, session, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authReady && session) {
      router.push("/dashboard");
    }
  }, [authReady, session, router]);

  // Focus email input if URL has #email hash
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#email') {
      setTimeout(() => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) {
          emailInput.focus();
          emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, []);

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
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant">Redirecting to dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-20 lg:py-0 bg-background">
        <div className="max-w-md mx-auto lg:mx-0 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-primary/30 mb-8 mt-2">
            <span className="material-symbols-outlined text-primary text-sm">⚔️</span>
            <span className="text-sm font-body text-primary">
              The Professional Business Game for the AI Era
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold text-on-surface mb-4 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f5e6bc] via-[#d4af37] to-[#8b6914]">
              BrandForge
            </span>
          </h1>

          <p className="text-lg text-on-surface-variant mb-8 font-body">
            AI agents, deal rooms, and smart matching. Execute projects end-to-end with human and AI squads.
          </p>

          {/* Auth Card */}
          <div id="auth-section" className="surface-card p-6 sm:p-8">
            <h2 className="text-xl font-headline font-semibold text-on-surface mb-2">
              Enter the Arena
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Sign in to start your journey
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

            <p className="mt-6 text-xs text-on-surface-variant/70 text-center">
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
      </div>

      {/* Right Side - App Preview Image */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-container-low">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* App Screenshot / Preview */}
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="relative w-full max-w-lg">
            {/* Main Dashboard Preview */}
            <div className="surface-card p-4 rounded-xl shadow-2xl border border-outline-variant/50 bg-surface">
              {/* Mock Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">BrandForge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20" />
                </div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-surface-container-high">
                  <p className="text-xs text-on-surface-variant">Honor</p>
                  <p className="text-lg font-bold text-primary">2,450</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-high">
                  <p className="text-xs text-on-surface-variant">Conquest</p>
                  <p className="text-lg font-bold text-tertiary">890</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-high">
                  <p className="text-xs text-on-surface-variant">Agents</p>
                  <p className="text-lg font-bold text-secondary">5</p>
                </div>
              </div>

              {/* Mock Agents List */}
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant font-medium uppercase">Active Agents</p>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">Content Writer</p>
                    <p className="text-xs text-on-surface-variant">Writing blog post...</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-success" />
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary">code</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">Code Assistant</p>
                    <p className="text-xs text-on-surface-variant">Idle</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-on-surface-variant/30" />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 surface-card p-3 rounded-lg shadow-lg border border-outline-variant/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-success text-lg">trending_up</span>
                <span className="text-sm font-medium text-on-surface">Rank Up!</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 surface-card p-3 rounded-lg shadow-lg border border-outline-variant/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">groups</span>
                <span className="text-sm font-medium text-on-surface">3 New Squads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
