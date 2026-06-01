"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  displacementFragmentShader,
  displacementVertexShader,
} from "@/shaders/hero-shaders";
import { useSceneUniformsOptional } from "@/lib/webgl/scene-uniforms";

type DisplacementUniforms = {
  uTime: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uNoiseScale: { value: number };
};

/** Noise-displaced plane sitting behind the hero headline area. */
export function HeroDisplacementPlane(): React.JSX.Element {
  const uniformsRef = useRef<DisplacementUniforms>({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uNoiseScale: { value: 1.6 },
  });

  const sceneUniforms = useSceneUniformsOptional();
  const mouseSmooth = useRef(new THREE.Vector2(0, 0));

  useFrame((state) => {
    const uniforms = uniformsRef.current;
    uniforms.uTime.value = state.clock.elapsedTime;

    if (sceneUniforms?.uniforms) {
      const scene = sceneUniforms.uniforms;
      uniforms.uScroll.value = scene.heroScroll;
      mouseSmooth.current.lerp(
        new THREE.Vector2(scene.mouse.x, scene.mouse.y),
        0.08,
      );
      uniforms.uMouse.value.copy(mouseSmooth.current);
    }
  });

  return (
    <mesh position={[0, 0.2, -0.5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[9, 4.5, 32, 32]} />
      <shaderMaterial
        uniforms={uniformsRef.current}
        vertexShader={displacementVertexShader}
        fragmentShader={displacementFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
