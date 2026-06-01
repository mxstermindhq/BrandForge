"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { EASE_KINETIC } from "@/lib/motion/easing";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

function isInternalRoute(href: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return href.startsWith("/");
}

/** Full-screen curtain wipe — covers on link click, reveals on route change. */
export function PageTransitionCurtain(): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const curtainRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);
  const navigating = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    registerGsapPlugins();
    const curtain = curtainRef.current;
    if (!curtain || reducedMotion) return;

    if (isFirst.current) {
      isFirst.current = false;
      gsap.set(curtain, { scaleY: 0 });
      return;
    }

    if (!navigating.current) {
      gsap.set(curtain, { scaleY: 1, transformOrigin: "top center" });
    }

    gsap.to(curtain, {
      scaleY: 0,
      duration: 0.75,
      ease: EASE_KINETIC,
      transformOrigin: "bottom center",
      onComplete: () => {
        navigating.current = false;
      },
    });

    return () => {
      gsap.killTweensOf(curtain);
    };
  }, [pathname, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const curtain = curtainRef.current;
    if (!curtain) return;

    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || !isInternalRoute(href)) return;
      if (href === pathname || href.split("#")[0] === pathname) return;

      event.preventDefault();
      navigating.current = true;

      gsap.set(curtain, { scaleY: 0, transformOrigin: "bottom center" });
      gsap.to(curtain, {
        scaleY: 1,
        duration: 0.55,
        ease: EASE_KINETIC,
        transformOrigin: "top center",
        onComplete: () => {
          router.push(href);
        },
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, reducedMotion, router]);

  if (reducedMotion) return null;

  return (
    <div
      ref={curtainRef}
      className="pointer-events-none fixed inset-0 z-[550] origin-top bg-accent will-change-transform"
      aria-hidden="true"
      data-page-curtain=""
      style={{ transform: "scaleY(0)" }}
    />
  );
}
