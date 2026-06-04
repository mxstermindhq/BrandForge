import type { PortfolioDetail } from "@/types/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

const DEFAULT_FAQ = [
  {
    question: "Can BrandForge build a project like this for my niche?",
    answer:
      "Yes. Send references on Discord or Telegram. Fixed USD quote within 24 hours based on scope — not hourly guesses.",
  },
  {
    question: "Do you sign NDAs?",
    answer: "Yes when required. Public case studies only include approved details.",
  },
  {
    question: "Who owns deliverables?",
    answer: "You do on final payment unless otherwise agreed in writing.",
  },
  {
    question: "Ongoing work after launch?",
    answer: "Retainer tiers (Automator through Full-Stack) or scoped fixes in the same Discord thread.",
  },
] as const;

export function buildPortfolioDetail(project: PortfolioProject): PortfolioDetail {
  const liveLabel = project.url
    ? project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : undefined;

  return {
    slug: project.slug,
    meta: {
      title: `${project.name} Case Study | BrandForge`,
      description: `${project.description.slice(0, 155)}…`,
    },
    name: project.name,
    tag: project.category,
    status: project.status,
    mockupType: project.mockupType,
    brandGradient: project.brandGradient,
    ogImageUrl: project.ogImageUrl,
    liveUrl: project.url,
    liveLabel,
    context: project.brief,
    problem: [
      "Operators in this niche judge credibility in seconds — unclear scope and slow pages kill conversion.",
      "Prior vendors quoted hourly without fixed deliverables or escrow-friendly terms.",
    ],
    delivered: project.built,
    stack: project.stack,
    timeline: project.timeline,
    teamSize: project.teamSize,
    budgetPublic: project.budgetPublic,
    outcomeMetric: project.outcomeMetric,
    outcome: project.outcome,
    visuals: [
      { label: "Hero", caption: `${project.name} primary interface`, mockupType: project.mockupType },
      { label: "Product", caption: "Core user flow and conversion surfaces", mockupType: project.mockupType },
      { label: "Mobile", caption: "Responsive or native surfaces where applicable", mockupType: "phone" },
    ],
    vouch: project.vouch,
    relatedServices: project.relatedServices,
    faqs: DEFAULT_FAQ,
    confidentialNote: project.confidentialNote,
  };
}
