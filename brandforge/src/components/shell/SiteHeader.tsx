"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SITE } from "@/config/site";
import { useLenis } from "@/components/providers/LenisProvider";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

export function SiteHeader(): React.JSX.Element {
  const headerRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const apply = (scrollY: number): void => {
      header.dataset.scrolled = scrollY > 48 ? "true" : "false";
    };

    if (lenis && !reducedMotion) {
      const onScroll = ({ scroll }: { scroll: number }): void => apply(scroll);
      lenis.on("scroll", onScroll);
      apply(lenis.scroll);
      return () => {
        lenis.off("scroll", onScroll);
      };
    }

    const onScroll = (): void => apply(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis, reducedMotion]);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[300] border-b border-transparent bg-transparent backdrop-blur-[18px] transition-[border-color,background-color] duration-500 ease-out data-[scrolled=true]:border-b1 data-[scrolled=true]:bg-bg/90"
      data-site-header=""
      data-scrolled="false"
    >
      <div className="content-wrap flex min-h-14 items-center justify-between gap-4 py-3.5">
        <Link href="/" className="inline-flex items-center" aria-label="BrandForge home" data-cursor="hover">
          <Image
            src="/img/logo-header.png"
            alt="BrandForge.gg"
            width={233}
            height={36}
            priority
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            className="h-7 w-auto max-w-[200px]"
          />
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
          <Link
            href="/#packages"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
            data-cursor="hover"
          >
            Packages
          </Link>
          <Link
            href="/#portfolio"
            className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-text"
            data-cursor="hover"
          >
            Work
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <MagneticButton
            href={SITE.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-discord px-4 py-2 font-mono text-[11px] font-bold text-white"
            data-cursor="hover"
          >
            Open Discord
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
