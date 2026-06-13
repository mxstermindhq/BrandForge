import type { BlogPost } from "../types";

const p = (paragraphs: string[]) => ({ paragraphs });

export const post: BlogPost = {
  slug: "how-to-pick-the-right-brandforge-tier",
  title: "How to pick the right BrandForge tier",
  metaTitle: "Pick the Right BrandForge Tier | BrandForge",
  metaDescription:
    "Blueprint vs Automator vs MVP Engine — match package tier to stage, capacity limits, and when to escalate to mxstermind.com.",
  datePublished: "2026-06-08",
  readingTime: "9 min",
  category: "Guides",
  tags: ["packages", "pricing", "retainers", "mvp"],
  sections: [
    { heading: "Stage 0: validate", ...p(["No paid proof yet → Blueprint $300–500.", "Logo, lander, funnel structure in 1–2 weeks."]) },
    { heading: "Stage 1: automate ops", ...p(["Manual handoffs eating hours → Automator $1.5k–3k/mo.", "Three active workflows max — see /portfolio/ops-flow-dashboard/."]) },
    { heading: "Stage 2: ship product", ...p(["Need features monthly → MVP Engine $5k/mo.", "CarSpotLive-scale apps quoted separately if larger."]) },
    { heading: "Community + AI", ...p(["Discord + bots + video pipelines → AI & Community $7.5k/mo.", "/for/gaming-server-owners/ for community proof."]) },
    { heading: "Full squad", ...p(["Design + dev + growth concurrently → Full-Stack $10k+/mo.", "Three dedicated work streams."]) },
    { heading: "Compare tables", ...p(["/packages/ comparison table — copy into your brief.", "Delivery timeline on same page."]) },
    { heading: "When packages break", ...p(["Bespoke multi-quarter builds → mxstermind.com.", "BrandForge stays bounded and fast."]) },
    { heading: "Next step", ...p(["Message tier name on Discord — quote in 24h.", "Mention this article for faster routing."]) },
  ],
  relatedServices: [
    { label: "Automation", href: "/services/automation/" },
    { label: "Mobile apps", href: "/services/mobile-apps/" },
  ],
  relatedPortfolio: ["carspotlive", "ops-flow-dashboard"],
  faqs: [
    { question: "Most popular tier?", answer: "Automator for ops-heavy operators — badge on /packages/." },
    { question: "Can I switch tiers?", answer: "Yes — quote new scope when needs change." },
    { question: "Rush delivery?", answer: "Quoted separately — overnight possible for forum clients." },
    { question: "Compare deliverables?", answer: "/packages/ table + home delivery matrix." },
  ],
};
