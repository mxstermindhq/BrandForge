import { WELCOME_CREDITS } from "@/lib/constants";
import { SITE } from "@/lib/site";

export type DistributionPost = {
  id: string;
  platform: string;
  title: string;
  body: string;
  notes?: string;
  tags?: string[];
};

const URL = SITE.url;
const REGISTER = `${URL}/auth/register`;
const CREDITS = WELCOME_CREDITS;

/** Platform-ready posts for manual distribution — not linked from public nav. */
export const DISTRIBUTION_POSTS: DistributionPost[] = [
  {
    id: "discord",
    platform: "Discord",
    title: "Server announcement (@everyone)",
    tags: ["community", "warm audience"],
    notes: "Paste in your Discord. Tag @everyone if your server allows it.",
    body: `Hello @everyone — want to try a new tool I've been building? It's a lead generation tool for B2B and B2C. Super simple:

1. Paste your product or service website
2. Press **Analyze** to build your buyer persona
3. Search, scrape, and get hundreds of potential buyers — contact details and relevant context included

**Try it:** ${URL}

Register, paste your website, review your buyer persona, then pull potential buyers. **${CREDITS} free credits** to start — DM me if you need more.

Best weekend and good luck everyone 🙏`,
  },
  {
    id: "telegram",
    platform: "Telegram",
    title: "Channel / group post",
    tags: ["short", "mobile-friendly"],
    body: `New tool drop — LeadForge 🔥

B2B + B2C lead gen in 3 steps:
1️⃣ Paste your website
2️⃣ AI builds your ideal buyer persona
3️⃣ Scrape leads across Reddit, LinkedIn, X, Google & more

${URL}

${CREDITS} free credits on signup. Need more? Message me here.`,
  },
  {
    id: "reddit-long",
    platform: "Reddit",
    title: "Value-first launch post (r/Entrepreneur, r/SaaS, r/startups)",
    tags: ["long form", "no hard sell"],
    notes: "Adapt title per sub. Avoid link-only posts — lead with the problem you solve. Check each sub's self-promo rules.",
    body: `**Title idea:** I built a tool that turns your website into a buyer persona, then finds matching leads across 8 platforms — looking for testers

I've been working on **LeadForge** — paste your product/service URL, it analyzes who actually *buys* (not just what you sell), then searches Reddit, LinkedIn, X, Google, YouTube, Instagram, TikTok, and the open web for people showing intent.

**How it works:**
- Paste your site → AI infers ICP (titles, pain points, intent phrases)
- Confirm the profile → live scrape with fit scores + emails where available
- Export CSV or work leads in the dashboard

Built this because I was tired of guessing buyer keywords manually. Early version but the flow works end-to-end.

**Free to try:** ${REGISTER} (${CREDITS} credits, no card)

Happy to answer questions in comments — especially if you're B2B SaaS, agency, or ecom and want to sanity-check whether the persona it builds matches your market.`,
  },
  {
    id: "reddit-short",
    platform: "Reddit",
    title: "Short comment / reply template",
    tags: ["comment", "reply"],
    body: `If you want something that builds a buyer persona from your site URL and then scrapes matching leads (Reddit, LinkedIn, X, etc.), I built LeadForge for exactly that — ${CREDITS} free credits at ${REGISTER}. Happy to share more if useful.`,
  },
  {
    id: "hackforums",
    platform: "HackForums",
    title: "Marketplace / services thread",
    tags: ["forum", "BBCode ok"],
    notes: "Use a clear thread title. Add screenshots from the landing demo if the forum allows images.",
    body: `[b]LeadForge — AI buyer persona + multi-platform lead scraping[/b]

Started building this yesterday, opening it up for testers.

[b]What it does:[/b]
[list]
[*]You paste your product/service website
[*]AI analyzes the site and builds your ideal buyer profile (titles, intent signals, where buyers hang out)
[*]Search + scrape potential buyers across Google, Reddit, LinkedIn, X, YouTube, Instagram, TikTok, open web
[*]Leads come back with fit scores, context, and emails when we can extract them
[/list]

[b]Good for:[/b] B2B founders, agencies, ecom brands, anyone doing outbound who doesn't want to guess ICP keywords manually.

[b]Try it:[/b] ${URL}
[b]Free credits:[/b] ${CREDITS} on register — ping me if you need more for a real test run.

Built by the same team behind BrandForge. Feedback welcome.`,
  },
  {
    id: "voided",
    platform: "Voided.to",
    title: "Release / tools section",
    tags: ["forum", "digital"],
    notes: "Match Voided tone — direct, no fluff. Add [RELEASE] prefix if that's the norm in your section.",
    body: `[RELEASE] LeadForge — paste your site, get buyer persona + scraped leads

Simple flow:
→ Paste website URL
→ Analyze → AI buyer persona (ICP, intent phrases, platforms)
→ Stream leads with scores + contact details

Works for B2B and B2C. Pulls from Reddit, LinkedIn, X, Google, YouTube, IG, TikTok, web.

Link: ${URL}
${CREDITS} free credits. DM for extra if you're running a serious test.

Early build — looking for feedback from people actually doing outreach.`,
  },
  {
    id: "patched",
    platform: "Patched.to",
    title: "Tools / services listing",
    tags: ["forum"],
    body: `LeadForge — lead gen tool (B2B + B2C)

1. Paste your product/service website
2. AI builds your buyer persona from the site content
3. Scrape hundreds of potential buyers across multiple platforms

Platforms: Google, Reddit, LinkedIn, X, YouTube, Instagram, TikTok, open web
Output: fit scores, context snippets, emails when available, CSV export

${URL} — ${CREDITS} free credits on signup.

Built this over the last few days. If you try it, drop feedback — I'll add credits if you need more volume.`,
  },
  {
    id: "builtbybit",
    platform: "BuiltByBit",
    title: "Resource / tool announcement",
    tags: ["marketplace", "dev audience"],
    notes: "BuiltByBit audience skews dev/marketplace — emphasize MVP speed and outbound for digital products.",
    body: `[FREE TOOL] LeadForge — website → buyer persona → multi-platform lead scrape

For sellers, SaaS founders, and agencies:

• Paste your site URL
• AI infers who buys (job titles, pain points, intent keywords)
• Scrape matching leads live across 8 channels
• Export or manage in dashboard

Channels: Google, Reddit, LinkedIn, X, YouTube, Instagram, TikTok, open web.

Try: ${URL}
${CREDITS} free credits — no subscription required to start.

I'm the builder — message me on Discord/Telegram (links on site) if you want extra credits for a proper test.`,
  },
  {
    id: "twitter-thread",
    platform: "X / Twitter",
    title: "Launch thread (5 posts)",
    tags: ["thread", "social"],
    body: `1/ Shipped something new: LeadForge — paste your website, AI builds your buyer persona, then scrapes matching leads across 8 platforms.

B2B + B2C. ${CREDITS} free credits to try.

${URL}

🧵 how it works ↓

2/ Step 1 — Paste your product or service URL. Not a form about "who you think buys" — the site itself.

3/ Step 2 — Analyze. AI reads your offer and outputs ICP: titles, intent signals, pain points, where buyers congregate.

4/ Step 3 — Search. Intent-based queries hit Reddit, LinkedIn, X, Google, YouTube, IG, TikTok, open web. Leads stream live with fit scores.

5/ Emails extracted when available. CSV export. ${CREDITS} free credits on signup.

Try it → ${REGISTER}

Feedback welcome — especially if the persona it builds is off for your niche.`,
  },
  {
    id: "twitter-single",
    platform: "X / Twitter",
    title: "Single post",
    tags: ["short"],
    body: `LeadForge: paste your site → AI buyer persona → scrape leads across Reddit, LinkedIn, X, Google & more.

${CREDITS} free credits. ${URL}`,
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    title: "Founder post",
    tags: ["professional", "B2B"],
    body: `I started building LeadForge this week — a lead generation tool for B2B and B2C.

The idea is simple:
1. Paste your product or service website
2. AI analyzes the site and builds your ideal buyer persona (not a generic template — inferred from what you actually sell)
3. Search and scrape potential buyers across LinkedIn, Reddit, X, Google, YouTube, and more — with fit scores and contact details where available

We're opening it up for early testers. ${CREDITS} free credits to start; happy to add more for anyone running a real outbound test.

Try it: ${URL}

If you're doing outbound for SaaS, agencies, or ecom — I'd love feedback on whether the buyer profiles match your market.`,
  },
  {
    id: "generic-forum",
    platform: "Generic forum",
    title: "Universal template (any board)",
    tags: ["adaptable"],
    notes: "Swap bracketed fields. Shorten if the forum hates long posts.",
    body: `[Tool] LeadForge — website URL in, buyer persona out, leads scraped across platforms

Hey — sharing a tool I built for finding buyers without manually writing ICP docs.

Flow:
1. Paste your product/service website
2. Analyze → AI buyer persona
3. Scrape potential buyers (contact + context) across multiple platforms

Use case: B2B SaaS, agencies, ecom, creators selling services — anyone who needs outbound leads.

Link: ${URL}
Free: ${CREDITS} credits on register.

[Add: your forum-specific proof/screenshots if required]`,
  },
  {
    id: "dm-short",
    platform: "DM / cold intro",
    title: "One-liner + link",
    tags: ["outreach", "minimal"],
    body: `Hey — built a lead gen tool where you paste your site, it builds your buyer persona, then scrapes matching leads across Reddit/LinkedIn/X/Google. ${CREDITS} free credits: ${REGISTER}`,
  },
];

export const THREAD_TITLES: { platform: string; titles: string[] }[] = [
  {
    platform: "Reddit",
    titles: [
      "Built a tool that turns your website into a buyer persona + scrapes leads — looking for testers",
      "[Tool] Paste your site → AI buyer profile → leads from Reddit/LinkedIn/X",
      "Anyone else hate manually defining ICP keywords? I automated it from your URL",
    ],
  },
  {
    platform: "HackForums / Voided / Patched",
    titles: [
      "[RELEASE] LeadForge — AI buyer persona + multi-platform lead scraping",
      "[FREE] Website → buyer persona → scraped leads (B2B + B2C)",
      "New lead gen tool — paste URL, get hundreds of potential buyers",
    ],
  },
  {
    platform: "BuiltByBit",
    titles: [
      "[FREE TOOL] LeadForge — website to buyer persona to lead scrape",
      "Lead generation tool for digital sellers — 500 free credits",
    ],
  },
  {
    platform: "X / Twitter",
    titles: [
      "Shipped LeadForge — paste your site, get buyer persona + scraped leads",
      "New: AI buyer intelligence + multi-platform lead scraping",
    ],
  },
];

export const POSTING_CHECKLIST = [
  "Pick platform section that allows tools/services (read rules first)",
  "Use the matching copy block — tweak tone if mods are strict",
  "Add 1–2 screenshots (landing demo or search results) if images allowed",
  "Link to " + URL + " or " + REGISTER + " — register converts better",
  "Reply to comments same day — offer extra credits to serious testers",
  "Track which forum/thread drove signups (ask in Discord how they found you)",
];

export const QUICK_FACTS = {
  url: URL,
  register: REGISTER,
  credits: CREDITS,
  platforms: "Google, Reddit, LinkedIn, X, YouTube, Instagram, TikTok, Open Web",
  discord: SITE.discord,
  telegram: SITE.telegram,
};
