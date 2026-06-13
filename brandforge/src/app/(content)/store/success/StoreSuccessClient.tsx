"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CTASection, PageHero } from "@/components/content";
import { PurchaseCompleteTracker } from "@/components/marketing/PurchaseCompleteTracker";
import { getStoreProduct } from "@/config/store";
import { SITE } from "@/config/site";

/** Client-only success page — reads ?product= from URL (static export safe). */
export function StoreSuccessClient(): React.JSX.Element {
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const parsed = useRef(false);

  useEffect(() => {
    if (parsed.current) return;
    parsed.current = true;
    const params = new URLSearchParams(window.location.search);
    setProductSlug(params.get("product"));
    setSessionId(params.get("session_id") ?? undefined);
  }, []);

  const product = productSlug ? getStoreProduct(productSlug) : undefined;

  return (
    <>
      {product ? (
        <PurchaseCompleteTracker
          productSlug={product.slug}
          priceUsd={product.priceUsd}
          sessionId={sessionId}
        />
      ) : null}

      <PageHero
        eyebrow="Store"
        title="Order confirmed"
        subhead={
          product
            ? `${product.name} — check your email or Discord for download instructions.`
            : "Check your email or Discord for download instructions."
        }
      />

      <div className="content-wrap py-12">
        <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
          Digital delivery is automated — if nothing arrives within 15 minutes, open a ticket in our{" "}
          <a href={SITE.discord} className="text-accent-bright underline" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/store/"
            className="rounded bg-accent px-6 py-3 font-mono text-[11px] font-bold text-white"
          >
            Back to store
          </Link>
          <Link
            href="/packages/"
            className="rounded border border-b1 px-6 py-3 font-mono text-[11px] font-semibold text-text-secondary"
          >
            View packages
          </Link>
        </div>
      </div>

      <CTASection
        title="Need custom work?"
        subhead="Templates are self-serve — full builds start on /packages/."
        discordLabel="Ask on Discord"
        telegramLabel="Telegram"
        campaign="store-success-upsell"
      />
    </>
  );
}
