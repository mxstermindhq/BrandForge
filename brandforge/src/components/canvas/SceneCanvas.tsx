"use client";

import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";
import { useWebGLSupported } from "@/lib/webgl/scene-uniforms";

const HeroScene = dynamic(
  () => import("@/components/canvas/HeroScene").then((mod) => mod.HeroScene),
  { ssr: false },
);

type SceneCanvasProps = {
  children?: ReactNode;
};

/** Fixed full-viewport R3F layer — pointer-events none so DOM remains interactive. */
function SceneCanvasInner(): React.JSX.Element {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
      data-r3f-canvas=""
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function SceneCanvas(): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();

  if (reducedMotion || !webglSupported) return null;

  return <SceneCanvasInner />;
}
