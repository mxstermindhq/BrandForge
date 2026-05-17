"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    question: "What is BrandForge?",
    answer:
      "BrandForge is a curated operator network for founders, creators, and online brands who need work done properly. We're not a marketplace where you wade through 80 proposals. We're a directory of vetted specialists managed by mxstermind — he scopes your need, selects the right person, and stands behind the outcome.",
  },
  {
    question: "How do I hire someone or book a package?",
    answer:
      "Start one conversation — Telegram @Notmxstermind or Discord. Describe what you're building or what's broken. mxstermind qualifies the brief, recommends the right operator or package, and manages the introduction. No forms, no bidding, no wasted meetings.",
  },
  {
    question: "Why Telegram / Discord only?",
    answer:
      "Because real deals are made in real conversations — not through contact forms that disappear into inboxes. Telegram and Discord let mxstermind stay in the thread, maintain context, and intervene if anything needs resolving. Slower to start. Much faster to execute.",
  },
  {
    question: "What services do you focus on?",
    answer:
      "Five verticals: AI & Automation, Web & Apps, Content & Social, Growth & Ads, and Branding. Every service has a fixed scope and a clear outcome. If your need doesn't fit a package, we'll scope a custom engagement from scratch.",
  },
  {
    question: "What does the trust score mean?",
    answer:
      "The trust score reflects an operator's delivery history, client feedback, and scope accuracy. It's not a star rating — it's a practical record of reliability and professionalism.",
  },
  {
    question: "What standards do you follow?",
    answer:
      "BrandForge follows strict professional standards: transparency, no deception, clear contracts, no exploitative pricing, and mutual benefit. Every scope and introduction follows these principles.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-headline text-4xl font-semibold text-[#F5F0E8] sm:text-5xl">FAQ</h2>
          <p className="text-lg text-[#8A8070]">How BrandForge works</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="surface-card overflow-hidden rounded-xl border border-[#C9A84C]/22 bg-[#0F172B]">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-[#111C35]"
              >
                <span className="pr-4 text-lg font-semibold text-[#F5F0E8]">{faq.question}</span>
                <span className="material-symbols-outlined shrink-0 text-[#8A8070]">
                  {openIndex === index ? "expand_less" : "expand_more"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index ? (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-left leading-relaxed text-[#8A8070]">{faq.answer}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
