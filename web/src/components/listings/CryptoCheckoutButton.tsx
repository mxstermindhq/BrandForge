"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { ForgeButton } from "@/components/marketplace/ForgeButton";

type CryptoCheckoutButtonProps = {
  listingId: string;
  priceLabel: string;
  className?: string;
};

export function CryptoCheckoutButton({ listingId, priceLabel, className }: CryptoCheckoutButtonProps) {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    if (!session?.access_token) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`);
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiFetch<{
        checkoutUrl?: string;
        error?: string;
      }>("/api/marketplace/checkout", {
        method: "POST",
        accessToken: session.access_token,
        body: JSON.stringify({ listingId }),
      });
      if (!ok || !data.checkoutUrl) {
        throw new Error(data.error || "Could not start checkout");
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <ForgeButton
        type="button"
        variant="primary"
        onClick={() => void startCheckout()}
        disabled={loading}
        dataTrack={`checkout_${listingId}`}
      >
        {loading ? "Opening checkout…" : `Pay ${priceLabel} — crypto`}
      </ForgeButton>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
