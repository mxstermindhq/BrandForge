"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

/** Fallback when /api/auth/me publishedServiceCount is stale or the API host is not updated yet. */
export function useHasOwnListings() {
  const { accessToken } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    void apiFetch<{ listings?: unknown[] }>("/api/me/listings", {
      method: "GET",
      accessToken,
    })
      .then(({ ok, data }) => {
        setCount(ok && Array.isArray(data.listings) ? data.listings.length : 0);
      })
      .catch(() => setCount(0))
      .finally(() => setLoading(false));
  }, [accessToken]);

  return { listingCount: count, hasListings: count > 0, loading };
}
