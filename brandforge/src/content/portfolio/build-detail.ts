import { SCREENSHOT_GALLERY } from "@/content/portfolio/screenshot-manifest";
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

const GALLERY_VISUAL_LABELS: Partial<
  Record<string, readonly { label: string; caption: string; mockupType?: PortfolioDetail["mockupType"] }[]>
> = {
  carspotlive: [
    { label: "Home", caption: "App home and discovery", mockupType: "phone" },
    { label: "Spot feed", caption: "Live spotting feed", mockupType: "phone" },
    { label: "Map", caption: "Real-time map and pins", mockupType: "phone" },
    { label: "Profile", caption: "User profile and garage", mockupType: "phone" },
    { label: "Capture", caption: "Spot capture flow", mockupType: "phone" },
    { label: "Community", caption: "Social and community surfaces", mockupType: "phone" },
  ],
  whiteskyhosting: [
    { label: "Home", caption: "Hosting homepage and hero", mockupType: "browser" },
    { label: "Plans", caption: "VPS plan comparison and pricing", mockupType: "browser" },
    { label: "Product", caption: "Product detail and trust surfaces", mockupType: "browser" },
    { label: "Mobile", caption: "Responsive layout on smaller viewports", mockupType: "browser" },
  ],
  "drain-cx": [
    { label: "Storefront", caption: "Gaming tools storefront hero", mockupType: "browser" },
    { label: "Catalog", caption: "Game-specific product categories", mockupType: "browser" },
    { label: "Product", caption: "Product page and purchase flow", mockupType: "browser" },
    { label: "Support", caption: "FAQ and buyer trust content", mockupType: "browser" },
  ],
  directfiber: [
    { label: "Portal", caption: "Enterprise ISP customer portal", mockupType: "browser" },
    { label: "Plans", caption: "Plan management and billing views", mockupType: "browser" },
    { label: "Usage", caption: "Usage dashboards for account holders", mockupType: "browser" },
    { label: "Admin", caption: "Admin and account management surfaces", mockupType: "browser" },
  ],
  boostingfactory: [
    { label: "Home", caption: "Boosting storefront hero", mockupType: "browser" },
    { label: "Catalog", caption: "Multi-game service catalog", mockupType: "browser" },
    { label: "Order", caption: "Order flow and SKU selection", mockupType: "browser" },
    { label: "Trust", caption: "Trust signals and checkout surfaces", mockupType: "browser" },
  ],
  "fluorite-store": [
    { label: "Storefront", caption: "Fluorite.store gaming tools hero", mockupType: "browser" },
    { label: "Catalog", caption: "MLBB, Free Fire, and COD Mobile products", mockupType: "browser" },
    { label: "Product", caption: "Product detail and delivery UX", mockupType: "browser" },
  ],
};

function buildVisuals(
  project: PortfolioProject,
): PortfolioDetail["visuals"] {
  const gallery = SCREENSHOT_GALLERY[project.slug];
  const custom = GALLERY_VISUAL_LABELS[project.slug];

  if (gallery?.length) {
    if (custom?.length) {
      return custom.slice(0, gallery.length);
    }
    return gallery.map((_, index) => ({
      label: index === 0 ? "Hero" : `Screen ${index + 1}`,
      caption: `${project.name} product surface ${index + 1}`,
      mockupType: project.mockupType,
    }));
  }

  return [
    { label: "Hero", caption: `${project.name} primary interface`, mockupType: project.mockupType },
    { label: "Product", caption: "Core user flow and conversion surfaces", mockupType: project.mockupType },
    { label: "Mobile", caption: "Responsive or native surfaces where applicable", mockupType: "phone" },
  ];
}

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
    visuals: buildVisuals(project),
    vouch: project.vouch,
    relatedServices: project.relatedServices,
    faqs: DEFAULT_FAQ,
    confidentialNote: project.confidentialNote,
  };
}
