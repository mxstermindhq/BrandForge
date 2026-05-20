"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CONTACT } from "@/content/landing-directory";

const steps = [
  { n: "01", title: "Describe your need", body: "One message with budget, timeline, and outcome." },
  { n: "02", title: "mxstermind reviews fit", body: `${CONTACT.guarantor} scopes scope and shortlists operators.` },
  { n: "03", title: "Intro to the operator", body: "Warm handoff — no cold outreach or bidding wars." },
  { n: "04", title: "Scoped kickoff", body: "Fixed package or clear hourly frame before work starts." },
] as const;

export function ProcessTimeline() {
  const reduced = useReducedMotion();

  return (
    <section
      id="process"
      className="scroll-mt-24 border-t px-4 py-16 sm:px-6 lg:px-8"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)]">How it works</p>
        <h2 className="mt-3 max-w-xl font-headline text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">
          One conversation. No marketplace noise.
        </h2>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.li
              key={step.n}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="process-step"
            >
              <span className="process-step-num">{step.n}</span>
              <h3 className="mt-4 font-headline text-lg font-semibold text-[var(--color-text-primary)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
