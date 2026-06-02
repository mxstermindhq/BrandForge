"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { registerGsapPlugins, ScrollTrigger } from "@/lib/gsap/register-plugins";
import { useReducedMotion } from "@/lib/motion/prefers-reduced-motion";

export type SceneUniformState = {
  heroScroll: number;
  mouse: { x: number; y: number };
  pointer: { x: number; y: number };
};

type SceneUniformContextValue = {
  /** Mutable uniform bucket — read in R3F useFrame for zero re-render churn. */
  uniforms: SceneUniformState;
};

const SceneUniformContext = createContext<SceneUniformContextValue | null>(null);

export function useSceneUniforms(): SceneUniformContextValue {
  const ctx = useContext(SceneUniformContext);
  if (!ctx) {
    throw new Error("useSceneUniforms must be used within SceneUniformProvider");
  }
  return ctx;
}

export function useSceneUniformsOptional(): SceneUniformContextValue | null {
  return useContext(SceneUniformContext);
}

type SceneUniformProviderProps = {
  children: ReactNode;
};

/** Bridges DOM scroll + pointer into WebGL uniform state. */
export function SceneUniformProvider({ children }: SceneUniformProviderProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const uniformsRef = useRef<SceneUniformState>({
    heroScroll: 0,
    mouse: { x: 0, y: 0 },
    pointer: { x: 0, y: 0 },
  });
  const targetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    registerGsapPlugins();

    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        uniformsRef.current.heroScroll = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const onMove = (event: PointerEvent): void => {
      targetMouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      uniformsRef.current.pointer.x = event.clientX;
      uniformsRef.current.pointer.y = event.clientY;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    let raf = 0;
    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

    const tick = (): void => {
      const u = uniformsRef.current;
      u.mouse.x = lerp(u.mouse.x, targetMouse.current.x, 0.08);
      u.mouse.y = lerp(u.mouse.y, targetMouse.current.y, 0.08);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <SceneUniformContext.Provider value={{ uniforms: uniformsRef.current }}>
      {children}
    </SceneUniformContext.Provider>
  );
}

/** Returns true when WebGL2 or WebGL is available. */
export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return supported;
}
