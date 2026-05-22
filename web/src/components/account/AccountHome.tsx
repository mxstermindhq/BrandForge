"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { apiFetch } from "@/lib/api";
import { profilePath } from "@/lib/reserved-paths";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthMe } from "@/providers/AuthMeProvider";
import { useHasOwnListings } from "@/hooks/useHasOwnListings";

type Overview = {
  orders: number;
  paidOrders: number;
  earningsUsd: number;
  listingCount: number;
};

export function AccountHome() {
  const { session } = useAuth();
  const { me } = useAuthMe();
  const { listingCount, hasListings, loading: listingsLoading } = useHasOwnListings();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  const username = me?.profile?.username;
  const profileUrl = username ? profilePath(username) : null;

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    setLoading(true);
    void Promise.all([
      apiFetch<{ stats?: { totalOrders?: number; paidOrders?: number } }>("/api/dashboard/buyer", {
        method: "GET",
        accessToken: token,
      }),
      apiFetch<{ earningsUsd?: number; stats?: { activeListings?: number } }>("/api/dashboard/seller", {
        method: "GET",
        accessToken: token,
      }),
    ])
      .then(([buyer, seller]) => {
        setOverview({
          orders: buyer.ok ? buyer.data.stats?.totalOrders ?? 0 : 0,
          paidOrders: buyer.ok ? buyer.data.stats?.paidOrders ?? 0 : 0,
          earningsUsd: seller.ok ? Number(seller.data.earningsUsd) || 0 : 0,
          listingCount: seller.ok ? seller.data.stats?.activeListings ?? listingCount : listingCount,
        });
      })
      .finally(() => setLoading(false));
  }, [session?.access_token, listingCount]);

  const stats = overview ?? {
    orders: 0,
    paidOrders: 0,
    earningsUsd: 0,
    listingCount,
  };

  return (
    <AccountShell
      title={`Welcome back${me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""}`}
      subtitle="Your command center for profile, offers, orders, and crypto payments."
    >
      {!hasListings && !listingsLoading ? (
        <div className="hub-promo mb-8">
          <div>
            <p className="hub-promo-eyebrow">Optional</p>
            <h2 className="font-headline text-xl font-semibold text-[var(--forge-text)]">Publish a paid offer</h2>
            <p className="mt-1 max-w-lg text-sm text-[var(--forge-text-muted)]">
              You&apos;re set up as a buyer and member. When you&apos;re ready to sell, create a short-term or subscription
              listing — crypto checkout included.
            </p>
          </div>
          <Link href="/account/listings/new" className="forge-btn forge-btn-primary shrink-0">
            Create offer
          </Link>
        </div>
      ) : null}

      <div className="hub-stat-grid">
        <Link href="/dashboard" className="hub-stat-card hub-stat-card-link">
          <span className="hub-stat-label">Orders</span>
          <span className="hub-stat-value">{loading ? "—" : stats.orders}</span>
          <span className="hub-stat-hint">{stats.paidOrders} paid</span>
        </Link>
        <Link href="/dashboard" className="hub-stat-card hub-stat-card-link">
          <span className="hub-stat-label">Earnings</span>
          <span className="hub-stat-value hub-stat-value-gold">
            {loading ? "—" : `$${stats.earningsUsd.toLocaleString()}`}
          </span>
          <span className="hub-stat-hint">Crypto · paid</span>
        </Link>
        <Link href="/account/listings" className="hub-stat-card hub-stat-card-link">
          <span className="hub-stat-label">Live offers</span>
          <span className="hub-stat-value">{listingsLoading ? "—" : stats.listingCount}</span>
          <span className="hub-stat-hint">Manage listings</span>
        </Link>
        <Link href="/account/profile" className="hub-stat-card hub-stat-card-link">
          <span className="hub-stat-label">Profile</span>
          <span className="hub-stat-value">{username ? `@${username}` : "Edit"}</span>
          <span className="hub-stat-hint">Public page</span>
        </Link>
      </div>

      <div className="hub-grid-2 mt-8">
        <section className="hub-panel p-6">
          <h2 className="hub-panel-title">Quick actions</h2>
          <div className="hub-action-grid mt-4">
            <Link href="/marketplace" className="hub-action-tile">
              <span className="hub-action-icon">🛒</span>
              <span className="hub-action-label">Browse & buy</span>
              <span className="hub-action-desc">Short & long term offers</span>
            </Link>
            <Link href="/account/listings/new" className="hub-action-tile">
              <span className="hub-action-icon">＋</span>
              <span className="hub-action-label">New offer</span>
              <span className="hub-action-desc">Publish when ready</span>
            </Link>
            <Link href="/dashboard" className="hub-action-tile">
              <span className="hub-action-icon">▣</span>
              <span className="hub-action-label">Dashboard</span>
              <span className="hub-action-desc">Orders & analytics</span>
            </Link>
            {profileUrl ? (
              <Link href={profileUrl} className="hub-action-tile">
                <span className="hub-action-icon">◇</span>
                <span className="hub-action-label">Public profile</span>
                <span className="hub-action-desc">Trust layer</span>
              </Link>
            ) : (
              <Link href="/account/profile" className="hub-action-tile">
                <span className="hub-action-icon">◇</span>
                <span className="hub-action-label">Edit profile</span>
                <span className="hub-action-desc">Bio & skills</span>
              </Link>
            )}
          </div>
        </section>

        <section className="hub-panel p-6">
          <h2 className="hub-panel-title">Account status</h2>
          <ul className="hub-status-list mt-4">
            <li>
              <span>Profile</span>
              <span className="hub-status-ok">Complete</span>
            </li>
            <li>
              <span>Marketplace access</span>
              <span className="hub-status-ok">Active</span>
            </li>
            <li>
              <span>Seller whitelist</span>
              <span className={me?.canCreateListing ? "hub-status-ok" : "hub-status-muted"}>
                {me?.canCreateListing ? "Can publish" : "Request access"}
              </span>
            </li>
            <li>
              <span>Offers live</span>
              <span className={hasListings ? "hub-status-ok" : "hub-status-muted"}>
                {hasListings ? `${listingCount} listing${listingCount === 1 ? "" : "s"}` : "None yet"}
              </span>
            </li>
          </ul>
          {!me?.canCreateListing ? (
            <p className="mt-4 text-xs text-[var(--forge-text-muted)]">
              To publish paid offers on the marketplace, seller whitelist approval is required. You can still purchase
              and manage your profile.
            </p>
          ) : null}
        </section>
      </div>
    </AccountShell>
  );
}
