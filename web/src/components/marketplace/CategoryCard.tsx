"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/lib/marketplace/types";

type CategoryCardProps = {
  category: Category;
  index?: number;
};

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Link href={`/marketplace/${category.slug}`} className="mp-category-card">
        <span className="mp-category-ember" aria-hidden />
        <span className="mp-category-name">{category.name}</span>
        <span className="mp-category-desc">{category.description}</span>
        <span className="mp-category-count">{category.productCount} listings</span>
      </Link>
    </motion.div>
  );
}
