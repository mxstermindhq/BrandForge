import Link from "next/link";
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
            <Link href="#packages" className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text">
              Packages
            </Link>
            <Link href="#portfolio" className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text">
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
        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-[120px] pb-20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_15%_50%,rgba(124,58,237,0.13),transparent_60%),radial-gradient(ellipse_35%_35%_at_85%_20%,rgba(124,58,237,0.07),transparent_60%)]"
            aria-hidden
          />
          <div className="content-wrap relative">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.24em] text-accent-bright">
              Design · Development · Growth
            </p>
            <h1 className="max-w-4xl text-[clamp(2.5rem,6.5vw,5.25rem)] font-bold leading-[1.06]">
              We <span className="text-accent-bright">Build,</span> Optimise
              <br />
              <span className="font-light">&amp; Grow</span> Brands.
            </h1>
            <p className="mt-5 max-w-xl text-[clamp(14px,1.7vw,17px)] leading-relaxed text-text-secondary">
              <strong className="text-text">One studio for brand, website, and growth</strong> — built
              for founders, SaaS teams, and Web3 operators. Phase 1 shell: Lenis + GSAP + R3F canvas
              active.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="#packages"
                className="inline-flex items-center rounded bg-accent px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_30px_var(--a-glow)]"
              >
                View packages ↓
              </Link>
              <a
                href={SITE.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-[var(--a-mid)] hover:text-text"
              >
                Get a quote on Discord
              </a>
            </div>
          </div>
        </section>

        <section id="packages" className="border-t border-b1 bg-s1 py-[100px]">
          <div className="content-wrap">
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-accent-bright">Packages</p>
            <h2 className="mt-3 text-[clamp(28px,4vw,48px)] font-bold leading-tight">
              Pick your starting point.
            </h2>
            <p className="mt-4 max-w-lg text-sm text-text-secondary">
              Full section migration begins Phase 2–3. Scroll smoothness should feel weighted and
              continuous — verify in devtools performance panel.
            </p>
            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {(["Brand Sprint", "Launch Stack", "Growth Engine"] as const).map((name) => (
                <article
                  key={name}
                  className="rounded-md border border-b1 bg-bg p-8 transition-transform hover:-translate-y-1 hover:border-[var(--a-mid)]"
                >
                  <h3 className="text-xl font-bold">{name}</h3>
                  <p className="mt-2 text-xs text-muted">Placeholder card — Phase 3 scroll stack.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="py-[100px]">
          <div className="content-wrap">
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold">Work we&apos;ve shipped.</h2>
            <ul className="mt-8 flex flex-wrap gap-4 font-mono text-xs text-text-secondary">
              <li>cascade.markets</li>
              <li>drain.cx</li>
              <li>CarSpot Live</li>
              <li>dyotravel.com</li>
            </ul>
          </div>
        </section>
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
