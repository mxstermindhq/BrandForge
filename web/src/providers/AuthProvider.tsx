"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type AuthCtx = {
  session: Session | null;
  accessToken: string | null;
  /** False until the first `getSession()` completes (avoids duplicate bootstrap while session is unknown). */
  authReady: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (opts?: { isSignUp?: boolean }) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function authCallbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSession(null);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      throw new Error(
        process.env.NODE_ENV === "production"
          ? "Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Worker build env and web/wrangler.jsonc vars, then redeploy."
          : "Auth is not configured. Add NEXT_PUBLIC_SUPABASE_* to web/.env.local.",
      );
    }
    const redirectTo = authCallbackUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Auth is not configured.");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: authCallbackUrl(),
      },
    });
    if (error) throw error;
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Auth is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Auth is not configured.");
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authCallbackUrl(),
      },
    });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const signInWithPhoneOtp = useCallback(async (phone: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Auth is not configured.");
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Auth is not configured.");
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: token.trim(),
      type: "sms",
    });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let cancelled = false;

    async function hydrate() {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setSession(data.session ?? null);
      } else if (!cancelled) {
        setSession(null);
      }
      if (!cancelled) setAuthReady(true);
    }

    void hydrate();

    if (!supabase) {
      return () => {
        cancelled = true;
      };
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      accessToken: session?.access_token ?? null,
      authReady,
      configured,
      refresh,
      signOut,
      signInWithGoogle,
      signInWithOtp,
      signInWithPassword,
      signUpWithPassword,
      signInWithPhoneOtp,
      verifyPhoneOtp,
    }),
    [
      session,
      authReady,
      configured,
      refresh,
      signOut,
      signInWithGoogle,
      signInWithOtp,
      signInWithPassword,
      signUpWithPassword,
      signInWithPhoneOtp,
      verifyPhoneOtp,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
