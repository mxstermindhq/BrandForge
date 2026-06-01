"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { revertSplit, splitIntoLines } from "@/lib/motion/split-text";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
  /** When true, animation progress ties to scroll scrub (for long sections). */
  scrub?: boolean;
  id?: string;
};

/** Line-by-line wipe from below — transform/opacity only, ScrollTrigger on enter. */
export function SectionHeading({
  children,
  className = "",
  scrub = false,
  id,
}: SectionHeadingProps): React.JSX.Element {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const heading = ref.current;
      if (!heading || reducedMotion) return;

      const lines = splitIntoLines(heading);

      gsap.set(lines, { yPercent: 100, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top 85%",
          end: scrub ? "top 40%" : undefined,
          scrub: scrub ? 0.45 : false,
          once: !scrub,
        },
      });

      tl.to(lines, {
        yPercent: 0,
        opacity: 1,
        duration: scrub ? 1 : 0.9,
        ease: EASE_KINETIC,
        stagger: 0.12,
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        revertSplit(heading);
      };
    },
    { scope: ref, dependencies: [reducedMotion, scrub] },
  );

  return (
    <h2
      ref={ref}
      id={id}
      className={`text-[clamp(28px,4vw,48px)] font-bold leading-[1.1] ${className}`}
    >
      {children}
    </h2>
  );
}

type SectionLineProps = {
  children: ReactNode;
};

export function SectionLine({ children }: SectionLineProps): React.JSX.Element {
  return (
    <span className="block" data-bf-line="">
      {children}
    </span>
  );
}
