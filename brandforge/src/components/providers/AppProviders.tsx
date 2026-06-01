"use client";

import type { ReactNode } from "react";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { PageTransitionCurtain } from "@/components/motion/PageTransitionCurtain";
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
            <LoadingScreen />
            <PageTransitionCurtain />
            <CustomCursor />
            <SceneCanvas />
            <div className="relative z-10">{children}</div>
          </SceneUniformProvider>
        </LenisProvider>
      </GsapProvider>
    </MotionPreferenceProvider>
  );
}
