"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { gsap, registerGsapPlugins } from "@/lib/gsap/register-plugins";
import { ScrollTrigger } from "@/lib/gsap/register-plugins";
import { useMobileLite, useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type LenisContextValue = {
  lenis: Lenis | null;
};

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis(): Lenis | null {
  return useContext(LenisContext).lenis;
}

type LenisProviderProps = {
  children: ReactNode;
};

/**
 * Lenis smooth scroll synced to GSAP ticker (not rAF loop).
 * ScrollTrigger.update fires on Lenis scroll events.
 */
export function LenisProvider({ children }: LenisProviderProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const mobileLite = useMobileLite();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion || mobileLite) {
      setLenis(null);
      return;
    }

    registerGsapPlugins();

    const instance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    instance.on("scroll", ScrollTrigger.update);

    const onTick = (time: number): void => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion, mobileLite]);

  const value = useMemo(() => ({ lenis }), [lenis]);

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
