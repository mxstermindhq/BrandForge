"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "What is BrandForge and how does it work?",
    answer: (
      <>
        BrandForge is a professional marketplace, trained on three years of real deal-making to be fast,
        accountable, and chaos-free — the trusted platform for clients and builders to do their best work
        together.
        <br />
        <br />
        You can use BrandForge solo or bring your whole team. Brief, negotiate, sign, and ship — all in one place.{" "}
        <Link href="/product/overview" className="text-primary hover:underline">
          Learn more about BrandForge
        </Link>
        .
      </>
    ),
  },
  {
    question: "What should I use BrandForge for?",
    answer:
      "If you can brief it, BrandForge can help you build it. Design, development, AI, Web3, marketing, automation — bring your idea and receive vetted offers from specialists who actually ship. AI copilots handle the admin so you can focus on what matters.",
  },
  {
    question: "How much does it cost?",
    answer: (
      <>
        BrandForge has three plans — Free, Pro ($13/mo), and Agency ($29/mo). The Free plan gets you full
        access to deals, contracts, escrow, and the AI copilot with no payment required.{" "}
        <a href="#pricing" className="text-primary hover:underline">
          See pricing
        </a>
        .
      </>
    ),
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
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
                  <div className="text-on-surface-variant leading-relaxed text-left">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
