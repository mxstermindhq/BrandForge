import type { BlogPost } from "../types";

const p = (paragraphs: string[]) => ({ paragraphs });

export const post: BlogPost = {
  slug: "complete-guide-forum-seller-reputation",
  title: "The complete guide to forum seller reputation",
  metaTitle: "Forum Seller Reputation Guide | BrandForge",
  metaDescription:
    "How marketplace operators build vouches, trust UX, and brand consistency on HF, Voided, and niche forums — without looking like a reskin.",
  datePublished: "2026-06-11",
  readingTime: "13 min",
  category: "Forums",
  tags: ["forums", "reputation", "vouches", "e-commerce", "trust"],
  ogImage: "/img/og-image.png",
  sections: [
    {
      heading: "Reputation is the product",
      ...p([
        "On forum marketplaces your vouch thread is your balance sheet. Buyers scroll past stores that look unfunded — no matter how good fulfillment is.",
        "BrandForge builds identity, store UX, and trust copy for operators who sell through escrow culture — see /for/forum-sellers/.",
      ]),
    },
    {
      heading: "The three-second store test",
      ...p([
        "Header, category clarity, payment rails, and escrow callout must read before scroll. Dark templates with buried pricing kill conversion.",
        "Case study: /portfolio/valaccs/ — multi-category gaming store with Billgang checkout.",
      ]),
    },
    {
      heading: "Vouch velocity without spam",
      ...p([
        "Ask at delivery — not weeks later. Short, specific vouches beat generic praise. Screenshot proof for high-ticket deals when rules allow.",
        "Never buy vouches — moderators and buyers pattern-match fake threads.",
      ]),
    },
    {
      heading: "Rebrand after a dispute",
      ...p([
        "You can recover with new GFX, clearer policies, and consistent delivery — but only if the product matches the new look.",
        "Our /services/brand-identity/ sprint includes dispute-aware copy blocks for FAQs.",
      ]),
    },
    {
      heading: "GFX pipeline between orders",
      ...p([
        "Operators who fulfill manually often neglect banners and thread headers. Batch GFX quarterly so every launch looks fresh.",
        "The Blueprint tier ships logo, lander, and social templates in 1–2 weeks.",
      ]),
    },
    {
      heading: "Forum marketing that still works in 2026",
      ...p([
        "Value posts, case studies, and honest scope threads outperform cold bumps. See /blog/forum-marketing-2026-what-still-works/ for channel specifics.",
        "Link one URL everywhere — split domains confuse buyers and SEO.",
      ]),
    },
    {
      heading: "Payment and escrow copy",
      ...p([
        "State accepted rails above the fold: crypto, middleman, platform escrow. Ambiguity reads as scam.",
        "BrandForge quotes fixed USD within 24 hours on Discord — same channel you use for client intake.",
      ]),
    },
    {
      heading: "Scale without losing trust",
      ...p([
        "When volume grows, automate intake and status — not vouch quality. The Automator retainer covers n8n flows for order routing.",
        "Message scope on Discord — mention this guide for faster quoting.",
      ]),
    },
  ],
  relatedServices: [
    { label: "Brand identity", href: "/services/brand-identity/" },
    { label: "Web design", href: "/services/web-design/" },
  ],
  relatedPortfolio: ["valaccs", "forum-commerce-hub", "whiteskyhosting"],
  relatedNiches: ["forum-sellers", "ecommerce-brands"],
  faqs: [
    {
      question: "How fast can I rebrand a forum store?",
      answer: "Blueprint tier typically 1–2 weeks for logo, lander, and store headers.",
    },
    {
      question: "Do you understand escrow culture?",
      answer: "Yes — vouches, middleman, and dispute-aware copy are normal for our forum clients.",
    },
    {
      question: "Can you match marketplace rules?",
      answer: "You confirm compliance — we design within your platform constraints.",
    },
    {
      question: "Best first investment for new sellers?",
      answer: "Brand Sprint + simple lander — expand catalog GFX after first sales proof.",
    },
  ],
};
