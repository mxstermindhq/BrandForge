"use client";

import { useGSAP } from "@gsap/react";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type TiltCardProps = ComponentPropsWithoutRef<"article">;

/** 3D tilt on mouse proximity — rotateX/rotateY transforms only. */
export function TiltCard({
  children,
  className = "",
  ...rest
}: TiltCardProps): React.JSX.Element {
  const cardRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    registerGsapPlugins();
  }, []);

  const handleMove = (event: MouseEvent<HTMLElement>): void => {
    if (reducedMotion) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateY: px * 14,
      rotateX: -py * 14,
      transformPerspective: 900,
      duration: 0.45,
      ease: EASE_KINETIC,
    });
  };

  const handleLeave = (): void => {
    const card = cardRef.current;
    if (!card || reducedMotion) return;

    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: EASE_KINETIC,
    });
  };

  return (
    <article
      ref={cardRef}
      className={`will-change-transform ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transformStyle: "preserve-3d" }}
      {...rest}
    >
      {children}
    </article>
  );
}
