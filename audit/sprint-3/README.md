# Sprint 3 — Content Velocity & Architecture Lockdown

**Dates:** 2026-06-13  
**Goal:** 80+ pages live, content pipeline automated, zero manual SEO file edits

---

## Department 1 — Content Pipeline (P0)

| Task | Status | Notes |
|------|--------|-------|
| `src/content/index.ts` unified index | ✅ | Typed entries for static, blog, portfolio, services, niches, roadmap |
| Auto sitemap from content index | ✅ | `sitemap.ts` imports `getAllContentEntries()` |
| `generate-llms-txt.mjs` at build | ✅ | Reads manifest → `public/llms.txt` |
| `generate-rss.mjs` at build | ✅ | `public/rss.xml` + RSS link in root layout |
| `lint-content.mjs` enhanced | ✅ | 80+ pages, duplicates, meta lengths, niches ≥8 |
| Blog `_template.md` + `posts/` folder | ✅ | Register in `posts/index.ts` + build |

**Workflow:** New blog post → `posts/your-slug.ts` + one line in `posts/index.ts` → `npm run build`

---

## Department 2 — Portfolio (P1)

| Task | Status |
|------|--------|
| 25 projects | ✅ |
| Related projects on detail | ✅ |
| Services + niche links on detail | ✅ |
| Start similar project CTA + copy intake | ✅ |
| Hub: niche filter + search + featured | ✅ |
| WebP image pipeline | ⏸ Deferred (gradient mockups) |

---

## Department 3 — Blog (P1)

| Task | Status |
|------|--------|
| 19 posts (14 baseline + 5 new) | ✅ |
| Discord growth, Web3 trust, forum reputation guides | ✅ in `posts/` |
| Article + FAQPage schema | ✅ via PageShell |
| Per-post OG + keywords | ✅ |
| Internal linking footer | ✅ BlogPostFooter |
| Hub: category filter + search + latest | ✅ BlogFilterGrid |
| RSS feed | ✅ `/rss.xml` |

---

## Department 4 — Niches (P2)

| Task | Status |
|------|--------|
| 8 niche pages | ✅ + mobile-app-founders, automation-ops-teams |
| `/for/` hub | ✅ |
| Home links to all niches | ✅ IcpSection grid |

---

## Department 5 — SEO Hygiene (P2)

| Task | Status |
|------|--------|
| Content lint meta/schema checks | ✅ Partial — meta + counts |
| Custom 404 with search + links | ✅ `app/not-found.tsx` |
| Cloudflare AI robots | ⚠️ Manual dashboard |

---

## Build output

| Metric | Value |
|--------|-------|
| Static routes | **86** |
| Sitemap entries | **80** indexable |
| Home FLJS | 113 kB (no regression vs Sprint 7) |
| Blog hub | 138 kB FLJS (filter grid client) |

---

## Commands

```bash
cd brandforge
npm run lint:content
npm run build
npm run deploy
```

---

## Manual remaining

- Cloudflare: disable Managed robots blocking AI crawlers
- Portfolio WebP assets in `public/img/portfolio/[slug]/`
- Lighthouse post-deploy → save to `audit/sprint-3/`
