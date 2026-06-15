import Link from "next/link";
import type { BlogPost } from "@/content/blog/types";
import { NICHE_PAGES } from "@/content/niche/pages";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";
import { defaultRelatedForPost } from "@/lib/blog/related";

type BlogPostFooterProps = {
  post: BlogPost;
};

/** Related services, portfolio, blog, and niche links at end of blog posts. */
export function BlogPostFooter({ post }: BlogPostFooterProps): React.JSX.Element {
  const related = defaultRelatedForPost(post);

  const portfolio = related.portfolio
    .map((slug) => PORTFOLIO_PROJECTS.find((p) => p.slug === slug))
    .filter(Boolean);

  const niches = related.niches
    .map((slug) => NICHE_PAGES[slug])
    .filter(Boolean);

  const relatedBlog = post.relatedBlog ?? [];

  return (
    <aside className="content-wrap border-t border-b1 py-10">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
        Continue reading
      </h2>
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-bold">Related services</h3>
          <ul className="mt-3 space-y-2">
            {related.services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-sm text-accent-bright hover:text-text">
                  {s.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
          {relatedBlog.length > 0 ? (
            <>
              <h3 className="mt-6 text-sm font-bold">Related posts</h3>
              <ul className="mt-3 space-y-2">
                {relatedBlog.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/blog/${b.slug}/`}
                      className="text-sm text-accent-bright hover:text-text"
                    >
                      {b.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
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
      </div>
    </aside>
  );
}
