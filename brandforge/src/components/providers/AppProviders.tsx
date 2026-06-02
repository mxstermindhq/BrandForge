"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { GsapProvider } from "@/components/providers/GsapProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { useMobileLite, useReducedMotion } from "@/lib/motion/prefers-reduced-motion";
import { SceneUniformProvider } from "@/lib/webgl/scene-uniforms";

const LoadingScreen = dynamic(
  () => import("@/components/motion/LoadingScreen").then((mod) => mod.LoadingScreen),
  { ssr: false },
);

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

type AppProvidersProps = {
  children: ReactNode;
};

function MotionLayers(): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const mobileLite = useMobileLite();

  if (reducedMotion || mobileLite) return null;

  return (
    <>
      <LoadingScreen />
      <PageTransitionCurtain />
      <CustomCursor />
      <SceneCanvas />
    </>
  );
}

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  return (
    <GsapProvider>
      <LenisProvider>
        <SceneUniformProvider>
          <MotionLayers />
          <div className="relative z-10">{children}</div>
        </SceneUniformProvider>
      </LenisProvider>
    </GsapProvider>
  );
}
