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
import { apiGetJson } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export type AuthMeProfile = {
  id?: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  onboarding_completed_at?: string | null;
};

export type AuthMeResponse = {
  enabled?: boolean;
  user: { id: string; email: string } | null;
  profile: AuthMeProfile | null;
  pendingOnboarding?: boolean;
};

type AuthMeCtx = {
  me: AuthMeResponse | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const Ctx = createContext<AuthMeCtx | null>(null);

/**
 * Single shared `/api/auth/me` payload for the whole app.
 * Without this, each `useAuthMe` consumer keeps separate state — after onboarding,
 * WelcomeClient can see `pendingOnboarding: false` while OnboardingRedirect still
 * has stale `true`, causing `/` ↔ `/welcome` redirect fights.
 */
export function AuthMeProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) {
      setMe(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiGetJson<AuthMeResponse>("/api/auth/me", accessToken);
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<AuthMeCtx>(() => ({ me, loading, reload: load }), [me, loading, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuthMe() {
  const ctx = useContext(Ctx);
  const { refresh } = useAuth();
  if (!ctx) {
    throw new Error("useAuthMe must be used within AuthMeProvider");
  }
  return { me: ctx.me, loading: ctx.loading, reload: ctx.reload, reloadSession: refresh };
}
