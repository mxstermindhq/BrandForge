"use client";

import { motion } from "framer-motion";

export function OperationalPulse() {
  const cards = [
    {
      title: "No bidding wars",
      subtitle: "Adl · Fairness",
      body: "No race-to-bottom auction behavior. Scope and fit determine introductions.",
    },
    {
      title: "One thread, right team",
      subtitle: "Amanah · Trust",
      body: "One conversation with mxstermind routes you to the right operator set fast.",
    },
    {
      title: "Verified operators only",
      subtitle: "Curation standard",
      body: "Every visible profile is vetted before it enters the directory.",
    },
  ];

  return (
    <section className="border-y border-[#C9A84C]/20 bg-[#0B1326] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="section-label text-[#C9A84C]">Why Brandforge</p>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, idx) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="rounded-2xl border border-[#C9A84C]/25 bg-[#0E172B] p-6"
            >
              <div className="mb-4 h-8 w-1 rounded-full bg-[#C9A84C]" />
              <p className="text-xs uppercase tracking-[0.12em] text-[#C9A84C]/90">{card.subtitle}</p>
              <h3 className="mt-2 font-headline text-2xl font-semibold text-[#F5F0E8]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#C9BEAA]">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
