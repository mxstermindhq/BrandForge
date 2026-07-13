"use client";

import { useEffect, useRef } from "react";

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

type Rgb = [number, number, number];

const ANVIL_X_RATIO = 0.5;
const ANVIL_Y_RATIO = 0.92;

const COLOR_STOPS: { t: number; rgb: Rgb }[] = [
  { t: 0.00, rgb: [255, 243, 214] },  // #FFF3D6 white-hot core
  { t: 0.20, rgb: [255, 179,  71] },  // #FFB347 amber
  { t: 0.55, rgb: [232,  98,  44] },  // #E8622C mid-orange
  { t: 1.00, rgb: [122,  31,  18] },  // #7A1F12 deep red
];

function lerpColor(t: number): Rgb {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i];
    const b = COLOR_STOPS[i + 1];
    if (!a || !b) continue;
    if (clamped >= a.t && clamped <= b.t) {
      const f = (clamped - a.t) / (b.t - a.t);
      return [
        Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * f),
        Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * f),
        Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * f),
      ];
    }
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  return last ? last.rgb : [255, 243, 214];
}

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
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);
  const timerIntervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;
    parentRef.current = canvas.parentElement;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function isMobile(): boolean {
      return window.innerWidth < 768;
    }

    function maxParticles(): number {
      return isMobile() ? 60 : 150;
    }

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
        alpha: 0,
        life: 0,
        maxLife,
      });
    }

    function spawnBurst(x: number, y: number, count = 50) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const speed = 1 + Math.random() * 7;
        st.sparks.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: 1 + Math.random() * 3.5,
          alpha: 0,
          life: 0,
          maxLife: 25 + Math.random() * 50,
        });
      }
    }

    function scheduleAutoBurst() {
      const delay = 4000 + Math.random() * 3000;
      timerIntervalRef.current = window.setTimeout(() => {
        if (pausedRef.current) {
          scheduleAutoBurst();
          return;
        }
        const anvilX = W * ANVIL_X_RATIO;
        const anvilY = H * ANVIL_Y_RATIO;
        spawnBurst(anvilX, anvilY, 40 + Math.floor(Math.random() * 20));
        scheduleAutoBurst();
      }, delay);
    }

    function update() {
      const anvilX = W * ANVIL_X_RATIO;
      const anvilY = H * ANVIL_Y_RATIO;
      const cap = maxParticles();

      for (let i = st.sparks.length - 1; i >= 0; i--) {
        const s = st.sparks[i];
        if (!s) continue;
        s.life++;
        const progress = s.life / s.maxLife;
        if (progress < 0.10) {
          s.alpha = progress / 0.10;
        } else if (progress > 0.70) {
          s.alpha = (1 - progress) / 0.30;
        } else {
          s.alpha = 1;
        }
        s.vy += 0.015 + progress * 0.008;
        s.vx += (Math.random() - 0.5) * 0.04;
        s.vx *= 0.995;
        s.x += s.vx;
        s.y += s.vy;
        if (s.alpha <= 0.01 || s.y > H + 20 || s.x < -50 || s.x > W + 50) {
          st.sparks.splice(i, 1);
        }
      }

      while (st.sparks.length < cap && st.frameCount % 3 === 0) {
        spawnSpark(anvilX, anvilY);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (const s of st.sparks) {
        if (s.alpha < 0.01) continue;
        const progress = s.life / s.maxLife;
        const [r, g, b] = lerpColor(progress);
        const glow = s.size * 3;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glow);
        grad.addColorStop(0, `rgba(${r},${g},${b},${s.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${Math.min(r + 20, 255)},${Math.min(g + 20, 255)},${Math.min(b + 20, 255)},${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(s.size * (1 - progress * 0.4), 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawStaticGlow() {
      ctx.clearRect(0, 0, W, H);
      const cx = W * ANVIL_X_RATIO;
      const cy = H * ANVIL_Y_RATIO;
      const radius = Math.min(W, H) * 0.3;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, "rgba(176,141,62,0.08)");
      grad.addColorStop(1, "rgba(176,141,62,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function onClick(e: MouseEvent) {
      if (reducedMotionRef.current) return;
      const rect = parentRef.current?.getBoundingClientRect();
      if (!rect) return;
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top, 50);
    }

    function tick() {
      st.frameCount++;
      if (reducedMotionRef.current) {
        drawStaticGlow();
      } else if (!pausedRef.current) {
        update();
        draw();
      }
      animRef.current = requestAnimationFrame(tick);
    }

    const animRef = { current: 0 };
    const ro = new ResizeObserver(() => resize());
    const parent = parentRef.current;
    if (parent) ro.observe(parent);
    resize();

    scheduleAutoBurst();
    window.addEventListener("click", onClick);

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionHandler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionMedia.addEventListener("change", motionHandler);

    const io = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry?.isIntersecting;
      },
      { threshold: 0 }
    );
    if (parent) io.observe(parent);

    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("click", onClick);
      motionMedia.removeEventListener("change", motionHandler);
      if (timerIntervalRef.current !== undefined) {
        clearTimeout(timerIntervalRef.current);
      }
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
