"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics.client";

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { session } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !session?.access_token) return;
    void apiFetch<{ order?: { status?: string } }>(`/api/orders/${orderId}`, {
      method: "GET",
      accessToken: session.access_token,
    }).then(({ data }) => {
      const s = data.order?.status || null;
      setStatus(s);
      if (s === "paid" || s === "in_progress") {
        trackEvent("checkout_complete", { orderId: orderId || "" });
      }
    });
  }, [orderId, session?.access_token]);

  return (
    <main className="forge-page pb-24">
      <div className="forge-container forge-page-inner max-w-lg">
        <h1 className="font-headline text-3xl font-semibold text-[var(--forge-text)]">Payment received</h1>
        <p className="mt-3 text-[var(--forge-text-muted)]">
          {status === "paid"
            ? "Your order is confirmed. The seller will begin delivery."
            : "We are confirming your crypto payment. Refresh your dashboard in a minute if status is still pending."}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard" className="forge-btn forge-btn-primary justify-center">
            View dashboard
          </Link>
          <Link href="/marketplace" className="forge-btn forge-btn-ghost justify-center">
            Back to marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="forge-page p-12 text-center text-sm text-[var(--forge-text-muted)]">Loading…</div>}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
