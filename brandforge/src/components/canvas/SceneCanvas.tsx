"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

type SceneCanvasProps = {
  children?: ReactNode;
};

/** Fixed full-viewport R3F layer — pointer-events none so DOM remains interactive. */
function SceneCanvasInner({ children }: SceneCanvasProps): React.JSX.Element {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
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
        frameloop="demand"
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export function SceneCanvas({ children }: SceneCanvasProps): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return <SceneCanvasInner>{children}</SceneCanvasInner>;
}
