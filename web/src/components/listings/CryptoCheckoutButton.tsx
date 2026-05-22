"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics.client";

type CryptoCheckoutButtonProps = {
  listingId: string;
  priceLabel: string;
  className?: string;
  autoStart?: boolean;
};

export function CryptoCheckoutButton({
  listingId,
  priceLabel,
  className,
  autoStart = false,
}: CryptoCheckoutButtonProps) {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  async function startCheckout() {
    setError(null);
    if (!session?.access_token) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listingId}?checkout=1`)}`);
      return;
    }
    setLoading(true);
    trackEvent("checkout_start", { listingId });
    try {
      const { ok, data } = await apiFetch<{
        checkoutUrl?: string;
        orderId?: string;
        error?: string;
      }>("/api/marketplace/checkout", {
        method: "POST",
        accessToken: session.access_token,
        body: JSON.stringify({ listingId }),
      });
      if (!ok || !data.checkoutUrl) {
        throw new Error(data.error || "Payment could not be started. Check configuration or try again.");
      }
      trackEvent("checkout_redirect", { listingId, orderId: data.orderId || "" });
      window.location.href = data.checkoutUrl;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setError(msg);
      trackEvent("checkout_error", { listingId, error: msg });
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoStart || autoTriggered || !session?.access_token) return;
    setAutoTriggered(true);
    void startCheckout();
  }, [autoStart, autoTriggered, session?.access_token]);

  return (
    <div className={className}>
      <button
        type="button"
        className="forge-btn forge-btn-primary w-full justify-center"
        onClick={() => void startCheckout()}
        disabled={loading}
        data-track={`checkout_${listingId}`}
      >
        {loading ? "Opening secure checkout…" : `Buy Now — ${priceLabel}`}
      </button>
      {error ? (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/30 p-3" role="alert">
          <p className="text-sm font-medium text-red-300">Payment failed</p>
          <p className="mt-1 text-xs text-red-200/90">{error}</p>
          <button
            type="button"
            className="forge-btn forge-btn-ghost mt-3 w-full justify-center text-sm"
            onClick={() => void startCheckout()}
            disabled={loading}
          >
            Retry payment
          </button>
        </div>
      ) : null}
      <p className="mt-2 text-xs text-[var(--forge-text-muted)]">
        Secure crypto checkout. You will return here when payment completes.
      </p>
    </div>
  );
}
