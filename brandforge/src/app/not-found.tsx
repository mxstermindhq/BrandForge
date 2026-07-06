import Link from "next/link";
import { StaticSiteHeader } from "@/components/shell/StaticSiteHeader";

const POPULAR_POSTS = [
  { title: "How to build a brand from scratch in 2026", href: "/blog/how-to-build-a-brand-from-scratch-2026/" },
  { title: "What is GEO?", href: "/blog/what-is-geo-generative-engine-optimisation/" },
  { title: "Forum seller reputation guide", href: "/blog/complete-guide-forum-seller-reputation/" },
  { title: "Discord branding for growth", href: "/blog/discord-server-branding-for-growth/" },
] as const;

const POPULAR_PROJECTS = [
  { name: "CarSpotLive", href: "/portfolio/carspotlive/" },
  { name: "Drain.cx", href: "/portfolio/drain-cx/" },
  { name: "Cascade Markets", href: "/portfolio/cascade-markets/" },
  { name: "Whiteskyhosting", href: "/portfolio/whiteskyhosting/" },
] as const;

const NICHE_LINKS = [
  { label: "Gaming server owners", href: "/for/gaming-server-owners/" },
  { label: "Web3 projects", href: "/for/web3-crypto-projects/" },
  { label: "SaaS startups", href: "/for/saas-startups/" },
  { label: "Forum sellers", href: "/for/forum-sellers/" },
  { label: "Mobile app founders", href: "/for/mobile-app-founders/" },
  { label: "Automation ops", href: "/for/automation-ops-teams/" },
] as const;

export default function NotFound(): React.JSX.Element {
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
              {NICHE_LINKS.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-accent-bright hover:text-text">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-sm font-bold">Recent blog posts</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {POPULAR_POSTS.map((p) => (
              <li key={p.href}>
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
            {POPULAR_PROJECTS.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="text-accent-bright hover:text-text">
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
