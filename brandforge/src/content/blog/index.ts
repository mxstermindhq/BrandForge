import type { FaqItem } from "@/types/content";
import { BLOG_EXTRA_SECTIONS } from "./extra-sections";
import { BLOG_EXTRA_SECTIONS_2 } from "./extra-sections-2";

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  readingTime: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  faqs: readonly FaqItem[];
};

const p = (paragraphs: string[]) => ({ paragraphs });

export const BLOG_POSTS: Record<string, BlogPost> = {
  "how-to-build-a-brand-from-scratch-2026": {
    slug: "how-to-build-a-brand-from-scratch-2026",
    title: "How to build a brand from scratch in 2026",
    metaTitle: "Build a Brand From Scratch 2026 | BrandForge",
    metaDescription:
      "Operator guide: positioning, identity, Discord, and lander — without agency fluff.",
    datePublished: "2026-05-18",
    readingTime: "12 min",
    sections: [
      {
        heading: "Start with the buyer screenshot",
        ...p([
          "Your brand is what strangers assume in three seconds on a Discord banner or store header. In 2026 that is still true for forum sellers, Web3 founders, and SaaS operators — only the channels multiplied.",
          "BrandForge builds from that screenshot backward: positioning line, tokens, exports, then web. mxstermind.com picks up when you need bespoke systems across product and growth.",
        ]),
      },
      {
        heading: "Sequence that saves money",
        ...p([
          "Validate with a plain lander. Ship identity with bounded revisions. Launch with one URL everywhere. Grow with FAQ-rich pages — see /roadmap/ and /services/seo-growth/.",
        ]),
      },
    ],
    faqs: [
      {
        question: "How much does a new brand cost in 2026?",
        answer: "BrandForge Brand Sprint from $500 — quote in 24h on Discord.",
      },
      {
        question: "Can I skip validation?",
        answer: "Only if you already have paid proof — otherwise you are guessing.",
      },
      {
        question: "GEO and brand?",
        answer: "Consistent entity names and FAQ blocks help AI cite you — part of launch.",
      },
      {
        question: "Related services?",
        answer: "/services/brand-identity/ and /packages/.",
      },
    ],
  },

  "what-is-geo-generative-engine-optimisation": {
    slug: "what-is-geo-generative-engine-optimisation",
    title: "What is GEO (Generative Engine Optimisation)?",
    metaTitle: "What Is GEO? Generative Engine Optimisation",
    metaDescription:
      "GEO earns AI citations with FAQs, schema, and entity-clear copy — BrandForge explains for operators.",
    datePublished: "2026-05-16",
    readingTime: "11 min",
    sections: [
      {
        heading: "GEO vs SEO",
        ...p([
          "SEO fights for blue links. GEO fights for paragraph citations when buyers ask ChatGPT, Perplexity, or Google AI which agency to hire.",
          "BrandForge structures every service page with FAQs and JSON-LD. That is not decoration — it is how generative engines extract trustworthy answers.",
        ]),
      },
    ],
    faqs: [
      {
        question: "What is GEO in marketing?",
        answer:
          "Optimising pages so AI assistants can quote accurate, self-contained answers about your brand.",
      },
      {
        question: "Does BrandForge do GEO?",
        answer: "Yes — /services/seo-growth/ includes GEO architecture.",
      },
      {
        question: "Quick win?",
        answer: "Add four real FAQs per page with schema — start with /services/.",
      },
      {
        question: "mxstermind and GEO?",
        answer: "Studio sites use the same discipline with editorial tone.",
      },
    ],
  },

  "discord-server-branding-complete-guide": {
    slug: "discord-server-branding-complete-guide",
    title: "Discord server branding — complete guide",
    metaTitle: "Discord Server Branding Guide | BrandForge",
    metaDescription: "Roles, banners, onboarding, and GFX for gaming and trading servers.",
    datePublished: "2026-05-14",
    readingTime: "13 min",
    sections: [
      {
        heading: "Structure before GFX",
        ...p([
          "Channels, roles, and rules clarity beat a pretty banner with chaos underneath. BrandForge Discord branding service covers layout plus art.",
          "Link to /services/discord-branding/ and /for/gaming-server-owners/ for niche proof.",
        ]),
      },
    ],
    faqs: [
      {
        question: "How much is Discord branding?",
        answer: "Quoted fixed USD on Discord — scoped by server size and asset list.",
      },
      {
        question: "Bots included?",
        answer: "Verification bots are separate automation scope — see portfolio.",
      },
      {
        question: "FiveM servers?",
        answer: "Yes — send references.",
      },
      {
        question: "Timeline?",
        answer: "Often one to two weeks for full kit.",
      },
    ],
  },

  "how-to-build-a-web-store-gaming-community": {
    slug: "how-to-build-a-web-store-gaming-community",
    title: "How to build a web store for a gaming community",
    metaTitle: "Gaming Community Web Store Guide",
    metaDescription: "Trust, checkout, and catalog UX for community stores.",
    datePublished: "2026-05-12",
    readingTime: "12 min",
    sections: [
      {
        heading: "Trust before theme",
        ...p([
          "ValAccs-style stores win on clarity: what you get, how fast, how disputes work. BrandForge builds operator storefronts with escrow-friendly copy.",
          "See /portfolio/valaccs/ and /for/gaming-server-owners/.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Shopify or custom?",
        answer: "Scoped per quote — control vs speed.",
      },
      {
        question: "Payment methods?",
        answer: "Crypto and traditional — you approve processors.",
      },
      {
        question: "Package fit?",
        answer: "Launch Stack for many stores.",
      },
      {
        question: "Ads after launch?",
        answer: "/services/paid-ads/.",
      },
    ],
  },

  "forum-marketing-2026-what-still-works": {
    slug: "forum-marketing-2026-what-still-works",
    title: "Forum marketing in 2026 — what still works",
    metaTitle: "Forum Marketing 2026 | BrandForge",
    metaDescription: "Vouches, threads, and proof patterns that still convert.",
    datePublished: "2026-05-10",
    readingTime: "10 min",
    sections: [
      {
        heading: "Proof beats posts",
        ...p([
          "Forums reward verified delivery and escrow discipline — not AI-generated thread spam. BrandForge clients lead with live URLs and case studies.",
          "Read /for/forum-sellers/ and ethics page before you advertise.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Do forums still work?",
        answer: "Yes where vouches and escrow culture remain — match the venue.",
      },
      {
        question: "What to avoid?",
        answer: "Fake vouches and bump bots — we refuse that work.",
      },
      {
        question: "Brand help?",
        answer: "Brand Sprint before you bump a dead thread.",
      },
      {
        question: "Growth Engine?",
        answer: "Retainer for ongoing content and SEO support.",
      },
    ],
  },

  "how-we-built-carspotlive-mobile-app-case-study": {
    slug: "how-we-built-carspotlive-mobile-app-case-study",
    title: "How we built CarSpotLive",
    metaTitle: "CarSpotLive Case Study | BrandForge Blog",
    metaDescription: "Mobile app delivery — maps, Firebase, App Store 2024.",
    datePublished: "2026-05-08",
    readingTime: "12 min",
    sections: [
      {
        heading: "Product scope",
        ...p([
          "Real-time spotting needed maps performance and store compliance — not a template app. Full write-up at /portfolio/carspotlive/.",
          "Mobile service line: /services/mobile-apps/.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Is CarSpotLive live?",
        answer: "Yes on App Store — link in portfolio case.",
      },
      {
        question: "Quote a similar app?",
        answer: "Discord with feature list and deadline.",
      },
      {
        question: "Android too?",
        answer: "Same engagement scope — stated in quote.",
      },
      {
        question: "mxstermind mobile?",
        answer: "Larger multi-surface products — Studio intake.",
      },
    ],
  },

  "brand-identity-vs-brand-design-difference": {
    slug: "brand-identity-vs-brand-design-difference",
    title: "Brand identity vs brand design — what's the difference?",
    metaTitle: "Identity vs Design | BrandForge",
    metaDescription: "Systems vs one-off visuals — when to buy each.",
    datePublished: "2026-05-06",
    readingTime: "9 min",
    sections: [
      {
        heading: "Identity is the system",
        ...p([
          "Identity includes rules, tokens, and reuse. Design is execution on a surface. BrandForge identity SKUs ship systems; web design applies them.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Which do I need first?",
        answer: "Identity before scattered design tickets.",
      },
      {
        question: "Logo only?",
        answer: "Possible — but banners and guidelines save rework.",
      },
      {
        question: "Service page?",
        answer: "/services/brand-identity/",
      },
      {
        question: "Package?",
        answer: "Brand Sprint.",
      },
    ],
  },

  "what-is-cro-conversion-rate-optimisation": {
    slug: "what-is-cro-conversion-rate-optimisation",
    title: "What is CRO?",
    metaTitle: "Conversion Rate Optimisation Guide",
    metaDescription: "CRO for operator landers and stores — measurable fixes.",
    datePublished: "2026-05-04",
    readingTime: "10 min",
    sections: [
      {
        heading: "CRO is diagnosis",
        ...p([
          "Heatmaps and hero clarity beat random A/B tests. Growth Engine retainers include CRO when analytics exist.",
          "Pair with /services/web-design/ for implementation.",
        ]),
      },
    ],
    faqs: [
      {
        question: "What is CRO?",
        answer: "Improving the percentage of visitors who complete your goal.",
      },
      {
        question: "Minimum traffic?",
        answer: "Enough to learn — often hundreds of sessions per variant.",
      },
      {
        question: "Forum landers?",
        answer: "Trust copy and CTA placement matter most.",
      },
      {
        question: "GEO overlap?",
        answer: "FAQ clarity helps both humans and AI.",
      },
    ],
  },

  "how-to-choose-a-design-agency-2026": {
    slug: "how-to-choose-a-design-agency-2026",
    title: "How to choose a design agency in 2026",
    metaTitle: "Choose a Design Agency 2026",
    metaDescription: "Package vs bespoke, proof, escrow — operator checklist.",
    datePublished: "2026-05-02",
    readingTime: "11 min",
    sections: [
      {
        heading: "Fit first",
        ...p([
          "Pick BrandForge for fixed packages and speed. Pick mxstermind for bespoke diagnosis. Ask for live URLs, escrow terms, and who actually delivers.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Red flags?",
        answer: "No portfolio, no escrow option, vague hourly-only quotes.",
      },
      {
        question: "Green flags?",
        answer: "Case studies, ethics page, bounded revisions.",
      },
      {
        question: "BrandForge proof?",
        answer: "/portfolio/ and Discord vouches on home.",
      },
      {
        question: "Quote speed?",
        answer: "24 hours on Discord for BrandForge.",
      },
    ],
  },

  "ai-tools-every-operator-should-use": {
    slug: "ai-tools-every-operator-should-use",
    title: "AI tools every operator should use",
    metaTitle: "AI Tools for Operators | BrandForge",
    metaDescription: "Assistants, automation, and doc-grounded bots — not hype.",
    datePublished: "2026-04-28",
    readingTime: "12 min",
    sections: [
      {
        heading: "Tools that save hours",
        ...p([
          "Grounded support bots, caption assistants, and workflow triggers — scoped with your data map. Custom builds: /services/ai-tools/.",
          "Refuse black-box bots on regulated offers without human review.",
        ]),
      },
    ],
    faqs: [
      {
        question: "Best first AI tool?",
        answer: "Doc-grounded FAQ bot tied to your knowledge base.",
      },
      {
        question: "BrandForge build bots?",
        answer: "Yes — quote with Telegram/Discord scope.",
      },
      {
        question: "n8n vs custom?",
        answer: "n8n for speed; custom when governance requires.",
      },
      {
        question: "mxstermind AI?",
        answer: "Enterprise integrations — Studio developers hub.",
      },
    ],
  },
};

for (const slug of Object.keys(BLOG_POSTS)) {
  const extra = BLOG_EXTRA_SECTIONS[slug];
  if (extra) {
    const post = BLOG_POSTS[slug]!;
    BLOG_POSTS[slug] = {
      ...post,
      sections: [...post.sections, ...extra],
    };
  }
}

for (const slug of Object.keys(BLOG_POSTS)) {
  const extra2 = BLOG_EXTRA_SECTIONS_2[slug];
  if (extra2) {
    const post = BLOG_POSTS[slug]!;
    BLOG_POSTS[slug] = { ...post, sections: [...post.sections, ...extra2] };
  }
}

export const BLOG_SLUGS = Object.keys(BLOG_POSTS);

export const BLOG_INDEX = BLOG_SLUGS.map((slug) => {
  const post = BLOG_POSTS[slug]!;
  return {
    slug,
    title: post.title,
    excerpt: post.metaDescription,
    date: post.datePublished,
    readingTime: post.readingTime,
    href: `/blog/${slug}/`,
  };
});
