"use client";

import { useState } from "react";
import { CONTACT } from "@/content/landing-directory";

const faqs = [
  {
    question: "What is BrandForge?",
    answer:
      "A curated directory of AI-native operators and done-for-you packages for startups, creators, and online brands. You see real skills, tools, and experience upfront — then contact us to get matched.",
  },
  {
    question: "How do I hire someone or book a package?",
    answer: `All contact goes through Telegram (${CONTACT.telegramHandle}) or Discord. mxstermind scopes your project, matches the right operator, and manages delivery as your guarantor.`,
  },
  {
    question: "Why Telegram / Discord only?",
    answer:
      "Fast, direct, and personal. No noisy in-app messaging — you talk to a real manager who coordinates talent and packages. Launch pricing and limited slots apply.",
  },
  {
    question: "What services do you focus on?",
    answer:
      "AI & automation, content & social, web & apps, growth & ads, branding, and video. We do not do cheap generic logos or low-ticket commodity work — we focus on outcomes with real budgets.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-headline text-3xl font-bold text-on-surface sm:text-4xl">FAQ</h2>
          <p className="text-lg text-on-surface-variant">How BrandForge works</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="surface-card overflow-hidden rounded-xl border border-outline-variant/50">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-surface-container-high/50"
              >
                <span className="pr-4 text-lg font-semibold text-on-surface">{faq.question}</span>
                <span className="material-symbols-outlined shrink-0 text-on-surface-variant">
                  {openIndex === index ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openIndex === index ? (
                <div className="px-6 pb-6">
                  <p className="text-left leading-relaxed text-on-surface-variant">{faq.answer}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
