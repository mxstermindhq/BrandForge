"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type ProfileCTAProps = {
  telegramUrl: string;
};

export function ProfileCTA({ telegramUrl }: ProfileCTAProps) {
  const reduced = useReducedMotion();
  return (
    <div className="mt-8 rounded-xl border-t p-4" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface-2)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={reduced ? undefined : { scale: 1.01 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
        >
          Contact via mxstermind
          <span className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-spring)] hover:translate-x-1">→</span>
        </motion.a>
        <Link href="/" className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">
          ← Back to directory
        </Link>
      </div>
    </div>
  );
}
