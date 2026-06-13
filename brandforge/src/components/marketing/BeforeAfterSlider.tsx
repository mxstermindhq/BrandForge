"use client";

import { useCallback, useRef, useState } from "react";

type BeforeAfterSliderProps = {
  beforeLabel?: string;
  afterLabel?: string;
  beforeCaption: string;
  afterCaption: string;
};

/** Lightweight before/after — tap or drag handle. */
export function BeforeAfterSlider({
  beforeLabel = "Before",
  afterLabel = "After",
  beforeCaption,
  afterCaption,
}: BeforeAfterSliderProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);

  const setFromClientX = useCallback((clientX: number): void => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setPct(next);
  }, []);

  return (
    <div
      ref={trackRef}
      className="relative mt-6 overflow-hidden rounded-md border border-b1 bg-s1 select-none touch-none"
      onPointerDown={(e) => setFromClientX(e.clientX)}
      onPointerMove={(e) => {
        if (e.buttons > 0) setFromClientX(e.clientX);
      }}
      role="slider"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Before and after comparison"
    >
      <div className="grid grid-cols-2 text-center font-mono text-[9px] uppercase tracking-wider text-muted">
        <span className="border-b border-r border-b1 py-2">{beforeLabel}</span>
        <span className="border-b border-b1 py-2">{afterLabel}</span>
      </div>
      <div className="relative min-h-[120px]">
        <p
          className="absolute inset-0 flex items-center justify-start p-4 text-sm text-text-secondary"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          {beforeCaption}
        </p>
        <p
          className="absolute inset-0 flex items-center justify-end p-4 text-sm text-text-secondary"
          style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
        >
          {afterCaption}
        </p>
        <div
          className="absolute inset-y-0 w-0.5 bg-accent-bright"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-bg px-2 py-1 font-mono text-[9px] text-accent-bright"
          style={{ left: `${pct}%` }}
        >
          ◆
        </div>
      </div>
    </div>
  );
}
