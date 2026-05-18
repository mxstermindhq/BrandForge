"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

export function DirectoryHero() {
  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8"
      style={{ background: "var(--color-bg)" }}
    >
      <IslamicPattern className="pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[720px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "var(--color-gold-subtle)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full blur-[120px]"
        style={{ background: "var(--color-emerald-subtle)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{
            borderColor: "var(--color-gold-border)",
            background: "var(--color-gold-subtle)",
            color: "var(--color-gold)",
          }}
        >
          Curated talent · Verified operators · Managed by {CONTACT.guarantor}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="landing-gold-line max-w-4xl font-headline text-5xl font-semibold leading-[1.02] text-[var(--color-text-primary)] sm:text-6xl md:text-7xl"
        >
          The team behind the brands winning online.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="mt-8 max-w-2xl text-lg text-[var(--color-text-secondary)] sm:text-xl"
        >
          One conversation with mxstermind routes you to the right operator — scoped, trusted, and ready.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--color-gold)]"
        >
          No bidding. No spam. No hidden fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a
            href={CONTACT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary min-h-11 px-6 text-sm"
          >
            Start a conversation →
          </a>
          <a href="#talent" className="btn-secondary min-h-11 px-6 text-sm">
            See who&apos;s available ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
}
