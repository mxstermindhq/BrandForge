# SEO & AI-SEO Final Report

**Date:** 2026-05-19  
**Scope:** brandforge.gg (57 routes) + mxstermind.com (37 routes)

---

## Executive summary

Both domains ship as Next.js 15 static exports with per-page metadata, JSON-LD graphs, visible FAQ blocks, canonical URLs, OG/Twitter tags, sitemaps, and AI-bot-friendly robots.txt. Cross-domain entity signals link brandforge.gg ↔ mxstermind.com in footers and ethics copy.

---

## brandforge.gg

| Check | Status |
|-------|--------|
| Unique titles & meta descriptions | ✅ Per-page via `buildPageMetadata` |
| Canonical absolute URLs | ✅ |
| OG + Twitter cards | ✅ |
| Organization JSON-LD | ✅ All pages via `SchemaInjector` |
| BreadcrumbList | ✅ All inner pages |
| FAQPage schema | ✅ Where FAQ blocks exist |
| Service / CreativeWork / Article schema | ✅ Service, portfolio, blog routes |
| WebSite + SearchAction (home) | ✅ |
| Visible FAQ blocks | ✅ Hubs, services, portfolio, blog, ethics |
| Sitemap | ✅ 57 URLs — `brandforge/src/app/sitemap.ts` |
| robots.txt AI bots allowed | ✅ |
| Internal linking | ✅ Hubs → deep dives → portfolio → blog |
| Deploy | ✅ Cloudflare Workers Assets (`brandforge`) |

---

## mxstermind.com

| Check | Status |
|-------|--------|
| Unique titles & meta descriptions | ✅ 37 routes |
| Canonical absolute URLs | ✅ |
| OG + Twitter cards | ✅ |
| Organization JSON-LD | ✅ |
| BreadcrumbList | ✅ |
| FAQPage schema | ✅ All major page types |
| CreativeWork (portfolio) / Article (blog) | ✅ |
| WebSite + SearchAction (home) | ✅ |
| Visible FAQ blocks | ✅ Home, hubs, case studies, dev platform, blog |
| Sitemap | ✅ 32 content URLs + index routes — `mxstermind/src/app/sitemap.ts` |
| robots.txt AI bots allowed | ✅ |
| Internal linking | ✅ Services ↔ developers ↔ portfolio ↔ blog ↔ apply |
| Cross-link BrandForge | ✅ Footer + services + ethics + home |
| Deploy | ⏳ Run `npm run mxstermind:deploy` |

### mxstermind route inventory (37 static)

- **Core (6):** `/`, `/services/`, `/portfolio/`, `/process/`, `/apply/`, `/about/`
- **Developers (7):** hub + 6 technical pages
- **Portfolio (6):** cascade-markets, drain-cx, carspotlive, sui-blockchain, crypto-trading-platform, telegram-verification-system
- **Trust (3):** `/ethics-standards/`, `/blog/`, `/for/established-businesses/`
- **Blog posts (10):** all slugs from content audit registry
- **System (2):** `/sitemap.xml`, `/robots.txt`

---

## AI-SEO (GEO) patterns applied

1. **Question-phrased FAQ copy** — written as buyers ask in Discord/Telegram, not keyword-stuffed headings.
2. **Entity clarity** — Organization schema names match visible brand (`BrandForge`, `mxstermind`) and `sameAs` includes Discord + Telegram.
3. **Extractable structure** — H2 sections, FAQ `<details>` blocks, breadcrumb labels match URL hierarchy.
4. **Internal anchors** — blog posts link to `/services/`, `/portfolio/`, `/developers/` paths on the same domain.

---

## Known gaps / follow-ups

| Item | Priority | Notes |
|------|----------|-------|
| mxstermind production DNS cutover | High | Deploy worker + point mxstermind.com |
| OG image brand variant | Low | Currently shared `/img/og-image.png` from brandforge assets |
| Blog word count expansion | Medium | mxstermind posts are structured for GEO; expand to 1,200+ words per spec over time |
| brandforge home ICP/process sections | Done | Live strip, ICP, process, delivery, support, FAQ, trust bar, mxstermind promo, sticky CTA, home JSON-LD |
| Lighthouse mobile perf | Medium | Mobile lite applied — re-run audit to confirm gains |

---

## Validation commands

```bash
# brandforge
cd brandforge && npm run build

# mxstermind
cd mxstermind && npm run build
```

Expected: static export, zero type errors, sitemap counts match route registries.

---

*Phase 11–12 complete. mxstermind app built; SEO validation documented.*
