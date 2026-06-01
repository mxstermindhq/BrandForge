"use client";

import { useFrame, useThree } from "@react-three/fiber";

/** Keeps demand frameloop rendering while the hero WebGL layer is active. */
export function CanvasInvalidator(): null {
  const invalidate = useThree((state) => state.invalidate);

  useFrame(() => {
    invalidate();
  });

  return null;
}
