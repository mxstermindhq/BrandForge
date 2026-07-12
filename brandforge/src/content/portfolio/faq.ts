import type { FaqItem } from "@/types/content";

export const PORTFOLIO_HUB_FAQ: readonly FaqItem[] = [
  {
    question: "Are these live projects I can verify?",
    answer:
      "Live entries link to production URLs or app stores. Archived projects were delivered then discontinued by clients — still proof of range.",
  },
  {
    question: "Can BrandForge build something similar?",
    answer: "Yes. Send references on Discord or Telegram — fixed quote within 24 hours.",
  },
  {
    question: "Why show archived work?",
    answer:
      "Archived projects prove delivery depth across Web3, gaming, AI, and enterprise — even when clients later shut down.",
  },
  {
    question: "Who builds portfolio projects?",
    answer: "One coordinated BrandForge team — design, development, and growth under one roof.",
  },
] as const;
