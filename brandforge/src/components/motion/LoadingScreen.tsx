"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap/register-plugins";
import { EASE_HERO_CHAR } from "@/lib/motion/easing";
import { splitIntoChars, revertSplit } from "@/lib/motion/split-text";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

const STORAGE_KEY = "bf-loader-seen";

/** First-visit loader — brand name assembles character by character. */
export function LoadingScreen(): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    setVisible(true);
  }, [reducedMotion]);

  useEffect(() => {
    if (!visible || reducedMotion) return;

    const overlay = overlayRef.current;
    const title = titleRef.current;
    if (!overlay || !title) return;

    document.body.style.overflow = "hidden";

    const chars = splitIntoChars(title);
    gsap.set(chars, { opacity: 0, yPercent: 120, rotateZ: 6 });

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setVisible(false);
        document.body.style.overflow = "";
        revertSplit(title);
      },
    });

    tl.to(chars, {
      opacity: 1,
      yPercent: 0,
      rotateZ: 0,
      duration: 0.75,
      ease: EASE_HERO_CHAR,
      stagger: 0.045,
    })
      .to({}, { duration: 0.35 })
      .to(overlay, {
        yPercent: -100,
        duration: 0.85,
        ease: EASE_HERO_CHAR,
      });

    return () => {
      tl.kill();
      gsap.killTweensOf([overlay, ...chars]);
      document.body.style.overflow = "";
    };
  }, [visible, reducedMotion]);

  if (!visible || reducedMotion) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[600] flex items-center justify-center bg-bg will-change-transform"
      aria-hidden="true"
      data-loading-screen=""
    >
      <h1
        ref={titleRef}
        className="font-mono text-sm uppercase tracking-[0.35em] text-accent-bright"
        aria-label="BrandForge"
      >
        BrandForge
      </h1>
    </div>
  );
}
