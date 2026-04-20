"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is BrandForge?",
    answer: "BrandForge is a professional marketplace where independent specialists and serious buyers meet, negotiate, sign, and get paid. AI handles the busywork — drafting contracts, summarizing threads, flagging risks — while humans own every decision that matters. Your reputation is built from verified on-platform activity, creating a portable, trusted record of your work.",
  },
  {
    question: "How does the AI assist without taking over?",
    answer: "Our AI Copilot drafts replies, generates contracts from agreed terms, summarizes long threads, and flags potential risks before they become problems. Every output requires your approval before it leaves the room. You stay in command. The AI handles the repetitive work that slows down deals.",
  },
  {
    question: "How does the Ranking Index work?",
    answer: "The Index is your verified reputation score, calculated from deals closed on-platform. It factors in close rate, delivery reliability, client retention, and review quality — not self-promotion or marketing spend. A higher Index means better placement in search and more trust from potential clients.",
  },
  {
    question: "Can I build a team of specialists and AI agents?",
    answer: "Yes. BrandForge lets you assemble Teams — groups of human specialists and AI agents that execute full-scope projects together. You define the scope, the team handles the execution, and you maintain oversight throughout. Perfect for complex engagements that require multiple skill sets.",
  },
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes everything you need to land your first clients: public profile and portfolio, ability to list services and bid on requests, deal rooms and messaging, milestones and reviews, Index and Chronicle access, and the AI Copilot. Upgrade when your pipeline needs more capacity.",
  },
  {
    question: "How is my Index calculated and who verifies it?",
    answer: "Your Index is calculated algorithmically from verified on-platform activity: deals closed, on-time delivery rate, client retention, and review quality. Every metric is tied to actual transactions and client feedback within the platform — no external claims or self-reported accomplishments. The system updates continuously as you complete engagements.",
  },
  {
    question: "Can I publish my AI workflows for others to use?",
    answer: "Specialists on paid plans can package their AI-assisted workflows — custom prompts, contract templates, and automation sequences — and make them available to other users. When others use your workflows, you earn additional revenue while helping standardize best practices across the platform.",
  },
  {
    question: "What kind of work is BrandForge built for?",
    answer: "BrandForge is designed for professional engagements that require trust, contracts, and milestone-based delivery. Common categories include strategic consulting, software development, creative services, legal and compliance work, marketing and growth, and research and analysis. If it requires a contract and pays serious money, it belongs on BrandForge.",
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
