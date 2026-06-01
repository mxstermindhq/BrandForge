"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { revertSplit, splitIntoWords } from "@/lib/motion/split-text";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type HeroSubheadingProps = {
  /** Full subheading copy — split into words for clip reveal. */
  text: string;
  /** Optional leading phrase rendered in semibold before animated words. */
  boldPrefix?: string;
  className?: string;
  delay?: number;
};

/** Per-word clip-path reveal on hero subheading — transform/opacity only. */
export function HeroSubheading({
  text,
  boldPrefix,
  className = "",
  delay = 0.38,
}: HeroSubheadingProps): React.JSX.Element {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  const fullText = boldPrefix ? `${boldPrefix}${text}` : text;

  useGSAP(
    () => {
      registerGsapPlugins();
      const el = ref.current;
      if (!el || reducedMotion) return;

      const words = splitIntoWords(el);

      if (boldPrefix) {
        const prefixWordCount = boldPrefix.trim().split(/\s+/).length;
        words.slice(0, prefixWordCount).forEach((word) => {
          word.style.fontWeight = "600";
          word.style.color = "var(--text)";
        });
      }

      gsap.set(words, { yPercent: 115, opacity: 0 });

      gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.82,
        ease: EASE_KINETIC,
        stagger: 0.042,
        delay,
      });

      return () => {
        gsap.killTweensOf(words);
        revertSplit(el);
      };
    },
    { scope: ref, dependencies: [reducedMotion, delay, fullText, boldPrefix] },
  );

  return (
    <p
      ref={ref}
      className={`mt-5 max-w-xl text-[clamp(14px,1.7vw,17px)] leading-relaxed text-text-secondary ${className}`}
    >
      {fullText}
    </p>
  );
}
