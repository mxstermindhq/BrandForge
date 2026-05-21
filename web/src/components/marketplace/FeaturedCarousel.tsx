"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/lib/marketplace/types";

type FeaturedCarouselProps = {
  products: Product[];
};

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  if (!products.length) return null;

  return (
    <section className="mp-featured">
      <div className="forge-container">
        <p className="forge-section-eyebrow">Featured</p>
        <h2 className="forge-section-title text-2xl sm:text-3xl">Trending in the forge</h2>
      </div>
      <div className="mp-featured-track-wrap">
        <div className="mp-featured-track">
          {products.map((p) => (
            <motion.div key={p.id} className="mp-featured-slide" whileHover={{ scale: 1.02 }}>
              <Link href={`/product/${p.id}`} className="mp-featured-card">
                <div className="mp-featured-thumb" style={{ background: p.thumbGradient }} />
                <div className="mp-featured-body">
                  <p className="mp-featured-price">{p.priceLabel}</p>
                  <h3 className="mp-featured-title">{p.title}</h3>
                  <p className="mp-featured-delivery">{p.deliveryLabel} delivery</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
