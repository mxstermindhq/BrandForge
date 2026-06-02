"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  particleFragmentShader,
  particleVertexShader,
} from "@/shaders/hero-shaders";
import { useSceneUniformsOptional } from "@/lib/webgl/scene-uniforms";

const MOBILE_BREAKPOINT = 768;

function particleCount(): number {
  if (typeof window === "undefined") return 1600;
  return window.innerWidth < MOBILE_BREAKPOINT ? 600 : 1800;
}

type ParticleUniforms = {
  uTime: { value: number };
  uScroll: { value: number };
  uMouse: { value: THREE.Vector2 };
  uPixelRatio: { value: number };
};

export function HeroParticleField(): React.JSX.Element {
  const uniformsRef = useRef<ParticleUniforms>({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: 1 },
  });

  const sceneUniforms = useSceneUniformsOptional();
  const mouseSmooth = useRef(new THREE.Vector2(0, 0));

  const geometry = useMemo(() => {
    const count = particleCount();
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.45) * 3.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.55;
      const z = (Math.random() - 0.5) * 1.2;

      targets[i * 3] = x;
      targets[i * 3 + 1] = y;
      targets[i * 3 + 2] = z;

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      randoms[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, []);

  useFrame((state) => {
    const uniforms = uniformsRef.current;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.viewport.dpr;

    const scene = sceneUniforms?.uniforms;
    if (scene) {
      uniforms.uScroll.value = scene.heroScroll;
      mouseSmooth.current.lerp(
        new THREE.Vector2(scene.mouse.x, scene.mouse.y),
        0.12,
      );
      uniforms.uMouse.value.copy(mouseSmooth.current);
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniformsRef.current}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
