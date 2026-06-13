import Link from "next/link";
import type { StoreProduct } from "@/config/store";

type StoreProductCardProps = {
  product: StoreProduct;
};

export function StoreProductCard({ product }: StoreProductCardProps): React.JSX.Element {
  return (
    <article className="flex flex-col rounded-md border border-b1 bg-s1 p-6">
      <p className="font-mono text-[9px] uppercase tracking-wider text-muted">{product.category}</p>
      <h2 className="mt-2 text-lg font-bold">{product.name}</h2>
      <p className="mt-2 flex-1 text-sm text-text-secondary">{product.tagline}</p>
      <p className="mt-4 font-mono text-sm font-bold text-accent-bright">${product.priceUsd}</p>
      <Link
        href={`/store/${product.slug}/`}
        className="mt-4 font-mono text-[10px] text-accent-bright hover:text-text"
      >
        View product →
      </Link>
    </article>
  );
}
