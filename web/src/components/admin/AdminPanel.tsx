"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api";

type Overview = { orders: number; users: number; revenueUsd: number };

export function AdminPanel() {
  const { session } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<Array<{ id: string; listing_title: string; status: string; amount_usd: number }>>([]);
  const [whitelist, setWhitelist] = useState<Array<{ id: string; email: string; note: string | null }>>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;
    void Promise.all([
      apiFetch<Overview>("/api/admin/overview", { method: "GET", accessToken: token }),
      apiFetch<{ orders: typeof orders }>("/api/admin/orders", { method: "GET", accessToken: token }),
      apiFetch<{ rows: typeof whitelist }>("/api/admin/whitelist", { method: "GET", accessToken: token }),
    ]).then(([o, ord, wl]) => {
      if (o.ok) setOverview(o.data);
      if (ord.ok) setOrders(ord.data.orders || []);
      if (wl.ok) setWhitelist(wl.data.rows || []);
    });
  }, [session?.access_token]);

  async function addWhitelist(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token || !email.trim()) return;
    const { ok, data } = await apiFetch<{ error?: string }>("/api/admin/whitelist", {
      method: "POST",
      accessToken: session.access_token,
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!ok) {
      setError(data.error || "Failed");
      return;
    }
    setEmail("");
    const wl = await apiFetch<{ rows: typeof whitelist }>("/api/admin/whitelist", {
      method: "GET",
      accessToken: session.access_token,
    });
    if (wl.ok) setWhitelist(wl.data.rows || []);
  }

  if (!session) {
    return (
      <main className="forge-page p-12">
        <p className="text-[var(--forge-text-muted)]">
          <Link href="/login?next=/admin" className="text-[var(--forge-gold)]">
            Sign in
          </Link>{" "}
          as admin.
        </p>
      </main>
    );
  }

  return (
    <main className="forge-page pb-24">
      <div className="forge-container max-w-5xl py-10">
        <h1 className="font-headline text-3xl font-semibold text-[var(--forge-text)]">Admin</h1>
        {overview ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="hub-card">
              <p className="hub-card-label">Orders</p>
              <p className="hub-card-value">{overview.orders}</p>
            </div>
            <div className="hub-card">
              <p className="hub-card-label">Users</p>
              <p className="hub-card-value">{overview.users}</p>
            </div>
            <div className="hub-card">
              <p className="hub-card-label">Revenue (paid+)</p>
              <p className="hub-card-value">${overview.revenueUsd.toLocaleString()}</p>
            </div>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--forge-text)]">Seller whitelist</h2>
          <form onSubmit={addWhitelist} className="mt-3 flex gap-2">
            <input className="hub-input flex-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@email.com" />
            <button type="submit" className="forge-btn forge-btn-primary">
              Add
            </button>
          </form>
          {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
          <ul className="mt-4 space-y-2 text-sm text-[var(--forge-text-muted)]">
            {whitelist.map((r) => (
              <li key={r.id}>
                {r.email}
                {r.note ? ` — ${r.note}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--forge-text)]">Recent orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-[var(--forge-border)] py-2">
                <span>{o.listing_title}</span>
                <span className="text-[var(--forge-text-muted)]">
                  ${o.amount_usd} · {o.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
