"use client";

import type { ReactNode } from "react";
import { SceneCanvas } from "@/components/canvas/SceneCanvas";
import { GsapProvider } from "@/components/providers/GsapProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { MotionPreferenceProvider } from "@/lib/motion/prefers-reduced-motion";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <MotionPreferenceProvider>
      <GsapProvider>
        <LenisProvider>
          <SceneCanvas />
          <div className="relative z-10">{children}</div>
        </LenisProvider>
      </GsapProvider>
    </MotionPreferenceProvider>
  );
}
