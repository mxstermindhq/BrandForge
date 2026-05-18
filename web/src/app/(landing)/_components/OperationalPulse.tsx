"use client";

import { motion } from "framer-motion";

export function OperationalPulse() {
  const cards = [
    {
      title: "No bidding wars",
      subtitle: "Fairness standard",
      body: "Introductions are made on fit and scope — not who paid to appear first. Every operator earns visibility through delivery, not ad spend.",
    },
    {
      title: "One thread, right team",
      subtitle: "Trust standard",
      body: "Message mxstermind once. He qualifies the brief, selects the operator, and manages the relationship. You never chase strangers in a cold inbox again.",
    },
    {
      title: "Verified operators only",
      subtitle: "Curation standard",
      body: "Every profile is manually reviewed before it enters the directory. You only see people who have proven they can execute — full stop.",
    },
  ];

  return (
    <section className="border-y px-4 py-16 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 font-headline text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Three reasons serious builders choose us.
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, idx) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="rounded-2xl border p-8"
              style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}
            >
              <div className="mb-4 h-8 w-1 rounded-full bg-[var(--color-gold)]" />
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-gold)]">{card.subtitle}</p>
              <h3 className="mt-2 font-headline text-2xl font-semibold text-[var(--color-text-primary)]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
