"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/motion/LoadingScreen";
import { GsapProvider } from "@/components/providers/GsapProvider";

const CustomCursor = dynamic(
  () => import("@/components/motion/CustomCursor").then((mod) => mod.CustomCursor),
  { ssr: false },
);

const PageTransitionCurtain = dynamic(
  () =>
    import("@/components/motion/PageTransitionCurtain").then((mod) => mod.PageTransitionCurtain),
  { ssr: false },
);

const SceneCanvas = dynamic(
  () => import("@/components/canvas/SceneCanvas").then((mod) => mod.SceneCanvas),
  { ssr: false },
);
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
