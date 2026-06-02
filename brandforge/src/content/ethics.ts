import type { EthicsSectionData, FaqItem } from "@/types/content";

export const BF_ETHICS_SECTIONS: readonly EthicsSectionData[] = [
  {
    id: "client",
    title: "Client standards",
    body: [
      "Discord and Telegram are where quotes and delivery happen — no intake forms, no calendar bait. You get a human reply within 24 hours on quotes; active builds get same-day thread updates when capacity allows.",
      "You know who is designing and who is building. We do not swap in anonymous freelancers after deposit.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery standards",
    body: [
      "Done means the quote list is shipped: files, access, and a short handoff note. Extra requests get a new line item before work continues.",
      "Revisions are capped in writing so scope does not drift. Forum operators buy fixed — we keep it that way.",
    ],
  },
  {
    id: "financial",
    title: "Financial standards",
    body: [
      "USD quotes with escrow and crypto options spelled out up front. Milestones match deliverables you can verify before release.",
      "Refunds if we miss an agreed milestone and cannot fix in the cure window stated in your quote. Deposits after sign-off reserve capacity — non-refundable unless we fail delivery.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy standards",
    body: [
      "Your files stay yours. Least-privilege access during build; revoke on handoff. NDA on request.",
      "We do not train public models on your private assets without written yes. IP transfers on final payment for that milestone.",
    ],
  },
  {
    id: "quality",
    title: "Quality standards",
    body: [
      "We do not ship scam pages, fake vouches, or impersonation brands. Web deliverables target agreed performance budgets.",
      "We refuse work that exists to defraud buyers — full stop.",
    ],
  },
  {
    id: "community",
    title: "Community standards",
    body: [
      "Real vouches only with permission. Competitors get respect — we compete on output, not slurs in public channels.",
      "BrandForge and mxstermind are labeled honestly: packages here, bespoke there. Same team, different fit.",
    ],
  },
];

export const BF_ETHICS_FAQ: readonly FaqItem[] = [
  {
    question: "What are BrandForge ethics and standards?",
    answer:
      "Operational rules on replies, delivery, payments, privacy, quality, and conduct — written for forum and operator buyers. mxstermind.com publishes the same philosophy in a more formal tone for established businesses.",
  },
  {
    question: "How do refunds work at BrandForge?",
    answer:
      "Missed written milestones get a cure period; if we still fail, that milestone refunds per quote. Approved stages release payment.",
  },
  {
    question: "Who owns files?",
    answer: "You, on final payment, plus listed third-party licenses.",
  },
  {
    question: "Is this different from mxstermind ethics?",
    answer: "Same backbone — BrandForge states it direct; Studio states it for longer bespoke engagements.",
  },
];
