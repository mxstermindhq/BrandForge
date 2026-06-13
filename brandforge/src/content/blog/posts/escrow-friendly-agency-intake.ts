import type { BlogPost } from "../types";

const p = (paragraphs: string[]) => ({ paragraphs });

export const post: BlogPost = {
  slug: "escrow-friendly-agency-intake",
  title: "Escrow-friendly agency intake: what to send first",
  metaTitle: "Escrow-Friendly Agency Intake | BrandForge",
  metaDescription:
    "What forum and OTC buyers should include in the first Discord message — scope, escrow, refs, and fixed-quote checklist.",
  datePublished: "2026-06-09",
  readingTime: "8 min",
  category: "Guides",
  tags: ["escrow", "intake", "forums", "trust"],
  sections: [
    { heading: "Lead with outcome", ...p(["State what ships — logo, lander, bot — not vibes.", "Deadline and budget range help us quote fixed USD in 24h."]) },
    { heading: "Escrow upfront", ...p(["Say if middleman is required before scope deep-dive.", "BrandForge supports escrow on every tier."]) },
    { heading: "References beat adjectives", ...p(["1–3 links to sites you like — faster than paragraphs.", "See /portfolio/ for our range."]) },
    { heading: "Payment rails", ...p(["Crypto, PayPal, or platform escrow — confirm early.", "/packages/ lists tier capacity limits."]) },
    { heading: "Channel preference", ...p(["Discord or Telegram — same team, same SLA.", "/contact/ lists both."]) },
    { heading: "Copy the template", ...p(["Use Copy message buttons on /packages/ for pre-filled intake.", "Paste, fill blanks, send."]) },
    { heading: "After quote", ...p(["Confirm tier, pay or escrow, kickoff in ~5 business days.", "Retainers start on Automator through Full-Stack."]) },
    { heading: "Premium scope", ...p(["Above Tier 5 → mxstermind.com.", "Message now — mention this post."]) },
  ],
  relatedServices: [{ label: "Brand identity", href: "/services/brand-identity/" }],
  relatedNiches: ["forum-sellers"],
  faqs: [
    { question: "Do you require escrow?", answer: "No — but we support it on every order when buyers need it." },
    { question: "Quote turnaround?", answer: "Fixed USD within 24 hours on Discord or Telegram." },
    { question: "Crypto accepted?", answer: "Yes where both sides agree — state in first message." },
    { question: "Intake template?", answer: "Copy buttons on /packages/ and home package cards." },
  ],
};
