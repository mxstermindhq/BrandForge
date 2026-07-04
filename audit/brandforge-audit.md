# BrandForge.gg — Production Audit

**Audit date:** 2026-06-13  
**URL:** https://brandforge.gg  
**Stack:** Next.js 15.5 · static export · Cloudflare Workers Assets (`brandforge/`)  
**Deploy:** `cd brandforge && npm run deploy`  
**Latest deploy:** commit `5888368` (includes `/launch/` campaign page)

---

## Executive summary

| Area | Grade | Verdict |
|------|-------|---------|
| **Content & routes** | A | 71 static pages live — full hub + 21 portfolio + 11 blog + launch ops page |
| **SEO / schema** | A | Per-page metadata, JSON-LD, sitemap, llms.txt — home SEO **100** |
| **Conversion funnel** | A | Discord/Telegram CTAs, package intake messages, FAQ, ethics, brand guide |
| **Mobile performance** | D | Home still worst page — **28** perf, **8.6 s LCP** (Jun 3 crawl) |
| **Desktop performance** | C | Home **65** — acceptable hero, heavy JS on inner pages |
| **Ops / crawl hygiene** | B− | robots.txt conflict at edge; perf audit script stale |

**Bottom line:** BrandForge is content-complete and SEO-strong. The main gap is **mobile home speed** — everything else averages ~65 mobile Lighthouse perf across 51 crawled URLs.

---

## 1. Live site check (2026-06-13)

| URL | HTTP | Notes |
|-----|------|-------|
| `/` | 200 | Static hero + full legacy sections restored |
| `/launch/` | 200 | Internal campaign calendar — `noindex` |
| `/sitemap.xml` | 200 | ~65 indexable URLs |
| `/robots.txt` | 200 | **Conflict** — see §6 |

---

## 2. Route inventory

**Build output:** 71 prerendered routes (Jun 13 build)

| Type | Count | Examples |
|------|-------|----------|
| Hubs | 12 | `/`, `/services/`, `/packages/`, `/portfolio/`, `/about/`, `/contact/`, `/roadmap/`, `/blog/`, `/ethics-standards/`, `/brand-guide/`, `/terms/`, `/privacy/` |
| Services | 9 | `/services/brand-identity/` … `/services/social-media/` |
| Portfolio | 21 | cascade-markets, carspotlive, drain-cx, valaccs, … |
| Roadmap stages | 6 | validate → tools-resources |
| Niche `/for/*` | 6 | gaming-server-owners, forum-sellers, web3, … |
| Blog posts | 11 | GEO, CRO, Discord branding, build-in-public, … |
| Ops (noindex) | 1 | `/launch/` — weekly outreach calendar |
| System | 2 | `robots.txt`, `sitemap.xml` |

**Not in sitemap (intentional):** `/launch/` (`robots: noindex`)

---

## 3. Architecture (current)

```
brandforge/
├── src/app/              Next.js App Router — static export
│   ├── page.tsx          Home — fully static (no WebGL/GSAP on home)
│   ├── (content)/        Marketing hubs + dynamic [slug] routes
│   └── (content)/launch/ Internal campaign CRM (client component)
├── src/content/          Typed copy modules (home, blog, portfolio, launch)
├── src/components/
│   ├── sections/         HomeStaticCoreSections, HomeStaticSections
│   ├── content/          PageShell, FAQBlock, CopyButton, SchemaInjector
│   └── shell/            StaticSiteHeader, ContactActionBar, SiteFooter
├── out/                  Static export → Wrangler assets
└── wrangler.jsonc        Cloudflare Workers Assets
```

### Home page (important change since May audit)

Home no longer hydrates `HomeMotionSections`, Lenis, WebGL, or GSAP pin stacks. It uses:

- `HomeHeroStatic` — CSS gradient hero, no canvas
- `HomeCoreSections` — services, packages, vouches (static HTML)
- `HomeStaticSections` — ICP, process, delivery table, support, trust
- `LiveWorkMarquee`, `HomePortfolioPreview`, FAQ, CTA

Motion stack (`AppProviders`, `SceneCanvas`, `LenisProvider`) remains in codebase for optional future use but **is not mounted on home or content layout**.

---

## 4. Lighthouse — production

**Source:** `audit/lh-bf-all/` (51 URLs, mobile, 2026-06-03) · `audit/lh-bf-home-*-2026.json`

### Home `/`

| Metric | Mobile | Desktop | Target |
|--------|--------|---------|--------|
| Performance | **28** (Jun 3) / **12** (May 19) | **65** | 85+ / 95+ |
| LCP | **8.6 s** | ~1.1 s | < 2.5 s |
| TBT | **3.1 s** | ~1.1 s | < 200 ms |
| CLS | **0** | ~0.006 | ≈ 0 |
| SEO | **100** | — | 100 |
| Accessibility | **89** | — | 95+ |
| Best practices | **81** | — | 100 |

CLS regression from May (0.86) appears **fixed** — static home removed lazy package hydration shift.

### Site-wide mobile perf (51 pages)

| Stat | Value |
|------|-------|
| Average performance | **65** |
| Pages &lt; 50 | **5** (home + 4 heavy blog/hub pages) |
| Pages ≥ 75 | **8** |
| Worst | `/` **28**, CarSpotLive blog **46** |
| Best | `/brand-guide/` **84**, whiteskyhosting portfolio **82** |

**Pattern:** Content pages (portfolio, roadmap, terms) score 74–84. **Home and long blog posts** drag averages down via TBT + LCP.

### Raw reports

- `audit/brandforge-perf-all.json` — summary JSON
- `audit/lh-bf-all/*.json` — per-URL mobile reports
- `audit/lh-bf-home-mobile-2026.json`, `audit/lh-bf-home-desktop-2026.json`
- `audit/lighthouse.md` — quick reference table

### Re-run full crawl

```bash
cd brandforge && node scripts/audit-perf-all.mjs --fresh
```

> **Note:** `scripts/audit-perf-all.mjs` still hardcodes 8 portfolio slugs — update to import `PORTFOLIO_SLUGS` from content before next run (21 projects missing from crawl).

---

## 5. SEO & AI discoverability

| Check | Status |
|-------|--------|
| Unique titles + meta per route | ✅ `buildPageMetadata()` |
| Canonical URLs | ✅ |
| OG + Twitter cards | ✅ `/img/og-image.png` |
| Organization + BreadcrumbList JSON-LD | ✅ `SchemaInjector` |
| FAQPage schema | ✅ Hubs, services, portfolio, blog, ethics |
| WebSite + SearchAction (home) | ✅ |
| Visible FAQ blocks | ✅ Home + inner pages |
| Sitemap | ✅ ~65 URLs — `src/app/sitemap.ts` |
| llms.txt | ✅ `public/llms.txt` — missing `/brand-guide/` |
| sr-only home summary | ✅ Package pricing for crawlers |
| Cross-link mxstermind | ✅ Footer + promo section |

---

## 6. Issues & recommendations

### P0 — Mobile home performance

**Problem:** LCP 8.6 s, perf 28 despite static home.

**Likely causes:**
1. Shared Next.js JS chunks (~103 kB First Load JS on content pages)
2. Google Analytics (`G-G3L5EBB195`) — third-party main-thread work
3. Font loading (Space Grotesk + Space Mono, `display: optional` helps but LCP element may still wait)
4. Large hero typography + marquee + portfolio preview images without priority hints

**Fixes (ordered):**
1. Defer GA until after `load` or first interaction
2. Add `fetchPriority="high"` to above-fold logo / hero visual if any
3. Audit portfolio preview images — WebP, explicit width/height, lazy below fold only
4. Consider route-level JS splitting — home imports only static components (already done; verify chunk graph)

### P1 — robots.txt conflict

Production `robots.txt` contains **two layers**:

1. **Cloudflare Managed** — blocks GPTBot, ClaudeBot, Google-Extended, etc.
2. **App `robots.ts`** — explicitly allows those bots

Edge config wins for blocked user-agents. If AI-SEO is intentional, disable or align Cloudflare Managed robots in the dashboard.

### P2 — Stale audit tooling

| Item | Fix |
|------|-----|
| `audit-perf-all.mjs` portfolio list | Import from `@/content/portfolio/projects` |
| Sitemap `lastModified` | Dynamic date or update on deploy |
| `llms.txt` | Add brand-guide; omit `/launch/` (noindex ops) |

### P3 — Accessibility (89 mobile home)

Re-run axe/Lighthouse on home after perf pass. Prior audits flagged contrast on `--muted` (partially fixed). Check marquee motion + reduced-motion coverage on `LiveWorkMarquee`.

### P4 — Launch page ops

`/launch/` is live, noindex, not in sitemap — **correct for internal ops**.

- 7-day campaign starting Fri 13 Jun 2026, 18:51 local
- Discord + 9 platforms with copy buttons
- Update weekly via `src/content/launch/campaign.ts`

---

## 7. Conversion & content quality

| Element | Status |
|---------|--------|
| Package tiers (5 + custom) | ✅ Home + `/packages/` |
| Discord/Telegram intake templates | ✅ `config/site.ts` per tier |
| Portfolio case studies | ✅ 21 projects with detail pages |
| Vouches + trust stats | ✅ Home |
| Delivery table + support tiers | ✅ Restored in static sections |
| Ethics + brand guide | ✅ Copy-paste templates |
| Blog depth | ✅ ~8 sections × 11 posts |
| Roadmap checklists | ✅ Copy buttons per stage |
| Contact | ✅ Discord/Telegram only — no form (intentional) |

---

## 8. Security & deploy

| Item | Status |
|------|--------|
| Static export — no server secrets in client | ✅ |
| Env vars | GA ID public only |
| Cloudflare Workers Assets | ✅ No Node runtime |
| HTTPS | ✅ brandforge.gg |

---

## 9. Priority action list

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Defer Google Analytics load | Low | Medium TBT reduction |
| 2 | Image audit on home portfolio preview | Low | LCP |
| 3 | Fix Cloudflare vs app robots.txt | Low | AI crawl consistency |
| 4 | Update `audit-perf-all.mjs` slug lists | Low | Accurate monitoring |
| 5 | Re-run 65-URL Lighthouse crawl post-fix | Medium | Baseline |
| 6 | Target home mobile perf 60+ then 85+ | High | Core Web Vitals |

---

## 10. Related audit files

| File | Scope |
|------|-------|
| `audit/lighthouse.md` | Lighthouse score quick reference |
| `audit/performance-audit.md` | May 2026 deep-dive (pre-static home) |
| `audit/seo-final-report.md` | SEO checklist both domains |
| `audit/content-audit.md` | Content architecture (partially outdated route counts) |
| `audit/brandforge-fix-report.md` | May remediation log |
| `audit/brandforge-perf-all.json` | Jun 3 mobile summary (51 URLs) |

---

*Next audit recommended after mobile home perf pass — re-run Lighthouse on `/` and full sitemap.*
