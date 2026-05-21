"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetJson } from "@/lib/api";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import {
  mapApiProfileToViewModel,
  mapCuratedOperatorToViewModel,
  type ProfileViewModel,
} from "@/lib/profile-view-model";
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
  open_to_offers?: boolean | null;
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
  curatedOperator?: CuratedOperator | null;
};

export function PublicMemberProfile({ username, curatedOperator }: PublicMemberProfileProps) {
  const curatedVm = useMemo(
    () => (curatedOperator ? mapCuratedOperatorToViewModel(curatedOperator) : null),
    [curatedOperator],
  );
  const [viewModel, setViewModel] = useState<ProfileViewModel | null>(curatedVm);
  const [loading, setLoading] = useState(!curatedVm);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const json = await apiGetJson<{ profile: PublicProfile }>(
      `/api/profiles/${encodeURIComponent(username)}/public`,
      null,
    );
    return json.profile || null;
  }, [username]);

  useEffect(() => {
    if (curatedVm) {
      setViewModel(curatedVm);
      setLoading(false);
      setErr(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const profile = await load();
        if (!cancelled && profile) setViewModel(mapApiProfileToViewModel(profile));
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
  }, [curatedVm, load]);

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
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Profile not found</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{err || "This user does not exist."}</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-md border px-4 text-[var(--color-text-primary)]"
          style={{ borderColor: "var(--color-border)" }}
        >
          Back to directory
        </Link>
      </div>
    );
  }

  return <UnifiedProfileView viewModel={viewModel} />;
}
