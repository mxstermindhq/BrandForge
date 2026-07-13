"use client";

import { useEffect, useRef } from "react";

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  startHue: number;
  startSat: number;
  startLight: number;
}

const SPAWN_RATE = 3;
const MAX_SPARKS = 120;
const ANVIL_X_RATIO = 0.5;
const ANVIL_Y_RATIO = 0.92;

let dpr = 1;
let W = 0;
let H = 0;

export function ForgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef({
    sparks: [] as Spark[],
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;
    parentRef.current = canvas.parentElement;

    function resize() {
      const parent = parentRef.current;
      if (!parent) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = parent.clientWidth;
      H = parent.clientHeight;
      if (W === 0 || H === 0) return;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnSpark(anvilX: number, anvilY: number) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 0.4 + Math.random() * 1.6;
      const maxLife = 120 + Math.random() * 180;
      st.sparks.push({
        x: anvilX + (Math.random() - 0.5) * 40,
        y: anvilY + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.7 + Math.random() * 0.3,
        life: 0,
        maxLife,
        startHue: 42 + Math.random() * 18,
        startSat: 85 + Math.random() * 15,
        startLight: 55 + Math.random() * 25,
      });
    }

    function spawnBurst(x: number, y: number) {
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5;
        const speed = 1.5 + Math.random() * 6;
        const upwardBias = i < 15 ? -0.5 : -1.0;
        st.sparks.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + upwardBias,
          size: 1 + Math.random() * 3,
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 40,
          startHue: 40 + Math.random() * 20,
          startSat: 90 + Math.random() * 10,
          startLight: 60 + Math.random() * 20,
        });
      }
    }

    function update() {
      const anvilX = W * ANVIL_X_RATIO;
      const anvilY = H * ANVIL_Y_RATIO;

      for (let i = st.sparks.length - 1; i >= 0; i--) {
        const s = st.sparks[i];
        if (!s) continue;
        s.life++;
        const progress = s.life / s.maxLife;
        s.alpha = progress < 0.05 ? progress / 0.05 : progress > 0.85 ? (1 - progress) / 0.15 : 0.7 + 0.3 * (1 - progress);
        s.vy += 0.015 + progress * 0.008;
        s.vx += (Math.random() - 0.5) * 0.04;
        s.vx *= 0.995;
        s.x += s.vx;
        s.y += s.vy;
        if (s.alpha <= 0.01 || s.y > H + 20 || s.x < -50 || s.x > W + 50) {
          st.sparks.splice(i, 1);
        }
      }

      if (st.frameCount % SPAWN_RATE === 0 && st.sparks.length < MAX_SPARKS) {
        for (let i = 0; i < 2; i++) {
          spawnSpark(anvilX, anvilY);
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (const s of st.sparks) {
        if (s.alpha < 0.01) continue;
        const progress = s.life / s.maxLife;
        const hue = s.startHue - progress * 35;
        const sat = s.startSat - progress * 50;
        const light = s.startLight + progress * 20;
        const clampedHue = Math.max(10, hue);
        const clampedSat = Math.max(20, sat);
        const glow = s.size * 3;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glow);
        grad.addColorStop(0, `hsla(${clampedHue}, ${clampedSat}%, ${light}%, ${s.alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${clampedHue}, ${clampedSat}%, ${light}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${clampedHue}, ${clampedSat}%, ${Math.min(light + 10, 95)}%, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(s.size * (1 - progress * 0.4), 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function onClick(e: MouseEvent) {
      const rect = parentRef.current?.getBoundingClientRect();
      if (!rect) return;
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
    }

    function tick() {
      st.frameCount++;
      update();
      draw();
      animRef.current = requestAnimationFrame(tick);
    }

    const animRef = { current: 0 };
    const ro = new ResizeObserver(() => resize());
    const parent = parentRef.current;
    if (parent) ro.observe(parent);
    resize();
    window.addEventListener("click", onClick);
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
