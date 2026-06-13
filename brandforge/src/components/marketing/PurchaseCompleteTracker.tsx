"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/tracking";

type PurchaseCompleteTrackerProps = {
  productSlug: string;
  priceUsd: number;
  sessionId?: string;
};

/** Fires purchase_completed once when Stripe/LemonSqueezy redirects here after checkout. */
export function PurchaseCompleteTracker({
  productSlug,
  priceUsd,
  sessionId,
}: PurchaseCompleteTrackerProps): null {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent("purchase_completed", {
      product: productSlug,
      price: priceUsd,
      session_id: sessionId ?? "",
    });
  }, [productSlug, priceUsd, sessionId]);

  return null;
}
