"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { ConversionCTA } from "@/components/conversion/ConversionCTA";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api";

type OrderPayload = {
  order: {
    id: string;
    listing_title: string;
    amount_usd: number;
    status: string;
    delivery_note?: string | null;
    delivery_url?: string | null;
    delivered_at?: string | null;
  };
  events: Array<{ event_type: string; message: string | null; created_at: string }>;
  review: { id: string } | null;
  role: "buyer" | "seller";
};

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const { session } = useAuth();
  const [data, setData] = useState<OrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    headline: "",
    body: "",
    deliveryScore: 5,
    communicationScore: 5,
    valueScore: 5,
  });

  async function reload() {
    if (!session?.access_token) return;
    const { ok, data: payload } = await apiFetch<OrderPayload>(`/api/orders/${orderId}`, {
      method: "GET",
      accessToken: session.access_token,
    });
    if (ok && payload) setData(payload);
  }

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    void reload().finally(() => setLoading(false));
  }, [session?.access_token, orderId]);

  async function action(path: string, body?: Record<string, unknown>) {
    if (!session?.access_token) return;
    setBusy(true);
    setError(null);
    const { ok, data: res } = await apiFetch<{ error?: string }>(`/api/orders/${orderId}/${path}`, {
      method: "POST",
      accessToken: session.access_token,
      body: JSON.stringify(body || {}),
    });
    setBusy(false);
    if (!ok) {
      setError(res.error || "Action failed");
      return;
    }
    await reload();
  }

  if (!session) {
    return (
      <AccountShell title="Order" subtitle="Sign in to view this order.">
        <Link href={`/login?next=/dashboard/orders/${orderId}`} className="text-[var(--forge-gold)] hover:underline">
          Sign in
        </Link>
      </AccountShell>
    );
  }

  if (loading) {
    return (
      <AccountShell title="Order" subtitle="Loading…">
        <p className="text-[var(--forge-text-muted)]">Loading order…</p>
      </AccountShell>
    );
  }

  if (!data?.order) {
    return (
      <AccountShell title="Order" subtitle="Not found">
        <p className="text-[var(--forge-text-muted)]">This order does not exist or you do not have access.</p>
        <Link href="/dashboard" className="forge-btn forge-btn-ghost mt-4 inline-flex">
          ← Dashboard
        </Link>
      </AccountShell>
    );
  }

  const { order, events, review, role } = data;
  const status = order.status;

  return (
    <AccountShell title={order.listing_title} subtitle={`Order · $${Number(order.amount_usd).toLocaleString()} · ${status}`}>
      <div className="hub-order-grid">
        <section className="hub-card">
          <p className="hub-card-label">Status</p>
          <p className="hub-card-value capitalize">{status.replace(/_/g, " ")}</p>
          {order.delivery_note ? (
            <p className="mt-3 text-sm text-[var(--forge-text-muted)]">{order.delivery_note}</p>
          ) : null}
          {order.delivery_url ? (
            <a href={order.delivery_url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-[var(--forge-gold)]">
              View delivery →
            </a>
          ) : null}
        </section>

        <section className="hub-card">
          <p className="hub-card-label">Timeline</p>
          <ul className="hub-timeline">
            {events.map((e) => (
              <li key={`${e.event_type}-${e.created_at}`}>
                <span className="hub-timeline-type">{e.event_type.replace(/_/g, " ")}</span>
                {e.message ? <span className="hub-timeline-msg">{e.message}</span> : null}
                <time className="hub-timeline-time">{new Date(e.created_at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        </section>

        <section className="hub-card hub-card-actions">
          {role === "seller" && status === "paid" ? (
            <button type="button" className="forge-btn forge-btn-primary w-full" disabled={busy} onClick={() => void action("start")}>
              Start work
            </button>
          ) : null}
          {role === "seller" && ["paid", "in_progress", "revision_requested"].includes(status) ? (
            <div className="space-y-2">
              <input
                className="hub-input w-full"
                placeholder="Delivery note"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
              />
              <input
                className="hub-input w-full"
                placeholder="Delivery URL (optional)"
                value={deliveryUrl}
                onChange={(e) => setDeliveryUrl(e.target.value)}
              />
              <button
                type="button"
                className="forge-btn forge-btn-primary w-full"
                disabled={busy}
                onClick={() => void action("deliver", { note: deliveryNote, url: deliveryUrl })}
              >
                Mark delivered
              </button>
            </div>
          ) : null}
          {role === "buyer" && status === "delivered" ? (
            <>
              <button type="button" className="forge-btn forge-btn-primary w-full" disabled={busy} onClick={() => void action("approve")}>
                Approve delivery
              </button>
              <button
                type="button"
                className="forge-btn forge-btn-ghost w-full"
                disabled={busy}
                onClick={() => void action("revision", { message: "Revision requested" })}
              >
                Request revision
              </button>
            </>
          ) : null}
          {role === "buyer" && status === "completed" && !review ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--forge-text)]">Leave a review</p>
              <input
                className="hub-input w-full"
                placeholder="Headline"
                value={reviewForm.headline}
                onChange={(e) => setReviewForm((f) => ({ ...f, headline: e.target.value }))}
              />
              <textarea
                className="hub-input w-full min-h-[80px]"
                placeholder="Your experience (min 20 characters)"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
              />
              <button
                type="button"
                className="forge-btn forge-btn-primary w-full"
                disabled={busy}
                onClick={() => void action("review", reviewForm)}
              >
                Submit review
              </button>
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </section>
      </div>
      <div className="mt-6">
        <Link href="/dashboard" className="forge-btn forge-btn-ghost">
          ← Dashboard
        </Link>
      </div>
    </AccountShell>
  );
}
