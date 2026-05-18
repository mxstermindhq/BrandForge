"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { talentInitials } from "@/lib/talent-types";
import { profilePath } from "@/lib/reserved-paths";

type OperatorCardProps = {
  operator: CuratedOperator;
  index: number;
};

function availabilityUi(availability: CuratedOperator["availability"]) {
  if (availability === "available-now") return { label: "Available now", dot: "var(--color-emerald-text)", pulse: true, text: "var(--color-emerald-text)" };
  if (availability === "available") return { label: "Available", dot: "var(--color-emerald-text)", pulse: false, text: "var(--color-emerald-text)" };
  if (availability === "limited") return { label: "Limited slots", dot: "var(--color-warning)", pulse: false, text: "var(--color-warning)" };
  return { label: "Unavailable", dot: "var(--color-danger)", pulse: false, text: "var(--color-danger)" };
}

export function OperatorCard({ operator, index }: OperatorCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const score = useMotionValue(0);
  const scoreSpring = useSpring(score, { stiffness: 60, damping: 15 });
  const scoreText = useTransform(scoreSpring, (v) => Math.round(v));
  const avail = availabilityUi(operator.availability);
  const featured = operator.layoutSpan === "featured";

  useEffect(() => {
    score.set(operator.amanahScore);
  }, [operator.amanahScore, score]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={prefersReducedMotion ? undefined : { y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      className="group relative overflow-hidden rounded-2xl border bg-[var(--color-surface)] p-4 transition-all duration-[var(--duration-base)] ease-[var(--ease-smooth)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className={`absolute left-0 top-0 h-[3px] w-full bg-[var(--color-gold)] transition-opacity duration-[var(--duration-base)] ${
          featured ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-[var(--duration-base)] group-hover:border-[var(--color-gold)]"
            style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-text-primary)" }}
          >
            {talentInitials(operator.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold text-[var(--color-text-primary)]">{operator.name}</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">{operator.role}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: avail.text }}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${avail.pulse ? "animate-[bf-live-dot_2s_infinite]" : ""}`}
            style={{ backgroundColor: avail.dot }}
            aria-hidden="true"
          />
          {avail.label}
        </span>
      </div>

      <div className="mt-4 rounded-md bg-[var(--color-surface-3)] px-3 py-2">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-secondary)]">Reviews</span>
          <motion.span className="font-semibold text-[var(--color-text-primary)]">{scoreText}</motion.span>
        </div>
        <div className="relative h-[3px] overflow-hidden rounded-sm bg-[var(--color-border)]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={operator.amanahScore}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${operator.amanahScore}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-sm bg-[var(--color-gold)]"
          />
          <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-white/15 group-hover:block group-hover:animate-[bf-shimmer_1.5s_linear_1]" />
        </div>
        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
          {Math.max(3, Math.round(operator.completionRate / 20))} verified reviews
        </p>
      </div>

      <p className="mt-3 line-clamp-1 text-sm text-[var(--color-text-secondary)]">{operator.bio}</p>

      <div className="mt-3 rounded-md border-l-2 border-[var(--color-emerald)] bg-[var(--color-emerald-subtle)] px-2.5 py-2">
        <p className="flex items-center gap-1.5 text-[12px] italic text-[var(--color-emerald-text)]">
          <Trophy size={12} aria-hidden="true" />
          {operator.bestResult}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--color-text-primary)]">{operator.startingPrice}</span>
        <span className="text-[var(--color-text-secondary)]">{operator.pricingModel}</span>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {operator.skills.map((skill) => (
          <span
            key={skill}
            className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)", color: "var(--color-text-secondary)" }}
          >
            {skill}
          </span>
        ))}
      </div>

      <Link
        href={profilePath(operator.username)}
        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm transition-all duration-[var(--duration-fast)] hover:border-[var(--color-gold-border)] hover:bg-[var(--color-gold-subtle)] hover:text-[var(--color-gold)]"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        View profile
        <span className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-spring)] group-hover:translate-x-1">→</span>
      </Link>
    </motion.article>
  );
}
