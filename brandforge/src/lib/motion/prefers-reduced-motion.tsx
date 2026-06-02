"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type MotionContextValue = {
  reducedMotion: boolean;
  mobileLite: boolean;
};

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  mobileLite: false,
});

export function useMotionPreference(): MotionContextValue {
  return useContext(MotionContext);
}

type MotionPreferenceProviderProps = {
  children: ReactNode;
};

/** Syncs prefers-reduced-motion to React state and html.reduce-motion class. */
export function MotionPreferenceProvider({
  children,
}: MotionPreferenceProviderProps): React.JSX.Element {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobileLite, setMobileLite] = useState(false);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia("(max-width: 768px)");

    const apply = (): void => {
      const reduced = motionMedia.matches;
      const lite = mobileMedia.matches;
      setReducedMotion(reduced);
      setMobileLite(lite);
      document.documentElement.classList.toggle("reduce-motion", reduced);
      document.documentElement.classList.toggle("mobile-lite", lite);
    };

    apply();
    motionMedia.addEventListener("change", apply);
    mobileMedia.addEventListener("change", apply);
    return () => {
      motionMedia.removeEventListener("change", apply);
      mobileMedia.removeEventListener("change", apply);
    };
  }, []);

  const value = useMemo(() => ({ reducedMotion, mobileLite }), [reducedMotion, mobileLite]);

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useReducedMotion(): boolean {
  return useMotionPreference().reducedMotion;
}

/** True on viewports ≤768px — skips WebGL, Lenis, loader, and custom cursor. */
export function useMobileLite(): boolean {
  return useMotionPreference().mobileLite;
}

/** Skips GSAP scroll/pin animations on mobile lite or reduced motion. */
export function useSkipMotion(): boolean {
  const { reducedMotion, mobileLite } = useMotionPreference();
  return reducedMotion || mobileLite;
}

/** Defers heavy ScrollTrigger setup until the section nears the viewport. */
export function useMotionInView(
  ref: RefObject<Element | null>,
  rootMargin = "320px 0px",
): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || ready) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, ready]);

  return ready;
}

/** Returns a stable callback that no-ops when reduced motion is preferred. */
export function useMotionGate(): (run: () => void) => void {
  const { reducedMotion } = useMotionPreference();

  return useCallback(
    (run: () => void) => {
      if (!reducedMotion) run();
    },
    [reducedMotion],
  );
}
