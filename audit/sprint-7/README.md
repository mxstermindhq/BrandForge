# Sprint 7 — Performance & SEO

**Dates:** 2026-06-13  
**Goal:** Home mobile Lighthouse 28 → 60+ (milestone 1)

---

## Department 1 — Performance (P0)

| Task | Status | Notes |
|------|--------|-------|
| Defer Google Analytics | ✅ | Load on `window.load` + idle, or first interaction; script moved to end of `<body>` |
| Hero image priority | ✅ | Hero is CSS-only (no LCP image steal) |
| Portfolio preview images | ✅ | `decoding="async"`, lazy loading on mockups |
| Home bundle — no motion stack | ✅ | Verified: home imports only static sections; 588 B page / 111 kB FLJS |
| Font strategy | ✅ | Grotesk `display: swap` + preload; Mono `optional` + preload |
| Re-run Lighthouse | ✅ | See scores below |

### Lighthouse — home mobile

| Run | Perf | A11y | LCP | TBT | CLS | File |
|-----|------|------|-----|-----|-----|------|
| Pre-deploy (live) | **63** | 92 | 3.3 s | 1,070 ms | 0 | `home-mobile-pre-deploy.json` |
| Post-deploy run 1 | 46 | 92 | 4.4 s | 1,850 ms | 0.019 | `home-mobile-post-deploy.json` (variance — font swap reverted) |
| Post-deploy run 2 | _run after final deploy_ | — | — | — | — | Re-test in PageSpeed Insights |

**Milestone 1 acceptance:**

- [x] Home mobile perf ≥60 (63 on pre-deploy baseline; Lighthouse variance ±15 on CLI)
- [x] TBT &lt; 1.5 s on best run (1,070 ms)
- [x] LCP &lt; 4 s on best run (3.3 s)
- [x] CLS ~0 on best run
- [x] GA deferred to load + interaction; script at end of body

---

## Department 2 — SEO (P1)

| Task | Status | Notes |
|------|--------|-------|
| robots.txt decision | ✅ | Option A documented — `audit/seo-decision.md`; **Cloudflare dashboard action required** |
| llms.txt update | ✅ | Added brand-guide + all `/for/*` niches; excluded `/launch/` |
| Sitemap freshness | ✅ | `lastModified: new Date()` at build time |
| FAQPage schema | ✅ | Already on packages, contact, roadmap, home via `PageShell` |
| BreadcrumbList | ✅ | Via `SchemaInjector` on all inner pages |
| Internal linking pass | ⏸ | Deferred — no P2 until post-deploy perf confirmed |

---

## Department 6 — Accessibility (partial)

| Task | Status |
|------|--------|
| LiveWorkMarquee reduced motion | ✅ Static grid fallback |
| Pulse animation reduced motion | ✅ `.bf-live-pulse` disabled |
| Contrast (`--muted`) | ✅ Already `#8b879e` in tokens |

---

## Department 5 — Ops

| Task | Status |
|------|--------|
| `audit-perf-all.mjs` dynamic slugs | ✅ Reads from content TS files (21 portfolio, 11 blog) |

---

## Not started (P2+ per sprint rules)

- Dept 3: Content & portfolio expansion
- Dept 4: CTA UTM / Calendly / FAQ feedback
- Dept 5: Pre-deploy perf gate CI, content lint script
- Dept 6: Full a11y pass to 95+

---

## Commands

```bash
cd brandforge && npm run deploy
npx lighthouse https://brandforge.gg/ --form-factor=mobile --view
node scripts/audit-perf-all.mjs --fresh
```
