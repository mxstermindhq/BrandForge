"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { MarketplaceListing } from "@/lib/listings-types";
import { contactMessage } from "@/content/landing-directory";

type ListingCardProps = {
  listing: MarketplaceListing;
  index?: number;
};

function formatEndsAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const endsLabel = formatEndsAt(listing.endsAt);
  const orderMsg = contactMessage(`Order: ${listing.title} (${listing.priceLabel})`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="mp-card group"
    >
      <Link href={listing.serviceUrl} className="block">
        <div className="mp-card-thumb" style={{ background: listing.thumbGradient }}>
          {listing.isOfficial ? (
            <span className="mp-card-badge">Official</span>
          ) : listing.listingType === "long_term" ? (
            <span className="mp-card-badge">Subscription</span>
          ) : endsLabel ? (
            <span className="mp-card-badge mp-card-badge-hot">Ends {endsLabel}</span>
          ) : null}
        </div>
        <div className="mp-card-body">
          <div className="mp-card-meta-row">
            <span className="mp-card-cat">{listing.category}</span>
            <span className="mp-card-rating">{listing.deliveryLabel}</span>
          </div>
          <h3 className="mp-card-title">{listing.title}</h3>
          <p className="mp-card-tagline">{listing.tagline}</p>
          <div className="mp-card-footer">
            <span className="mp-card-price">{listing.priceLabel}</span>
            {listing.ownerUsername ? (
              <span className="mp-card-delivery">@{listing.ownerUsername}</span>
            ) : (
              <span className="mp-card-delivery">{listing.ownerName}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="mp-card-cta-row">
        <Link href={listing.serviceUrl} className="forge-btn forge-btn-ghost forge-btn-sm flex-1 justify-center">
          View
        </Link>
        <a
          href={contactMessage(orderMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-primary forge-btn-sm flex-1 justify-center"
          data-track={`order_listing_${listing.id}`}
        >
          Contact on Discord
        </a>
      </div>
    </motion.article>
  );
}
