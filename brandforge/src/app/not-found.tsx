import Link from "next/link";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";
import { BLOG_INDEX } from "@/content/blog/index";
import { NICHE_SLUGS } from "@/content/niche/pages";
import { PORTFOLIO_PROJECTS } from "@/content/portfolio/projects";

export default function NotFound(): React.JSX.Element {
  const popularPosts = [...BLOG_INDEX].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const popularProjects = PORTFOLIO_PROJECTS.filter((p) => p.status === "live").slice(0, 6);

  return (
    <>
      <StaticSiteHeader />
      <main id="main" className="content-wrap min-h-[70vh] py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 max-w-lg text-sm text-text-secondary">
          That URL does not exist or moved. Search below or jump to a popular page.
        </p>

        <form action="/blog/" method="get" className="mt-8 max-w-md">
          <label className="sr-only" htmlFor="404-search">
            Search blog
          </label>
          <input
            id="404-search"
            name="q"
            type="search"
            placeholder="Search blog posts…"
            className="w-full rounded border border-b2 bg-s2 px-4 py-3 text-sm"
          />
        </form>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-bold">Popular links</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-accent-bright hover:text-text">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/packages/" className="text-accent-bright hover:text-text">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/portfolio/" className="text-accent-bright hover:text-text">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/for/" className="text-accent-bright hover:text-text">
                  Who we serve
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold">Niche guides</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {NICHE_SLUGS.slice(0, 6).map((slug) => (
                <li key={slug}>
                  <Link href={`/for/${slug}/`} className="text-accent-bright hover:text-text">
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-sm font-bold">Recent blog posts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {popularPosts.map((p) => (
              <li key={p.slug}>
                <Link href={p.href} className="text-accent-bright hover:text-text">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-sm font-bold">Live portfolio</h2>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {popularProjects.map((p) => (
              <li key={p.slug}>
                <Link href={`/portfolio/${p.slug}/`} className="text-accent-bright hover:text-text">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
