"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";
import { apiFetch } from "@/lib/api";

type BuyerDash = {
  orders: Array<{
    id: string;
    listing_title: string;
    amount_usd: number;
    status: string;
    created_at: string;
  }>;
  saved: Array<{ listing_id: string; listing_type: string }>;
  stats: { totalOrders: number; paidOrders: number };
};

type SellerDash = {
  listings: Array<{
    id: string;
    title: string;
    views: number;
    sales: number;
    conversionRate: number;
    price: number;
  }>;
  earningsUsd: number;
  stats: { activeListings: number; totalSales: number };
};

export function DashboardClient() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const [buyer, setBuyer] = useState<BuyerDash | null>(null);
  const [seller, setSeller] = useState<SellerDash | null>(null);
  const [loading, setLoading] = useState(true);

  const showSeller = Boolean(me?.sellerAccess || me?.canCreateListing || me?.publishedServiceCount);

  useEffect(() => {
    if (!session?.access_token) return;
    setLoading(true);
    const token = session.access_token;
    void Promise.all([
      apiFetch<BuyerDash>("/api/dashboard/buyer", { method: "GET", accessToken: token }),
      showSeller
        ? apiFetch<SellerDash>("/api/dashboard/seller", { method: "GET", accessToken: token })
        : Promise.resolve({ ok: true, data: null as SellerDash | null, status: 200 }),
    ]).then(([b, s]) => {
      if (b.ok) setBuyer(b.data);
      if (s.ok && s.data) setSeller(s.data);
      setLoading(false);
    });
  }, [session?.access_token, showSeller]);

  if (!session) {
    return (
      <p className="text-[var(--forge-text-muted)]">
        <Link href="/login?next=/dashboard" className="text-[var(--forge-gold)] hover:underline">
          Sign in
        </Link>{" "}
        to view your dashboard.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          className={`forge-btn forge-btn-sm ${tab === "buyer" ? "forge-btn-primary" : "forge-btn-ghost"}`}
          onClick={() => setTab("buyer")}
        >
          Buyer
        </button>
        {showSeller ? (
          <button
            type="button"
            className={`forge-btn forge-btn-sm ${tab === "seller" ? "forge-btn-primary" : "forge-btn-ghost"}`}
            onClick={() => setTab("seller")}
          >
            Seller
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--forge-text-muted)]">Loading…</p>
      ) : tab === "buyer" ? (
        <div className="space-y-8">
          <section>
            <h2 className="forge-section-eyebrow">Orders</h2>
            {!buyer?.orders?.length ? (
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">No orders yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {buyer.orders.map((o) => (
                  <li key={o.id} className="forge-surface-card flex justify-between gap-4 text-sm">
                    <span>{o.listing_title}</span>
                    <span className="text-[var(--forge-gold)]">
                      ${Number(o.amount_usd).toLocaleString()} · {o.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="forge-section-eyebrow">Saved listings</h2>
            {!buyer?.saved?.length ? (
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">Nothing saved yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {buyer.saved.map((s) => (
                  <li key={`${s.listing_type}-${s.listing_id}`}>
                    <Link href={`/listing/${s.listing_id}`} className="text-[var(--forge-gold)] hover:underline">
                      {s.listing_id}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="forge-surface-card">
            <p className="forge-section-eyebrow">Earnings (paid orders)</p>
            <p className="font-headline text-4xl font-semibold text-[var(--forge-gold)]">
              ${Number(seller?.earningsUsd || 0).toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[var(--forge-text-muted)]">
              {seller?.stats?.totalSales || 0} completed sales · {seller?.stats?.activeListings || 0} active listings
            </p>
          </div>
          <section>
            <h2 className="forge-section-eyebrow">Listing performance</h2>
            {!seller?.listings?.length ? (
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
                No listings.{" "}
                {me?.canCreateListing ? (
                  <Link href="/onboarding/service" className="text-[var(--forge-gold)] hover:underline">
                    Create one
                  </Link>
                ) : (
                  "Request seller whitelist access."
                )}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {seller.listings.map((l) => (
                  <li key={l.id} className="forge-surface-card text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{l.title}</span>
                      <span>${l.price.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-[var(--forge-text-muted)]">
                      {l.views} views · {l.sales} sales · {l.conversionRate}% conversion
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
