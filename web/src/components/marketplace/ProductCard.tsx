"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/lib/marketplace/types";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { getCategory, getSeller } from "@/lib/marketplace";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cat = getCategory(product.categoryId);
  const seller = getSeller(product.sellerId);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="mp-card group"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="mp-card-thumb" style={{ background: product.thumbGradient }}>
          {product.featured ? <span className="mp-card-badge">Featured</span> : null}
          {product.popular && !product.featured ? <span className="mp-card-badge mp-card-badge-hot">Hot</span> : null}
        </div>
        <div className="mp-card-body">
          <div className="mp-card-meta-row">
            <span className="mp-card-cat">{cat?.name ?? product.categoryId}</span>
            <span className="mp-card-rating">★ {product.rating}</span>
          </div>
          <h3 className="mp-card-title">{product.title}</h3>
          <p className="mp-card-tagline">{product.tagline}</p>
          <div className="mp-card-footer">
            <span className="mp-card-price">{product.priceLabel}</span>
            <span className="mp-card-delivery">{product.deliveryLabel}</span>
          </div>
          {seller ? <p className="mp-card-seller">by {seller.name}</p> : null}
        </div>
      </Link>
      <div className="mp-card-cta-row">
        <Link href={`/product/${product.id}`} className="forge-btn forge-btn-ghost forge-btn-sm flex-1 justify-center">
          View
        </Link>
        <a
          href={contactMessage(`Order: ${product.title} (${product.priceLabel})`)}
          target="_blank"
          rel="noopener noreferrer"
          className="forge-btn forge-btn-primary forge-btn-sm flex-1 justify-center"
          data-track={`order_${product.id}`}
        >
          Order via Discord
        </a>
      </div>
    </motion.article>
  );
}
