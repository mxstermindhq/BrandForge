"use client";

import dynamic from "next/dynamic";
import { HERO_STATS } from "@/content/home";

const AbHeroPrimaryCta = dynamic(
  () => import("@/components/marketing/AbHeroPrimaryCta").then((m) => ({ default: m.AbHeroPrimaryCta })),
  {
    loading: () => (
      <div className="mt-10 flex flex-wrap gap-3">
        <span className="rounded bg-accent px-7 py-3.5 text-sm font-bold text-white opacity-80">
          View packages ↓
        </span>
      </div>
    ),
  },
);

const AnimatedHeroStats = dynamic(
  () =>
    import("@/components/marketing/AnimatedHeroStats").then((m) => ({ default: m.AnimatedHeroStats })),
  { loading: () => <div className="mt-14 h-24" aria-hidden /> },
);

/** Hero CTAs + stats — code-split to reduce home TBT. */
export function HomeHeroInteractive(): React.JSX.Element {
  return (
    <>
      <AbHeroPrimaryCta />
      <AnimatedHeroStats stats={HERO_STATS} />
    </>
  );
}
