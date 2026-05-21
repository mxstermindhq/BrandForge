import { CATEGORIES, OFFERS, PRODUCTS, SELLERS } from "./data";
import type { CategoryId, Product, SortKey } from "./types";

export { CATEGORIES, OFFERS, PRODUCTS, SELLERS } from "./data";
export type * from "./types";

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug || c.id === slug) ?? null;
}

export function getProduct(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getSeller(id: string) {
  return SELLERS.find((s) => s.id === id) ?? null;
}

export function getOffer(id: string) {
  return OFFERS.find((o) => o.id === id) ?? null;
}

export function getProductsBySeller(sellerId: string): Product[] {
  return PRODUCTS.filter((p) => p.sellerId === sellerId);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, limit);
}

export function filterProducts(opts: {
  categoryId?: CategoryId | null;
  query?: string;
  sort?: SortKey;
}): Product[] {
  let list = [...PRODUCTS];
  const q = (opts.query ?? "").trim().toLowerCase();

  if (opts.categoryId) {
    list = list.filter((p) => p.categoryId === opts.categoryId);
  }
  if (q) {
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  switch (opts.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "fastest":
      list.sort((a, b) => a.deliveryHours - b.deliveryHours);
      break;
    case "popular":
    default:
      list.sort(
        (a, b) =>
          b.popularityScore - a.popularityScore ||
          (b.popular ? 1 : 0) - (a.popular ? 1 : 0) ||
          b.reviewCount - a.reviewCount,
      );
  }

  return list;
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function orderDiscordMessage(product: Product): string {
  return `Order: ${product.title} (${product.priceLabel}) — BrandForge`;
}
