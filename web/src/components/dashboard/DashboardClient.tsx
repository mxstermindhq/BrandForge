"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";
import { apiFetch } from "@/lib/api";

type BuyerDash = {
  orders: Array<{
    id: string;
    listing_title: string;
    listing_slug: string | null;
    amount_usd: number;
    status: string;
    paid_at: string | null;
    created_at: string;
  }>;
  payments: Array<{
    order_id: string;
    reference: string;
    status: string;
    amount_usd: number;
    paid_at: string | null;
  }>;
  saved: Array<{ listing_id: string; listing_type: string; created_at: string }>;
  activity: Array<{ type: string; id: string; title: string; status: string; at: string }>;
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
    status: string;
  }>;
  earningsUsd: number;
  stats: { activeListings: number; totalSales: number };
};

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed" || s === "delivered") return "hub-pill hub-pill-ok";
  if (s === "pending" || s === "in_progress") return "hub-pill hub-pill-pending";
  return "hub-pill";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DashboardClient() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");
  const [buyer, setBuyer] = useState<BuyerDash | null>(null);
  const [seller, setSeller] = useState<SellerDash | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    setLoading(true);
    void Promise.all([
      apiFetch<BuyerDash>("/api/dashboard/buyer", { method: "GET", accessToken: token }),
      apiFetch<SellerDash>("/api/dashboard/seller", { method: "GET", accessToken: token }),
    ]).then(([b, s]) => {
      if (b.ok) setBuyer(b.data);
      if (s.ok) setSeller(s.data);
      setLoading(false);
    });
  }, [session?.access_token]);

  if (!session) {
    return (
      <AccountShell title="Dashboard" subtitle="Sign in to track orders and seller performance.">
        <p className="text-[var(--forge-text-muted)]">
          <Link href="/login?next=/dashboard" className="text-[var(--forge-gold)] hover:underline">
            Sign in
          </Link>
        </p>
      </AccountShell>
    );
  }

  const totalSpent =
    buyer?.orders?.reduce((sum, o) => {
      if (["paid", "in_progress", "delivered", "completed"].includes(o.status)) {
        return sum + Number(o.amount_usd || 0);
      }
      return sum;
    }, 0) ?? 0;

  return (
    <AccountShell title="Dashboard" subtitle="Purchases, crypto payments, saved listings, and seller analytics.">
      <div className="hub-mode-tabs">
        <button
          type="button"
          className={`hub-mode-tab ${mode === "buyer" ? "hub-mode-tab-active" : ""}`}
          onClick={() => setMode("buyer")}
        >
          Buying
        </button>
        <button
          type="button"
          className={`hub-mode-tab ${mode === "seller" ? "hub-mode-tab-active" : ""}`}
          onClick={() => setMode("seller")}
        >
          Selling
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-[var(--forge-text-muted)]">Loading dashboard…</p>
      ) : mode === "buyer" ? (
        <div className="mt-8 space-y-8">
          <div className="hub-stat-grid hub-stat-grid-3">
            <div className="hub-stat-card">
              <span className="hub-stat-label">Total orders</span>
              <span className="hub-stat-value">{buyer?.stats?.totalOrders ?? 0}</span>
            </div>
            <div className="hub-stat-card">
              <span className="hub-stat-label">Paid orders</span>
              <span className="hub-stat-value">{buyer?.stats?.paidOrders ?? 0}</span>
            </div>
            <div className="hub-stat-card">
              <span className="hub-stat-label">Total spent</span>
              <span className="hub-stat-value hub-stat-value-gold">${totalSpent.toLocaleString()}</span>
            </div>
          </div>

          <section className="hub-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--forge-border)] px-6 py-4">
              <h2 className="hub-panel-title">Recent orders</h2>
              <Link href="/marketplace" className="text-sm text-[var(--forge-gold)] hover:underline">
                Browse offers →
              </Link>
            </div>
            {!buyer?.orders?.length ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--forge-text-muted)]">No orders yet.</p>
                <Link href="/marketplace" className="forge-btn forge-btn-primary mt-4 inline-flex">
                  Find a service
                </Link>
              </div>
            ) : (
              <ul className="hub-table">
                {buyer.orders.slice(0, 8).map((o) => (
                  <li key={o.id} className="hub-table-row">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--forge-text)]">{o.listing_title}</p>
                      <p className="text-xs text-[var(--forge-text-muted)]">{formatDate(o.paid_at || o.created_at)}</p>
                    </div>
                    <span className="font-medium text-[var(--forge-gold)]">${Number(o.amount_usd).toLocaleString()}</span>
                    <span className={statusClass(o.status)}>{o.status.replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="hub-grid-2">
            <section className="hub-panel p-6">
              <h2 className="hub-panel-title">Payment history</h2>
              {!buyer?.payments?.length ? (
                <p className="mt-4 text-sm text-[var(--forge-text-muted)]">No crypto payments yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {buyer.payments.slice(0, 5).map((p) => (
                    <li key={p.reference} className="flex justify-between gap-2 text-sm">
                      <span className="text-[var(--forge-text-muted)]">{p.reference}</span>
                      <span>
                        ${Number(p.amount_usd).toLocaleString()} · <span className={statusClass(p.status)}>{p.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="hub-panel p-6">
              <h2 className="hub-panel-title">Saved listings</h2>
              {!buyer?.saved?.length ? (
                <p className="mt-4 text-sm text-[var(--forge-text-muted)]">Save offers from the marketplace to compare later.</p>
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
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="hub-earnings-hero">
            <div>
              <p className="hub-promo-eyebrow">Seller earnings</p>
              <p className="font-headline text-5xl font-semibold tracking-tight text-[var(--forge-gold)]">
                ${Number(seller?.earningsUsd || 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
                {seller?.stats?.totalSales ?? 0} paid sales · {seller?.stats?.activeListings ?? 0} active offers
              </p>
            </div>
            <Link href="/account/listings/new" className="forge-btn forge-btn-primary">
              + New offer
            </Link>
          </div>

          <section className="hub-panel overflow-hidden">
            <div className="border-b border-[var(--forge-border)] px-6 py-4">
              <h2 className="hub-panel-title">Offer performance</h2>
            </div>
            {!seller?.listings?.length ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--forge-text-muted)]">No offers published yet.</p>
                {me?.canCreateListing ? (
                  <Link href="/account/listings/new" className="forge-btn forge-btn-primary mt-4 inline-flex">
                    Create your first offer
                  </Link>
                ) : (
                  <p className="mt-2 text-xs text-[var(--forge-text-muted)]">Seller whitelist required to publish.</p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-[var(--forge-border)]">
                {seller.listings.map((l) => (
                  <li key={l.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <Link href={`/listing/${l.id}`} className="font-headline text-lg font-semibold hover:text-[var(--forge-gold)]">
                          {l.title}
                        </Link>
                        <p className="text-sm text-[var(--forge-text-muted)]">
                          ${l.price.toLocaleString()} · {l.status}
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-[var(--forge-text-muted)]">Views</p>
                          <p className="font-semibold">{l.views}</p>
                        </div>
                        <div>
                          <p className="text-[var(--forge-text-muted)]">Sales</p>
                          <p className="font-semibold">{l.sales}</p>
                        </div>
                        <div>
                          <p className="text-[var(--forge-text-muted)]">Conv.</p>
                          <p className="font-semibold">{l.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="hub-progress mt-3" aria-hidden>
                      <div
                        className="hub-progress-fill"
                        style={{ width: `${Math.min(100, l.conversionRate * 5)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AccountShell>
  );
}
