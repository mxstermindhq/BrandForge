"use client";

import type { ReactNode } from "react";
import { SceneCanvas } from "@/components/canvas/SceneCanvas";
import { GsapProvider } from "@/components/providers/GsapProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { MotionPreferenceProvider } from "@/lib/motion/prefers-reduced-motion";
import { SceneUniformProvider } from "@/lib/webgl/scene-uniforms";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <MotionPreferenceProvider>
      <GsapProvider>
        <LenisProvider>
          <SceneUniformProvider>
            <SceneCanvas />
            <div className="relative z-10">{children}</div>
          </SceneUniformProvider>
        </LenisProvider>
      </GsapProvider>
    </MotionPreferenceProvider>
  );
}
