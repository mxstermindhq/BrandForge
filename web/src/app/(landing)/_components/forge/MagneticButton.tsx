"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
  dataTrack?: string;
};

export function MagneticButton({
  href,
  children,
  className = "",
  variant = "primary",
  external,
  dataTrack,
}: MagneticButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const variantClass =
    variant === "primary"
      ? "forge-btn forge-btn-primary"
      : variant === "secondary"
        ? "forge-btn forge-btn-secondary"
        : "forge-btn forge-btn-ghost";

  const inner = (
    <motion.span
      style={{ x: sx, y: sy }}
      className={`${variantClass} ${className}`}
      data-track={dataTrack}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.12);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.12);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.span>
  );

  if (external || href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
        {inner}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className="inline-block"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }}
      >
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
