"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { CanvasInvalidator } from "@/components/canvas/CanvasInvalidator";
import { useDeferredMount } from "@/hooks/useDeferredMount";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";
import { useSceneUniformsOptional, useWebGLSupported } from "@/lib/webgl/scene-uniforms";

const HeroScene = dynamic(
  () => import("@/components/canvas/HeroScene").then((mod) => mod.HeroScene),
  { ssr: false },
);

const HERO_SCROLL_UNMOUNT = 0.98;

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
        frameloop="demand"
        style={{ background: "transparent" }}
      >
        <CanvasInvalidator />
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

function SceneCanvasGate(): React.JSX.Element | null {
  const sceneUniforms = useSceneUniformsOptional();
  const [heroActive, setHeroActive] = useState(true);

  useEffect(() => {
    if (!sceneUniforms) return;

    let raf = 0;
    let active = true;

    const tick = (): void => {
      const nextActive = sceneUniforms.uniforms.heroScroll < HERO_SCROLL_UNMOUNT;
      if (nextActive !== active) {
        active = nextActive;
        setHeroActive(nextActive);
      }
      if (active) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sceneUniforms]);

  if (!heroActive) return null;

  return <SceneCanvasInner />;
}

export function SceneCanvas(): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();
  const deferredReady = useDeferredMount({ fallbackMs: 1400 });

  if (reducedMotion || !webglSupported || !deferredReady) return null;

  return <SceneCanvasGate />;
}
