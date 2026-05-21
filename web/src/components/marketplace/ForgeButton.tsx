"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "glass";

type ForgeButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  type?: "button" | "submit";
  dataTrack?: string;
  small?: boolean;
};

export function ForgeButton({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  external,
  type = "button",
  dataTrack,
  small,
}: ForgeButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22 });
  const sy = useSpring(y, { stiffness: 320, damping: 22 });

  const variantClass =
    variant === "primary"
      ? "forge-btn-primary"
      : variant === "secondary"
        ? "forge-btn-secondary"
        : variant === "glass"
          ? "forge-btn-glass"
          : "forge-btn-ghost";

  const inner = (
    <motion.span
      style={{ x: sx, y: sy }}
      className={`forge-btn ${variantClass} ${small ? "forge-btn-sm" : ""} ${className}`}
      data-track={dataTrack}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.1);
        y.set((e.clientY - r.top - r.height / 2) * 0.1);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className="inline-block">
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className="inline-block border-0 bg-transparent p-0">
      {inner}
    </button>
  );
}
