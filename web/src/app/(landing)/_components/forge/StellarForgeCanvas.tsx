"use client";

import { useEffect, useRef } from "react";

type StellarForgeCanvasProps = {
  variant?: "hero" | "collapse";
  className?: string;
};

type Ember = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export function StellarForgeCanvas({ variant = "hero", className = "" }: StellarForgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;
    const embers: Ember[] = Array.from({ length: variant === "hero" ? 90 : 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -Math.random() * 0.0008 - 0.0002,
      life: Math.random(),
      size: Math.random() * 2 + 0.5,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const drawStar = (w: number, h: number, time: number) => {
      const cx = w * (0.5 + (mouseRef.current.x - 0.5) * 0.04);
      const cy = h * (variant === "hero" ? 0.42 : 0.5) + (mouseRef.current.y - 0.5) * 20;
      const pulse = variant === "collapse" ? 0.85 + Math.sin(time * 2) * 0.08 : 1 + Math.sin(time * 0.8) * 0.06;
      const baseR = Math.min(w, h) * (variant === "hero" ? 0.28 : 0.22) * pulse;

      const corona = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.2);
      corona.addColorStop(0, "rgba(255, 220, 120, 0.95)");
      corona.addColorStop(0.15, "rgba(255, 120, 40, 0.75)");
      corona.addColorStop(0.4, "rgba(255, 60, 10, 0.35)");
      corona.addColorStop(0.7, "rgba(180, 20, 0, 0.08)");
      corona.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = corona;
      ctx.fillRect(0, 0, w, h);

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.55);
      core.addColorStop(0, "#fff8e7");
      core.addColorStop(0.35, "#ffae42");
      core.addColorStop(0.7, "#ff3d00");
      core.addColorStop(1, "rgba(255, 30, 0, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.55, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const angle = time * 0.15 + (i * Math.PI * 2) / 5;
        const waveR = baseR * (1.1 + Math.sin(time * 1.2 + i) * 0.12);
        ctx.strokeStyle = `rgba(255, ${100 + i * 20}, 0, ${0.12 + i * 0.02})`;
        ctx.lineWidth = 2 + i;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.08) {
          const r = waveR + Math.sin(a * 6 + time * 2 + i) * 18;
          const px = cx + Math.cos(a + angle) * r;
          const py = cy + Math.sin(a + angle) * r * 0.85;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      if (!reduced) t += 0.016;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#030305");
      bg.addColorStop(0.5, "#080404");
      bg.addColorStop(1, "#020202");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nebula = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.5, h * 0.5, w * 0.8);
      nebula.addColorStop(0, "rgba(80, 20, 0, 0.25)");
      nebula.addColorStop(0.5, "rgba(40, 8, 0, 0.12)");
      nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      drawStar(w, h, t);

      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        if (!reduced) {
          e.x += e.vx + (mouseRef.current.x - 0.5) * 0.0001;
          e.y += e.vy;
          e.life += 0.004;
          if (e.y < 0 || e.life > 1) {
            e.x = Math.random();
            e.y = 0.9 + Math.random() * 0.1;
            e.life = 0;
          }
        }
        const px = e.x * w;
        const py = e.y * h;
        const alpha = (1 - e.life) * 0.7;
        ctx.fillStyle = `rgba(255, ${140 + e.life * 80}, 40, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={`forge-canvas ${className}`}
      aria-hidden
    />
  );
}
