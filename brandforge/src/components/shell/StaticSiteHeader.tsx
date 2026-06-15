import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";
import { CrossPlatformLink } from "@/components/marketing/CrossPlatformLink";

const CopyInviteButton = dynamic(
  () => import("@/components/marketing/CopyInviteButton").then((m) => ({ default: m.CopyInviteButton })),
);

/** Server-rendered header — no Lenis, GSAP, or magnetic interactions. */
export function StaticSiteHeader(): React.JSX.Element {
  return (
    <header
      className="fixed inset-x-0 top-0 z-[300] border-b border-b1 bg-bg/90 backdrop-blur-[18px]"
      data-site-header=""
    >
      <div className="content-wrap flex min-h-14 items-center justify-between gap-4 py-3.5">
        <Link href="/" className="inline-flex items-center" aria-label="BrandForge home">
          <picture>
            <source srcSet="/img/logo-header.avif" type="image/avif" />
            <source srcSet="/img/logo-header.webp" type="image/webp" />
            <Image
              src="/img/logo-header.png"
              alt="BrandForge.gg"
              width={233}
              height={36}
              priority
              fetchPriority="high"
              className="h-7 w-auto max-w-[200px]"
            />
          </picture>
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
          <CrossPlatformLink
            href="https://mxstermind.com"
            platform="mxstermind"
            campaign="header-for-economists"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            For Economists ↗
          </CrossPlatformLink>
          <Link
            href="/mxstermind/"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
          >
            MXSTERMIND
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <CopyInviteButton campaign="header-discord-copy" className="hidden sm:inline-flex" />
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
