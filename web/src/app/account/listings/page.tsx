"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ForgePage } from "@/components/forge/ForgePage";
import { apiGetJson } from "@/lib/api";
import { normalizeServiceDetail, type ServiceDetail } from "@/lib/service-types";
import { useAuth } from "@/providers/AuthProvider";

export default function MyListingsPage() {
  const { session, accessToken, authReady } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<ServiceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await apiGetJson<{ listings?: Record<string, unknown>[] }>(
        "/api/me/listings",
        accessToken,
      );
      setListings((data.listings || []).map((r) => normalizeServiceDetail(r)));
      setError(null);
    } catch (e) {
      setListings([]);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authReady && !session) router.replace("/login?next=/account/listings");
  }, [authReady, session, router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ForgePage
      title="Your listings"
      eyebrow="Seller"
      description="Edit pricing, copy, and availability. Published listings appear in Short/Long browse."
      narrow
      backHref="/account"
      backLabel="← Account"
    >
      <div className="mx-auto max-w-lg space-y-4">
        <Link href="/onboarding/service" className="forge-btn forge-btn-primary w-full justify-center">
          + New listing
        </Link>

        {loading ? <p className="text-sm text-[var(--forge-text-muted)]">Loading listings…</p> : null}
        {error ? <p className="text-sm text-[var(--forge-fire)]">{error}</p> : null}

        {!loading && !listings.length ? (
          <div className="forge-surface-card py-10 text-center text-sm text-[var(--forge-text-muted)]">
            No listings yet. Publish your first service to unlock the marketplace.
          </div>
        ) : null}

        {listings.map((l) => (
          <div key={l.id} className="forge-surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--forge-gold)]">
                {l.listingType === "long_term" ? "Long term" : "Short term"} · {l.status || "published"}
              </p>
              <h3 className="font-headline text-lg font-semibold text-[var(--forge-text)]">{l.title}</h3>
              <p className="text-sm text-[var(--forge-text-muted)]">
                {l.priceLabel} · {l.deliveryLabel}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/product/${l.id}`} className="forge-btn forge-btn-ghost forge-btn-sm">
                View
              </Link>
              <Link href={`/account/listings/${l.id}/edit`} className="forge-btn forge-btn-secondary forge-btn-sm">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </ForgePage>
  );
}
