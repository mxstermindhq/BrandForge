"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getFeaturedProducts } from "@/lib/marketplace";
import { MagneticButton } from "./MagneticButton";

export function TrendingMarketplace() {
  const trending = getFeaturedProducts().slice(0, 4);

  return (
    <section id="trending" className="forge-section forge-section-alt">
      <div className="forge-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="forge-section-head"
        >
          <p className="forge-section-eyebrow">Hot right now</p>
          <h2 className="forge-section-title">Trending in the Forge</h2>
        </motion.div>

        <div className="forge-listing-grid">
          {trending.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              whileHover={{ y: -8 }}
            >
              <Link href={`/product/${item.id}`} className="forge-listing-card block">
                <div className="forge-listing-thumb" style={{ background: item.thumbGradient }}>
                  <span className="forge-listing-badge">Trending</span>
                </div>
                <div className="forge-listing-body">
                  <h3 className="forge-listing-title">{item.title}</h3>
                  <div className="forge-listing-meta">
                    <span className="forge-listing-price">{item.priceLabel}</span>
                    <span className="forge-listing-delivery">{item.deliveryLabel}</span>
                  </div>
                  <div className="forge-listing-rating">
                    <span className="forge-listing-stars">★ {item.rating}</span>
                    <span className="forge-listing-reviews">({item.reviewCount})</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="forge-section-cta-row">
          <MagneticButton href="/#browse" variant="primary" dataTrack="trending_marketplace">
            View all listings →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
