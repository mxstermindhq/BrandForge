"use client";

import { useEffect, useRef } from "react";

interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
  sat: number;
  light: number;
  targetX?: number;
  targetY?: number;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  hue: number;
}

const EMBER_COUNT = 80;
const GRID_COLS = 12;
const GRID_ROWS = 8;

let dpr = 1;
let W = 0;
let H = 0;

export function ForgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    embers: [] as Ember[],
    sparks: [] as Spark[],
    mouseX: -9999,
    mouseY: -9999,
    mouseSpeed: 0,
    scrollProgress: 0,
    lastMX: -9999,
    lastMY: -9999,
    frameCount: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnEmber() {
      const chaos = st.scrollProgress < 0.4;
      const h = chaos ? 15 + Math.random() * 35 : 35 + Math.random() * 25;
      const s = chaos ? 80 + Math.random() * 20 : 60 + Math.random() * 20;
      const l = chaos ? 50 + Math.random() * 30 : 60 + Math.random() * 25;
      st.embers.push({
        x: Math.random() * W,
        y: H + 10,
        vx: (Math.random() - 0.5) * (chaos ? 2 : 0.5),
        vy: -(0.3 + Math.random() * (chaos ? 1.5 : 0.6)),
        size: 1.5 + Math.random() * 3.5,
        alpha: 0,
        life: 0,
        maxLife: 180 + Math.random() * 200,
        hue: h,
        sat: s,
        light: l,
      });
    }

    function spawnBurst(x: number, y: number) {
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 7;
        st.sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: 1 + Math.random() * 2.5,
          alpha: 1,
          life: 0,
          maxLife: 15 + Math.random() * 25,
          hue: 20 + Math.random() * 40,
        });
      }
    }

    function updateEmbers() {
      const progress = st.scrollProgress;
      const orderFactor = Math.min(Math.max((progress - 0.3) / 0.3, 0), 1);

      for (let i = st.embers.length - 1; i >= 0; i--) {
        const e = st.embers[i];
        if (!e) continue;
        e.life++;
        e.alpha = e.life < 30 ? e.life / 30 : e.life > e.maxLife - 40 ? (e.maxLife - e.life) / 40 : 1;
        e.alpha *= 0.5 + (e.life / e.maxLife) * 0.5;

        if (orderFactor > 0 && e.targetX !== undefined && e.targetY !== undefined) {
          const dx = e.targetX - e.x;
          const dy = e.targetY - e.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1) {
            const pull = orderFactor * 0.03;
            e.vx += dx * pull;
            e.vy += dy * pull;
          }
          e.vx *= 0.96;
          e.vy *= 0.96;
        }

        e.x += e.vx;
        e.y += e.vy;

        if (e.alpha <= 0.01 || e.y < -20 || e.x < -50 || e.x > W + 50) {
          st.embers.splice(i, 1);
        }
      }

      while (st.embers.length < EMBER_COUNT) {
        spawnEmber();
      }

      if (orderFactor > 0) {
        assignGridTargets(orderFactor);
      }
    }

    const gridTargets: { x: number; y: number }[] = [];

    function assignGridTargets(factor: number) {
      if (gridTargets.length === 0) {
        const padX = W * 0.1;
        const padY = H * 0.15;
        const cellW = (W - padX * 2) / GRID_COLS;
        const cellH = (H - padY * 2) / GRID_ROWS;
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const jitter = factor > 0.5 ? 0 : 20;
            gridTargets.push({
              x: padX + c * cellW + (Math.random() - 0.5) * jitter,
              y: padY + r * cellH + (Math.random() - 0.5) * jitter,
            });
          }
        }
      }

      const unassigned = st.embers.filter((e) => e.targetX === undefined);
      const taken = new Set(
        st.embers.filter((e) => e.targetX !== undefined).map((e) => `${e.targetX},${e.targetY}`)
      );
      const available = gridTargets.filter((t) => !taken.has(`${t.x},${t.y}`));

      unassigned.forEach((e) => {
        if (available.length === 0) return;
        const idx = Math.floor(Math.random() * available.length);
        const target = available[idx];
        if (!target) return;
        e.targetX = target.x;
        e.targetY = target.y;
        available.splice(idx, 1);
      });
    }

    function updateSparks() {
      for (let i = st.sparks.length - 1; i >= 0; i--) {
        const s = st.sparks[i];
        if (!s) continue;
        s.life++;
        s.alpha = 1 - s.life / s.maxLife;
        s.vy += 0.05;
        s.x += s.vx;
        s.y += s.vy;
        s.size *= 0.98;
        if (s.alpha <= 0 || s.life >= s.maxLife) {
          st.sparks.splice(i, 1);
        }
      }
    }

    function drawEmbers() {
      for (const e of st.embers) {
        if (e.alpha < 0.01) continue;
        const glow = e.size * 3;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glow);
        grad.addColorStop(0, `hsla(${e.hue}, ${e.sat}%, ${e.light}%, ${e.alpha * 0.6})`);
        grad.addColorStop(1, `hsla(${e.hue}, ${e.sat}%, ${e.light}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${e.hue}, ${e.sat}%, ${e.light + 15}%, ${e.alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawSparks() {
      for (const s of st.sparks) {
        ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(s.size, 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawGridLines() {
      const progress = st.scrollProgress;
      const orderFactor = Math.min(Math.max((progress - 0.3) / 0.3, 0), 1);
      if (orderFactor < 0.1) return;

      const assigned = st.embers.filter((e) => e.targetX !== undefined && e.targetY !== undefined);
      ctx.strokeStyle = `hsla(35, 80%, 70%, ${orderFactor * 0.08})`;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < assigned.length; i++) {
        const a = assigned[i];
        if (!a || a.targetX === undefined || a.targetY === undefined) continue;
        for (let j = i + 1; j < assigned.length; j++) {
          const b = assigned[j];
          if (!b || b.targetX === undefined || b.targetY === undefined) continue;
          const dx = a.targetX - b.targetX;
          const dy = a.targetY - b.targetY;
          const cellW = (W - W * 0.2) / GRID_COLS;
          if (Math.abs(dx) < cellW * 1.5 && Math.abs(dy) < cellW * 1.5) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function onScroll() {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      st.scrollProgress = docH > 0 ? scrollY / docH : 0;
    }

    function onMouseMove(e: MouseEvent) {
      st.lastMX = st.mouseX;
      st.lastMY = st.mouseY;
      st.mouseX = e.clientX;
      st.mouseY = e.clientY;
      st.mouseSpeed = Math.hypot(st.mouseX - st.lastMX, st.mouseY - st.lastMY);
    }

    function onClick(e: MouseEvent) {
      spawnBurst(e.clientX, e.clientY);
    }

    function tick() {
      st.frameCount++;
      ctx.clearRect(0, 0, W, H);

      if (st.mouseSpeed > 15 && st.frameCount % 3 === 0) {
        spawnBurst(st.mouseX + (Math.random() - 0.5) * 20, st.mouseY + (Math.random() - 0.5) * 20);
      }
      st.mouseSpeed *= 0.85;

      updateEmbers();
      updateSparks();
      drawGridLines();
      drawEmbers();
      drawSparks();

      animRef.current = requestAnimationFrame(tick);
    }

    const animRef = { current: 0 };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick);
    onScroll();
    tick();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
