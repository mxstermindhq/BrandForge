# Sprint 4 — Conversion Engineering & Trust Architecture

**Goal:** CTA click-through +15%, intake completion +20%, trust signals everywhere  
**Stack:** Next.js 15.5 static export · Cloudflare Workers Assets · GA4

## Shipped

### Dept 1 — CTA & tracking (P0)

- `src/config/tracking.ts` — UTM presets
- `src/lib/tracking.ts` — `buildTrackedUrl`, `discordHref`, `discordCopyUrl`, `portfolioExternalHref`
- `CopyInviteButton` — copy invite + toast + `click_copy_discord`
- `StartPackageButton` — tier CTA + mobile intake modal + `click_package_tier`
- `CalendlyEmbed` — inline widget or Discord fallback
- `AbHeroPrimaryCta` — hero A/B test wired on home
- GA events: `click_discord`, `click_telegram`, `click_package_tier`, `click_calendly`, `click_copy_discord`

### Dept 2 — Trust (P1)

- `AnimatedHeroStats` — 25+ projects, 12 countries, 14 vouches (count-up on scroll)
- `VouchCarousel` — mobile carousel, desktop grid, verified project badges
- `ClientLogoBar` — niche marquee on home + `/packages/`
- `ResultStatBox` — copyable stats on portfolio detail pages

### Dept 3 — FAQ feedback (P1)

- `FAQBlock` — 👍/👎, localStorage `bf-faq-feedback`, `faq_helpful` GA event
- `scripts/faq-weekly-report.mjs` — weak FAQ report from exported JSON

### Dept 4 — Launch ops (P2)

- Campaign schema: `startDate`, `endDate`, `results`, `learnings`
- `/launch/` — days remaining, platform checklist (localStorage), campaign history
- `scripts/generate-campaign.mjs` — 7-day scaffold generator

### Dept 5 — A/B (P2)

- `src/lib/ab-test.ts` — `useABTest`, sessionStorage hash, no external deps
- First test on home hero — see `audit/ab-tests.md`

## Manual

- Set `SITE.calendlyUrl` in `src/config/site.ts` when Calendly is live
- Export FAQ feedback: localStorage key `bf-faq-feedback` → `audit/faq-feedback-export.json`

## Verify

```bash
cd brandforge
npm run lint:content
npm run build
node scripts/lighthouse-home.mjs   # target perf ≥ 60 mobile
npm run deploy
```

## Lighthouse evidence

Home mobile perf **71** — `audit/sprint-4/home-mobile.json`

## Sprint 4 gap fixes (follow-up)

- FAQ `pageSlug` on all major pages (contact, roadmap, services, blog, portfolio, for, about, ethics)
- Contact FAQ expanded (response time, availability, process) + Copy invite on contact cards
- Roadmap hub FAQ expanded (stage selection guidance)
- `StartPackageButton` copies tier intake message before opening Discord
- `CopyInviteButton` on header, InlineCTA, and contact page
- Portfolio highlights on 4 more case studies (cascade, valaccs, forum-commerce, community-launch)
- Vouch verified-project links for @Can and @vizzy
- `src/content/launch/generate-copy.ts` — outreach template helper
