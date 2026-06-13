import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection, FAQBlock, PageShell } from "@/components/content";
import { StoreBuyButton } from "@/components/marketing/StoreBuyButton";
import { STORE_PRODUCTS, getStoreProduct } from "@/config/store";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): { slug: string }[] {
  return STORE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) return {};
  return buildPageMetadata({
    title: `${product.name} — $${product.priceUsd} | BrandForge Store`,
    description: product.description.slice(0, 160),
    path: `/store/${slug}/`,
  });
}

export default async function StoreProductPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) notFound();

  const related = product.relatedSlugs
    .map((s) => getStoreProduct(s))
    .filter(Boolean);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Store", href: "/store/" },
        { label: product.name, href: `/store/${slug}/` },
      ]}
      path={`/store/${slug}/`}
      faqs={product.faqs}
      products={[
        {
          name: product.name,
          description: product.description,
          price: String(product.priceUsd),
          url: `/store/${slug}/`,
        },
      ]}
    >
      <header className="content-wrap border-b border-b1 pb-12 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent-bright">
          {product.category}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,2.75rem)] font-bold">{product.name}</h1>
        <p className="mt-4 max-w-2xl text-sm text-text-secondary">{product.description}</p>
        <div className="mt-8">
          <StoreBuyButton product={product} />
        </div>
      </header>

      <section className="py-12">
        <div className="content-wrap">
          <h2 className="text-lg font-bold">What&apos;s included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {product.includes.map((item) => (
              <li key={item} className="rounded-md border border-b1 bg-s1 p-4 text-sm text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-b1 bg-s1 py-12">
          <div className="content-wrap">
            <h2 className="text-lg font-bold">Related products</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {related.map((p) =>
                p ? (
                  <Link
                    key={p.slug}
                    href={`/store/${p.slug}/`}
                    className="font-mono text-[11px] text-accent-bright hover:text-text"
                  >
                    {p.name} — ${p.priceUsd} →
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        </section>
      ) : null}

      <FAQBlock items={product.faqs} title="Product FAQ" pageSlug={`/store/${slug}/`} />
      <CTASection
        title="Questions before buying?"
        subhead="Discord reply in 24 hours — mention this product."
        campaign={`store-${slug}-footer`}
      />
    </PageShell>
  );
}
