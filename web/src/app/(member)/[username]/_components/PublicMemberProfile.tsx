"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGetJson } from "@/lib/api";
import { mapApiProfileToViewModel, type ProfileViewModel } from "@/lib/profile-view-model";
import type { ProfileTrustMetrics, MarketplaceReview } from "@/lib/trust-types";
import { UnifiedProfileView } from "./UnifiedProfileView";

type PublicProfile = {
  full_name?: string | null;
  username?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  availability?: string | null;
  rate_label?: string | null;
  min_budget?: number | null;
  avatar_url?: string | null;
  publicServices?: Array<{
    id: string;
    title?: string;
    category?: string;
    base_price?: number;
    listing_type?: string;
    description?: string;
  }>;
};

type PublicMemberProfileProps = {
  username: string;
};

export function PublicMemberProfile({ username }: PublicMemberProfileProps) {
  const [viewModel, setViewModel] = useState<ProfileViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const json = await apiGetJson<{
      profile: PublicProfile;
      trust: ProfileTrustMetrics | null;
      marketplaceReviews: MarketplaceReview[];
    }>(`/api/profiles/${encodeURIComponent(username)}/public`, null);
    if (!json.profile) return null;
    return mapApiProfileToViewModel(json.profile, json.trust, json.marketplaceReviews || []);
  }, [username]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const vm = await load();
        if (!cancelled) setViewModel(vm);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load");
          setViewModel(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--forge-surface-2)]" />
      </div>
    );
  }

  if (err || !viewModel) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-[var(--forge-text)]">Profile not found</h1>
        <p className="mt-2 text-[var(--forge-text-muted)]">{err || "This user does not exist."}</p>
        <Link href="/marketplace" className="forge-btn forge-btn-ghost mt-6 inline-flex">
          Browse marketplace
        </Link>
      </div>
    );
  }

  return <UnifiedProfileView viewModel={viewModel} />;
}
