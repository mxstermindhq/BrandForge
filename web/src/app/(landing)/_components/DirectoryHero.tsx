"use client";

import { motion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";

export function DirectoryHero() {
  const ticker = [
    "● Founder matched · lifecycle operator · 2 min ago",
    "● New scope: Next.js rebuild · Under review",
    "● Deal delivered: AI support agent · Approved",
    "● UGC retainer filled · 3 operators shortlisted",
  ];

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-[#F8F6F1] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[#F8F6F1]" />
      <div className="geometric-pattern pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[720px] -translate-x-1/2 rounded-full bg-[#A67C2E]/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#1F7A4D]/10 blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#A67C2E]/30 bg-[#A67C2E]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C4620]"
        >
          Curated talent · Verified operators · Managed by {CONTACT.guarantor}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="landing-gold-line max-w-4xl font-headline text-5xl font-semibold leading-[1.02] text-[#1F2937] sm:text-6xl md:text-7xl"
        >
          The team behind the brands winning online.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="mt-8 max-w-3xl text-lg text-[#6B7280] sm:text-xl"
        >
          Most agencies waste your time with proposals. We waste nothing. One conversation with mxstermind routes you
          to the right operator — scoped, trusted, and ready to execute.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-xs uppercase tracking-[0.12em] text-[#8A6A27]"
        >
          No bidding. No spam briefs. No hidden fees. Your word is honoured here.
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
            See who's available ↓
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[#7B6E54]">Live activity</p>
          <div className="ticker-mask overflow-hidden rounded-lg border border-[#A67C2E]/20 bg-white py-2">
            <div className="ticker-track">
              {[...ticker, ...ticker].map((line, i) => (
                <span key={`${line}-${i}`} className="mx-5 whitespace-nowrap text-xs uppercase tracking-[0.08em] text-[#374151]">
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
