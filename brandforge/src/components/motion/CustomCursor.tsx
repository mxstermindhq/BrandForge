"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap/register-plugins";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]';

function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = (): void => setFine(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return fine;
}

/** 8px dot + 32px ring — lerped follow, blend expand on interactive targets. */
export function CustomCursor(): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    if (reducedMotion || !finePointer) return;

    document.documentElement.classList.add("bf-custom-cursor");

    const onMove = (event: PointerEvent): void => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
    };

    const onOver = (event: PointerEvent): void => {
      const el = (event.target as Element | null)?.closest(INTERACTIVE);
      hovering.current = Boolean(el);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    const tick = (): void => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot && ring) {
        pos.current.x += (target.current.x - pos.current.x) * 0.22;
        pos.current.y += (target.current.y - pos.current.y) * 0.22;

        gsap.set(dot, {
          x: pos.current.x,
          y: pos.current.y,
          xPercent: -50,
          yPercent: -50,
        });

        const ringLag = hovering.current ? 0.14 : 0.1;
        const ringX = pos.current.x + (target.current.x - pos.current.x) * ringLag;
        const ringY = pos.current.y + (target.current.y - pos.current.y) * ringLag;

        gsap.set(ring, {
          x: ringX,
          y: ringY,
          xPercent: -50,
          yPercent: -50,
          scale: hovering.current ? 1.65 : 1,
          opacity: hovering.current ? 0.55 : 0.35,
          borderColor: hovering.current ? "rgba(157, 95, 255, 0.9)" : "rgba(157, 95, 255, 0.45)",
        });
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("bf-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, [reducedMotion, finePointer]);

  if (reducedMotion || !finePointer) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[560] h-8 w-8 rounded-full border border-accent-bright will-change-transform"
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[561] h-2 w-2 rounded-full bg-accent-bright will-change-transform mix-blend-difference"
        aria-hidden="true"
      />
    </>
  );
}
