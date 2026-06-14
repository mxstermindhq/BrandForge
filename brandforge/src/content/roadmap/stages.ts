import type { FaqItem } from "@/types/content";

export type RoadmapStage = {
  slug: string;
  stage: number;
  title: string;
  meta: { title: string; description: string };
  overview: string;
  prerequisites: readonly string[];
  mistakes: readonly string[];
  checklist: readonly string[];
  success: string;
  nextSlug?: string;
  nextLabel?: string;
  serviceHref: string;
  serviceLabel: string;
  body: readonly string[];
  faqs: readonly FaqItem[];
};

export const ROADMAP_STAGES: Record<string, RoadmapStage> = {
  "validate-your-idea": {
    slug: "validate-your-idea",
    stage: 1,
    title: "Validate your idea",
    meta: {
      title: "Stage 1: Validate Your Idea | BrandForge Roadmap",
      description:
        "Test demand before you spend on brand and dev. Checklist, mistakes, and fit for forum and Web3 operators.",
    },
    overview:
      "Validation is proving someone will pay — not collecting compliments in Discord. This stage exists so you do not fund a full Launch Stack on a guess.",
    prerequisites: [
      "A clear offer (what they get, what they pay)",
      "One channel where buyers already hang out",
      "Willingness to kill the idea if numbers say no",
    ],
    mistakes: [
      "Building a logo before a landing page with a CTA",
      "Asking friends instead of strangers who match ICP",
      "Counting Discord joins as revenue",
      "Skipping price testing — free users lie",
      "Confusing a meme viral moment with repeat purchases",
    ],
    checklist: [
      "Write a one-sentence outcome for the buyer",
      "List three direct competitors or substitutes",
      "Ship a single-page lander with payment or waitlist",
      "Run $50–$200 in paid traffic or pinned post test",
      "Collect five real objections from DMs",
      "Document what proof buyers asked for",
      "Decide kill / pivot / proceed in writing",
      "If proceed, pick BrandForge package or custom quote",
    ],
    success:
      "You have paid pre-orders, escrow deposits, or a waitlist with verified emails from target buyers — not just engagement.",
    nextSlug: "build-your-brand",
    nextLabel: "Stage 2: Build your brand →",
    serviceHref: "/services/web-design/",
    serviceLabel: "Validation landers →",
    body: [
      "BrandForge sees operators skip this stage and then blame the designer for low sales. Validation is cheap relative to a full brand and site. Use a simple lander, talk to buyers in the channel you will sell in forever, and measure whether anyone pulls out a card.",
      "Forum sellers: post a vouch-backed thread with a limited SKU before you commission art. Web3 founders: test narrative on X and Telegram before token spend. SaaS: run a fake-door or concierge MVP.",
      "mxstermind.com is for later — when validation succeeded and you need operating systems. BrandForge packages meet most operators at stage two onward.",
    ],
    faqs: [
      {
        question: "How long should idea validation take?",
        answer:
          "One to three weeks for most digital offers. If you cannot get signal in that window, tighten the offer or channel before spending on creative.",
      },
      {
        question: "Does BrandForge help with validation?",
        answer:
          "Yes — lightweight landers and Discord setup are common first buys. We tell you if the idea should not advance yet.",
      },
      {
        question: "What is the cheapest validation stack?",
        answer:
          "Single lander, one payment link, manual fulfillment, spreadsheet CRM — upgrade when volume forces it.",
      },
    ],
  },

  "build-your-brand": {
    slug: "build-your-brand",
    stage: 2,
    title: "Build your brand",
    meta: {
      title: "Stage 2: Build Your Brand | BrandForge Roadmap",
      description:
        "Identity, positioning, and assets that look funded. Logo systems, Discord branding, guidelines.",
    },
    overview:
      "Positioning and visual systems that survive screenshots — server banners, store headers, and pitch slide one.",
    prerequisites: [
      "Validation signal from stage 1",
      "Named buyer and one sentence outcome",
      "References of brands you are not copying illegally",
    ],
    mistakes: [
      "Logo-only with no banner or avatar exports",
      "Neon gradients that fail on OLED Discord",
      "Inconsistent usernames across platforms",
      "Guidelines nobody on the team reads",
      "Rebrand mid-launch week without announcement plan",
    ],
    checklist: [
      "Lock positioning line and tone (direct, not corporate)",
      "Approve logo plus dark-background variant",
      "Export Discord icon, banner, and emoji-safe mark",
      "Set typography for web and social crops",
      "Document colour hex for dev handoff",
      "Create one-page brand rules PDF",
      "Update Telegram and X avatars same day",
      "Brief web build with tokens — stage 3",
    ],
    success:
      "A stranger says you look legit in the first screenshot — before they read copy.",
    nextSlug: "launch-strategy",
    serviceHref: "/services/brand-identity/",
    serviceLabel: "Brand identity service →",
    body: [
      "Brand Sprint exists for this stage. Identity without web is fine when your store is forum-native. Add Discord branding service when community is the product surface.",
      "BrandForge ships files you own — SVG, PNG sizes, guidelines — bounded revision rounds in the quote.",
    ],
    faqs: [
      {
        question: "Brand Sprint vs custom identity?",
        answer: "Brand Sprint covers most operator launches. Custom quotes add motion systems, slide decks, or multi-sub-brand families.",
      },
      {
        question: "Can I skip brand and only buy a site?",
        answer:
          "Yes if you have tokens already — send Figma or guidelines. We match, not guess.",
      },
      {
        question: "How does this tie to GEO?",
        answer:
          "Consistent entity naming (BrandForge, your brand) across pages helps AI citations later — stage 4 expands that.",
      },
    ],
  },

  "launch-strategy": {
    slug: "launch-strategy",
    stage: 3,
    title: "Launch strategy",
    meta: {
      title: "Stage 3: Launch Strategy | BrandForge Roadmap",
      description: "Site, store, community launch — coordinated ship date and handoff.",
    },
    overview: "Turn brand into surfaces buyers use: site, store, Discord, Telegram.",
    prerequisites: ["Brand tokens from stage 2", "Sitemap or feature list", "Launch date"],
    mistakes: [
      "Launching site before payment rails work",
      "No status channel for buyers during deploy",
      "Soft launch without analytics",
      "Forgot mobile Discord users",
      "Announce on five platforms with different links",
    ],
    checklist: [
      "Finalize sitemap and primary CTA",
      "Wire payments or escrow instructions",
      "QA mobile and ultrawide",
      "Publish FAQ and ethics links in footer",
      "Schedule announcement posts",
      "Pin Discord post with vouch instructions",
      "Monitor errors first 48h",
      "Collect three post-launch testimonials",
    ],
    success: "Live URLs, working checkout or intake, and first sales without heroics.",
    nextSlug: "grow-your-audience",
    serviceHref: "/packages/",
    serviceLabel: "Launch Stack package →",
    body: [
      "Launch Stack bundles identity plus site for most operators. Web3 landers may add wallet education modules. Forum sellers may need store + trust copy only.",
    ],
    faqs: [
      {
        question: "What is Launch Stack?",
        answer: "Brand + site package — see /packages/ for current USD ranges.",
      },
      {
        question: "Do you launch Discord too?",
        answer: "Yes via /services/discord-branding/ — structure, roles, banners.",
      },
      {
        question: "Founder OS for launch?",
        answer: "When launch includes custom app, multi-region, or enterprise procurement — apply at mxstermind.com.",
      },
    ],
  },

  "grow-your-audience": {
    slug: "grow-your-audience",
    stage: 4,
    title: "Grow your audience",
    meta: {
      title: "Stage 4: Grow Your Audience | BrandForge Roadmap",
      description: "SEO, GEO, paid ads, and content systems that compound.",
    },
    overview: "Acquisition systems — not random posts when you remember.",
    prerequisites: ["Live site with analytics", "Offer that already converted once", "Budget for tests"],
    mistakes: [
      "SEO blog filler with no internal links",
      "Boosting posts without landing page fit",
      "Ignoring AI FAQ structure",
      "One creative for all platforms aspect ratios",
      "No retargeting before cold scale",
    ],
    checklist: [
      "Install analytics and conversion events",
      "Publish FAQ-rich service pages",
      "Submit sitemap and fix robots",
      "Ship two pillar articles with internal links",
      "Launch small paid test with one hook",
      "Set weekly metrics review in Discord",
      "Repurpose one article to five shorts",
      "Document CAC and payback rough math",
    ],
    success: "Repeatable weekly growth tasks with numbers — not vibes.",
    nextSlug: "scale-operations",
    serviceHref: "/services/seo-growth/",
    serviceLabel: "SEO & GEO →",
    body: [
      "Growth Engine retainer covers ongoing SEO, paid, and content reuse. GEO means structuring pages so ChatGPT and Perplexity can cite you — BrandForge builds that into site architecture.",
    ],
    faqs: [
      {
        question: "What is GEO vs SEO?",
        answer:
          "SEO ranks in Google. GEO earns AI answers with schema, FAQs, and entity-clear copy — both matter in 2026.",
      },
      {
        question: "Minimum ad budget?",
        answer: "Enough to learn — often $500–$2k test before scaling; depends on niche CPC.",
      },
      {
        question: "Forum marketing still work?",
        answer: "Yes with proof — see /blog/forum-marketing-2026-what-still-works/.",
      },
    ],
  },

  "scale-operations": {
    slug: "scale-operations",
    stage: 5,
    title: "Scale operations",
    meta: {
      title: "Stage 5: Scale Operations | BrandForge Roadmap",
      description: "Automation, AI tools, and workflows that remove manual bottlenecks.",
    },
    overview: "Systems so growth does not drown you in DMs and spreadsheets.",
    prerequisites: ["Repeatable sales", "Documented fulfillment", "List of manual tasks"],
    mistakes: [
      "Automating a broken process",
      "No logs when webhooks fail",
      "Bots with no human override",
      "Stripe and Discord out of sync",
      "Buying tools before mapping workflow",
    ],
    checklist: [
      "List top five weekly manual tasks",
      "Map triggers and outputs per task",
      "Pick n8n/Make vs custom API",
      "Build staging webhook tests",
      "Add failure alerts to Discord",
      "Document rollback steps",
      "Train mod on admin dashboard",
      "Review hours saved monthly",
    ],
    success: "Moderators and ops spend time on exceptions only — baseline runs automated.",
    nextSlug: "tools-resources",
    serviceHref: "/services/automation/",
    serviceLabel: "Automation service →",
    body: [
      "LinkedIn automation and Telegram verification builds in our portfolio show operator-scale patterns. Quote automation with workflow diagrams on Discord.",
    ],
    faqs: [
      {
        question: "n8n or Make?",
        answer: "Self-host n8n for data control; Make for speed — scoped in quote.",
      },
      {
        question: "AI bots for support?",
        answer: "See /services/ai-tools/ — grounded on your docs, not generic.",
      },
      {
        question: "When is the Founder OS needed?",
        answer: "Multi-system enterprise graphs or regulated data — Studio scopes discovery first.",
      },
    ],
  },

  "tools-resources": {
    slug: "tools-resources",
    stage: 6,
    title: "Tools & resources",
    meta: {
      title: "Stage 6: Tools & Resources | BrandForge Roadmap",
      description: "Curated stack for operators — design, dev, growth, community.",
    },
    overview: "Pick tools once — stop rebuilding the stack every launch.",
    prerequisites: ["Stages 1–5 context", "Budget for SaaS", "Security basics"],
    mistakes: [
      "Twelve overlapping analytics tabs",
      "No password manager for team",
      "Paying annual before validation",
      "Tool hoarding instead of shipping",
      "Ignoring export paths",
    ],
    checklist: [
      "Design: Figma + asset CDN",
      "Web: hosting with preview deploys",
      "Analytics: one source of truth",
      "Community: Discord + bot audit log",
      "Payments: escrow + backup processor",
      "Automation: n8n or Make workspace",
      "AI: doc store for support bot",
      "Bookmark BrandForge + mxstermind ethics pages",
    ],
    success: "Documented stack your team can onboard to in a day.",
    serviceHref: "/contact/",
    serviceLabel: "Ask for stack review →",
    body: [
      "We do not affiliate spam tool lists. These are categories that survive forum and Web3 delivery. Ask on Discord for a stack review against your roadmap stage.",
    ],
    faqs: [
      {
        question: "Does BrandForge resell tools?",
        answer: "No — we integrate what you already pay for.",
      },
      {
        question: "Free vs paid tools?",
        answer: "Free until friction costs more than subscription — then pay for reliability.",
      },
      {
        question: "Where to start if overwhelmed?",
        answer: "Return to stage 1 validation — tools do not fix a broken offer.",
      },
    ],
  },
};

export const ROADMAP_SLUGS = Object.keys(ROADMAP_STAGES);

export const ROADMAP_HUB_FAQ: readonly FaqItem[] = [
  {
    question: "What is the BrandForge marketer roadmap?",
    answer:
      "Six stages from validation to tools — each with checklists, mistakes, and service links. Built for forum sellers, Web3 founders, and community operators.",
  },
  {
    question: "Do I follow every stage in order?",
    answer:
      "Usually yes. Skip only when you honestly completed the prerequisite — e.g. existing brand jumps to launch with token handoff.",
  },
  {
    question: "Where do packages fit?",
    answer:
      "Brand Sprint, Launch Stack, and Growth Engine map to stages 2–4. Custom quotes cover edge cases.",
  },
  {
    question: "Is this different from mxstermind?",
    answer:
      "mxstermind is the Founder OS for established businesses. BrandForge roadmap is operator-first with fixed pricing culture.",
  },
  {
    question: "Which roadmap stage should I start at?",
    answer:
      "Match the stage to what you've shipped: idea only → validate-your-idea; logo but no lander → build-your-brand; traffic but weak funnel → launch-strategy; growth plateau → grow-your-audience.",
  },
  {
    question: "Can I skip straight to growth or scale?",
    answer:
      "Only if validation and brand foundations are done — otherwise you're optimising a broken funnel. Message us on Discord with what exists and we'll point you honestly.",
  },
];
