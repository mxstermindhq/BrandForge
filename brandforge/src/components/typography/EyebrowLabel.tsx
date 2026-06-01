"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { revertSplit, splitIntoChars } from "@/lib/motion/split-text";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type EyebrowLabelProps = {
  text: string;
  className?: string;
  delay?: number;
};

/** Mono eyebrow — char stagger entrance before headline. */
export function EyebrowLabel({
  text,
  className = "",
  delay = 0.05,
}: EyebrowLabelProps): React.JSX.Element {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      registerGsapPlugins();
      const el = ref.current;
      if (!el || reducedMotion) return;

      const chars = splitIntoChars(el);

      gsap.set(chars, { yPercent: 80, opacity: 0 });
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.65,
        ease: EASE_KINETIC,
        stagger: 0.018,
        delay,
      });

      return () => {
        gsap.killTweensOf(chars);
        revertSplit(el);
      };
    },
    { scope: ref, dependencies: [reducedMotion, delay, text] },
  );

  return (
    <p
      ref={ref}
      className={`mb-6 font-mono text-[10px] uppercase tracking-[0.24em] text-accent-bright ${className}`}
    >
      {text}
    </p>
  );
}
