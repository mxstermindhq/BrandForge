"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MotionContextValue = {
  reducedMotion: boolean;
};

const MotionContext = createContext<MotionContextValue>({ reducedMotion: false });

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

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = (): void => {
      const reduced = media.matches;
      setReducedMotion(reduced);
      document.documentElement.classList.toggle("reduce-motion", reduced);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const value = useMemo(() => ({ reducedMotion }), [reducedMotion]);

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useReducedMotion(): boolean {
  return useMotionPreference().reducedMotion;
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
