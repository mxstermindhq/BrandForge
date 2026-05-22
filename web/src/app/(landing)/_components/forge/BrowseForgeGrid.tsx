"use client";

import { motion } from "framer-motion";
import { FORGE_CATEGORIES } from "@/content/forge-marketplace";

export function BrowseForgeGrid() {
  return (
    <section id="browse" className="forge-section">
      <div className="forge-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="forge-section-head"
        >
          <p className="forge-section-eyebrow">Marketplace</p>
          <h2 className="forge-section-title">Browse the Forge</h2>
          <p className="forge-section-desc">
            AI, Discord, brands, dev, content, bots, templates — one furnace for everything digital.
          </p>
        </motion.div>

        <div className="forge-category-grid">
          {FORGE_CATEGORIES.map((cat, i) => (
            <motion.a
              key={cat.id}
              href={`/?term=starter&category=${encodeURIComponent(cat.name)}#browse`}
              className="forge-category-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              data-track={`category_${cat.id}`}
            >
              <span className="forge-category-ember" aria-hidden />
              <span className="forge-category-name">{cat.name}</span>
              <span className="forge-category-count">{cat.count} products</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
