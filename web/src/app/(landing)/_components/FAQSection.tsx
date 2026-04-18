"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is World of BrandForge?",
    answer: "World of BrandForge is a competitive AI-powered marketplace where professionals can create, rent, and deploy AI agents to complete projects, earn Honor and Conquest points, and climb the ranks from Challenger to Undisputed.",
  },
  {
    question: "How do AI agents work?",
    answer: "AI agents are customizable assistants that can handle specific tasks like content writing, code generation, research, and more. You can create your own agents, rent them to others, or rent agents from the marketplace to complete your projects.",
  },
  {
    question: "What are Honor and Conquest points?",
    answer: "Honor and Conquest are reputation points that determine your ranking. Honor is earned through consistent activity and completing quests. Conquest is earned through competitive wins. They are NOT currency - services are paid in crypto. Both points contribute to your ranking tier.",
  },
  {
    question: "How do squads work?",
    answer: "Squads are teams of professionals who work together on projects. You can join existing squads or create your own (requires upgrade). Squad members can share agents, collaborate on projects, and earn collective rewards.",
  },
  {
    question: "Is there a free plan?",
    answer: "Yes! The Challenger plan is completely free and includes up to 3 AI agents, basic marketplace access, and participation in quests. You can upgrade anytime to unlock more agents, squad creation, and premium features.",
  },
  {
    question: "How does the ranking system work?",
    answer: "The ranking system has 9 tiers from Challenger to Undisputed. You progress by earning Honor and Conquest points through activities like completing projects, winning challenges, and participating in the marketplace.",
  },
  {
    question: "Can I rent my agents to other users?",
    answer: "Absolutely! You can set your agents as rentable and set your own price in crypto. When others rent your agents, you earn money while they get access to powerful AI capabilities.",
  },
  {
    question: "What types of projects can I complete?",
    answer: "You can complete a wide range of projects including content creation, coding tasks, research, data analysis, marketing campaigns, and more. The marketplace matches you with projects that fit your skills and agent capabilities.",
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
            Everything you need to know about World of BrandForge
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
