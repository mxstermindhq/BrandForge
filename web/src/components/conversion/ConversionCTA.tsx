"use client";

import Link from "next/link";
import { CONTACT, contactMessage } from "@/content/landing-directory";

type Variant = "hero" | "card" | "listing" | "profile" | "dashboard";

type ConversionCTAProps = {
  variant: Variant;
  listingId?: string;
  listingTitle?: string;
  priceLabel?: string;
  serviceUrl?: string;
  operatorName?: string;
  orderId?: string;
  onBuy?: () => void;
  buyLoading?: boolean;
};

export function ConversionCTA({
  variant,
  listingId,
  listingTitle,
  priceLabel,
  serviceUrl,
  operatorName,
  orderId,
  onBuy,
  buyLoading,
}: ConversionCTAProps) {
  if (variant === "hero") {
    return (
      <div className="forge-hero-ctas">
        <Link href="/marketplace" className="forge-btn forge-btn-primary" data-track="cta_browse_services">
          Browse Services
        </Link>
        <a
          href={CONTACT.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-secondary"
          data-track="cta_join_discord"
        >
          Join Discord
        </a>
      </div>
    );
  }

  if (variant === "card" && serviceUrl) {
    return (
      <div className="mp-card-cta-row mp-card-cta-unified">
        <Link
          href={`${serviceUrl}?checkout=1`}
          className="forge-btn forge-btn-primary forge-btn-sm flex-1 justify-center"
          data-track={listingId ? `buy_listing_${listingId}` : "buy_listing"}
        >
          Buy Now
        </Link>
        <a
          href={CONTACT.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-ghost forge-btn-sm"
          data-track={listingId ? `questions_listing_${listingId}` : "questions_listing"}
        >
          Questions?
        </a>
      </div>
    );
  }

  if (variant === "listing" && listingId) {
    return (
      <div className="flex flex-col gap-2">
        {onBuy ? (
          <button
            type="button"
            className="forge-btn forge-btn-primary w-full justify-center"
            onClick={onBuy}
            disabled={buyLoading}
            data-track={`checkout_${listingId}`}
          >
            {buyLoading ? "Opening checkout…" : `Buy Now — ${priceLabel || "crypto"}`}
          </button>
        ) : (
          <Link
            href={`/listing/${listingId}?checkout=1`}
            className="forge-btn forge-btn-primary w-full justify-center"
            data-track={`checkout_${listingId}`}
          >
            Buy Now — {priceLabel}
          </Link>
        )}
        <a
          href={CONTACT.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-ghost w-full justify-center text-sm"
          data-track={`questions_${listingId}`}
        >
          Questions on Discord
        </a>
        <a
          href={contactMessage(listingTitle ? `Question: ${listingTitle}` : "Marketplace question")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs text-[var(--forge-text-muted)] hover:text-[var(--forge-gold)]"
          data-track={`telegram_${listingId}`}
        >
          Telegram support
        </a>
      </div>
    );
  }

  if (variant === "profile" && operatorName) {
    const hireHref = serviceUrl || CONTACT.discord;
    const isExternal = hireHref.startsWith("http");
    return (
      <div className="profile-cta-unified">
        {isExternal ? (
          <a href={hireHref} target="_blank" rel="noopener noreferrer" className="forge-btn forge-btn-primary w-full justify-center">
            Hire {operatorName}
          </a>
        ) : (
          <Link href={hireHref} className="forge-btn forge-btn-primary w-full justify-center">
            Hire {operatorName}
          </Link>
        )}
        <a
          href={contactMessage(`I'd like to work with ${operatorName}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-ghost w-full justify-center mt-2"
        >
          Message
        </a>
      </div>
    );
  }

  if (variant === "dashboard" && orderId) {
    return (
      <Link href={`/dashboard/orders/${orderId}`} className="forge-btn forge-btn-primary justify-center">
        Continue Order
      </Link>
    );
  }

  return null;
}
