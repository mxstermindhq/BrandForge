export type StoreCategory = "Templates" | "Kits" | "Guides" | "Tools";

export type StoreProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceUsd: number;
  category: StoreCategory;
  /** Stripe Payment Link or LemonSqueezy checkout — set via env at build time */
  paymentLink: string;
  previewImage: string;
  includes: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  relatedSlugs: readonly string[];
};

const stripe = (envKey: string, fallback: string) =>
  (typeof process !== "undefined" && process.env[envKey]) || fallback;

/** Replace payment links with live Stripe/LemonSqueezy URLs in production. */
export const STORE_PRODUCTS: readonly StoreProduct[] = [
  {
    slug: "discord-launch-kit",
    name: "Discord Launch Kit",
    tagline: "Roles, banners, welcome flow, and announcement templates",
    description:
      "Ship a credible Discord server in days — Figma source files, PNG exports, welcome bot copy, and launch checklist aligned with BrandForge delivery standards.",
    priceUsd: 19,
    category: "Templates",
    paymentLink: stripe("NEXT_PUBLIC_STRIPE_DISCORD_KIT", ""),
    previewImage: "/img/store/discord-launch-kit.webp",
    includes: [
      "Server icon + banner system (Figma + PNG)",
      "Role hierarchy diagram and permission notes",
      "Welcome + rules bot message templates",
      "Launch announcement pack (3 variants)",
    ],
    faqs: [
      {
        question: "How do I use this?",
        answer: "Download after checkout. Import Figma or use PNG exports. Follow the included checklist for bot setup.",
      },
      {
        question: "Can I resell?",
        answer: "No — single-operator license. Agency white-label available via Discord intake.",
      },
      {
        question: "Refund policy?",
        answer: "Digital goods — no refunds once downloaded. Preview screenshots show exactly what you get.",
      },
    ],
    relatedSlugs: ["forum-store-ui-kit", "web3-trust-lander"],
  },
  {
    slug: "forum-store-ui-kit",
    name: "Forum Seller Store UI Kit",
    tagline: "Dark storefront blocks for digital goods operators",
    description:
      "Tailwind-ready sections for category filters, trust callouts, and checkout CTAs — tuned for forum traffic and repeat buyers.",
    priceUsd: 29,
    category: "Kits",
    paymentLink: stripe("NEXT_PUBLIC_STRIPE_FORUM_KIT", ""),
    previewImage: "/img/store/forum-store-ui-kit.webp",
    includes: [
      "Hero, catalog grid, product detail, FAQ blocks",
      "Billgang / crypto checkout CTA patterns",
      "Mobile-first dark theme tokens",
      "Copy snippets for escrow-friendly listings",
    ],
    faqs: [
      {
        question: "Stack required?",
        answer: "HTML + Tailwind classes — paste into Next.js, Astro, or static HTML. No backend included.",
      },
      {
        question: "Can I resell?",
        answer: "No — one brand license. Custom storefront builds: /services/web-design/.",
      },
      {
        question: "Refund policy?",
        answer: "No refunds on digital download. See /portfolio/forum-commerce-hub/ for live example.",
      },
    ],
    relatedSlugs: ["discord-launch-kit", "brand-style-guide-template"],
  },
  {
    slug: "web3-trust-lander",
    name: "Web3 Trust Lander Blocks",
    tagline: "Credible crypto landing sections before paid traffic",
    description:
      "Performance-first hero, proof, FAQ, and CTA modules for Web3 launches — the same patterns used on Cascade-style landings.",
    priceUsd: 39,
    category: "Templates",
    paymentLink: stripe("NEXT_PUBLIC_STRIPE_WEB3_LANDER", ""),
    previewImage: "/img/store/web3-trust-lander.webp",
    includes: [
      "Hero + social proof + roadmap teaser sections",
      "FAQ block with schema-ready copy",
      "Wallet-agnostic CTA patterns",
      "GEO-friendly entity paragraphs",
    ],
    faqs: [
      {
        question: "Includes smart contracts?",
        answer: "No — design and copy blocks only. Engineering: /services/web-design/ or MXSTERMIND bespoke.",
      },
      {
        question: "Can I resell?",
        answer: "Single project license. Multi-project agency license via Discord.",
      },
      {
        question: "Refund policy?",
        answer: "Digital download — all sales final after delivery email sends.",
      },
    ],
    relatedSlugs: ["forum-store-ui-kit"],
  },
  {
    slug: "brand-style-guide-template",
    name: "Brand Style Guide Template",
    tagline: "Figma template for tokens, voice, and export specs",
    description:
      "Operator-ready brand guide shell — colors, type, logo usage, Discord exports, and handoff checklist.",
    priceUsd: 24,
    category: "Guides",
    paymentLink: stripe("NEXT_PUBLIC_STRIPE_STYLE_GUIDE", ""),
    previewImage: "/img/store/brand-style-guide.webp",
    includes: [
      "Figma brand guide template (editable)",
      "PDF export preset",
      "Voice and copy pattern pages",
      "Client handoff checklist",
    ],
    faqs: [
      {
        question: "Need Figma?",
        answer: "Yes — Figma account required. PDF export included for clients without Figma.",
      },
      {
        question: "Custom brand identity?",
        answer: "Template only — full identity: /services/brand-identity/ from $500.",
      },
      {
        question: "Refund policy?",
        answer: "No refunds on digital templates.",
      },
    ],
    relatedSlugs: ["discord-launch-kit"],
  },
] as const;

export function getStoreProduct(slug: string): StoreProduct | undefined {
  return STORE_PRODUCTS.find((p) => p.slug === slug);
}
