import Link from "next/link";
import type { BlogPost } from "@/content/blog/index";
import { NICHE_PAGES } from "@/content/niche/pages";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";

type BlogPostFooterProps = {
  post: BlogPost;
};

/** Related services, portfolio, and niche links at end of blog posts. */
export function BlogPostFooter({ post }: BlogPostFooterProps): React.JSX.Element {
  const services = post.relatedServices ?? [];
  const portfolioSlugs = post.relatedPortfolio ?? [];
  const nicheSlugs = post.relatedNiches ?? [];

  const portfolio = portfolioSlugs
    .map((slug) => PORTFOLIO_PROJECTS.find((p) => p.slug === slug))
    .filter(Boolean);

  const niches = nicheSlugs
    .map((slug) => NICHE_PAGES[slug])
    .filter(Boolean);

  if (!services.length && !portfolio.length && !niches.length) return <></>;

  return (
    <aside className="content-wrap border-t border-b1 py-10">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
        Continue reading
      </h2>
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        {services.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold">Related services</h3>
            <ul className="mt-3 space-y-2">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-sm text-accent-bright hover:text-text">
                    {s.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {portfolio.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold">Related work</h3>
            <ul className="mt-3 space-y-2">
              {portfolio.map((p) => (
                <li key={p!.slug}>
                  <Link
                    href={`/portfolio/${p!.slug}/`}
                    className="text-sm text-accent-bright hover:text-text"
                  >
                    {p!.name} case study →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {niches.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold">Who this is for</h3>
            <ul className="mt-3 space-y-2">
              {niches.map((n) => (
                <li key={n!.slug}>
                  <Link
                    href={`/for/${n!.slug}/`}
                    className="text-sm text-accent-bright hover:text-text"
                  >
                    {n!.headline.slice(0, 48)}… →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
