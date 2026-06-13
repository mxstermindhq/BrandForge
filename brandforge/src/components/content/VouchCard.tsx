"use client";

import Link from "next/link";
import type { VouchCardData } from "@/types/content";

type VouchCardProps = {
  vouch: VouchCardData;
};

export function VouchCard({ vouch }: VouchCardProps): React.JSX.Element {
  const stars = "★".repeat(vouch.stars) + (vouch.stars < 5 ? "☆".repeat(5 - vouch.stars) : "");
  const initial = vouch.avatarInitial ?? vouch.who.replace(/[@\[\]]/g, "").charAt(0).toUpperCase();

  return (
    <blockquote className="relative flex h-full flex-col overflow-hidden rounded-md border border-b1 bg-s1 p-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gradient-to-b before:from-amber before:to-transparent">
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 font-mono text-sm font-bold text-accent-bright"
          aria-hidden
        >
          {initial}
        </span>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{vouch.from}</p>
          {vouch.role ? (
            <p className="mt-0.5 font-mono text-[9px] text-text-secondary">{vouch.role}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-amber text-sm" aria-label={`${vouch.stars} out of 5 stars`}>
        {stars}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
        &ldquo;{vouch.text}&rdquo;
      </p>
      <footer className="mt-4 space-y-2 font-mono text-[10px]">
        <p className="text-accent-bright">{vouch.who}</p>
        {vouch.amount ? <p className="text-muted">{vouch.amount}</p> : null}
        {vouch.portfolioSlug ? (
          <Link
            href={`/portfolio/${vouch.portfolioSlug}/`}
            className="inline-flex items-center gap-1 rounded border border-green/30 bg-green/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-green"
          >
            ✓ Verified project
          </Link>
        ) : null}
      </footer>
    </blockquote>
  );
}

type VouchCarouselProps = {
  vouches: readonly VouchCardData[];
};

/** Mobile scroll-snap carousel; grid on md+. */
export function VouchCarousel({ vouches }: VouchCarouselProps): React.JSX.Element {
  return (
    <>
      <div className="content-wrap hidden gap-3.5 md:grid md:grid-cols-2 lg:grid-cols-3">
        {vouches.map((vouch) => (
          <VouchCard key={vouch.id} vouch={vouch} />
        ))}
      </div>
      <div className="content-wrap flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:hidden">
        {vouches.map((vouch) => (
          <div key={vouch.id} className="w-[85vw] max-w-sm shrink-0 snap-center">
            <VouchCard vouch={vouch} />
          </div>
        ))}
      </div>
    </>
  );
}
