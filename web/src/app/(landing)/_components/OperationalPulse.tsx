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
    <section className="border-y border-[#A67C2E]/16 bg-[#FCFAF5] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 font-headline text-4xl font-semibold text-[#1F2937] sm:text-5xl">
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
              className="rounded-2xl border border-[#A67C2E]/16 bg-white p-8"
            >
              <div className="mb-4 h-8 w-1 rounded-full bg-[#A67C2E]" />
              <p className="text-xs uppercase tracking-[0.12em] text-[#8A6A27]">{card.subtitle}</p>
              <h3 className="mt-2 font-headline text-2xl font-semibold text-[#1F2937]">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
