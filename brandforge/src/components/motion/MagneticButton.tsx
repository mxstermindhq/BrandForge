"use client";

import Link from "next/link";
import { useRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from "react";
import { gsap } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type MagneticAnchorProps = ComponentPropsWithoutRef<"a"> & {
  children: ReactNode;
  strength?: number;
};

type MagneticLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  strength?: number;
  asChild: true;
};

type Props = MagneticAnchorProps | MagneticLinkProps;

function useMagneticHandlers(strength: number): {
  outerRef: React.RefObject<HTMLAnchorElement | null>;
  innerRef: React.RefObject<HTMLSpanElement | null>;
  onMove: (event: MouseEvent<HTMLAnchorElement>) => void;
  onLeave: () => void;
} {
  const outerRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const onMove = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (reducedMotion) return;
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const rect = outer.getBoundingClientRect();
    const px = event.clientX - rect.left - rect.width / 2;
    const py = event.clientY - rect.top - rect.height / 2;

    gsap.to(inner, {
      x: px * strength,
      y: py * strength,
      duration: 0.45,
      ease: EASE_KINETIC,
    });
  };

  const onLeave = (): void => {
    const inner = innerRef.current;
    if (!inner || reducedMotion) return;

    gsap.to(inner, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: EASE_KINETIC,
    });
  };

  return { outerRef, innerRef, onMove, onLeave };
}

/**
 * Magnetic pull on primary CTAs — translate only, no layout reflow.
 */
export function MagneticButton(props: Props): React.JSX.Element {
  const { children, strength = 0.32, className = "" } = props;
  const { outerRef, innerRef, onMove, onLeave } = useMagneticHandlers(strength);
  const outerClass = `inline-block ${className}`;

  if ("asChild" in props && props.asChild) {
    const { asChild: _a, strength: _s, className: _c, children: _ch, ...linkRest } = props;
    return (
      <Link
        ref={outerRef}
        className={outerClass}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        {...linkRest}
      >
        <span ref={innerRef} className="inline-flex items-center will-change-transform">
          {children}
        </span>
      </Link>
    );
  }

  const { strength: _s, className: _c, children: _ch, ...anchorRest } = props as MagneticAnchorProps;
  return (
    <a
      ref={outerRef}
      className={outerClass}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...anchorRest}
    >
      <span ref={innerRef} className="inline-flex items-center will-change-transform">
        {children}
      </span>
    </a>
  );
}
