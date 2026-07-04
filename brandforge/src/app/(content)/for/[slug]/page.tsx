import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import {
  PageHero,
  PageShell,
  PortfolioCard,
} from "@/components/content";

const CTASection = dynamic(
  () => import("@/components/content/CTASection").then((m) => ({ default: m.CTASection })),
  { loading: () => <div className="py-24" aria-hidden /> },
);

const FAQBlock = dynamic(
  () => import("@/components/content/FAQBlock").then((m) => ({ default: m.FAQBlock })),
  { loading: () => <div className="content-wrap py-24" aria-hidden /> },
);
import { PORTFOLIO_HUB_CARDS } from "@/content/hubs/portfolio-hub";
import { NICHE_PAGES, NICHE_SLUGS } from "@/content/niche/pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> {
  return NICHE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = NICHE_PAGES[slug];
  if (!page) return {};
  return buildPageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: `/for/${slug}/`,
  });
}

export default async function NichePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const page = NICHE_PAGES[slug];
  if (!page) notFound();

  const path = `/for/${slug}/`;
  const cards = PORTFOLIO_HUB_CARDS.filter((c) =>
    page.portfolioSlugs.includes(c.slug),
  );

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "For you", href: path },
      ]}
      path={path}
      faqs={page.faqs}
    >
      <PageHero eyebrow="Built for your niche" title={page.headline} subhead={page.body[0] ?? ""} />

      <section className="py-12">
        <div className="content-wrap max-w-3xl">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Your pain — specifically
          </h2>
          <ul className="mt-4 space-y-3">
            {page.pain.map((item) => (
              <li key={item} className="text-sm text-text-secondary">
                {item}
              </li>
            ))}
          </ul>
          {page.body.slice(1).map((p) => (
            <p key={p} className="mt-6 text-sm leading-relaxed text-text-secondary">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="content-wrap">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
            Proof in this niche
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {cards.map((project) => (
              <PortfolioCard key={project.slug} project={project} />
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-4">
            {page.proof.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-accent-bright">
                  {link.name} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-8">
        <div className="content-wrap">
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-[10px] uppercase text-accent-bright">Pricing anchor · </span>
            {page.pricingAnchor}
          </p>
        </div>
      </section>

      <FAQBlock items={page.faqs} pageSlug={path} />
      <CTASection
        title="Quote for your niche"
        subhead="Name this page in Discord — fixed USD in 24 hours."
        campaign={`for-${slug}-cta`}
      />
    </PageShell>
  );
}
