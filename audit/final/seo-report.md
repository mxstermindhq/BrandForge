# SEO & AI Discoverability — Post-Sprint 7 Audit

**Audit date:** 2026-06-13  
**Domain:** https://brandforge.gg

---

## robots.txt

| Check | Status | Notes |
|-------|--------|-------|
| Single consistent policy | **FAIL** | Two layers: Cloudflare Managed (blocks AI bots) + Next.js export (allows them) |
| Cloudflare vs app conflict | **YES** | Documented in `audit/seo-decision.md` |
| AI-open intent | **Partial** | App allows GPTBot, ClaudeBot, Google-Extended; CF blocks them |
| Standard crawlers | **PASS** | `User-agent: * Allow: /` |

**Production excerpt (Cloudflare layer blocks AI):**
```
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /
```

**Required action:** Disable Cloudflare Managed robots override per `audit/seo-decision.md`.

---

## Sitemap

| Check | Status | Value |
|-------|--------|-------|
| Valid XML | PASS | `curl https://brandforge.gg/sitemap.xml` |
| URL count | PASS | **91 URLs** (target ≥90) |
| Dynamic lastModified | PASS | `2026-06-13T00:00:00.000Z` on sampled entries |
| `/launch/` excluded | PASS | Not present in sitemap |
| Auto-generated | PASS | `src/app/sitemap.ts` from `getAllContentEntries()` |

---

## llms.txt

| Check | Status | Notes |
|-------|--------|-------|
| Readable | PASS | 193 lines (<500) |
| All indexable routes | PASS | Hub, services, portfolio, blog, niches, store, partners |
| Brand guide summary | PASS | `/brand-guide/` with voice notes |
| Pricing context | PASS | Five tiers + custom |
| Contact context | PASS | Discord + Telegram |
| Excludes `/launch/` | PASS | Not listed |
| Auto-generated | PASS | `scripts/generate-llms-txt.mjs` at build |

---

## Schema (JSON-LD)

| Page type | Expected | Status |
|-----------|----------|--------|
| Home | Organization + WebSite + SearchAction | PASS |
| `/services/*` | Service + FAQ | PASS |
| `/packages/` | Product tiers | PASS |
| `/portfolio/*` | CreativeWork + BreadcrumbList | PASS |
| `/blog/*` | Article + FAQPage (where FAQ present) | PASS |
| Hubs | FAQPage | PASS |
| `/store/*` | Product | PASS |
| Vouches | Review | Partial |

**Validation:** 91 pass, 0 fail, 3 warn (`/privacy/`, `/terms/`, `/404/` — no JSON-LD).  
See `audit/final/schema-check.json`.

---

## Meta & OG

| Check | Status | Notes |
|-------|--------|-------|
| Unique titles | PASS | Content lint enforces per-page metaTitle |
| Unique descriptions | PASS | lint-content validates 50–165 chars |
| OG tags | PASS | Via Next.js metadata API |
| Blog unique OG images | Partial | Per-post when configured |
| Canonical URLs | PASS | Trailing-slash convention |
| Duplicate titles | PASS | No duplicates detected in lint |

---

## Internal Linking

| Check | Status | Notes |
|-------|--------|-------|
| Orphaned pages | Partial | Dashboard data flags orphans; most pages linked |
| Blog → services/portfolio | PASS | Content architecture enforces internal links |
| Portfolio → services/niches | PASS | Related links in templates |
| Home → 8 niche pages | PASS | Niche grid on home |
| MXSTERMIND cross-link | PASS | Header/footer CrossPlatformLink |

**Broken link found:** `/portfolio/telegram-verification-system/` (404) linked from `/services/automation/`.

---

## Grade: **B**

Strong sitemap, llms.txt, and schema coverage. **Blocker:** Cloudflare robots conflict prevents AI crawler access despite intentional AI-open policy.
