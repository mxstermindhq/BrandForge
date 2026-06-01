"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { HERO_STATS } from "@/content/home";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

export function HeroStats(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const root = ref.current;
      if (!root || reducedMotion) return;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-stat-block]", root);

      gsap.set(blocks, {
        clipPath: "inset(100% 0% 0% 0%)",
        y: 24,
        opacity: 0,
      });

      gsap.to(blocks, {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: EASE_KINETIC,
        stagger: 0.1,
        delay: 0.72,
      });

      return () => {
        gsap.killTweensOf(blocks);
      };
    },
    { scope: ref, dependencies: [reducedMotion] },
  );

  return (
    <div ref={ref} className="mt-14" aria-label="BrandForge track record">
      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--m2)]">
        Shipped for founders and operators worldwide
      </p>
      <div className="flex flex-wrap gap-11">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} data-stat-block="">
            <div className="font-mono text-[28px] leading-none text-text">{stat.value}</div>
            <div className="mt-1 text-[11px] text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
