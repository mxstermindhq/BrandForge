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
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";

export type BootstrapState = Record<string, unknown> & {
  services?: unknown[];
  profiles?: unknown[];
  requests?: unknown[];
  leaderboard?: unknown[];
  humanChats?: unknown[];
  marketplaceStats?: Record<string, unknown> | null;
  /** True when `profiles.role === 'admin'` or user id is listed in `ADMIN_USER_IDS`. */
  isPlatformAdmin?: boolean;
  hasPaidPlan?: boolean;
  honorSeason?: {
    weekStartsAt?: string;
    weeklyListingFilterActive?: boolean;
  };
  socialConnections?: unknown[];
  seasonRewardPoolUsdt?: number;
  seasonDisplayName?: string;
  /** Published `service_packages` rows for the signed-in user (activation journey). */
  publishedListingsCount?: number;
  /** User ids with recent API presence (same window as platform.onlineNow). */
  onlineUserIds?: string[];
};

type BootstrapCtx = {
  data: BootstrapState | null;
  err: string | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const Ctx = createContext<BootstrapCtx | null>(null);

export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { session, authReady } = useAuth();
  const [data, setData] = useState<BootstrapState | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      let t: string | null = session?.access_token ?? null;
      const supabase = getSupabaseBrowser();
      if (!t && supabase) {
        const { data: s } = await supabase.auth.getSession();
        t = s.session?.access_token ?? null;
      }
      const json = await apiGetJson<BootstrapState>("/api/bootstrap", t);
      setData(json);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [authReady, session?.user?.id, load]);

  const value = useMemo<BootstrapCtx>(
    () => ({ data, err, loading, reload: load }),
    [data, err, loading, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBootstrap(): BootstrapCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBootstrap must be used within BootstrapProvider");
  return v;
}
