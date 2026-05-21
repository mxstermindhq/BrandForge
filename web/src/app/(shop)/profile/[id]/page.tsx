import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForgeButton } from "@/components/marketplace/ForgeButton";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { CONTACT, contactMessage } from "@/content/landing-directory";
import { getProductsBySeller, getSeller } from "@/lib/marketplace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const seller = getSeller(id);
  if (!seller) return { title: "Seller not found" };
  return {
    title: `${seller.name} — Seller`,
    description: seller.bio,
  };
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seller = getSeller(id);
  if (!seller) notFound();

  const products = getProductsBySeller(seller.id);

  return (
    <main className="forge-page">
      <div className="forge-container forge-page-inner">
        <Link href="/marketplace" className="forge-back-link">
          ← Marketplace
        </Link>

        <header className="forge-detail-article mt-6 overflow-hidden">
          <div className="relative h-48 w-full md:h-56" style={{ background: seller.thumbGradient }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent, rgba(10,8,8,0.95))" }} />
          </div>
          <div className="relative z-10 -mt-16 px-6 pb-6">
            <div className="flex flex-wrap items-end gap-5">
              <div
                className="h-24 w-24 rounded-2xl border-2 border-[var(--forge-border)] shadow-lg md:h-28 md:w-28"
                style={{ background: seller.thumbGradient }}
              />
              <div className="flex-1 min-w-[200px]">
                <h1 className="font-headline text-3xl font-semibold text-[var(--forge-text)]">{seller.name}</h1>
                <p className="text-[var(--forge-text-muted)]">{seller.role}</p>
                <p className="mt-2 text-sm text-[var(--forge-gold)]">
                  ★ {seller.rating} · {seller.reviewCount} reviews · {seller.responseTime} response · {seller.completionRate}%
                  completion
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--forge-text-muted)]">{seller.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {seller.skills.map((s) => (
                <span key={s} className="mp-tag">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <ForgeButton
                href={contactMessage(`I'd like to work with ${seller.name} on BrandForge`)}
                variant="primary"
                external
              >
                Contact via Telegram
              </ForgeButton>
              <ForgeButton href={CONTACT.discord} variant="secondary" external>
                Discord
              </ForgeButton>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="forge-section-title text-2xl">Listings</h2>
          {products.length ? (
            <div className="mp-product-grid mt-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <p className="forge-surface-card mt-4 py-8 text-center text-sm text-[var(--forge-text-muted)]">
              No active listings.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
