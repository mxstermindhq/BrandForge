"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { MarketplaceListing } from "@/lib/listings-types";
import { normalizeListingIntelligence } from "@/lib/listing-intelligence-types";
import { ListingOutcomeBlock } from "./ListingOutcomeBlock";
import { ConversionCTA } from "@/components/conversion/ConversionCTA";

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
  const intelligence = normalizeListingIntelligence(listing.intelligence);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      whileHover={{ y: -4 }}
      className="mp-card group"
    >
      <Link href={listing.serviceUrl} className="block">
        <div className="mp-card-header-bar">
          {listing.isOfficial ? (
            <span className="mp-card-badge">Official</span>
          ) : listing.listingType === "long_term" ? (
            <span className="mp-card-badge">Subscription</span>
          ) : endsLabel ? (
            <span className="mp-card-badge mp-card-badge-hot">Ends {endsLabel}</span>
          ) : (
            <span className="mp-card-badge">{listing.category}</span>
          )}
        </div>
        <ListingOutcomeBlock
          compact
          tagline={listing.tagline}
          category={listing.category}
          deliveryLabel={listing.deliveryLabel}
          intelligence={intelligence}
        />
        <div className="mp-card-body">
          <h3 className="mp-card-title">{listing.title}</h3>
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
      <ConversionCTA variant="card" listingId={listing.id} serviceUrl={listing.serviceUrl} />
    </motion.article>
  );
}
