import type { LaunchCampaign } from "@/content/launch/types";

/**
 * Update this file each Monday for the new week's campaign.
 * Duplicate the structure, change id/weekLabel/dateRange/theme, swap posts.
 */
export const ACTIVE_CAMPAIGN: LaunchCampaign = {
  id: "2026-w25",
  weekLabel: "Week 25 — Operator Stack",
  dateRange: "Mon 16 Jun – Sun 22 Jun 2026",
  theme: "One invoice for brand, dev, and growth — built for forum operators",
  hook: "Most operators pay three vendors, then chase handoffs for weeks. BrandForge is the opposite: fixed USD packages, Discord delivery, quote in 24h.",
  keyMessages: [
    "Fixed USD packages — no hourly surprise invoices",
    "50+ projects shipped — Web3, gaming, SaaS, e-commerce",
    "Brand + lander + funnel in one sprint (Blueprint from $300)",
    "Escrow-friendly · crypto accepted · Discord/Telegram intake only",
    "Portfolio: CarSpotLive (App Store), cascade.markets, drain.cx, ValAccs",
  ],
  avoid: [
    "Don't beg for clicks — lead with a specific outcome or case study",
    "No 'DM me' spam in forum threads — link once at the bottom",
    "Don't bump more than once per 48h on the same thread",
    "Reddit: value first, link in comment or profile — not title spam",
    "Skip urgency theatre ('LAST CHANCE!!!') — scarcity only when real (slot counts)",
  ],
  timezonePrimary: "US Eastern (EST/EDT) — peak forum traffic 6–10pm",
  timezoneSecondary: "UTC+0 for EU overlap — add 5h to EST for UTC (EDT: add 4h)",
  postingGuide: [
    {
      platform: "reddit",
      bestEst: "07:00–09:00 or 12:00–13:00",
      bestUtc: "11:00–13:00 or 16:00–17:00",
      why: "US morning scroll + lunch break. Tue–Thu strongest.",
    },
    {
      platform: "linkedin",
      bestEst: "10:00–12:00 Tue–Thu",
      bestUtc: "14:00–16:00",
      why: "B2B feed peak. Skip weekends.",
    },
    {
      platform: "x",
      bestEst: "08:00–10:00 or 12:00–13:00",
      bestUtc: "12:00–14:00 or 16:00–17:00",
      why: "Commute + lunch. Threads perform better mid-week.",
    },
    {
      platform: "threads",
      bestEst: "11:00–13:00 Fri–Sat",
      bestUtc: "15:00–17:00",
      why: "Casual browsing window. Pair with a visual.",
    },
    {
      platform: "hackforums",
      bestEst: "19:00–22:00",
      bestUtc: "23:00–02:00",
      why: "Evening US = highest HF marketplace activity.",
    },
    {
      platform: "voided",
      bestEst: "20:00–23:00",
      bestUtc: "00:00–03:00",
      why: "Same evening window as HF. Post once, reply to questions.",
    },
    {
      platform: "patched",
      bestEst: "18:00–21:00",
      bestUtc: "22:00–01:00",
      why: "Dev community peaks after US work hours.",
    },
    {
      platform: "builtbybit",
      bestEst: "10:00–14:00 Wed",
      bestUtc: "14:00–18:00",
      why: "Mid-week resource updates get indexed faster.",
    },
    {
      platform: "nulledbb",
      bestEst: "17:00–20:00 Fri",
      bestUtc: "21:00–00:00",
      why: "Weekend prep browsing. Keep tone factual, not salesy.",
    },
  ],
  days: [
    {
      key: "mon",
      label: "Monday",
      date: "Jun 16",
      posts: [
        {
          id: "mon-reddit",
          platform: "reddit",
          timeEst: "07:30",
          kind: "story",
          title: "I stopped pitching agencies to forum sellers — here's what they actually buy",
          body: `I've shipped 50+ projects for forum operators, Discord server owners, and Web3 founders. The pattern is always the same:

They don't want a 40-slide deck. They want:
→ A logo + lander that looks funded
→ A fixed USD quote in 24h
→ Delivery on Discord (not email chains)
→ Escrow or crypto, no surprise invoices

So we productised it: BrandForge — nine disciplines (brand, dev, growth) in fixed packages.

Tier 1 Blueprint ($300–$500): logo, colours, single high-converting lander, funnel structure. 1–2 weeks.

Recent builds: CarSpotLive (live on App Store), cascade.markets, drain.cx, a SUI blockchain app rebuilt in two weeks.

Not pitching — sharing what actually closes deals in this space. Happy to answer scope questions in comments.

Site: brandforge.gg/packages
Discord: discord.gg/a8Nz2R6M55`,
          notes: "Post to r/Entrepreneur, r/SideProject, or r/webdev. Respond to every comment within 2h. Link only once.",
        },
        {
          id: "mon-linkedin",
          platform: "linkedin",
          timeEst: "10:15",
          kind: "new-thread",
          body: `Forum operators don't buy "brand strategy."

They buy:
• A logo that doesn't look like a Fiverr template
• A landing page that converts cold traffic
• A fixed quote before they send escrow

That's why we built BrandForge — a fixed-package studio (not an agency retainer pitch).

50+ projects. Quote in 24h. Discord delivery.

Blueprint tier starts at $300 for operators who need to look funded before they're big.

Portfolio includes App Store launches, Web3 dashboards, and Discord-native community infra.

If you're building in public this quarter — what's the one asset you're delaying because quotes keep coming back vague?

brandforge.gg`,
          notes: "No link in first comment on LinkedIn — link in post is fine. Ask the closing question to drive comments.",
        },
      ],
    },
    {
      key: "tue",
      label: "Tuesday",
      date: "Jun 17",
      posts: [
        {
          id: "tue-x-thread",
          platform: "x",
          timeEst: "09:00",
          kind: "new-thread",
          title: "Thread: What forum operators actually pay for (not what agencies pitch)",
          body: `1/ Operators don't fail because they lack ideas.

They fail because brand, website, and growth live with three vendors — and nobody owns the deadline.

2/ We tracked 50+ projects across Web3, gaming, SaaS, and e-commerce.

The wins had one thing in common: fixed scope, fixed USD, one Discord thread.

3/ So we built BrandForge — packages instead of hourly billing.

Blueprint ($300–$500): logo, lander, funnel structure. 1–2 weeks.
Automator ($1.5k–$3k/mo): n8n/Make workflows + CRO.

4/ Real builds:
• CarSpotLive — App Store
• cascade.markets — Web3
• drain.cx — brand + web
• SUI app — rebuilt in 2 weeks

5/ What we don't do:
• Fortune 500 theatre
• Surprise invoices
• Contact forms (Discord/Telegram only)

6/ Quote turnaround: 24h.
Payment: crypto or escrow.
Slots: 4 client slots Q3 2026.

7/ If you're shipping something this month — reply with what you're building.

I'll tell you which package tier fits (no pitch, just scope).

brandforge.gg/packages · discord.gg/a8Nz2R6M55`,
          notes: "Post as thread. Pin tweet 1. Reply to every scope question with specifics.",
        },
        {
          id: "tue-hf",
          platform: "hackforums",
          timeEst: "19:30",
          kind: "new-thread",
          title: "[Service] Brand + Web + Growth — Fixed USD Packages | 24h Quote | Escrow OK",
          body: `[center][size=large][b]BrandForge[/b] — Design, Dev & Growth for Operators[/size][/center]

[b]What this is:[/b]
Fixed-package studio for forum sellers, Discord owners, Web3 founders. Not hourly agency billing.

[b]Packages:[/b]
[list]
[*][b]Blueprint[/b] ($300–$500) — Logo, brand kit, single lander, funnel structure. 1–2 weeks.
[*][b]Automator[/b] ($1,500–$3,000/mo) — n8n/Make automation, CRM integrations, monthly CRO.
[*][b]MVP Engine[/b] ($5,000/mo) — Custom web app / MVP, sprint shipping.
[*][b]AI & Community[/b] ($7,500/mo) — Discord bots, AI agents, video pipelines.
[/list]

[b]Recent work:[/b]
CarSpotLive (App Store), cascade.markets, drain.cx, ValAccs.com, dyotravel.com, SUI blockchain app (2-week rebuild).

[b]How to start:[/b]
1. Check packages: brandforge.gg/packages
2. Message on Discord: discord.gg/a8Nz2R6M55
3. Fixed quote within 24h. Escrow/crypto accepted.

[b]Proof:[/b] brandforge.gg/portfolio

[i]Replies answered daily. Scope questions welcome — no vague "DM me" runaround.[/i]`,
          notes: "Post in Marketplace > Services. Use HF BBCode. Bump Thursday if no traction.",
        },
      ],
    },
    {
      key: "wed",
      label: "Wednesday",
      date: "Jun 18",
      posts: [
        {
          id: "wed-bbb",
          platform: "builtbybit",
          timeEst: "11:00",
          kind: "new-thread",
          title: "Brand + Landing Page Package for Server Owners & Digital Sellers",
          body: `[BrandForge — Fixed Package Studio]

Built for operators who need to look professional before scale.

[b]Blueprint Package ($300–$500):[/b]
• Logo + colour system + typography
• Single high-converting landing page
• Social templates (Discord, X, store banners)
• 2 revision rounds
• Delivery: 1–2 weeks

[b]Also available:[/b]
• Discord server branding + setup
• Custom web apps / MVPs (monthly retainer)
• Workflow automation (n8n / Make)

[b]Portfolio:[/b] brandforge.gg/portfolio
[b]Packages:[/b] brandforge.gg/packages

Start via Discord: discord.gg/a8Nz2R6M55
Fixed quote in 24h. Escrow accepted.`,
          notes: "List under Services or Resources. Include 2–3 portfolio screenshots as images.",
        },
        {
          id: "wed-voided",
          platform: "voided",
          timeEst: "20:15",
          kind: "new-thread",
          title: "[Service] BrandForge — Brand, Web & Automation | Fixed USD | 24h Quote",
          body: `[b]BrandForge[/b] — execution layer for operators who ship.

Not an agency deck. Fixed packages, Discord delivery, quote in 24h.

[b]Tiers:[/b]
• Blueprint $300–$500 — brand + lander + funnel
• Automator $1.5k–$3k/mo — automation + CRO
• MVP Engine $5k/mo — web app sprints

[b]Shipped:[/b] CarSpotLive (App Store), cascade.markets, drain.cx, ValAccs, SUI app in 2 weeks.

[b]Start:[/b] discord.gg/a8Nz2R6M55 · brandforge.gg/packages

Escrow/crypto OK. Scope questions answered in thread.`,
          notes: "Marketplace section. Keep shorter than HF — voided audience prefers direct.",
        },
      ],
    },
    {
      key: "thu",
      label: "Thursday",
      date: "Jun 19",
      posts: [
        {
          id: "thu-reddit-engage",
          platform: "reddit",
          timeEst: "12:00",
          kind: "comment",
          title: "Engagement comments — adapt to thread context",
          body: `[Template A — someone asking about landing pages]
We scope landers as part of a fixed package ($300–$500 tier) — logo, colours, single page, funnel structure. Quote in 24h, delivery on Discord. Portfolio at brandforge.gg/portfolio if you want to see operator-focused work.

[Template B — someone building a Discord community]
Discord branding + bot integrations are a separate lane for us — either Blueprint (visual kit + server setup basics) or AI & Community retainer for bots/automation. Happy to scope if you share member count + what you're selling.

[Template C — someone comparing agencies]
Fixed packages exist because hourly billing punishes operators. We productised nine disciplines into tiers so you know the range before escrow. Packages page lays it out: brandforge.gg/packages

[Template D — Web3 founder thread]
Shipped cascade.markets and a SUI app rebuild in two weeks — fixed sprint scope, no open-ended retainer unless you want one. Crypto/escrow both fine.`,
          notes: "Search: 'landing page', 'discord server', 'brand identity', 'mvp' in target subs. 3–5 genuine comments, not copy-paste identical text.",
        },
        {
          id: "thu-patched",
          platform: "patched",
          timeEst: "19:00",
          kind: "new-thread",
          title: "[Services] Web + Brand Packages for Dev Projects & Communities",
          body: `[b]BrandForge[/b] — fixed USD packages for devs who need brand + web without agency overhead.

[b]What we ship:[/b]
• Brand identity (logo, tokens, social kit)
• High-converting landing pages / landers
• Custom web apps & MVPs ($5k/mo sprint retainer)
• Automation (n8n, Make, API integrations)

[b]Recent:[/b]
• CarSpotLive — mobile app, App Store
• SUI blockchain app — full rebuild in 2 weeks
• drain.cx — brand + web

[b]Process:[/b]
Discord intake → fixed quote in 24h → sprint delivery → escrow/crypto

discord.gg/a8Nz2R6M55
brandforge.gg/portfolio`,
          notes: "Dev community tone — lead with technical deliverables, not marketing fluff.",
        },
        {
          id: "thu-hf-bump",
          platform: "hackforums",
          timeEst: "20:00",
          kind: "bump",
          body: `Bump — still taking Blueprint + Automator slots for July.

Added CarSpotLive + SUI app case studies to portfolio this week: brandforge.gg/portfolio

Quote in 24h on Discord: discord.gg/a8Nz2R6M55`,
          notes: "Reply to your Tuesday HF thread. Only if 48h+ since original post.",
        },
      ],
    },
    {
      key: "fri",
      label: "Friday",
      date: "Jun 20",
      posts: [
        {
          id: "fri-threads",
          platform: "threads",
          timeEst: "11:30",
          kind: "new-thread",
          body: `Most founders don't need another strategy call.

They need:
→ a logo that doesn't look cheap
→ a landing page that converts
→ a fixed price before they send escrow

That's the whole idea behind BrandForge.

50+ projects. Quote in 24h. Discord delivery.

Blueprint from $300 — brand + lander + funnel in one sprint.

What's the one asset you're stuck on right now?

brandforge.gg`,
          notes: "Pair with a portfolio screenshot or before/after. Cross-post to IG with same caption + carousel.",
        },
        {
          id: "fri-nulledbb",
          platform: "nulledbb",
          timeEst: "18:30",
          kind: "new-thread",
          title: "[Services] BrandForge — Brand Identity + Web + Automation | Fixed USD",
          body: `[b]BrandForge[/b]
Design, development & growth — fixed packages for digital operators.

[b]Services:[/b]
• Logo + brand identity + social assets
• Landing pages & web apps
• Discord branding & bots
• n8n/Make workflow automation

[b]Pricing:[/b]
Blueprint: $300–$500 (one-time)
Retainers from $1,500/mo

[b]Proof:[/b] brandforge.gg/portfolio
[b]Contact:[/b] discord.gg/a8Nz2R6M55

Fixed quote in 24h. Escrow accepted.`,
          notes: "Factual tone. Don't oversell. Reply to thread questions same day.",
        },
      ],
    },
    {
      key: "sat",
      label: "Saturday",
      date: "Jun 21",
      posts: [
        {
          id: "sat-x",
          platform: "x",
          timeEst: "10:00",
          kind: "new-thread",
          body: `Shipped CarSpotLive to the App Store.

Before: generic logo, no landing page, DMs as the only funnel.

After: brand kit + lander + store assets in one Blueprint sprint.

Forum operators don't need permission to look funded.

Fixed packages → brandforge.gg/packages`,
          notes: "Attach portfolio image or short screen recording. Quote tweet with portfolio link.",
        },
        {
          id: "sat-forum-replies",
          platform: "hackforums",
          timeEst: "15:00",
          kind: "reply",
          title: "Forum reply templates — HF, Voided, Patched, NulledBB",
          body: `[Scope question reply]
Happy to scope — what's the deliverable list? (logo only, lander, full brand kit, automation, etc.) and your deadline. We quote fixed USD within 24h on Discord.

[Price question reply]
Blueprint is $300–$500 depending on asset count (logo + lander + funnel structure). Retainers start at $1,500/mo for automation. Full breakdown: brandforge.gg/packages

[Proof/reputation reply]
Portfolio with case studies: brandforge.gg/portfolio — includes App Store launch, Web3 dashboards, Discord community work. Escrow accepted.

[Timeline reply]
Blueprint sprints are 1–2 weeks. MVP retainers ship in monthly sprints — usually 2–3 feature deployments per month depending on scope.`,
          notes: "Batch-reply to any unanswered thread comments across all forums. 30min block.",
        },
      ],
    },
    {
      key: "sun",
      label: "Sunday",
      date: "Jun 22",
      posts: [
        {
          id: "sun-linkedin",
          platform: "linkedin",
          timeEst: "10:30",
          kind: "new-thread",
          body: `Case study format that actually works for small studios:

[b]Before[/b]
Client had an idea, a Discord server, and a logo made in Canva.

[b]Problem[/b]
Cold traffic bounced. Escrow buyers asked "who else have you worked with?" — no portfolio, no lander.

[b]Build[/b] (Blueprint tier, 10 days)
• Logo + colour system
• Single landing page with vouch section
• Discord banner + social templates

[b]After[/b]
Fixed quote closed in 24h. Second project came from a forum referral two weeks later.

This is the pattern we repeat at BrandForge — not because it's flashy, but because operators buy outcomes, not hours.

50+ projects across Web3, gaming, SaaS, e-commerce.

brandforge.gg/portfolio`,
          notes: "Swap 'Client' for real project name when you have permission. CarSpotLive or drain.cx work well.",
        },
        {
          id: "sun-prep",
          platform: "x",
          timeEst: "20:00",
          kind: "new-thread",
          title: "Week 25 recap + Week 26 prep (internal)",
          body: `[Week 25 recap — copy to Discord #marketing or notes]

Posted: Reddit story, LinkedIn x2, X thread, HF + bump, BBB, Voided, Patched, NulledBB, Threads/IG

Track:
• Reddit post upvotes + comment count:
• HF thread views + replies:
• X thread impressions:
• Inbound Discord DMs from campaign:

[Week 26 angle ideas — pick one]
1. "Building BrandForge in public" — share a specific sprint metric
2. Discord server branding niche — target gaming/community owners
3. Automation tier focus — n8n/Make case study
4. Web3 landing page teardown — value post, soft CTA

Next week files: update src/content/launch/campaign.ts with new id + posts`,
          notes: "Internal only — not for public posting. Fill in metrics before planning Week 26.",
        },
      ],
    },
  ],
};

/** Previous weeks archived here when rotating campaigns */
export const CAMPAIGN_ARCHIVE: readonly LaunchCampaign[] = [];
