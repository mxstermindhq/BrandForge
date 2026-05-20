"use client";

import { motion, useReducedMotion } from "framer-motion";
import { OPERATOR_MEDIA } from "@/content/operator-media";

const metrics = [
  { value: "4", label: "Vetted operators" },
  { value: "12+", label: "Scoped services" },
  { value: "48h", label: "Typical intro window" },
] as const;

function pickQuotes() {
  const quotes: Array<{ quote: string; who: string }> = [];
  for (const media of Object.values(OPERATOR_MEDIA)) {
    const r = media.reviews[0];
    if (r) quotes.push({ quote: r.quote, who: `${r.reviewer} · ${r.context}` });
    if (quotes.length >= 2) break;
  }
  return quotes;
}

export function ProofStrip() {
  const reduced = useReducedMotion();
  const quotes = pickQuotes();

  return (
    <section
      className="border-t px-4 py-14 sm:px-6 lg:px-8"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <motion.ul
            initial={reduced ? false : { opacity: 0 }}
            whileInView={reduced ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-6"
          >
            {metrics.map((m) => (
              <li key={m.label}>
                <p className="font-headline text-3xl font-semibold tabular-nums text-[var(--color-text-primary)] sm:text-4xl">
                  {m.value}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">{m.label}</p>
              </li>
            ))}
          </motion.ul>

          <div className="grid gap-4 sm:grid-cols-2">
            {quotes.map((q, i) => (
              <motion.blockquote
                key={i}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="proof-quote"
              >
                <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">“{q.quote}”</p>
                <footer className="mt-3 text-xs text-[var(--color-text-muted)]">— {q.who}</footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
