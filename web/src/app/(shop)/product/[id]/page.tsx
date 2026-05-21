import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ForgeButton } from "@/components/marketplace/ForgeButton";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { getCategory, getProduct, getRelatedProducts, getSeller } from "@/lib/marketplace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const seller = getSeller(product.sellerId);
  const cat = getCategory(product.categoryId);
  const related = getRelatedProducts(product);
  const orderMsg = contactMessage(`Order: ${product.title} (${product.priceLabel})`);

  return (
    <main className="forge-page pb-28">
      <div className="forge-container forge-page-inner">
        <Link href={cat ? `/marketplace/${cat.slug}` : "/marketplace"} className="forge-back-link">
          ← {cat?.name ?? "Marketplace"}
        </Link>

        <article className="forge-detail-article mt-6">
          <div className="relative h-72 w-full overflow-hidden sm:h-96" style={{ background: product.thumbGradient }}>
            <div className="absolute inset-0 mp-heat-overlay" aria-hidden />
            <span className="absolute left-4 top-4 forge-tag">{cat?.name}</span>
          </div>

          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <h1 className="font-headline text-4xl font-semibold text-[var(--forge-text)]">{product.title}</h1>
              <p className="mt-3 text-lg text-[var(--forge-text-muted)]">{product.tagline}</p>
              <p className="mt-6 text-base leading-relaxed text-[var(--forge-text-secondary,var(--forge-text-muted))]">
                {product.description}
              </p>

              <h2 className="forge-section-eyebrow mt-8">What you get</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {product.deliverables.map((item) => (
                  <li key={item} className="forge-surface-card py-2.5 text-sm">
                    <span className="mr-2 text-[var(--forge-fire)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {product.useCases.length ? (
                <>
                  <h2 className="forge-section-eyebrow mt-8">Perfect if you</h2>
                  <ul className="mt-4 space-y-2">
                    {product.useCases.map((item) => (
                      <li key={item} className="text-sm text-[var(--forge-text-muted)]">
                        → {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t} className="mp-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <aside className="offer-sticky-panel">
              <div className="forge-detail-panel forge-detail-panel-accent">
                <p className="forge-section-eyebrow">Price</p>
                <p className="font-headline text-5xl font-semibold text-[var(--forge-text)]">{product.priceLabel}</p>
                <p className="mt-2 text-sm text-[var(--forge-text-muted)]">
                  Delivery: <strong className="text-[var(--forge-gold)]">{product.deliveryLabel}</strong>
                </p>
                <p className="mt-1 text-sm text-[var(--forge-text-muted)]">
                  ★ {product.rating} ({product.reviewCount} reviews) · Demand {product.popularityScore}/100
                </p>
                {seller ? (
                  <Link href={`/profile/${seller.id}`} className="mt-4 block text-sm text-[var(--forge-gold)] hover:underline">
                    Seller: {seller.name} · {seller.responseTime} response
                  </Link>
                ) : null}
                <div className="mt-6 flex flex-col gap-2">
                  <ForgeButton href={CONTACT.discord} variant="primary" external dataTrack={`product_discord_${product.id}`}>
                    {product.ctaText}
                  </ForgeButton>
                  <ForgeButton href={contactMessage(orderMsg)} variant="secondary" external dataTrack={`product_telegram_${product.id}`}>
                    Order via Telegram
                  </ForgeButton>
                </div>
                <p className="mt-4 text-xs text-[var(--forge-text-muted)]">No checkout yet — message to confirm scope & pay.</p>
              </div>
            </aside>
          </div>
        </article>

        {related.length ? (
          <section className="mt-14">
            <h2 className="forge-section-title text-2xl">Related</h2>
            <div className="mp-product-grid mt-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
