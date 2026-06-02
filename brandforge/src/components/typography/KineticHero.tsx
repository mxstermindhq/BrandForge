"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_HERO_CHAR } from "@/lib/motion/easing";
import { revertSplit, splitIntoChars } from "@/lib/motion/split-text";
import { useSkipMotion } from "@/lib/motion/prefers-reduced-motion";

type KineticHeroProps = {
  /** Accessible full headline — visible text is split for animation. */
  ariaLabel: string;
  children: ReactNode;
  className?: string;
};

export function KineticHero({
  ariaLabel,
  children,
  className = "",
}: KineticHeroProps): React.JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipMotion = useSkipMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const heading = headingRef.current;
      if (!heading || skipMotion) return;

      const chars = splitIntoChars(heading);

      gsap.set(chars, {
        yPercent: 110,
        opacity: 0,
        rotateZ: 2,
      });

      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        rotateZ: 0,
        duration: 1.05,
        ease: EASE_HERO_CHAR,
        stagger: {
          each: 0.028,
          from: "start",
        },
        delay: 0.12,
      });

      return () => {
        gsap.killTweensOf(chars);
        revertSplit(heading);
      };
    },
    { scope: headingRef, dependencies: [skipMotion] },
  );

  return (
    <h1
      ref={headingRef}
      aria-label={ariaLabel}
      className={`max-w-4xl text-[clamp(2.5rem,6.5vw,5.25rem)] font-bold leading-[1.06] ${className}`}
    >
      {children}
    </h1>
  );
}

type HeroLineProps = {
  children: ReactNode;
};

export function HeroLine({ children }: HeroLineProps): React.JSX.Element {
  return (
    <span className="block" data-bf-line="">
      {children}
    </span>
  );
}
