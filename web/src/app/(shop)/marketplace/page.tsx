import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/marketplace/CategoryCard";
import { FeaturedCarousel } from "@/components/marketplace/FeaturedCarousel";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { ProfileCard } from "@/components/marketplace/ProfileCard";
import { CATEGORIES, getFeaturedProducts, SELLERS } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse digital products and services — AI, Discord, branding, automation, and more.",
};

export default function MarketplacePage() {
  const featured = getFeaturedProducts();

  return (
    <main>
      <section className="mp-hero-bar">
        <div className="forge-container">
          <p className="forge-section-eyebrow">Execution marketplace</p>
          <h1 className="forge-section-title">Browse the forge</h1>
          <p className="forge-section-desc">
            Buy services, products, and systems — order via Discord. Fast delivery. No checkout friction.
          </p>
        </div>
      </section>

      <FeaturedCarousel products={featured} />

      <section className="forge-section">
        <div className="forge-container">
          <h2 className="forge-section-title text-2xl">Categories</h2>
          <div className="mp-category-grid mt-6">
            {CATEGORIES.map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="forge-section forge-section-alt" id="listings">
        <div className="forge-container">
          <MarketplaceFilters />
        </div>
      </section>

      <section className="forge-section">
        <div className="forge-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="forge-section-title text-2xl">Top sellers</h2>
            <Link href="/mxstermind" className="forge-back-link">
              Need talent? Mxstermind →
            </Link>
          </div>
          <div className="mp-profile-grid mt-6">
            {SELLERS.map((s, i) => (
              <ProfileCard key={s.id} profile={s} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
