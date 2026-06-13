# Sprint 3 — Content Velocity & Architecture Lockdown

**Dates:** 2026-06-13  
**Goal:** 80+ pages live, content pipeline automated, zero manual SEO file edits

---

## Department 1 — Content Pipeline (P0) ✅

| Task | Status |
|------|--------|
| `src/content/index.ts` unified index | ✅ |
| Auto sitemap from content index | ✅ |
| `generate-llms-txt.mjs` + `generate-rss.mjs` at build | ✅ |
| `lint-content.mjs` (80+ pages, FAQs, meta) | ✅ |
| Blog `posts/` + `_template.md` | ✅ |

---

## Department 2 — Portfolio (P1) ✅

| Task | Status |
|------|--------|
| 25 projects + detail enhancements | ✅ |
| Hub filter / search / featured | ✅ |
| WebP pipeline | ✅ `npm run optimize:portfolio` → `public/img/portfolio/[slug]/` |

---

## Department 3 — Blog (P1) ✅

| Task | Status |
|------|--------|
| 19 posts | ✅ |
| Hub filter + search (server props — **113 kB FLJS**, was 138 kB) | ✅ |
| Auto internal links on all posts | ✅ `defaultRelatedForPost()` |
| RSS + Article/FAQ schema | ✅ |

---

## Department 4 — Niches (P2) ✅

8 niches + `/for/` hub + home cross-links

---

## Department 5 — SEO Hygiene (P2)

| Task | Status |
|------|--------|
| Custom 404 (static links, no heavy imports) | ✅ |
| Lighthouse post-deploy | ✅ see below |
| Cloudflare AI robots | ⚠️ **Manual** — [audit/seo-decision.md](../seo-decision.md) |

---

## Lighthouse — home mobile (2026-06-13 post-gap-fix)

| Metric | Value | Target |
|--------|-------|--------|
| Performance | **72** | ≥60 ✅ |
| Accessibility | **93** | 95+ (close) |
| SEO | **100** | ✅ |
| LCP | 3.1 s | <4 s ✅ |
| TBT | 850 ms | <1.5 s ✅ |
| CLS | 0 | ✅ |

Evidence: `home-mobile.json`, `home-mobile-summary.json`

---

## Build output

| Metric | Value |
|--------|-------|
| Static routes | **86** |
| Sitemap entries | **80** |
| Home FLJS | **113 kB** |
| Blog hub FLJS | **113 kB** (fixed — was 138 kB) |
| Portfolio WebP | **25 images** across 6 slugs |

---

## Commands

```bash
cd brandforge
npm run lint:content
npm run optimize:portfolio   # after adding source PNGs
npm run build
node scripts/lighthouse-home.mjs
npm run deploy
```

---

## Only manual step left

**Cloudflare dashboard:** disable Managed robots blocking GPTBot / ClaudeBot / Google-Extended on brandforge.gg
