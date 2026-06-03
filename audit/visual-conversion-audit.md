# BrandForge — Visual & Conversion Audit

**Date:** 2026-06-03  
**Scope:** brandforge.gg (Next.js 15 static export, Cloudflare Workers assets)  
**Agent:** Autonomous visual/conversion pass

---

## Executive summary

| Area | Before | After this pass |
|------|--------|-----------------|
| Blog `/blog` | User reported wrong Framer/template content | **Production serves correct BrandForge index** (verified live). 11 posts including build-in-public 01 |
| Portfolio projects | 8 case studies, text-only cards | **21 projects** with Live / Upcoming / Archived, mockups, filters |
| Sitewide CTAs | Header Discord only on many pages | **ContactActionBar**: 2× Discord + Telegram under header on all PageShell + home + legal |
| Visual density | Text walls, placeholder frames | Device mockups, stat cards, marquee, 6-project home grid, visual vouches |
| Routes (static) | 56 pages | **64 pages** (13 new portfolio case studies + 1 blog) |

---

## Codebase map (126 files under `brandforge/`)

| Layer | Path | Role |
|-------|------|------|
| App routes | `src/app/` | Home, content group, blog, portfolio, services, roadmap, for, legal |
| Components | `src/components/` | content, shell, sections, visual, portfolio, analytics |
| Content | `src/content/` | blog, portfolio, hubs, home, niche, roadmap, ethics |
| Config | `src/config/site.ts` | Discord, Telegram, GA id |
| Deploy | `wrangler.jsonc` | `out/` static assets |
| Legacy | `site/` (repo root) | Old static HTML — **not** deployed by brandforge worker |

---

## BUG 1 — Blog diagnosis

### Finding

- **Source code:** `src/app/(content)/blog/page.tsx` renders `BLOG_INDEX` from `src/content/blog/index.ts` — correct BrandForge copy.
- **Production check (2026-06-03):** https://brandforge.gg/blog/ lists all operator guides — **no** “AI Agents to the Marketplace” content.
- **Likely root cause of past report:** Stale CDN/cache, old deploy, or confusion with `web/` mxstermind product pages (contains “AI Agents” marketing copy) — **not** brandforge route code.

### Fixes applied

- Confirmed 10 original slugs + added **`/blog/building-brandforge-in-public-01/`** (800+ words, Build in Public series).
- Mid-article `InlineCTA` after section 3 on all blog posts via `BlogArticle.tsx`.
- Sitemap `lastModified` bumped; blog slug in `BLOG_SLUGS`.

### Verification

- `npm run build` → static `/blog/index.html` + 11 post folders under `out/blog/`.

---

## BUG 2 — Missing visuals

### Root cause

- `PortfolioCard` used text-only placeholder header.
- `PortfolioPageTemplate` used `VisualFrame` gray boxes.
- Home relied on long text sections without proof assets.

### Fixes applied

**Component library (`src/components/visual/`):**

- `BrowserMockup`, `PhoneMockup`, `TabletMockup`, `ProjectMockup`
- `ProjectStatusBadge` (Live / In Development / Archived)
- `VisualStatCard`, `TechChip`

**Portfolio (`src/content/portfolio/projects.ts`):**

- 9 Live, 3 Upcoming, 9 Archived — full dataset per brief
- Case studies generated via `build-detail.ts` for every slug
- `/portfolio` → `PortfolioFilterGrid` (client tabs: All · Live · Upcoming · Archived)

**Homepage:**

- Hero stats → `VisualStatCard` grid (50+, 24h, 97 PageSpeed, 4 client slots)
- `LiveWorkMarquee` — favicon + LIVE dot, CSS scroll
- `HomePortfolioPreview` — 6 live projects with mockup cards
- Vouches → `VouchCard` with gold border

**Sitewide:**

- `ContactActionBar` — 2 Discord + Telegram below fixed header
- `InlineCTA` on services (after “Who it’s for”), blog (after §3), portfolio case studies (after screenshots)

---

## Conversion checklist (post-change)

| Page type | ≥2 Discord + 1 Telegram in first scroll | Bottom CTASection |
|-----------|----------------------------------------|-------------------|
| PageShell pages | ✅ ContactActionBar + PageHero CTAs | ✅ |
| Home | ✅ Header + ContactActionBar + hero links | ✅ |
| Blog posts | ✅ ContactActionBar + mid InlineCTA | ✅ |
| Portfolio case studies | ✅ ContactActionBar + mid InlineCTA | ✅ |
| Services | ✅ ContactActionBar + mid InlineCTA | ✅ |
| Terms / Privacy | ✅ ContactActionBar | Footer links |

---

## Portfolio slugs (21)

**Live:** whiteskyhosting, carspotlive, directfiber, drain-cx, boostingfactory, fluorite-store, passle, dyotravel, repsheets  

**Upcoming:** ai-voice-receptionist, crystal-wars, confidential-engagement  

**Archived:** cascade-markets, grindnode, cloutscout, lava-pw, sui-blockchain-app, jarro-ai, linkedin-automation, gazedvalleybeef, valaccs  

---

## Remaining opportunities

1. **Real screenshots** — OG fetch configured for key domains; add captures where OG fails.
2. **Animated stat counters** — deferred (client JS); static stat cards used for perf.
3. **Service page mockups** — per-service hero visuals not yet customized.
4. **Roadmap mid-page CTA** — RoadmapStageTemplate should get InlineCTA (follow-up).
5. **Blog wrong-content monitor** — add deploy smoke test hitting `/blog/` title string.

---

## File index (new/changed)

```
brandforge/src/components/visual/*
brandforge/src/components/portfolio/*
brandforge/src/components/shell/ContactActionBar.tsx
brandforge/src/components/sections/LiveWorkMarquee.tsx
brandforge/src/components/sections/HomePortfolioPreview.tsx
brandforge/src/content/portfolio/projects.ts
brandforge/src/content/portfolio/build-detail.ts
brandforge/src/content/blog/building-brandforge-in-public-01.ts
audit/visual-conversion-audit.md
```

---

*End of audit.*
