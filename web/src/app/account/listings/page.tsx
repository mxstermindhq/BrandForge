"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
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
    <main className="forge-page pb-20">
      <div className="forge-container">
        <AccountShell
          title="Your offers"
          subtitle="Manage pricing, delivery, and visibility. Publishing is optional."
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--forge-text-muted)]">
              {loading ? "Loading…" : `${listings.length} offer${listings.length === 1 ? "" : "s"}`}
            </p>
            <Link href="/account/listings/new" className="forge-btn forge-btn-primary">
              + New offer
            </Link>
          </div>

          {error ? <p className="mb-4 text-sm text-[var(--forge-fire)]">{error}</p> : null}

          {!loading && !listings.length ? (
            <div className="hub-panel px-6 py-14 text-center">
              <p className="font-headline text-xl text-[var(--forge-text)]">No offers yet</p>
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
                Create a listing when you want to sell — or keep browsing as a buyer.
              </p>
              <Link href="/account/listings/new" className="forge-btn forge-btn-primary mt-6 inline-flex">
                Create offer
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {listings.map((l) => (
                <li key={l.id} className="hub-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--forge-gold)]">
                      {l.listingType === "long_term" ? "Subscription" : "Short term"} · {l.status || "published"}
                    </p>
                    <h3 className="font-headline text-xl font-semibold text-[var(--forge-text)]">{l.title}</h3>
                    <p className="text-sm text-[var(--forge-text-muted)]">
                      {l.priceLabel} · {l.deliveryLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/listing/${l.id}`} className="forge-btn forge-btn-ghost forge-btn-sm">
                      View
                    </Link>
                    <Link href={`/account/listings/${l.id}/edit`} className="forge-btn forge-btn-secondary forge-btn-sm">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AccountShell>
      </div>
    </main>
  );
}
