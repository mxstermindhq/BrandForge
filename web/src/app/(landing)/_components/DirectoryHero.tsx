"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

const stats = [
  { value: "4", label: "Verified operators" },
  { value: "1", label: "Conversation to start" },
  { value: "0", label: "Open bidding" },
] as const;

export function DirectoryHero() {
  const reduced = useReducedMotion();

  return (
    <section
      className="directory-hero relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8"
      style={{ background: "var(--color-bg)" }}
    >
      <IslamicPattern className="pointer-events-none absolute inset-0 opacity-[0.035]" />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[min(560px,70vh)] w-[min(900px,120vw)] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "var(--color-gold-subtle)" }}
      />
      <div className="directory-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8 flex flex-wrap items-center gap-3"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{
              borderColor: "var(--color-gold-border)",
              background: "var(--color-gold-subtle)",
              color: "var(--color-gold)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: "var(--color-gold)" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--color-gold)" }} />
            </span>
            Curated · Verified · {CONTACT.guarantor}
          </span>
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="landing-gold-line max-w-[14ch] font-headline text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--color-text-primary)]"
        >
          Operators worth introducing.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-text-secondary)] sm:text-xl"
        >
          A shortlist of builders we trust — not a gig board. One message to mxstermind and we scope the right person.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-12 px-7 text-sm">
            Start a conversation →
          </a>
          <a href="#talent" className="btn-secondary min-h-12 px-7 text-sm">
            Browse the directory
          </a>
        </motion.div>

        <motion.ul
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-16 grid max-w-2xl grid-cols-3 gap-4 border-t pt-8 sm:gap-8"
          style={{ borderColor: "var(--color-border)" }}
        >
          {stats.map((s) => (
            <li key={s.label}>
              <p className="font-headline text-3xl font-semibold tabular-nums text-[var(--color-text-primary)] sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">{s.label}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
