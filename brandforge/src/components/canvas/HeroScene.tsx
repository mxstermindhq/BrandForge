"use client";

import { HeroDisplacementPlane } from "@/components/canvas/HeroDisplacementPlane";
import { HeroParticleField } from "@/components/canvas/HeroParticleField";

/** Hero WebGL layer — particles + displacement grid (transparent canvas). */
export function HeroScene(): React.JSX.Element {
  return (
    <>
      <HeroParticleField />
      <HeroDisplacementPlane />
    </>
  );
}
