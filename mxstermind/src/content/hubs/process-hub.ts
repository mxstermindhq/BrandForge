import type { FaqItem } from "@/types/content";

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Apply for OS access",
    body: "Reach out on Discord or Telegram with stage, revenue model, and OS needs. No intake forms — a human reads it.",
  },
  {
    step: "02",
    title: "OS fit review",
    body: "We confirm which modules fit — monetization, ops, growth — and whether mxstermind is the right layer. If not, we point to BrandForge packages.",
  },
  {
    step: "03",
    title: "OS scope document",
    body: "Deliverables, milestones, USD price, and payment schedule in writing. Escrow and crypto options when required.",
  },
  {
    step: "04",
    title: "Build & wire",
    body: "Daily or weekly updates in-thread. You review against the scope doc — systems shipped, not slide decks.",
  },
  {
    step: "05",
    title: "Handoff & operate",
    body: "Repos, runbooks, deploy access, and operator docs. Phase-two OS modules quoted separately if needed.",
  },
] as const;

export const PROCESS_FAQ: readonly FaqItem[] = [
  {
    question: "How long does OS scoping take?",
    answer: "Initial reply within 24 hours. OS scope document typically within 3–5 business days after fit confirmation.",
  },
  {
    question: "Do you work on retainer?",
    answer: "Yes for established Founder OS clients post-launch. Retainer scope is defined monthly with caps on concurrent workstreams.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "USD bank transfer, escrow platforms, and crypto — spelled out in the scope document before deposit.",
  },
  {
    question: "Can legal or procurement review your terms?",
    answer: "Yes. We work with established operators regularly and accommodate MSAs and NDAs when required.",
  },
];
