import type { FaqItem, BlogCardData } from "@/types/content";
import { SITE } from "@/config/site";
import { BLOG_EXTRA_SECTIONS } from "./extra-sections";

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

const p = (...paragraphs: string[]) => ({ paragraphs });

export const BLOG_SLUGS = [
  "how-we-rebuilt-sol-app-for-sui-blockchain-two-weeks",
  "bespoke-agency-vs-package-agency-which-is-right",
  "what-is-a-growth-engine-and-how-to-build-one",
  "how-to-brief-a-design-agency-without-wasting-time",
  "web3-branding-what-crypto-projects-get-wrong",
  "how-we-built-cascade-markets-case-study",
  "real-cost-of-a-bad-brand-and-how-to-fix-it",
  "what-outcome-based-agency-work-means-in-practice",
  "how-much-should-a-website-cost-honest-answer",
  "ethics-standards-how-we-work",
] as const;

export const BLOG_HUB_FAQ: readonly FaqItem[] = [
  {
    question: "Who writes mxstermind editorial content?",
    answer: "Published by mxstermind — the same studio that ships the case studies linked in each article.",
  },
  {
    question: "Can I request a topic?",
    answer: "Message Discord with your question. We prioritise topics that help established buyers scope bespoke work.",
  },
  {
    question: "How does mxstermind relate to BrandForge blog posts?",
    answer: "BrandForge.gg covers operator packages and roadmap stages. mxstermind.com goes deeper on bespoke builds and technical delivery.",
  },
  {
    question: "Do you accept guest posts?",
    answer: "Not currently. All editorial is produced in-house from shipped work.",
  },
];

export const BLOG_POSTS: Record<(typeof BLOG_SLUGS)[number], BlogPost> = {
  "how-we-rebuilt-sol-app-for-sui-blockchain-two-weeks": {
    slug: "how-we-rebuilt-sol-app-for-sui-blockchain-two-weeks",
    title: "How we rebuilt a Sol app for SUI blockchain in two weeks",
    metaTitle: "SUI Migration in Two Weeks | mxstermind",
    metaDescription:
      "Four-person squad, hard deadline, wallet UX on mobile — how mxstermind shipped a SUI rebuild before an investor milestone.",
    datePublished: "2026-05-14",
    readingTime: "14 min",
    sections: [
      {
        heading: "Why the deadline was non-negotiable",
        ...p(
          "The client had a public milestone tied to SUI ecosystem alignment. Sol-targeted wallet code could not demo. Two weeks was the window — not a negotiating tactic.",
          "mxstermind assembled four contributors: two mobile engineers, one integration specialist, and a PM on Discord with daily standups. Scope was ruthlessly bounded to wallet connect, signing, balances, and network errors.",
        ),
      },
      {
        heading: "Technical sequence",
        ...p(
          "Day 1–2: SDK spike and testnet wallet matrix. Day 3–8: port screens and transaction flows with readable error copy. Day 9–10: QA on testnet devices. Day 11–14: handoff runbook and gap list for phase two.",
          "We documented what was out of scope — social features, advanced analytics — so stakeholders did not expect a full product rewrite in fourteen days.",
        ),
      },
      {
        heading: "What buyers should learn",
        ...p(
          "Hard deadlines work when scope is written as a list of demo-ready flows, not a vague rebuild. See the full case study at /portfolio/sui-blockchain/ and blockchain capabilities at /developers/blockchain/.",
        ),
      },
    ],
    faqs: [
      { question: "Can mxstermind migrate our wallet to another chain?", answer: "Often yes — apply with your current stack and milestone date on Discord." },
      { question: "Minimum team size?", answer: "Depends on scope; this engagement used four contributors full-time for two weeks." },
      { question: "Related portfolio?", answer: "/portfolio/sui-blockchain/ and /portfolio/cascade-markets/." },
      { question: "Package alternative?", answer: "BrandForge packages cover smaller web scope — mxstermind handles chain migrations." },
    ],
  },
  "bespoke-agency-vs-package-agency-which-is-right": {
    slug: "bespoke-agency-vs-package-agency-which-is-right",
    title: "Bespoke agency vs package agency — which is right?",
    metaTitle: "Bespoke vs Package Agency | mxstermind",
    metaDescription:
      "When to hire mxstermind bespoke vs BrandForge packages — decision framework for founders and established businesses.",
    datePublished: "2026-05-12",
    readingTime: "12 min",
    sections: [
      {
        heading: "Packages optimise for speed and clarity",
        ...p(
          "BrandForge.gg publishes tiers because many operators want a known price for brand, web, or growth — quote in 24 hours, defined deliverables, escrow-friendly.",
          "Packages fail when your scope crosses mobile + backend + automation + brand in one timeline. That is where bespoke studios earn their fee.",
        ),
      },
      {
        heading: "Bespoke optimises for outcome complexity",
        ...p(
          "mxstermind quotes after fit review. You get a scope document, not a shopping cart. Typical signals: internal engineering team, procurement review, NDA, or Web3/fintech integrations.",
          "If you only need a landing and logo, start at brandforge.gg/packages/. If you need a trading desk or verification system, see /portfolio/ and /apply/.",
        ),
      },
    ],
    faqs: [
      { question: "Can we start with a package and upgrade?", answer: "Yes — many clients start on BrandForge and move to mxstermind for phase two." },
      { question: "Is bespoke always more expensive?", answer: "Usually higher floor, but avoids change-order death on complex builds." },
      { question: "Same team?", answer: "Same studio network — different intake and scope process." },
      { question: "How to apply?", answer: "/apply/ or Discord." },
    ],
  },
  "what-is-a-growth-engine-and-how-to-build-one": {
    slug: "what-is-a-growth-engine-and-how-to-build-one",
    title: "What is a growth engine and how to build one",
    metaTitle: "Build a Growth Engine | mxstermind",
    metaDescription:
      "Growth engine = repeatable acquisition loops, FAQ-rich pages, and measurement — not random posting. mxstermind explains for established brands.",
    datePublished: "2026-05-10",
    readingTime: "13 min",
    sections: [
      {
        heading: "Definition that survives board meetings",
        ...p(
          "A growth engine is a documented loop: traffic source → landing → conversion event → retention signal → content that feeds the next cycle. Not a single viral post.",
          "Established businesses already have revenue — they need engines that compound without betting the brand on one channel.",
        ),
      },
      {
        heading: "Build sequence",
        ...p(
          "Fix positioning and one primary URL. Ship FAQ-rich service and case study pages for GEO. Layer paid only after LCP and conversion baselines exist. Automate reporting last — not first.",
          "mxstermind often builds the product and the first engine slice in one engagement — see /services/ and /process/.",
        ),
      },
    ],
    faqs: [
      { question: "GEO vs SEO?", answer: "Both — structured FAQs and schema help AI citations and traditional search." },
      { question: "Timeline?", answer: "First loop in 6–12 weeks depending on product maturity." },
      { question: "Related services?", answer: `${SITE.url}/services/ and ${SITE.brandforge}services/seo-growth/ for package tier.` },
      { question: "Measurement?", answer: "Define one north-star conversion before scaling spend." },
    ],
  },
  "how-to-brief-a-design-agency-without-wasting-time": {
    slug: "how-to-brief-a-design-agency-without-wasting-time",
    title: "How to brief a design agency without wasting time",
    metaTitle: "Brief a Design Agency Properly | mxstermind",
    metaDescription:
      "Outcome, references, deadline, budget band — the four fields mxstermind needs to quote bespoke work in 24 hours.",
    datePublished: "2026-05-08",
    readingTime: "11 min",
    sections: [
      {
        heading: "Skip the manifesto",
        ...p(
          "We do not need a 20-page brand manifesto to quote. We need: what changes for the business if this ships, three references you respect, deadline, and budget band.",
          "Established buyers who send those four items get faster fixed quotes and fewer scoping calls.",
        ),
      },
      {
        heading: "Attach constraints early",
        ...p(
          "Stack requirements, compliance needs, and existing design systems belong in message one — not after deposit.",
          "Use /apply/ template or Discord — same review path.",
        ),
      },
    ],
    faqs: [
      { question: "Do you sign NDAs before brief?", answer: "Yes when required — say so in first message." },
      { question: "Figma required?", answer: "Helpful but not mandatory; we can audit what exists." },
      { question: "Response time?", answer: "Within 24 hours on business days." },
      { question: "Wrong fit?", answer: "We say so and may redirect to BrandForge packages." },
    ],
  },
  "web3-branding-what-crypto-projects-get-wrong": {
    slug: "web3-branding-what-crypto-projects-get-wrong",
    title: "Web3 branding — what crypto projects get wrong",
    metaTitle: "Web3 Branding Mistakes | mxstermind",
    metaDescription:
      "Purple gradients, meme clutter, and slow landers kill trust. What mxstermind fixes on Web3 launches like cascade.markets.",
    datePublished: "2026-05-06",
    readingTime: "12 min",
    sections: [
      {
        heading: "Trust is visual before it is on-chain",
        ...p(
          "Traders decide in seconds on mobile data. Generic Web3 templates signal rug-adjacent — even when the product is legitimate.",
          "Cascade Markets needed discipline: dark UI, clear CTA, performance-first static delivery. See /portfolio/cascade-markets/.",
        ),
      },
      {
        heading: "Wallet UX is part of brand",
        ...p(
          "Confusing signing flows erode the same trust your landing built. We ship both — /developers/blockchain/ and /portfolio/sui-blockchain/.",
        ),
      },
    ],
    faqs: [
      { question: "Do you do token launch branding?", answer: "Identity and product UI yes — legal/compliance is client responsibility." },
      { question: "Timeline for Web3 landing?", answer: "Often 2–3 weeks for focused scope." },
      { question: "Examples?", answer: "/portfolio/cascade-markets/ and /portfolio/sui-blockchain/." },
      { question: "Package tier?", answer: "BrandForge web packages for simple landers; mxstermind for wallet + web combined." },
    ],
  },
  "how-we-built-cascade-markets-case-study": {
    slug: "how-we-built-cascade-markets-case-study",
    title: "How we built Cascade Markets — case study deep dive",
    metaTitle: "Cascade Markets Build Story | mxstermind",
    metaDescription:
      "Web3 landing for cascade.markets — performance, CTA hierarchy, and handoff for paid traffic tests.",
    datePublished: "2026-05-04",
    readingTime: "13 min",
    sections: [
      {
        heading: "Problem framing",
        ...p(
          "Prediction market buyers compare credibility instantly. The client had Discord traction but no production URL that could absorb paid traffic.",
          "Scope: one high-impact landing — hero, proof sections, FAQ-ready structure, deploy on client infra.",
        ),
      },
      {
        heading: "Delivery choices",
        ...p(
          "Static export on Cloudflare-class hosting for LCP. Minimal JS on first paint. Section order optimised for GEO extraction — questions traders actually ask.",
          "Full case study: /portfolio/cascade-markets/. Services hub: /services/.",
        ),
      },
    ],
    faqs: [
      { question: "Can you clone this for our niche?", answer: "We do not clone — we adapt patterns. Send your niche and deadline." },
      { question: "Stack?", answer: "Next.js, Tailwind, static export." },
      { question: "Live URL?", answer: "cascade.markets — linked from portfolio." },
      { question: "Similar work?", answer: "/portfolio/drain-cx/ for product web depth." },
    ],
  },
  "real-cost-of-a-bad-brand-and-how-to-fix-it": {
    slug: "real-cost-of-a-bad-brand-and-how-to-fix-it",
    title: "The real cost of a bad brand — and how to fix it",
    metaTitle: "Cost of Bad Branding | mxstermind",
    metaDescription:
      "Bad brand tax shows up in CAC, sales cycle length, and hiring — fix sequence for established businesses.",
    datePublished: "2026-05-02",
    readingTime: "12 min",
    sections: [
      {
        heading: "The tax is measurable",
        ...p(
          "Higher CAC because ads look like competitors. Longer enterprise sales cycles because procurement sees inconsistency. Harder hiring because candidates check the site first.",
          "Fixing brand is not vanity — it is margin recovery when you already have product-market fit.",
        ),
      },
      {
        heading: "Fix sequence",
        ...p(
          "Positioning line → token system → flagship touchpoint (site or app shell) → roll out to sales decks and support macros.",
          "mxstermind scopes this as one engagement or phase one of a larger build — /apply/.",
        ),
      },
    ],
    faqs: [
      { question: "Rebrand vs refresh?", answer: "Refresh if positioning holds; rebrand if ICP shifted." },
      { question: "Budget range?", answer: "Package tier on BrandForge for identity; mxstermind for product+brand combined." },
      { question: "Timeline?", answer: "4–8 weeks typical for established business refresh." },
      { question: "Proof?", answer: "/portfolio/drain-cx/ and /for/established-businesses/." },
    ],
  },
  "what-outcome-based-agency-work-means-in-practice": {
    slug: "what-outcome-based-agency-work-means-in-practice",
    title: "What outcome-based agency work means in practice",
    metaTitle: "Outcome-Based Agency Work | mxstermind",
    metaDescription:
      "Fixed scope tied to verifiable outputs — how mxstermind writes milestones for established buyers.",
    datePublished: "2026-04-30",
    readingTime: "11 min",
    sections: [
      {
        heading: "Outcomes vs hours",
        ...p(
          "Hourly billing rewards slow delivery. Outcome-based scope ties payments to staging URLs, merged PRs, or shipped app builds — documented in writing before deposit.",
          "See /process/ for the full engagement flow and /ethics-standards/ for financial rules.",
        ),
      },
    ],
    faqs: [
      { question: "What if scope changes?", answer: "Change order with new price before work continues." },
      { question: "Escrow?", answer: "Supported when required." },
      { question: "Example milestones?", answer: "Design sign-off → staging → production → handoff doc." },
      { question: "Apply?", answer: "/apply/." },
    ],
  },
  "how-much-should-a-website-cost-honest-answer": {
    slug: "how-much-should-a-website-cost-honest-answer",
    title: "How much should a website cost — an honest answer",
    metaTitle: "Website Cost Honest Answer | mxstermind",
    metaDescription:
      "Template, package, bespoke — realistic USD ranges and what moves price for established businesses.",
    datePublished: "2026-04-28",
    readingTime: "13 min",
    sections: [
      {
        heading: "Three tiers of reality",
        ...p(
          "Template + DIY: hundreds. Productized agency packages (BrandForge): low thousands for defined deliverables. Bespoke product sites with integrations: often $5k–$50k+ with mxstermind.",
          "Price moves with auth, CMS, integrations, motion budget, and who maintains after launch.",
        ),
      },
      {
        heading: "How to not overpay",
        ...p(
          "Buy the smallest scope that proves conversion. Expand in phase two with the same studio if fit is good.",
          "Compare /portfolio/ examples to your requested scope before applying.",
        ),
      },
    ],
    faqs: [
      { question: "Cheapest path?", answer: "BrandForge packages for operator landers." },
      { question: "Enterprise?", answer: "mxstermind bespoke — message with budget band." },
      { question: "Hidden costs?", answer: "Hosting, domains, third-party SaaS — listed in scope doc." },
      { question: "Quote speed?", answer: "24 hours on Discord/Telegram." },
    ],
  },
  "ethics-standards-how-we-work": {
    slug: "ethics-standards-how-we-work",
    title: "Ethics & standards — how we work",
    metaTitle: "Ethics & Standards | mxstermind Editorial",
    metaDescription:
      "Selective intake, fixed scope, privacy, and quality bars — mxstermind ethics explained for established buyers.",
    datePublished: "2026-04-26",
    readingTime: "10 min",
    sections: [
      {
        heading: "Why we publish ethics",
        ...p(
          "Established businesses diligence vendors before MSAs. Our ethics page is the operational contract in plain language — selective engagements, named contributors, milestone payments.",
          "Full document: /ethics-standards/. BrandForge publishes the operator-facing variant.",
        ),
      },
      {
        heading: "Same team, two front doors",
        ...p(
          "BrandForge.gg for packages. mxstermind.com for bespoke. Ethics align — delivery standards do not change because the logo on the invoice differs.",
        ),
      },
    ],
    faqs: [
      { question: "Where is the full ethics page?", answer: "/ethics-standards/." },
      { question: "NDA?", answer: "Standard for established engagements." },
      { question: "Refunds?", answer: "When we miss agreed milestones and cannot cure — see ethics financial section." },
      { question: "Contact?", answer: "Discord or Telegram — same as /apply/." },
    ],
  },
};

for (const slug of BLOG_SLUGS) {
  const extra = BLOG_EXTRA_SECTIONS[slug];
  if (extra) {
    const post = BLOG_POSTS[slug];
    BLOG_POSTS[slug] = { ...post, sections: [...post.sections, ...extra] };
  }
}

export const BLOG_HUB_CARDS: readonly BlogCardData[] = BLOG_SLUGS.map((slug) => {
  const post = BLOG_POSTS[slug];
  return {
    slug,
    title: post.title,
    excerpt: post.metaDescription,
    date: post.datePublished,
    readingTime: post.readingTime,
    href: `/blog/${slug}/`,
  };
});

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS[slug as (typeof BLOG_SLUGS)[number]];
}
