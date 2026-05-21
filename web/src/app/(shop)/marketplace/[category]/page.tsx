import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { getCategory } from "@/lib/marketplace";
import type { CategoryId } from "@/lib/marketplace/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  return {
    title: cat ? `${cat.name} · Marketplace` : "Category",
    description: cat?.description,
  };
}

export default async function MarketplaceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  return (
    <main className="forge-page">
      <div className="forge-container forge-page-inner">
        <Link href="/marketplace" className="forge-back-link">
          ← Marketplace
        </Link>
        <p className="forge-section-eyebrow forge-page-eyebrow">{cat.productCount} listings</p>
        <h1 className="forge-section-title forge-page-title">{cat.name}</h1>
        <p className="forge-section-desc">{cat.description}</p>
        <div className="mt-10">
          <MarketplaceFilters initialCategory={cat.id as CategoryId} showCategoryChips={false} />
        </div>
      </div>
    </main>
  );
}
