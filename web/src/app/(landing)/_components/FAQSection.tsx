"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What can I do as a client on BrandForge?",
    answer: "Post requests, compare offers, counter terms, sign contracts, and manage payments from one place. You do not need separate tools for discovery, negotiation, and execution.",
  },
  {
    question: "How does AI help in client workflows?",
    answer: "AI helps draft briefs, summarize long chats, and generate contract drafts from agreed terms. You stay in control of approvals and final decisions.",
  },
  {
    question: "Can I negotiate before committing?",
    answer: "Yes. Every offer can be accepted, countered, or declined directly in deal chat. Both sides can keep negotiating until the final terms are right.",
  },
  {
    question: "How do contracts and payments work?",
    answer: "When terms are accepted, a contract draft is created in the thread. After both parties approve/sign, payments are handled through the deal flow.",
  },
  {
    question: "Can I still use the platform without a paid plan?",
    answer: "Yes. You can start with core features and upgrade when you need more scale, automation, or team capacity.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-on-surface-variant">
            Everything you need to know about BrandForge
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="surface-card rounded-xl overflow-hidden border border-outline-variant/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-high/50 transition-colors"
              >
                <span className="text-lg font-semibold text-on-surface pr-4">
                  {faq.question}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 transition-transform duration-300">
                  {openIndex === index ? "expand_less" : "expand_more"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-on-surface-variant leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-on-surface-variant">
            Still have questions?{" "}
            <a
              href="mailto:support@brandforge.ai"
              className="text-primary hover:underline font-medium"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
