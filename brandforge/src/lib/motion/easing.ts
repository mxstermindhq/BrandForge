/** Cubic-bezier easing factory — maps progress 0–1 without GSAP CustomEase (Club). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const sampleCurveX = (t: number): number =>
    ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t: number): number =>
    ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  const sampleDerivativeX = (t: number): number =>
    (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;

  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    let ax = t;
    for (let i = 0; i < 8; i += 1) {
      const x = sampleCurveX(ax) - t;
      if (Math.abs(x) < 1e-5) break;
      const dx = sampleDerivativeX(ax);
      if (Math.abs(dx) < 1e-6) break;
      ax -= x / dx;
    }

    return sampleCurveY(ax);
  };
}

/** Kinetic entrance — matches site static ease cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE_KINETIC = cubicBezier(0.22, 1, 0.36, 1);

/** Hero char stagger — sharper deceleration. */
export const EASE_HERO_CHAR = cubicBezier(0.16, 1, 0.3, 1);
