"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { explainOAuthExchangeFailure, takeOAuthCallbackError } from "@/lib/oauth-callback-errors";
import { formatOAuthProviderError, supabaseProjectHint } from "@/lib/supabase-auth-errors";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    configured,
    session,
    signInWithGoogle,
    signInWithOtp,
    signInWithPassword,
    signUpWithPassword,
    signInWithPhoneOtp,
    verifyPhoneOtp,
    refresh,
  } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter" | "verify">("enter");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const supabaseHint = supabaseProjectHint();

  useEffect(() => {
    const code = params.get("error");
    if (code === "session") {
      setErr("Session expired or sign-in incomplete.");
      return;
    }
    if (code === "oauth") {
      const stored = takeOAuthCallbackError();
      setErr(
        stored
          ? explainOAuthExchangeFailure(stored)
          : "Google sign-in failed on the server. Check Client ID/Secret in Supabase.",
      );
    }
  }, [params]);

  useEffect(() => {
    if (session?.user) router.replace("/");
  }, [session, router]);

  useEffect(() => {
    setErr(null);
    setNotice(null);
    setPhoneStep("enter");
    setPhoneOtp("");
  }, [channel]);

  async function onOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!email.trim()) {
      setErr("Enter your email.");
      return;
    }
    setBusy(true);
    try {
      const dest = safeNext(params.get("next"));
      if (dest !== "/") {
        try {
          sessionStorage.setItem("mx_auth_next", dest);
        } catch {
          /* ignore */
        }
      }
      await signInWithOtp(email);
      setNotice(
        mode === "signup"
          ? "Check your email — confirm the link to finish signup."
          : "Check your email for the sign-in link.",
      );
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send email");
    } finally {
      setBusy(false);
    }
  }

  async function onSendPhoneCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    const p = phone.trim();
    if (!p || p.length < 8) {
      setErr("Enter a valid phone number in E.164 format (e.g. +14155552671).");
      return;
    }
    if (!p.startsWith("+")) {
      setErr("Include country code with + (E.164), e.g. +1 for US.");
      return;
    }
    setBusy(true);
    try {
      const dest = safeNext(params.get("next"));
      if (dest !== "/") {
        try {
          sessionStorage.setItem("mx_auth_next", dest);
        } catch {
          /* ignore */
        }
      }
      await signInWithPhoneOtp(p);
      setPhoneStep("verify");
      setNotice("Enter the code we texted you.");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send SMS. Enable Phone auth in Supabase.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyPhone(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!phoneOtp.trim()) {
      setErr("Enter the verification code.");
      return;
    }
    setBusy(true);
    try {
      await verifyPhoneOtp(phone.trim(), phoneOtp.trim());
      router.replace("/");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Invalid code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setErr("Email and password are required.");
      return;
    }
    setBusy(true);
    try {
      const dest = safeNext(params.get("next"));
      if (mode === "signup") {
        await signUpWithPassword(email, password);
        await refresh();
        const supabase = (await import("@/lib/supabase/browser")).getSupabaseBrowser();
        const sess = await supabase?.auth.getSession();
        if (sess?.data.session) {
          router.replace("/");
        } else {
          setNotice("Check your email to confirm your account, then sign in.");
        }
      } else {
        await signInWithPassword(email, password);
        await refresh();
        router.replace(dest);
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    try {
      const dest = safeNext(params.get("next"));
      if (dest !== "/") {
        try {
          sessionStorage.setItem("mx_auth_next", dest);
        } catch {
          /* ignore */
        }
      }
      await signInWithGoogle({ isSignUp: mode === "signup" });
    } catch (e2) {
      setErr(formatOAuthProviderError(e2, "Google"));
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="bg-background text-on-surface flex min-h-screen items-center justify-center p-6">
        <div className="border-outline-variant/20 bg-surface-container-low max-w-md rounded-xl border p-8">
          <h1 className="font-headline text-xl font-bold">Auth not configured</h1>
          <p className="text-on-surface-variant mt-2 text-sm">
            Add <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="text-xs">web/.env.local</code>, then restart Next.
          </p>
          <Link href="/" className="text-primary mt-6 inline-block text-sm font-semibold">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface relative min-h-screen overflow-hidden font-body">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-8 inline-flex">
          <span className="inline-flex items-center gap-1.5 font-headline text-2xl font-bold tracking-tight text-on-surface">
            <span className="text-primary text-2xl leading-none">★</span>
            <span>BrandForge</span>
          </span>
        </Link>
        <div className="border-outline-variant/15 bg-surface-container-low/80 rounded-xl border p-8 backdrop-blur-xl">
          <h1 className="font-headline text-2xl font-bold">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Email, SMS, magic link, password, or Google. New accounts finish username and title on the next step.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setChannel("email")}
              className={`font-headline min-h-[40px] flex-1 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors ${
                channel === "email"
                  ? "bg-secondary/20 text-secondary border-secondary/40 border"
                  : "bg-surface-container-high text-on-surface-variant border border-transparent"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setChannel("phone")}
              className={`font-headline min-h-[40px] flex-1 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors ${
                channel === "phone"
                  ? "bg-secondary/20 text-secondary border-secondary/40 border"
                  : "bg-surface-container-high text-on-surface-variant border border-transparent"
              }`}
            >
              Phone
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`font-headline min-h-[44px] flex-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                mode === "signin"
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`font-headline min-h-[44px] flex-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                mode === "signup"
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              Sign up
            </button>
          </div>

          {err ? (
            <p className="text-error mt-4 whitespace-pre-line text-sm leading-relaxed" role="alert">
              {err}
            </p>
          ) : null}
          {notice ? (
            <p className="text-secondary mt-4 text-sm" role="status">
              {notice}
            </p>
          ) : null}

          {channel === "email" ? (
            <form onSubmit={onOtp} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-on-surface-variant text-xs font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-outline-variant/40 bg-background text-on-surface focus:border-primary mt-1 w-full min-h-[44px] rounded-lg border px-3 text-sm outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="font-headline bg-secondary text-on-secondary hover:brightness-110 w-full min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {mode === "signup" ? "Email me a signup link" : "Email me a sign-in link"}
              </button>
            </form>
          ) : phoneStep === "enter" ? (
            <form onSubmit={onSendPhoneCode} className="mt-6 space-y-4">
              <div>
                <label htmlFor="phone" className="text-on-surface-variant text-xs font-medium">
                  Mobile number (E.164)
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+14155552671"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-outline-variant/40 bg-background text-on-surface focus:border-primary mt-1 w-full min-h-[44px] rounded-lg border px-3 text-sm outline-none transition-colors"
                />
                <p className="text-on-surface-variant/80 mt-1 text-[10px] leading-snug">
                  Requires Phone provider enabled in Supabase → Authentication → Providers, and SMS settings.
                </p>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="font-headline bg-secondary text-on-secondary hover:brightness-110 w-full min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Send SMS code
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyPhone} className="mt-6 space-y-4">
              <div>
                <label htmlFor="phone-otp" className="text-on-surface-variant text-xs font-medium">
                  Verification code
                </label>
                <input
                  id="phone-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="border-outline-variant/40 bg-background text-on-surface focus:border-primary mt-1 w-full min-h-[44px] rounded-lg border px-3 text-sm outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                className="text-on-surface-variant hover:text-secondary text-xs font-medium"
                onClick={() => {
                  setPhoneStep("enter");
                  setPhoneOtp("");
                  setNotice(null);
                }}
              >
                ← Use a different number
              </button>
              <button
                type="submit"
                disabled={busy}
                className="font-headline bg-primary text-on-primary w-full min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-50"
              >
                Verify & continue
              </button>
            </form>
          )}

          {channel === "email" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onGoogle()}
              className="font-headline border-outline-variant/30 hover:bg-surface-container-high mt-4 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border text-sm font-semibold disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden>
                account_circle
              </span>
              Continue with Google
            </button>
          ) : null}

          {supabaseHint.host && channel === "email" ? (
            <p className="text-on-surface-variant/70 mt-2 text-center text-[10px] leading-snug">
              Supabase project: <span className="text-on-surface-variant font-mono">{supabaseHint.host}</span>
              {supabaseHint.projectRef ? (
                <>
                  {" "}
                  · redirect URI for Google Cloud:{" "}
                  <span className="break-all font-mono">
                    https://{supabaseHint.projectRef}.supabase.co/auth/v1/callback
                  </span>
                </>
              ) : null}
            </p>
          ) : null}

          {channel === "email" ? (
            <details className="border-outline-variant/15 mt-6 border-t pt-6">
              <summary className="text-on-surface-variant cursor-pointer text-sm font-medium">
                {mode === "signup" ? "Create account with password" : "Sign in with password"}
              </summary>
              <form onSubmit={onPassword} className="mt-4 space-y-3">
                <input
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-outline-variant/40 bg-background text-on-surface focus:border-primary w-full min-h-[44px] rounded-lg border px-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-primary text-on-primary font-headline w-full min-h-[44px] rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>
            </details>
          ) : null}

          <p className="text-on-surface-variant/80 mt-8 text-center text-[11px] leading-relaxed">
            In Supabase → Authentication → URL configuration, add redirect{" "}
            <code className="text-on-surface-variant">http://localhost:3001/auth/callback</code> (and your production
            URL).
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-on-surface flex min-h-screen items-center justify-center text-sm">
          Loading…
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
