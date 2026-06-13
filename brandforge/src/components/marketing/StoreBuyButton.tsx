"use client";

import { trackEvent, discordHref, ctaTrackAttrs } from "@/lib/tracking";
import type { StoreProduct } from "@/config/store";

type StoreBuyButtonProps = {
  product: StoreProduct;
  className?: string;
};

/** Stripe/LemonSqueezy checkout or Discord fallback when link not configured. */
export function StoreBuyButton({ product, className = "" }: StoreBuyButtonProps): React.JSX.Element {
  const hasPayment = Boolean(product.paymentLink);

  if (!hasPayment) {
    return (
      <a
        href={discordHref(`store-buy-${product.slug}`, product.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block rounded bg-discord px-6 py-3 font-mono text-[11px] font-bold text-white ${className}`}
        {...ctaTrackAttrs("discord", `store-buy-${product.slug}`)}
        onClick={() =>
          trackEvent("purchase_initiated", {
            product: product.slug,
            price: product.priceUsd,
            channel: "discord",
          })
        }
      >
        Buy via Discord — ${product.priceUsd}
      </a>
    );
  }

  return (
    <a
      href={product.paymentLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block rounded bg-accent px-6 py-3 font-mono text-[11px] font-bold text-white ${className}`}
      onClick={() =>
        trackEvent("purchase_initiated", {
          product: product.slug,
          price: product.priceUsd,
          channel: "stripe",
        })
      }
    >
      Buy now — ${product.priceUsd}
    </a>
  );
}
