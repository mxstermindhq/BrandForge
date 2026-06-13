import type { Metadata } from "next";
import { CTASection, PageHero, PageShell } from "@/components/content";
import { StoreProductCard } from "@/components/marketing/StoreProductCard";
import { STORE_PRODUCTS } from "@/config/store";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Template Store — Premium Kits & Templates | BrandForge",
  description:
    "Discord launch kits, forum store UI, Web3 lander blocks, and brand guides — $19–$49. Instant digital delivery.",
  path: "/store/",
});

const CATEGORIES = ["Templates", "Kits", "Guides", "Tools"] as const;

export default function StorePage(): React.JSX.Element {
  const products = [...STORE_PRODUCTS];

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Store", href: "/store/" },
      ]}
      path="/store/"
      products={products.map((p) => ({
        name: p.name,
        description: p.tagline,
        price: String(p.priceUsd),
        url: `/store/${p.slug}/`,
      }))}
    >
      <PageHero
        eyebrow="Store"
        title={
          <>
            Premium templates — <em className="text-accent-bright not-italic">ship faster.</em>
          </>
        }
        subhead="Digital products from the same team that delivers client work. Stripe checkout — instant download."
      />

      {CATEGORIES.map((cat) => {
        const items = products.filter((p) => p.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="border-b border-b1 py-16">
            <div className="content-wrap">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted">{cat}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <StoreProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="py-12">
        <div className="content-wrap font-mono text-[10px] text-muted">
          <p>Submit your template for review — 70% creator / 30% BrandForge revenue split. Discord intake.</p>
          <p className="mt-2">Marketplace submissions: /community/</p>
        </div>
      </section>

      <CTASection
        title="Need custom work?"
        subhead="Packages include bespoke delivery — store templates are self-serve."
        campaign="store-footer-cta"
      />
    </PageShell>
  );
}
