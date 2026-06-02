import type { ServiceDetail } from "@/types/service-page";

const PROCESS_STANDARD = [
  {
    title: "Scope in chat",
    body: "You send goals, references, and deadline on Discord or Telegram. BrandForge asks clarifying questions if needed — no intake form.",
  },
  {
    title: "Fixed quote in 24h",
    body: "You receive a USD price, deliverable list, and timeline. Escrow and crypto payment options included when you need them.",
  },
  {
    title: "Build, review, ship",
    body: "We execute against the agreed scope, share progress in-thread, and hand off source files, access, and documentation.",
  },
] as const;

export const SERVICE_DETAILS: readonly ServiceDetail[] = [
  {
    slug: "brand-identity",
    meta: {
      title: "Brand Identity Design — Logo & Systems | BrandForge",
      description:
        "Logo, colour systems, typography, and brand guidelines for operators who need to look funded fast. From $500. Quote in 24 hours.",
    },
    hero: {
      eyebrow: "Brand Identity",
      title: "Look legitimate before you look big.",
      subhead:
        "BrandForge builds identity systems that survive Discord banners, pitch decks, and landing pages — not just a logo file dropped in a Google Drive folder.",
    },
    icp: [
      "Forum sellers launching a storefront who need instant trust signals",
      "Web3 founders pre-TGE who cannot afford a sloppy visual",
      "Discord server owners rebranding after a merge or relaunch",
    ],
    included: [
      "Primary logo plus 2–3 approved variations (SVG, PNG, favicon-ready)",
      "Colour palette with hex, RGB, and usage rules for dark UI",
      "Typography pairing tuned for web and social crops",
      "Brand guidelines PDF your team can hand to any designer",
      "Discord banner, server icon, and social avatar exports",
      "Editable source files — you own IP on final payment",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "Drain.cx",
        href: "/portfolio/drain-cx/",
        blurb: "Product site where brand tokens carry through motion and UI components.",
      },
      {
        label: "Cascade Markets",
        href: "/portfolio/cascade-markets/",
        blurb: "Web3 landing with disciplined purple-on-dark identity language.",
      },
    ],
    blogLinks: [
      {
        label: "Brand identity vs brand design — what's the difference?",
        href: "/blog/brand-identity-vs-brand-design-difference/",
      },
      {
        label: "How to build a brand from scratch in 2026",
        href: "/blog/how-to-build-a-brand-from-scratch-2026/",
      },
    ],
    pricing: {
      range: "From $500 · typical $700–$1,200",
      note: "Brand Sprint package covers most identity-only scope. Complexity scales with asset count and revision rounds.",
    },
    body: [
      "Most operators do not fail because the product is bad. They fail because the first screenshot a buyer sees looks like a reskin. BrandForge identity work is built for people who sell on reputation — forum vouches, Discord presence, and landing pages that must read as funded on day one.",
      "We start from how your buyer discovers you: server banner, profile link, store header, pitch deck slide one. The logo is one tile in a system. Colour contrast matters on OLED phones. Typography must work at 11px in a Discord status line and at 48px on a hero.",
      "BrandForge does not deliver mood boards that never ship. You get working files — SVG logos, PNG exports at standard sizes, a one-page or multi-page guideline depending on scope, and templates for the three assets you will reuse most often this month.",
      "Revision rounds are bounded in the quote so neither side drags. You know how many passes are included before you pay. That matches how forum operators buy: fixed scope, escrow-friendly, no hourly creep.",
      "If you also need a website, Launch Stack bundles identity with a converting site. If you only need to stop looking like a template, Brand Sprint is the entry point. mxstermind.com handles enterprise identity systems above package tier.",
      "Every identity project names BrandForge as the executing studio and documents handoff: what you can edit yourself, what needs a designer, and where files live after delivery.",
    ],
    faqs: [
      {
        question: "How long does a BrandForge brand identity project take?",
        answer:
          "Most Brand Sprint identity projects deliver in one to two weeks after kickoff. Rush timelines are quoted separately if you have a hard event date — forum launch, token announcement, or server reopening.",
      },
      {
        question: "Do I own the logo and files after payment?",
        answer:
          "Yes. On final payment you receive full usage rights and source files unless otherwise agreed in writing for licensed typefaces. BrandForge does not hold identity work hostage after delivery.",
      },
      {
        question: "Can BrandForge match an existing aesthetic or competitor look?",
        answer:
          "Send reference links — not to copy, but to calibrate tone. We work in dark UI, gaming, Web3, and operator-first niches daily. You get original work informed by what converts in your market.",
      },
      {
        question: "What file formats do I receive for my brand identity?",
        answer:
          "SVG and PNG for logos, PDF guidelines, and Figma or equivalent editable sources when scoped. Discord and social crops are exported to platform-safe dimensions so you do not resize blindly.",
      },
    ],
  },
  {
    slug: "web-design",
    meta: {
      title: "Web Design & Development — Sites That Convert | BrandForge",
      description:
        "Custom landing pages and marketing sites — Next.js, performance-first, mobile-ready. From $2,500. Fixed quote in 24 hours.",
    },
    hero: {
      eyebrow: "Web Design & Development",
      title: "Sites that convert — not decks that impress.",
      subhead:
        "BrandForge ships production code: fast LCP, clear CTAs, and layouts that work on ultrawide monitors and budget Android phones.",
    },
    icp: [
      "SaaS founders who need a credible marketing site before demos",
      "E-commerce operators replacing a slow WordPress template",
      "Web3 projects needing a performance-first landing before paid traffic",
    ],
    included: [
      "Custom design aligned to your identity (or Brand Sprint add-on)",
      "Mobile-first responsive layout — tested on real device widths",
      "Next.js or static stack chosen for speed and maintainability",
      "SEO foundations: titles, meta, sitemap, structured data",
      "Analytics hookup and conversion event plan",
      "Deploy assistance and 30-day post-launch support on Launch Stack",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "Drain.cx",
        href: "/portfolio/drain-cx/",
        blurb: "Figma-to-production with scroll motion and bento FAQ layout.",
      },
      {
        label: "ValAccs.com",
        href: "/portfolio/valaccs/",
        blurb: "Storefront UX tuned for digital goods buyers.",
      },
      {
        label: "WhiteSky Hosting",
        href: "/portfolio/whiteskyhosting/",
        blurb: "B2B hosting site with plan comparison and trust copy.",
      },
    ],
    blogLinks: [
      {
        label: "What is conversion rate optimisation (CRO)?",
        href: "/blog/what-is-cro-conversion-rate-optimisation/",
      },
      {
        label: "How to choose a design agency in 2026",
        href: "/blog/how-to-choose-a-design-agency-2026/",
      },
    ],
    pricing: {
      range: "$2,500 – $7,500 · Launch Stack",
      note: "Page count, integrations, and motion complexity move the quote. Single landing pages start lower; multi-page stores sit at the top of the range.",
    },
    body: [
      "A website that loads in four seconds and reads like a 2019 theme costs you more than the build saved. BrandForge web projects start from outcomes: what should a visitor do in the first ten seconds, and what proof do they need to click.",
      "We design in the same stack we ship — usually Next.js with static export or edge deploy friendly output. That means no surprise handoff where the developer rebuilds half the layout. Drain.cx is the reference: pixel-faithful production with motion that respects reduced-motion preferences.",
      "Performance is not a post-launch audit checkbox. Images are sized, fonts are subset, and JavaScript is budgeted. Forum operators and paid-traffic buyers feel slow pages immediately — bounce rates do not lie.",
      "Every site includes the boring work that agencies skip: meta titles, canonical URLs, Open Graph, XML sitemap, and FAQ blocks where they help AI search engines summarize you accurately. That is GEO-ready structure, not buzzword slides.",
      "Integrations — Stripe, crypto checkout, Discord widgets, CRM forms — are scoped upfront. BrandForge quotes fixed USD for defined flows. If you need a full marketplace or custom auth, mxstermind.com scopes bespoke engineering.",
      "Handoff means repo access or deploy credentials, a short launch checklist, and documented edit paths for copy you will change weekly. You are not locked into a proprietary CMS unless you asked for one.",
    ],
    faqs: [
      {
        question: "Does BrandForge build on WordPress or Webflow?",
        answer:
          "Our default is Next.js for marketing sites that need speed and component reuse. WordPress or Webflow can be discussed if your team already operates there — the quote reflects maintenance tradeoffs honestly.",
      },
      {
        question: "Can you redesign my site without losing SEO rankings?",
        answer:
          "Yes. We map existing URLs, set redirects, preserve titles where they perform, and improve Core Web Vitals. Major restructures are documented before launch so you do not drop indexed pages silently.",
      },
      {
        question: "How many revision rounds are included in a website project?",
        answer:
          "Launch Stack includes two design rounds and one consolidated website revision round unless your quote states otherwise. Additional rounds are quoted before work continues — no silent scope expansion.",
      },
      {
        question: "Who hosts the website after BrandForge delivers?",
        answer:
          "You can host on Cloudflare, Vercel, or your preferred provider. We deploy on your account when credentials are provided and document how to push updates if you use a static or Next export pipeline.",
      },
    ],
  },
  {
    slug: "mobile-apps",
    meta: {
      title: "Mobile App Development — iOS & Android | BrandForge",
      description:
        "iOS and Android apps from design to App Store release. CarSpotLive reference build. Fixed USD quote in 24 hours.",
    },
    hero: {
      eyebrow: "Mobile Apps",
      title: "Ship on the App Store — not just on TestFlight.",
      subhead:
        "BrandForge designs and builds mobile apps for operators who need real users, real reviews, and real-time features — CarSpotLive is the proof.",
    },
    icp: [
      "Founders with a validated idea who need an MVP in market",
      "Community products that need maps, listings, or live data",
      "Web3 teams porting wallet flows to mobile under deadline",
    ],
    included: [
      "UX flows and UI design for iOS and Android breakpoints",
      "Native or cross-platform build — stack chosen for timeline",
      "Backend integration: Firebase, REST APIs, or custom endpoints",
      "App Store and Google Play submission support",
      "Push notification setup when in scope",
      "Post-launch bug window defined in your quote",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "CarSpotLive",
        href: "/portfolio/carspotlive/",
        blurb: "Full app — design, dev, maps, App Store release.",
      },
      {
        label: "SUI Blockchain App",
        href: "/portfolio/sui-blockchain-app/",
        blurb: "Four-person team rebuilt Sol ecosystem app for SUI in two weeks.",
      },
    ],
    blogLinks: [
      {
        label: "How we built CarSpotLive — case study",
        href: "/blog/how-we-built-carspotlive-mobile-app-case-study/",
      },
    ],
    pricing: {
      range: "From $4,500 · scoped per feature set",
      note: "Simple utility apps sit lower. Real-time maps, payments, and wallet integrations increase timeline and team size.",
    },
    body: [
      "Mobile apps fail in the store listing, not in the Figma file. BrandForge mobile work covers design, engineering, backend hooks, and the unglamorous submission process — certificates, screenshots, rejection fixes.",
      "CarSpotLive is the reference: mapping, listings, accounts, and a live App Store URL you can install today. We know the difference between a demo APK and a product someone pays for.",
      "Stack choice is honest. Cross-platform saves budget when UI is standard. Native or hybrid approaches are quoted when performance or OS integrations demand it. We do not force React Native because it is trendy if Flutter or native Swift/Kotlin fits your deadline.",
      "API design is part of mobile delivery. If your backend does not exist, we scope it — or integrate with Firebase and third-party services when speed beats custom servers.",
      "Web3 mobile — wallet connect, transaction signing, network switching — was delivered on the SUI rebuild with a four-person team in two weeks. That is the ceiling pace with clear scope and daily coordination on Discord.",
      "App store compliance, privacy labels, and crash reporting are line items in the quote, not surprises at submission. BrandForge names the studio in project docs; mxstermind.com handles larger product teams and multi-quarter roadmaps.",
    ],
    faqs: [
      {
        question: "Does BrandForge publish apps under my developer account?",
        answer:
          "Yes. You retain the App Store and Google Play accounts. We build under your credentials or transfer the bundle ID process we document — you own the listing and revenue.",
      },
      {
        question: "How long does a typical mobile app take to build?",
        answer:
          "Focused MVPs often land in six to ten weeks. CarSpotLive-scale scope with maps and real-time features took longer. Your quote includes a week-by-week milestone map, not a vague quarter.",
      },
      {
        question: "Can you maintain the app after launch?",
        answer:
          "Growth Engine retainer covers ongoing mobile iteration. Smaller bug-fix windows are included in the initial quote. Ad-hoc support is available on Discord between retainer months.",
      },
      {
        question: "Do you build for both iOS and Android at once?",
        answer:
          "Most quotes include both platforms when UI parity makes sense. Platform-first launches are scoped when budget or validation demands one store first.",
      },
    ],
  },
  {
    slug: "discord-branding",
    meta: {
      title: "Discord Server Branding & Setup | BrandForge",
      description:
        "Discord branding, roles, channels, banners, and onboarding for gaming and trading communities. Fixed quote in 24h.",
    },
    hero: {
      eyebrow: "Discord Branding",
      title: "Your server is your storefront.",
      subhead:
        "BrandForge sets up Discord like a product: structure, visuals, onboarding, and mod workflows — so new members know where to buy and where to get support.",
    },
    icp: [
      "Gaming server owners launching a paid tier or marketplace channel",
      "Trading communities that need clear rules and verification flows",
      "Creators merging servers after an acquisition or rebrand",
    ],
    included: [
      "Server icon, banner, and invite splash aligned to your identity",
      "Channel architecture: announcements, support, vouches, listings",
      "Role hierarchy with permissions that match how you actually mod",
      "Welcome flow and rules channel copy written for your niche",
      "Bot recommendations or basic bot setup when scoped",
      "Moderator handbook — what to pin, what to delete, escalation path",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "ValAccs.com",
        href: "/portfolio/valaccs/",
        blurb: "Digital goods brand with community-driven trust signals.",
      },
      {
        label: "Drain.cx",
        href: "/portfolio/drain-cx/",
        blurb: "Product brand extended into community touchpoints.",
      },
    ],
    blogLinks: [
      {
        label: "Discord server branding — complete guide",
        href: "/blog/discord-server-branding-complete-guide/",
      },
      {
        label: "How to build a web store for a gaming community",
        href: "/blog/how-to-build-a-web-store-gaming-community/",
      },
    ],
    pricing: {
      range: "From $350 · often bundled in Brand Sprint",
      note: "Standalone server setup is quick. Complex bot integrations and custom verification systems are quoted separately.",
    },
    body: [
      "Discord is where forum operators live. If your server looks default-gray and your roles are a maze, buyers bounce before they read your vouches. BrandForge treats server setup as product design — information architecture for chat.",
      "We map how money moves: discovery channel, proof channel, support thread expectations, and where staff announcements go. Roles are not decorative; they gate permissions so a new mod cannot accidentally nuke your listings channel.",
      "Visuals match your web identity when you have one. Banner safe zones, icon readability at 32px, and dark-mode contrast are checked against mobile Discord, not just desktop.",
      "Onboarding copy is written for your niche — gaming, trading, SaaS beta, Web3 allowlist — not generic community manager templates. FAQ pins answer the questions you get every day so mods stop answering manually.",
      "Verification and anti-scam flows can integrate with Telegram bots or custom tools when scoped. BrandForge has shipped verification systems for operator communities that cannot afford impersonation losses.",
      "Delivery includes a screenshot map of the server, exported assets, and a short mod guide. BrandForge remains available on Discord for tweak rounds within the quoted revision window.",
    ],
    faqs: [
      {
        question: "Can BrandForge manage my Discord server ongoing?",
        answer:
          "We setup and document — ongoing moderation is yours unless you hire Growth Engine hours for community ops. We can recommend bots and automations that reduce manual mod load.",
      },
      {
        question: "Do you configure Discord bots like Ticket Tool or Carl-bot?",
        answer:
          "Basic bot setup is in scope when quoted. Custom bot development moves to our automation or dev lines with a separate fixed price.",
      },
      {
        question: "Will you write server rules and welcome messages?",
        answer:
          "Yes. Copy is tailored to your niche and payment methods — escrow, crypto, chargeback policies — so members know how you operate before they buy.",
      },
      {
        question: "Can you rebrand an existing server without losing members?",
        answer:
          "We plan channel renames and role migrations to minimize confusion. Announcement templates explain changes. Large migrations are staged with your head mod in the loop.",
      },
    ],
  },
  {
    slug: "automation",
    meta: {
      title: "Workflow Automation — n8n, Make, Zapier | BrandForge",
      description:
        "CRM sync, intake routing, alerts, and ops automation with n8n, Make, or Zapier. Fixed USD quote from BrandForge in 24 hours.",
    },
    hero: {
      eyebrow: "Automation",
      title: "Stop copy-pasting between tools.",
      subhead:
        "BrandForge builds workflows that move leads, orders, and support tickets automatically — so you scale output without hiring an ops person first.",
    },
    icp: [
      "Sellers drowning in manual Discord-to-sheet tracking",
      "SaaS teams connecting CRM, billing, and support without an engineer",
      "Agencies that need client reporting pipelines on autopilot",
    ],
    included: [
      "Workflow diagram and error-handling plan before build",
      "n8n self-hosted or Make/Zapier — whichever fits your stack",
      "Webhook integrations with your store, forms, or bots",
      "Slack or Discord notifications for critical events",
      "Documentation so you can edit triggers later",
      "Two-week hypercare window for broken edge cases",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "LinkedIn Automation Platform",
        href: "/portfolio/linkedin-automation/",
        blurb: "$4,660 scoped automation product with dashboards.",
      },
      {
        label: "Telegram verification system",
        href: "/portfolio/telegram-verification-system/",
        blurb: "Bot-driven verification for operator communities.",
      },
    ],
    blogLinks: [
      {
        label: "AI tools every operator should use",
        href: "/blog/ai-tools-every-operator-should-use/",
      },
    ],
    pricing: {
      range: "From $800 · typical $1,500–$4,500",
      note: "Simple three-step Zaps cost less. Multi-system orchestration with custom API auth sits higher.",
    },
    body: [
      "Manual ops do not scale past your third hire. BrandForge automation work replaces repetitive clicks — new order to spreadsheet, lead to CRM, refund to support channel — with workflows you can see and audit.",
      "We diagram before we build. You approve triggers, data fields, and failure alerts. No black box that breaks silently on a holiday weekend.",
      "n8n self-hosted is preferred when you want control and lower per-task fees. Make and Zapier are fine when speed beats infrastructure. The quote names the platform and who pays monthly task costs.",
      "Discord and Telegram are first-class endpoints. Operator businesses live in chat; your automation should meet orders where they arrive, not force everyone into a SaaS form.",
      "The LinkedIn automation platform in our portfolio was a four-figure scoped build — not a toy Zap. Dashboards, limits, and compliance-aware sending were part of delivery.",
      "Handoff includes exported workflows, credential rotation notes, and a runbook for common failures. mxstermind.com takes multi-system enterprise integrations when you outgrow no-code limits.",
    ],
    faqs: [
      {
        question: "Which automation platform does BrandForge recommend?",
        answer:
          "n8n for control and volume, Make for visual speed, Zapier when your team already pays for it. We recommend in the quote based on task volume, hosting appetite, and budget — not affiliate links.",
      },
      {
        question: "Can you automate crypto or escrow order notifications?",
        answer:
          "Yes, when your store or bot exposes webhooks or API access. We scope read-only vs write actions carefully so automation cannot drain wallets or approve refunds without rules.",
      },
      {
        question: "What happens when an automation breaks?",
        answer:
          "Every workflow includes error branches — retry, alert, dead-letter log. Hypercare covers fixes for edge cases discovered in the first two weeks after launch.",
      },
      {
        question: "Do I need a developer to maintain n8n after handoff?",
        answer:
          "Basic edits are documented for non-devs. Complex new branches can be handled on a small follow-up quote or Growth Engine hours.",
      },
    ],
  },
  {
    slug: "ai-tools",
    meta: {
      title: "Custom AI Tools & Knowledge Bases | BrandForge",
      description:
        "Custom AI assistants and internal copilots trained on your docs — not generic ChatGPT wrappers. BrandForge fixed quote in 24h.",
    },
    hero: {
      eyebrow: "Custom AI Tools",
      title: "AI that knows your business — not the whole internet.",
      subhead:
        "BrandForge builds assistants, RAG knowledge bases, and internal copilots scoped to your docs, SOPs, and support history.",
    },
    icp: [
      "Support-heavy communities that answer the same questions daily",
      "SaaS teams wanting an docs-accurate onboarding bot",
      "Operators who need intake bots that qualify leads before you DM back",
    ],
    included: [
      "Source audit — which docs, Notion, PDFs, or tickets feed the model",
      "Retrieval pipeline with citation or fallback when unsure",
      "Discord, Telegram, or web widget deployment when scoped",
      "Prompt guardrails and escalation to human paths",
      "Usage and cost monitoring setup",
      "Admin guide for updating sources without redeploying everything",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "LinkedIn Automation Platform",
        href: "/portfolio/linkedin-automation/",
        blurb: "AI-assisted workflows with human approval gates.",
      },
    ],
    blogLinks: [
      {
        label: "What is GEO — generative engine optimisation?",
        href: "/blog/what-is-geo-generative-engine-optimisation/",
      },
      {
        label: "AI tools every operator should use",
        href: "/blog/ai-tools-every-operator-should-use/",
      },
    ],
    pricing: {
      range: "From $1,200 · typical $2,500–$6,000",
      note: "Widget-only FAQ bots cost less. Multi-channel deployment with custom auth and analytics sits higher.",
    },
    body: [
      "Generic ChatGPT tabs do not know your refund policy, your escrow rules, or your package tiers. BrandForge AI tools ground answers in sources you control — and say when they do not know instead of hallucinating.",
      "We scope retrieval before prompts. Which Notion space, PDF folder, or ticket export is authoritative? Stale docs are flagged so you update once, not retrain from scratch monthly.",
      "Deployment matches where your users already are. Discord support bot, Telegram intake, or embedded site widget — each channel gets tone and length limits appropriate to the medium.",
      "Human escalation is designed in. High-stakes questions — payments, bans, legal — route to your team with context attached. Automation reduces noise; it does not replace judgment on money.",
      "Cost controls matter. Token budgets, caching, and model selection are documented so a viral week does not surprise you with a four-figure API bill.",
      "GEO overlap: public FAQ pages we build for your site feed both Google and AI search engines. Private copilots stay private. BrandForge names both use cases in the quote so you buy the right layer.",
    ],
    faqs: [
      {
        question: "Does BrandForge train a custom model from scratch?",
        answer:
          "Usually no — we use retrieval-augmented generation on top of proven models. Fine-tuning is quoted only when RAG cannot meet accuracy requirements.",
      },
      {
        question: "Can an AI bot answer in my Discord server?",
        answer:
          "Yes, when scoped with rate limits, allowed channels, and mod override commands. We test adversarial prompts before go-live.",
      },
      {
        question: "How do you keep AI answers aligned with policy changes?",
        answer:
          "Source update playbook is part of handoff. Small teams edit docs and re-index; we can retainer-index on Growth Engine if you prefer us to maintain sources.",
      },
      {
        question: "Is customer data sent to OpenAI or other providers?",
        answer:
          "Disclosed in the quote. We prefer providers and regions matching your privacy comfort. Self-hosted options are discussed for sensitive operator data.",
      },
    ],
  },
  {
    slug: "seo-growth",
    meta: {
      title: "SEO & GEO Growth — Search + AI Visibility | BrandForge",
      description:
        "Traditional SEO plus Generative Engine Optimisation so Google and AI assistants cite BrandForge clients. Monthly and project quotes.",
    },
    hero: {
      eyebrow: "SEO & GEO Growth",
      title: "Get found on Google — and quoted by ChatGPT.",
      subhead:
        "BrandForge runs technical SEO, content structure, and GEO patterns so search engines and AI models can extract accurate answers about your business.",
    },
    icp: [
      "Sites with traffic but no inbound leads from search",
      "Operators whose competitors rank for keywords they invented",
      "Teams launching content hubs who need structure not just posts",
    ],
    included: [
      "Technical audit: crawl, index, Core Web Vitals, schema gaps",
      "Keyword and question map tied to service pages",
      "On-page optimisation for titles, meta, headings, internal links",
      "FAQ and entity blocks written for AI extraction",
      "Monthly reporting on rankings, impressions, and cited queries",
      "Content briefs when Growth Engine includes writing",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "Drain.cx",
        href: "/portfolio/drain-cx/",
        blurb: "Performance-first site with clean semantic structure.",
      },
      {
        label: "Cascade Markets",
        href: "/portfolio/cascade-markets/",
        blurb: "Web3 landing optimised for paid and organic entry.",
      },
    ],
    blogLinks: [
      {
        label: "What is GEO — generative engine optimisation?",
        href: "/blog/what-is-geo-generative-engine-optimisation/",
      },
      {
        label: "Forum marketing in 2026 — what still works",
        href: "/blog/forum-marketing-2026-what-still-works/",
      },
    ],
    pricing: {
      range: "From $900 project · $1,500/mo on Growth Engine",
      note: "One-time audits and fixes differ from ongoing content + link earning retainers.",
    },
    body: [
      "SEO in 2026 is two games: ranking on Google and being summarized correctly when someone asks an AI assistant about your category. BrandForge GEO work makes your pages extractable — clear questions, self-contained answers, schema, entity mentions.",
      "We do not sell backlink packs from spam domains. Technical foundation, internal linking, and content that matches buyer intent come first. Forum operators often skip this entirely and wonder why ads get expensive.",
      "Every Growth Engine month can include search reporting: which queries move, which FAQ blocks appear in AI overviews, where competitors cite better structure. Adjustments are operational, not quarterly deck theater.",
      "Site migrations and replatforms are high-risk moments. BrandForge preserves URL equity, redirects, and schema when you move from static HTML to Next.js or from a template to custom code.",
      "Content hubs — services, case studies, roadmap pages — are how BrandForge structures its own site. We apply the same architecture to clients: hubs, deep pages, internal links, sitemap discipline.",
      "mxstermind.com clients with large editorial programs get bespoke search strategy. BrandForge packages cover operators who need results without hiring a head of marketing.",
    ],
    faqs: [
      {
        question: "What is the difference between SEO and GEO?",
        answer:
          "SEO optimizes for traditional search rankings and clicks. GEO optimizes for how LLMs and AI search extract, cite, and summarize your brand — FAQ blocks, entity clarity, structured data, and answer-shaped copy.",
      },
      {
        question: "How long until SEO results show?",
        answer:
          "Technical fixes can improve Core Web Vitals immediately. Ranking movement often takes eight to sixteen weeks depending on competition. GEO citation tracking is newer; we report observable mentions where tools allow.",
      },
      {
        question: "Does BrandForge write blog posts as part of SEO?",
        answer:
          "Growth Engine can include content production. One-time projects often deliver briefs and structure while your team writes — or we quote writing separately.",
      },
      {
        question: "Can you fix SEO after a bad agency migration?",
        answer:
          "Yes. We audit index status, redirect chains, and lost schema first. Recovery plans are fixed-scope before ongoing retainers.",
      },
    ],
  },
  {
    slug: "paid-ads",
    meta: {
      title: "Paid Ads Management — Google, Meta, TikTok | BrandForge",
      description:
        "Paid ads with creative systems and ROAS tracking for operators. Google, Meta, TikTok. BrandForge — quote in 24 hours.",
    },
    hero: {
      eyebrow: "Paid Ads & ROAS",
      title: "Spend with a system — not a prayer.",
      subhead:
        "BrandForge sets up campaigns, creative templates, and weekly ROAS reporting so you know which dollar bought a customer — not just a click.",
    },
    icp: [
      "E-commerce brands scaling beyond organic Discord sales",
      "SaaS with trial signup goals and limited creative bandwidth",
      "Info products and communities testing paid to cold traffic",
    ],
    included: [
      "Account audit and pixel/conversion verification",
      "Campaign structure: prospecting, retargeting, brand search",
      "Creative template kit — sizes, hooks, safe zones for short-form",
      "Weekly ROAS or CPA report with clear kill/scale rules",
      "Landing page recommendations tied to CRO basics",
      "Spend caps and alerts so budgets do not run away",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "ValAccs.com",
        href: "/portfolio/valaccs/",
        blurb: "Conversion-focused storefront for paid traffic landing.",
      },
      {
        label: "Cascade Markets",
        href: "/portfolio/cascade-markets/",
        blurb: "Web3 landing built for cold traffic clarity.",
      },
    ],
    blogLinks: [
      {
        label: "What is conversion rate optimisation (CRO)?",
        href: "/blog/what-is-cro-conversion-rate-optimisation/",
      },
    ],
    pricing: {
      range: "From $750 setup · $1,200/mo management + ad spend",
      note: "Management fee excludes media spend. Creative production bundled or quoted separately.",
    },
    body: [
      "Paid ads punish vague offers. BrandForge ad work starts with the post-click experience — if the landing page cannot convert, scaling spend amplifies losses.",
      "We configure tracking before scaling: pixels, server-side events where available, UTM discipline, and dashboards you can read without a media buyer translator.",
      "Creative is systematized — hook variants, aspect ratios, iteration calendar — so you are not filming one-off ads that die in three days. Short-form templates align with our social media service when bundled.",
      "Weekly reporting uses kill/scale language. Campaigns that miss CPA targets pause until creative or offer changes — not endless hope spending.",
      "Platform mix depends on audience. Meta for broad B2C, Google for intent, TikTok for creative-led products. We do not force TikTok because it is trendy if your buyer is not there.",
      "BrandForge ad management pairs with Growth Engine retainers. mxstermind.com handles large multi-market budgets and custom attribution when package analytics are not enough.",
    ],
    faqs: [
      {
        question: "Does BrandForge require a minimum ad spend?",
        answer:
          "We recommend minimum monthly spend per platform so data is statistically useful — typically $1,000+ combined for learning phase. Smaller tests are scoped as short sprint engagements.",
      },
      {
        question: "Who owns the ad accounts?",
        answer:
          "You do. BrandForge requests access as agency partner; billing stays on your card. You can revoke access anytime.",
      },
      {
        question: "Can you run ads for crypto or gaming offers?",
        answer:
          "Many offers face platform restrictions. We audit policy fit before taking payment and suggest compliant landing structures where needed.",
      },
      {
        question: "Do you produce video ads or only manage campaigns?",
        answer:
          "Template and static creative are in scope on most quotes. Filmed UGC is quoted via social media service or external creators with BrandForge art direction.",
      },
    ],
  },
  {
    slug: "social-media",
    meta: {
      title: "Social Media & Short-Form Systems | BrandForge",
      description:
        "Content calendars, short-form templates, and posting systems for operators. BrandForge — fixed quote in 24 hours.",
    },
    hero: {
      eyebrow: "Social & Short-Form",
      title: "Content systems — not random posts.",
      subhead:
        "BrandForge builds repeatable short-form templates, calendars, and distribution checklists so you show up daily without reinventing hooks.",
    },
    icp: [
      "Creators who sell on Discord but neglect public social proof",
      "Brands entering TikTok/Reels with no production workflow",
      "B2B operators who need LinkedIn presence without hiring full-time",
    ],
    included: [
      "Channel strategy — which platforms match your buyer",
      "30-day content calendar with hook themes",
      "Short-form template pack (CapCut/Premiere-friendly)",
      "Caption and CTA library aligned to your offers",
      "Repurpose map from long video to clips",
      "Optional posting SOP for VA or in-house editor",
    ],
    process: PROCESS_STANDARD,
    portfolio: [
      {
        label: "Omballa vouch — motion graphics",
        href: "/#vouches",
        blurb: "Client praised BrandForge motion detail on social assets.",
      },
    ],
    blogLinks: [
      {
        label: "Forum marketing in 2026 — what still works",
        href: "/blog/forum-marketing-2026-what-still-works/",
      },
    ],
    pricing: {
      range: "From $600 · $1,500/mo with Growth Engine",
      note: "Template-only delivery is project-based. Ongoing editing and posting adds monthly hours.",
    },
    body: [
      "Consistency beats viral lottery. BrandForge social systems give you a calendar, templates, and captions — so production is a checklist, not a blank page crisis every morning.",
      "We design for operators who hate being on camera. Faceless formats, screen recordings, product demos, and text-on-broll patterns are first-class — not afterthoughts when you refuse to dance on TikTok.",
      "Templates include safe zones, brand colours from your identity system, and hook structures that match your offers. Editors swap clips without breaking layout.",
      "Distribution SOPs cover Discord cross-post, Telegram announcements, and when to boost with paid — linked to paid ads service when you scale.",
      "Motion work in our portfolio earned public vouches for detail — social is not only static JPEGs. Scope motion separately when you need animated launches.",
      "Growth Engine retainer can include monthly template refreshes and performance review. One-off projects kickstart the system; retainers maintain it.",
    ],
    faqs: [
      {
        question: "Does BrandForge post on my accounts daily?",
        answer:
          "Only when scoped with access and monthly hours. Many clients take templates and calendar and post internally or via a VA using our SOP.",
      },
      {
        question: "Which platforms do you support?",
        answer:
          "TikTok, Instagram Reels, YouTube Shorts, X, and LinkedIn depending on audience. Strategy doc names primary and secondary channels.",
      },
      {
        question: "Can social templates match my Brand Sprint identity?",
        answer:
          "Yes — best results when identity tokens exist. Bundle social template pack with Brand Sprint or Launch Stack for colour and type consistency.",
      },
      {
        question: "Do you write scripts or only design templates?",
        answer:
          "Hook scripts and caption libraries are included in most scopes. Full scriptwriting for long-form is quoted separately.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return SERVICE_DETAILS.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): readonly string[] {
  return SERVICE_DETAILS.map((s) => s.slug);
}
