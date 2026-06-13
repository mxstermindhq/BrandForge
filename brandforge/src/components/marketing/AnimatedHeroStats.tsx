"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: string;
  label: string;
  icon?: string;
};

function parseStatValue(raw: string): { prefix: string; num: number; suffix: string } | null {
  const match = /^(\D*)(\d+)(\D*)$/.exec(raw.trim());
  if (!match) return null;
  return { prefix: match[1] ?? "", num: Number(match[2]), suffix: match[3] ?? "" };
}

function StatCard({ value, label, icon }: Stat): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(value);
  const parsed = parseStatValue(value);

  useEffect(() => {
    if (!parsed) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    let observer: IntersectionObserver | null = null;

    const animate = (): void => {
      const start = performance.now();
      const duration = 900;
      const tick = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        const current = Math.round(parsed.num * eased);
        setDisplay(`${parsed.prefix}${current}${parsed.suffix}`);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          animate();
          observer?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [parsed, value]);

  return (
    <div
      ref={ref}
      className="rounded-md border border-b1 bg-s1/80 p-4 backdrop-blur-sm"
    >
      {icon ? (
        <p className="font-mono text-lg text-accent-bright" aria-hidden>
          {icon}
        </p>
      ) : null}
      <p className="mt-1 font-mono text-2xl font-bold text-text">{display}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

type AnimatedHeroStatsProps = {
  stats: readonly Stat[];
};

/** Lightweight count-up on scroll — respects reduced motion via static values. */
export function AnimatedHeroStats({ stats }: AnimatedHeroStatsProps): React.JSX.Element {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (): void => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduceMotion) {
    return (
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="BrandForge track record">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-b1 bg-s1/80 p-4">
            {stat.icon ? (
              <p className="font-mono text-lg text-accent-bright" aria-hidden>
                {stat.icon}
              </p>
            ) : null}
            <p className="mt-1 font-mono text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="BrandForge track record">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
