"use client";

import Link from "next/link";
import { CONTACT } from "@/content/landing-directory";

type Variant = "hero" | "card" | "profile" | "dashboard";

type ConversionCTAProps = {
  variant: Variant;
  listingId?: string;
  serviceUrl?: string;
  hireUrl?: string;
  operatorName?: string;
  orderId?: string;
};

export function ConversionCTA({
  variant,
  listingId,
  serviceUrl,
  hireUrl,
  operatorName,
  orderId,
}: ConversionCTAProps) {
  if (variant === "hero") {
    return (
      <div className="forge-hero-ctas">
        <Link href="/#browse" className="forge-btn forge-btn-primary" data-track="cta_browse_services">
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
          Ask Questions
        </a>
      </div>
    );
  }

  if (variant === "profile" && operatorName) {
    const primaryHref = hireUrl || (serviceUrl ? `${serviceUrl}?checkout=1` : "/#browse");
    return (
      <div className="profile-cta-unified">
        <Link href={primaryHref} className="forge-btn forge-btn-primary w-full justify-center">
          Hire {operatorName}
        </Link>
        <a
          href={CONTACT.discord}
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
