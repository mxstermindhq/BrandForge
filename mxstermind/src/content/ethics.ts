import type { EthicsSectionData, FaqItem } from "@/types/content";

export const MM_ETHICS_SECTIONS: readonly EthicsSectionData[] = [
  {
    id: "selective",
    title: "Selective engagements",
    body: [
      "mxstermind takes a limited number of concurrent builds. We decline work that does not fit capacity, ethics, or outcome clarity — even when budget is attractive.",
      "BrandForge packages remain the faster path for operators who want defined tiers. mxstermind is for custom scope when product, engineering, and growth must move together.",
    ],
  },
  {
    id: "client",
    title: "Client standards",
    body: [
      "Discord and Telegram are the primary channels — no calendar funnels or account-manager theatre. You speak with people who ship.",
      "Named contributors on your engagement. We do not swap in anonymous freelancers after deposit without disclosure.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery standards",
    body: [
      "Done means the signed scope list is delivered: code, design files, access, and documentation. Change requests receive a new line item before work continues.",
      "Milestones map to verifiable outputs — staging URLs, testflight builds, or merged PRs — not vague progress percentages.",
    ],
  },
  {
    id: "financial",
    title: "Financial standards",
    body: [
      "Fixed USD quotes with milestone payments. Escrow and crypto available when required by your finance team.",
      "Refunds apply when we miss an agreed milestone and cannot cure within the window stated in your scope document.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy & IP",
    body: [
      "Your assets stay yours. Least-privilege access during build; revoke on handoff. NDAs standard for established businesses.",
      "We do not train public models on your private data without written consent. IP transfers on final payment per milestone.",
    ],
  },
  {
    id: "quality",
    title: "Quality & conduct",
    body: [
      "We refuse fraud, impersonation, and scam infrastructure — regardless of budget.",
      "Public case studies and vouches use real permissioned quotes only. Competitors are treated with professional respect in all channels.",
    ],
  },
];

export const MM_ETHICS_FAQ: readonly FaqItem[] = [
  {
    question: "What are mxstermind ethics and standards?",
    answer:
      "Six written sections covering selective intake, delivery, payments, privacy, quality, and conduct — aligned with BrandForge philosophy but tuned for bespoke business engagements.",
  },
  {
    question: "How is mxstermind related to BrandForge?",
    answer:
      "Same team, different offer. BrandForge.gg ships productized packages; mxstermind.com handles custom scope for established businesses and serious founders.",
  },
  {
    question: "Do you sign enterprise MSAs?",
    answer: "Yes when required. Standard scope documents cover most engagements; legal review is welcome before deposit.",
  },
  {
    question: "Where do I report a concern?",
    answer: "Discord or Telegram — same channels as sales. Leadership reads ethics concerns directly.",
  },
];
