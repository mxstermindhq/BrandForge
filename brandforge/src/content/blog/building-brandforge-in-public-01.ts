import type { FaqItem } from "@/types/content";

const p = (paragraphs: string[]) => ({ paragraphs });

export const BUILD_IN_PUBLIC_01 = {
  slug: "building-brandforge-in-public-01",
  title: "Building BrandForge in Public — Update 01",
  metaTitle: "Building BrandForge in Public — Update 01",
  metaDescription:
    "First build-in-public update: portfolio expansion, visual overhaul, performance work, and what we are shipping next.",
  datePublished: "2026-06-03",
  readingTime: "9 min",
  series: "Build in Public · Series 01",
  sections: [
    {
      heading: "Why we build in public",
      ...p([
        "BrandForge exists for operators who DM first — forum sellers, Web3 founders, SaaS teams, and community owners who want fixed USD packages, not a six-month agency retainer with vague deliverables.",
        "Building in public is not a marketing stunt for us. It is how we show the work: what shipped, what failed, what we learned, and what is in development right now. Transparency builds trust. Trust is the only currency that matters when someone is about to send four figures over escrow.",
        "This is Update 01 — the first in a series where we document the product, the site, and the business the same way we document client delivery.",
      ]),
    },
    {
      heading: "What we have built so far",
      ...p([
        "The BrandForge site at brandforge.gg is a full static Next.js export on Cloudflare — dozens of routes, not a single landing page. You get package hubs, nine service deep-dives, a roadmap platform with per-stage checklists, niche pages for gaming, Web3, SaaS, forums, e-commerce, and creators, ethics standards, a brand guide, and a blog structured for GEO (Generative Engine Optimisation) with FAQ schema on every post.",
        "The portfolio was the weakest link visually. It listed case studies as text cards with placeholder frames. That is honest but not convincing. Operators buy with their eyes first — they want to see live URLs, device frames, and status labels before they read three paragraphs of scope.",
        "Performance was the other pillar. We stripped global motion providers, moved the home page to fully server-rendered sections, and deferred analytics until user interaction so Lighthouse scores reflect real operator experience — not a GSAP demo that tanks mobile.",
      ]),
    },
    {
      heading: "What we shipped in this update",
      ...p([
        "Portfolio overhaul: twenty-one projects with Live, Upcoming, and Archived status — Whiteskyhosting, CarSpotLive, DirectFiber, Drain.cx, Boostingfactory, Fluorite.store, Passle, Dyo Travel, Repsheets, and archived work including Cascade Markets, Jarro AI, LinkedIn automation, ValAccs, and more. Every project gets a case study page with stats, tech stack, mockup frames, and Discord/Telegram CTAs.",
        "Visual system: CSS device mockups (browser, phone, tablet), pulsing status badges, visual stat cards on the home hero, a live-project marquee with favicons, and a six-project preview grid on the homepage.",
        "Conversion pass: a contact strip under the header on every page — two Discord entry points and Telegram — so no page ends without a path to DM us. Blog posts and service pages get mid-page CTAs. Case studies get inline CTAs after the screenshot section.",
        "Blog: confirmed /blog serves BrandForge content (not third-party templates). Added this build-in-public entry as post 01.",
      ]),
    },
    {
      heading: "What is working",
      ...p([
        "Fixed packages reduce friction. When someone knows Brand Sprint vs Launch Stack vs Growth Engine, the Discord message is shorter and quotes are faster.",
        "Showing archived work builds range without pretending every client is still live. Operators respect honesty — \"we delivered, they discontinued\" is still proof.",
        "Static-first architecture improved mobile performance materially. CLS on the home page went to zero. That matters for forum traffic on phones.",
      ]),
    },
    {
      heading: "What we are still figuring out",
      ...p([
        "OG images and screenshots for every project — we use brand gradients where fetch fails, but real product captures will improve conversion further.",
        "Case study depth varies. Flagship builds like CarSpotLive and Drain.cx deserve more screenshots and metrics; we will deepen those next.",
        "Capacity signalling — we added client slots on the hero stats but we need a clearer \"open / waitlist\" story so operators know when to DM without feeling ignored.",
      ]),
    },
    {
      heading: "What is coming next",
      ...p([
        "Deeper case studies for live gaming commerce and mobile apps — more before/after and PageSpeed proof on web builds.",
        "AI Voice Receptionist prototype moving from development to demo-ready — healthcare voice workflows without naming confidential client details.",
        "Crystal Wars — Unity strategy game engagement in negotiation; we will only publish category, engine, and crystal-war.com until terms close.",
        "Build in Public Update 02 — metrics on inbound, quote turnaround, and what we changed after operator feedback.",
      ]),
    },
    {
      heading: "If you are reading this as a potential client",
      ...p([
        "DM us on Discord or Telegram with your niche, deadline, and two reference links. You will get a fixed USD quote within 24 hours. Escrow and crypto are normal for our clients.",
        "If your scope is above packages, mxstermind.com is the premium studio line — we will tell you honestly which door fits.",
        "This series will stay direct — no corporate press release tone. If you want the next update, bookmark /blog/ or open Discord and ask for the build log.",
      ]),
    },
  ],
  faqs: [
    {
      question: "What is BrandForge build in public?",
      answer: "A blog series documenting how we build BrandForge.gg — product, portfolio, performance, and operator lessons.",
    },
    {
      question: "How often will you publish updates?",
      answer: "When meaningful shipping happens — not on a fake weekly calendar.",
    },
    {
      question: "Can I hire BrandForge from these posts?",
      answer: "Yes. Discord or Telegram — fixed quote in 24 hours.",
    },
    {
      question: "Is mxstermind the same team?",
      answer: "Related studio for bespoke work — BrandForge is the fixed-package line at brandforge.gg.",
    },
  ],
} as const satisfies {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  readingTime: string;
  series?: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  faqs: readonly FaqItem[];
};
