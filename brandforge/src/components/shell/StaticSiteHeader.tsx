import Image from "next/image";
import Link from "next/link";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";

/** Server-rendered header — no Lenis, GSAP, or magnetic interactions. */
export function StaticSiteHeader(): React.JSX.Element {
  return (
    <header
      className="fixed inset-x-0 top-0 z-[300] border-b border-b1 bg-bg/90 backdrop-blur-[18px]"
      data-site-header=""
    >
      <div className="content-wrap flex min-h-14 items-center justify-between gap-4 py-3.5">
        <Link href="/" className="inline-flex items-center" aria-label="BrandForge home">
          <Image
            src="/img/logo-header.png"
            alt="BrandForge.gg"
            width={233}
            height={36}
            priority
            className="h-7 w-auto max-w-[200px]"
          />
        </Link>
        <nav className="hidden items-center gap-4 lg:flex" aria-label="Primary">
          <Link
            href="/#who"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Who
          </Link>
          <Link
            href="/services/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Services
          </Link>
          <Link
            href="/packages/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Packages
          </Link>
          <Link
            href="/#delivery"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Delivery
          </Link>
          <Link
            href="/portfolio/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Work
          </Link>
          <Link
            href="/#faq"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            FAQ
          </Link>
          <Link
            href="/roadmap/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Roadmap
          </Link>
          <Link
            href="/blog/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            Blog
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <a
            href={discordHref("header-discord")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-discord px-4 py-2 font-mono text-[11px] font-bold text-white"
            {...ctaTrackAttrs("discord", "header-discord")}
          >
            Open Discord
          </a>
        </div>
      </div>
    </header>
  );
}
