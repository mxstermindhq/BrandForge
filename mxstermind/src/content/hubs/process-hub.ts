import type { FaqItem } from "@/types/content";

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Application",
    body: "You reach out on Discord or Telegram with outcome, deadline, and budget band. No intake forms — a human reads it.",
  },
  {
    step: "02",
    title: "Fit call",
    body: "We confirm alignment on scope class, timeline, and team shape. If mxstermind is not the right fit, we say so and may point to BrandForge packages.",
  },
  {
    step: "03",
    title: "Fixed scope document",
    body: "Deliverables, milestones, USD price, and payment schedule in writing. Escrow and crypto options when required.",
  },
  {
    step: "04",
    title: "Build & review",
    body: "Daily or weekly updates in-thread depending on engagement size. Stakeholders review against the scope doc — not surprise invoices.",
  },
  {
    step: "05",
    title: "Handoff",
    body: "Repos, design files, deploy access, and a short runbook. Retainer or phase-two quoted separately if needed.",
  },
] as const;

export const PROCESS_FAQ: readonly FaqItem[] = [
  {
    question: "How long does scoping take?",
    answer: "Initial reply within 24 hours. Fixed scope document typically within 3–5 business days after fit confirmation.",
  },
  {
    question: "Do you work on retainer?",
    answer: "Yes for established clients post-launch. Retainer scope is defined monthly with caps on concurrent workstreams.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "USD bank transfer, escrow platforms, and crypto — spelled out in the scope document before deposit.",
  },
  {
    question: "Can legal or procurement review your terms?",
    answer: "Yes. We work with established businesses regularly and accommodate MSAs and NDAs when required.",
  },
];
