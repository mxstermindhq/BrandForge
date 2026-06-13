# Sprint 7 — Performance & SEO

**Dates:** 2026-06-13  
**Goal:** Home mobile Lighthouse 28 → 60+ (milestone 1); close P2 conversion + content gaps

---

## Department 1 — Performance (P0)

| Task | Status | Notes |
|------|--------|-------|
| Defer Google Analytics | ✅ | Load on `window.load` + idle, or first interaction; script at end of `<body>` |
| Hero image priority | ✅ | Hero is CSS-only (no LCP image steal) |
| Portfolio preview images | ✅ | `decoding="async"`, lazy loading on mockups |
| Home bundle — no motion stack | ✅ | Verified: home imports only static sections; 588 B page / 111 kB FLJS |
| Font strategy | ✅ | Grotesk `display: optional` + preload; Mono `optional` + preload |
| WebP/AVIF pipeline | ⏸ | Deferred — gradient mockups cover new portfolio entries |
| Milestone 2 (perf 85+) | ⏸ | Requires asset pipeline + bundle split |

---

## Department 2 — SEO (P1)

| Task | Status | Notes |
|------|--------|-------|
| robots.txt decision | ✅ | Option A — `audit/seo-decision.md` |
| Cloudflare Managed robots | ⚠️ | **Manual dashboard fix** — disable AI bot block |
| llms.txt update | ✅ | brand-guide + niches; no `/launch/` |
| Sitemap freshness | ✅ | `lastModified: new Date()` at build |
| FAQPage schema | ✅ | Via `PageShell` |
| Internal linking | ✅ | New blog posts link to `/services/`, `/packages/`, portfolio |

---

## Department 3 — Content (P2)

| Task | Status |
|------|--------|
| Portfolio 21 → 25 | ✅ forum-commerce-hub, ops-flow-dashboard, community-launch-kit, geo-content-engine |
| Blog +3 posts | ✅ pricing, n8n vs Make, landing checklist |
| Automator “Most popular” | ✅ Mid-tier badge on home + packages |
| Package comparison table | ✅ `/packages/` |
| Delivery timeline visual | ✅ `/packages/` |
| Vouches +4 | ✅ home.ts |

---

## Department 4 — Conversion (P2)

| Task | Status |
|------|--------|
| UTM on Discord/Telegram CTAs | ✅ `src/lib/tracking.ts` + GA `cta_click` events |
| Copy intake buttons | ✅ Package cards + packages page |
| Calendly embed (custom tier) | ✅ Ready when `SITE.calendlyUrl` is set |
| FAQ 👍/👎 feedback | ✅ `FAQBlock` → GA `faq_feedback` |
| Animated trust counters | ✅ `AnimatedHeroStats` on home hero |

---

## Department 5 — Ops

| Task | Status |
|------|--------|
| `audit-perf-all.mjs` dynamic slugs | ✅ |
| `lint-content.mjs` | ✅ Meta + slug validation |
| `pre-deploy-check.mjs` | ✅ Content lint + build gate |

---

## Department 6 — Accessibility

| Task | Status |
|------|--------|
| LiveWorkMarquee reduced motion | ✅ |
| FAQ feedback buttons | ✅ `aria-pressed`, labels |
| Full pass to 95+ | ⏸ Re-test after deploy |

---

## Commands

```bash
cd brandforge
npm run lint:content
npm run predeploy
npm run deploy
node scripts/audit-perf-all.mjs --fresh
```

---

## Still manual / deferred

- Cloudflare dashboard: allow GPTBot, ClaudeBot, Google-Extended
- Set `SITE.calendlyUrl` when Calendly is live
- WebP/AVIF conversion for portfolio screenshots
- Full Lighthouse crawl post-deploy
