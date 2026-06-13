"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HERO_STATS } from "@/content/home";
import { ctaTrackAttrs, discordHref } from "@/lib/tracking";

const AbHeroPrimaryCta = dynamic(
  () => import("@/components/marketing/AbHeroPrimaryCta").then((m) => ({ default: m.AbHeroPrimaryCta })),
  {
    loading: () => <HeroCtaFallback />,
  },
);

const AnimatedHeroStats = dynamic(
  () =>
    import("@/components/marketing/AnimatedHeroStats").then((m) => ({ default: m.AnimatedHeroStats })),
  { loading: () => <HeroStatsFallback /> },
);

function HeroCtaFallback(): React.JSX.Element {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">
      <Link
        href="/#packages"
        className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white hover:bg-accent-bright"
      >
        View packages ↓
      </Link>
      <a
        href={discordHref("home-hero")}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded border border-b2 px-6 py-3 text-sm font-semibold text-text-secondary hover:border-[var(--a-mid)] hover:text-text"
        {...ctaTrackAttrs("discord", "home-hero")}
      >
        Get a quote on Discord
      </a>
    </div>
  );
}

function HeroStatsFallback(): React.JSX.Element {
  return (
    <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {HERO_STATS.map((stat) => (
        <div key={stat.label} className="rounded border border-b1 bg-s1/50 p-4">
          <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">{stat.label}</dt>
          <dd className="mt-1 text-2xl font-bold text-text">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Hero CTAs + stats — deferred until idle to cut home TBT. */
export function HomeHeroInteractive(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = (): void => setReady(true);
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(run, { timeout: 1200 });
    } else {
      window.setTimeout(run, 80);
    }
  }, []);

  if (!ready) {
    return (
      <>
        <HeroCtaFallback />
        <HeroStatsFallback />
      </>
    );
  }

  return (
    <>
      <AbHeroPrimaryCta />
      <AnimatedHeroStats stats={HERO_STATS} />
    </>
  );
}
