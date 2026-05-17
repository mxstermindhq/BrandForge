"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";

export function DirectoryHero() {
  const ticker = [
    "● Match in progress · SaaS founder + lifecycle operator",
    "● New request: Next.js rebuild · Reviewing",
    "● Deal delivered: AI support agent rollout",
  ];

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[#0A0F1E]" />
      <div className="islamic-pattern pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[720px] -translate-x-1/2 rounded-full bg-[#C9A84C]/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#1A6B4A]/20 blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/35 bg-[#C9A84C]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F5F0E8]"
        >
          Curated talent directory · managed by {CONTACT.guarantor}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="landing-gold-line max-w-4xl font-headline text-5xl font-semibold leading-[1.02] text-[#F5F0E8] sm:text-6xl md:text-7xl"
        >
          The team behind the brands winning online.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="mt-8 max-w-3xl text-lg text-[#C9A84C] sm:text-xl"
        >
          Curated operators. Done-for-you packages. One trusted conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-6 text-sm">
            Start a conversation →
          </a>
          <a href="#talent" className="btn-secondary min-h-11 px-6 text-sm">
            See the talent ↓
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#C9BEAA]">Live activity</p>
          <div className="ticker-mask overflow-hidden rounded-lg border border-[#C9A84C]/25 bg-black/20 py-2">
            <div className="ticker-track">
              {[...ticker, ...ticker].map((line, i) => (
                <span key={`${line}-${i}`} className="mx-5 whitespace-nowrap text-xs uppercase tracking-[0.08em] text-[#F5F0E8]/85">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
