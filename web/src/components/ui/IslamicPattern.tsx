"use client";

import { motion, useReducedMotion } from "framer-motion";

type IslamicPatternProps = {
  opacity?: number;
  color?: string;
  size?: number;
  className?: string;
};

export function IslamicPattern({
  opacity = 0.04,
  color = "var(--color-gold)",
  size = 60,
  className = "",
}: IslamicPatternProps) {
  const prefersReducedMotion = useReducedMotion();
  const id = `islamic-pattern-${size}`.replace(/\./g, "-");

  return (
    <motion.svg
      aria-hidden="true"
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2, ease: "easeOut" }}
    >
      <defs>
        <pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M ${size / 2} 4
                L ${size * 0.62} ${size * 0.28}
                L ${size - 4} ${size / 2}
                L ${size * 0.62} ${size * 0.72}
                L ${size / 2} ${size - 4}
                L ${size * 0.38} ${size * 0.72}
                L 4 ${size / 2}
                L ${size * 0.38} ${size * 0.28}
                Z`}
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <circle cx={size / 2} cy={size / 2} r={size * 0.16} fill="none" stroke={color} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </motion.svg>
  );
}
