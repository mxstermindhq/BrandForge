"use client";

import { motion } from "framer-motion";
import { FORGE_TRENDING } from "@/content/forge-marketplace";
import { CONTACT } from "@/content/landing-directory";
import { MagneticButton } from "./MagneticButton";

export function TrendingMarketplace() {
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
          {FORGE_TRENDING.map((item, i) => (
            <motion.article
              key={item.id}
              className="forge-listing-card"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              whileHover={{ y: -8 }}
            >
              <div className="forge-listing-thumb" style={{ background: item.thumb }}>
                <span className="forge-listing-badge">Trending</span>
              </div>
              <div className="forge-listing-body">
                <h3 className="forge-listing-title">{item.title}</h3>
                <div className="forge-listing-meta">
                  <span className="forge-listing-price">{item.price}</span>
                  <span className="forge-listing-delivery">{item.delivery}</span>
                </div>
                <div className="forge-listing-rating">
                  <span className="forge-listing-stars">★ {item.rating}</span>
                  <span className="forge-listing-reviews">({item.reviews})</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="forge-section-cta-row">
          <MagneticButton href={CONTACT.telegram} variant="primary" external dataTrack="trending_telegram">
            Get it built →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
