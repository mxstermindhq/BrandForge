import Link from "next/link";
import { HomeHero, HomeSections } from "@/components/sections/HomeSections";
import { SITE } from "@/config/site";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[500] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-[300] border-b border-b1 bg-bg/90 backdrop-blur-[18px]">
        <div className="content-wrap flex min-h-14 items-center justify-between gap-4 py-3.5">
          <Link href="/" className="inline-flex items-center" aria-label="BrandForge home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo-header.png"
              alt="BrandForge.gg"
              width={233}
              height={36}
              className="h-7 w-auto max-w-[200px]"
              fetchPriority="high"
            />
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
            <Link
              href="#packages"
              className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
            >
              Packages
            </Link>
            <Link
              href="#portfolio"
              className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
            >
              Work
            </Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-discord px-4 py-2 font-mono text-[11px] font-bold text-white transition-transform hover:-translate-y-px"
            >
              Open Discord
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <HomeHero />
        <HomeSections />
      </main>

      <footer className="border-t border-b1 py-9">
        <div className="content-wrap flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-[var(--m2)]">© 2026 BrandForge</p>
          <nav className="flex gap-5 font-mono text-[11px] text-[var(--m2)]">
            <Link href="/terms" className="hover:text-text">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-text">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
