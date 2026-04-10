"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGetJson, apiFetch } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type NotificationRow = {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
  created_at?: string;
  related_id?: string | null;
  related_type?: string | null;
  metadata?: Record<string, unknown>;
};

export function useNotifications() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      if (!t) {
        setItems([]);
        setLoading(false);
        return;
      }
      const data = await apiGetJson<{ notifications: NotificationRow[] }>("/api/notifications", t);
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Notifications failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    const supabase = getSupabaseBrowser();
    let t: string | null = null;
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      t = data.session?.access_token ?? null;
    }
    if (!t) return;
    await apiFetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: "PUT",
      accessToken: t,
    });
    await load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    let t: string | null = null;
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      t = data.session?.access_token ?? null;
    }
    if (!t) return;
    const { ok } = await apiFetch("/api/notifications/read-all", {
      method: "PUT",
      accessToken: t,
    });
    if (ok) await load();
  }, [load]);

  const deleteAll = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    let t: string | null = null;
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      t = data.session?.access_token ?? null;
    }
    if (!t) return;
    const { ok } = await apiFetch("/api/notifications", {
      method: "DELETE",
      accessToken: t,
    });
    if (ok) await load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  return { items, err, loading, reload: load, markRead, markAllRead, deleteAll, unreadCount };
}
