# BrandForge & TheOne — Product Gaps Master List

**Last updated:** 2026-06-14  
**Positioning:** mxstermind.com = **Founder Operating System** (not bespoke agency)  
**Scope:** Sprints 1–7 (brandforge.gg) + ecosystem best-in-class targets (TheOne monorepo)  
**Production:** https://brandforge.gg · deploy `feea4662` · commit `57d6ac9`  
**Last ship (pending):** home static hero, server blog hub, HSTS, CI gate
**Overall grade (Post-Sprint 7):** **B-** → target **A** for best-in-class operator studio

---

## How to read this doc

| Tag | Meaning |
|-----|---------|
| ✅ | Shipped and verified |
| ⚠️ | Partially done or blocked on manual/config |
| ❌ | Not started or failing acceptance |
| 🔴 | P0 — revenue, acquisition, or security |
| 🟠 | P1 — conversion, trust, or scale |
| 🟢 | P2 — polish, automation, nice-to-have |

**Best-in-class bar:** Mobile CWV pass on acquisition pages · attributed Discord funnel · self-serve store revenue · AI-discoverable content · ops that run without manual audits · ecosystem surfaces that cross-sell without confusion.

---

## Executive snapshot

| Dimension | Current | Best-in-class target | Gap severity |
|-----------|---------|----------------------|--------------|
| Pages live | 91 sitemap / 87 indexable | 90+ with zero orphans | 🟢 Met |
| Home mobile perf | **83** | ≥85, LCP &lt;2.5s, TBT &lt;200ms | 🟠 Close |
| Site-wide mobile avg | **~63** | ≥80, zero pages &lt;50 | 🔴 |
| SEO / schema | 100 home SEO, 96.7% schema | Full coverage + GSC CWV pass | 🟠 |
| AI discoverability | llms.txt ✅, robots conflict ❌ | AI bots allowed consistently | 🔴 |
| Conversion tracking | Events coded | GA4 Real-Time verified + CRM | 🟠 |
| Store revenue | Discord fallback | Stripe live + first sale | 🔴 |
| Ops automation | Scripts ✅, uptime ❌ | CI gates + 5-min monitor + alerts | 🟠 |
| Ecosystem bridge | BF → MM ✅ | Reciprocal nav + unified attribution | 🟠 Partial — mxstermind.com apex serves SaaS app; marketing site on worker |
| Marketplace (`web/`) | Separate app | Prod smoke test + Sentry on checkout | 🔴 (ecosystem) |
| LeadForge | Pre-1.0 | Rate limits, tests, billing hardened | 🔴 (ecosystem) |

---

## Sprint-by-sprint: shipped vs gaps

### Sprint 1 — Foundation & motion site

**Theme:** Next.js 15 app, motion-rich marketing experience, deploy pipeline.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ App Router, static export path | ❌ Motion stack (Lenis, GSAP, WebGL) still on inner routes — adds TBT on blog/portfolio |
| ✅ Cloudflare Workers Assets deploy | ⚠️ Dual brandforge apps in repo (`brandforge/` vs `web/`) — IA/docs still confuse buyers |
| ✅ Home rebuilt as static shell (intentional) | 🟢 Re-enable lightweight motion on home *only* if perf stays ≥85 |

---

### Sprint 2 — Performance & SEO base

**Theme:** Lighthouse baseline, metadata, sitemap, robots, font/image foundations.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ Per-page metadata, sitemap, robots.ts | ❌ Home mobile **83/85**; site-wide avg **63/80** |
| ✅ Schema foundation | ⚠️ `/privacy/`, `/terms/`, `/404/` — no JSON-LD (warn only) |
| ✅ HTTPS, static export | ❌ **HSTS** not confirmed at edge; partial security headers only in `_headers` |
| ✅ Image pipeline started | ❌ 2 oversized images, 7 legacy formats (image audit warnings) |
| | ❌ **INP** not tracked; TBT high on 32+ pages in crawl |
| | ❌ Core Web Vitals pass in Search Console (likely failing mobile home) |

---

### Sprint 3 — Content velocity & architecture lockdown

**Theme:** 80+ pages, unified content index, auto sitemap/llms/RSS, lint pipeline.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ 87 indexable / 91 sitemap URLs | 🟢 Manifest says 87 vs 90+ narrative — align counts in dashboard |
| ✅ 25 portfolio, 20 blog, 8 niches, 9 services | 🟠 Blog hub FLJS still heavy (~113 kB) — target &lt;100 kB |
| ✅ `lint-content.mjs`, auto internal links | ❌ No CI job that fails PRs on lint failure |
| ✅ RSS, Article/FAQ schema | 🟠 Blog posts missing unique OG images per post (generic fallbacks) |
| ✅ Custom 404 | 🟢 Orphan page detection in dashboard — not auto-fixed |
| ⚠️ Cloudflare AI robots | 🔴 **Still manual** — [seo-decision.md](./seo-decision.md) |

---

### Sprint 4 — Conversion engineering & trust

**Theme:** UTM CTAs, trust counters, FAQ feedback, A/B tests, `/launch/` ops.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ UTM on Discord/Telegram/package CTAs | ❌ **GA4 Real-Time never verified** in audit |
| ✅ AnimatedHeroStats, vouches, ClientLogoBar | 🟠 No session replay / heatmaps (Clarity, PostHog) |
| ✅ FAQ 👍/👎 + `faq_helpful` + `faq_feedback` | 🟠 FAQ weekly report script exists — not scheduled |
| ✅ A/B hero test active | ❌ **No completed test** — winner not declared ([ab-tests.md](./ab-tests.md)) |
| ✅ `/launch/` campaign calendar | 🟠 Week 1 metrics empty; campaign not rotated weekly |
| ✅ CopyInviteButton, StartPackageButton, CalendlyEmbed | ⚠️ `SITE.calendlyUrl` often unset — embed falls back to Discord |
| | ❌ No intake question: “Where did you hear about us?” in Discord template |
| | ❌ No lightweight CRM (Notion/Airtable) wired to GA events |

---

### Sprint 5 — Performance polish & AI-scale

**Theme:** AVIF, critical CSS, edge cache, llms.txt, rich schema, partners/store placeholders.

| Acceptance target | Status |
|-------------------|--------|
| Home mobile perf ≥85 | ❌ **83** (fresh LH 2026-06-13) |
| Site-wide avg ≥85 | ❌ **~63** |
| LCP &lt;2.5s, TBT &lt;200ms home | ❌ LCP **2.9s**, TBT **452ms** |
| AVIF via `<picture>` | ✅ Pipeline exists — verify MIME in prod DevTools |
| Critical CSS home | ✅ |
| `_headers` cache 1y static / 1h HTML | ✅ |
| llms.txt rich | ✅ 193 lines, auto-generated |
| Service/Product/Review/HowTo schema | ✅ 91/91 pass |
| `/partners/`, `/store/`, lead magnets | ✅ pages live |
| Portfolio before/after + video thumbs | ✅ |
| Service worker + prefetch | ✅ registered |
| Cache purge on deploy | ⚠️ Needs `CLOUDFLARE_API_TOKEN` + `ZONE_ID` |

**Remaining Sprint 5 gaps**

- 🔴 Full `audit-perf-all.mjs --fresh` on all 91 URLs (Windows EPERM — run on Linux CI)
- 🟠 Blog/portfolio route JS splitting — shared 103 kB First Load JS on content pages
- 🟠 Deploy uses `pre-deploy:quick` — skips Lighthouse gate

---

### Sprint 6 — Analytics dashboard & automation

**Theme:** `/admin/`, pre/post-deploy, weekly reports, bundle/image/schema audits.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ `/admin/` + `dashboard-data.json` at build | ❌ **No live GA4** in dashboard (Looker iframe null) |
| ✅ pre-deploy, post-deploy, weekly-report scripts | ❌ **Uptime monitor** not configured (5-min) |
| ✅ validate-schema, check-links, track-bundles | ⚠️ `DISCORD_WEBHOOK_URL` unset — deploy notify skipped |
| ✅ Lighthouse history in dashboard | ❌ No automated weekly report cron / GitHub Action |
| | ❌ Store revenue, partner referrals not in dashboard (static placeholders) |
| | 🟠 Dashboard screenshot/archival not automated |
| | 🟠 `npm run pre-deploy` full gate not used on production deploy |

---

### Sprint 7 — Ecosystem bridge & store launch

**Theme:** MXSTERMIND bridge, store MVP, partners v2, membership/events/community, client portal.

| Shipped | Gaps for best-in-class |
|---------|------------------------|
| ✅ `/mxstermind/`, cross-nav, `cross_platform_nav` | ✅ Repositioned as Founder OS; mxstermind header links BrandForge |
| ✅ `/store/` 4 products + Product schema | ❌ **Stripe env vars** unset — Discord fallback only |
| ✅ `/store/success/` + `purchase_completed` | ⚠️ Stripe Payment Links must redirect to success URL |
| ✅ `/partners/` 6 listings, affiliate copy, `?ref=` | 🟠 First partner referral not verified in GA4 |
| ✅ Membership, events, community pages | 🟠 No first workshop scheduled / calendar not dynamic |
| ✅ `/client/` scaffold (noindex) | ❌ No project status, file delivery, or client auth |
| ✅ Partner spotlight blog post | 🟢 More spotlight posts on cadence |
| ✅ `creator-economy-stack.pdf` | ❌ **Placeholder PDF** — replace with real asset |
| | ❌ **First store sale** — PENDING |
| | ❌ Digital delivery automation (email with download link) |
| | 🟠 LemonSqueezy alternative not documented as fallback |

---

## Cross-cutting gaps by pillar

### A. Performance & Core Web Vitals

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Site-wide mobile avg 63 (target 80) | 🔴 | Every indexable page ≥70 mobile; hubs ≥80 |
| 32 pages TBT &gt;1s in historical crawl | 🔴 | TBT &lt;500ms on content pages |
| Home LCP 2.9s (target 2.5s) | 🟠 | Hero image preload + font subset already — need less main-thread JS |
| Blog/portfolio share 103 kB FLJS | 🟠 | Route-level code split; RSC-first templates |
| Lighthouse CI on Windows EPERM | 🟠 | GitHub Action on Ubuntu, upload to `audit/` |
| INP not measured | 🟠 | Add to post-deploy + CrUX field data in GSC |
| Image audit: 2 oversized, 7 legacy | 🟢 | `--strict` fails build until clean |

---

### B. SEO, GEO & AI discoverability

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Cloudflare Managed robots blocks AI bots | 🔴 | Single policy: allow GPTBot, ClaudeBot, Google-Extended |
| GSC CWV likely failing | 🔴 | Mobile “Good” URL count &gt;90% |
| privacy/terms missing JSON-LD | 🟢 | WebPage or Organization snippet on legal pages |
| Unique OG images per blog post | 🟠 | Branded OG per slug in `public/og/blog/` |
| Internal link orphans | 🟠 | Zero orphans in dashboard; auto-fix in lint |
| hreflang / i18n | 🟢 | N/A unless EU expansion — document decision |

---

### C. Conversion & revenue

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Stripe checkout not live | 🔴 | One-click buy → email delivery → GA `purchase_completed` |
| First sale not recorded | 🔴 | Test purchase + runbook in docs |
| GA4 events not verified live | 🟠 | Real-Time checklist in post-deploy |
| A/B test inconclusive | 🟠 | Declare winner; ship control; start test #2 (packages page) |
| No CRM / lead scoring | 🟠 | Discord intake → Notion with UTM source |
| Calendly not configured | 🟠 | Custom tier books call without Discord friction |
| Email nurture | 🟢 | Resend drip for blog subscribers (no form today) |
| Escrow/checkout for packages | 🟢 | NOWPayments or Stripe for Blueprint tier |

---

### D. Content & product surface

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Store products: 4 (target met) | ✅ | 8+ products; templates + guides + tooling |
| Portfolio: real screenshots all 25 | 🟠 | Every case study: 3–4 images, video where applicable |
| Blog: 20 posts | ✅ | 1 post/month + case study tie-in to services |
| Niche pages: 8 | ✅ | 2 more niches (e.g. AI agencies, Discord mod teams) |
| Client portal | ❌ | Status board, deliverables, approval flows |
| Events calendar | ⚠️ | Live Discord event sync or Luma embed |
| Community showcase | ⚠️ | User submissions moderated + featured on home |
| `/launch/` execution | 🟠 | Weekly metrics filled; auto-archive campaigns |

---

### E. Ops, automation & observability

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Uptime monitoring | 🔴 | Better Stack / Checkly 5-min + Discord alert |
| Full pre-deploy on prod deploy | 🟠 | Never skip Lighthouse on main |
| Weekly report not scheduled | 🟠 | Cron or GitHub Action Mondays |
| CF cache purge on deploy | ⚠️ | Token in CI secrets |
| Error tracking (Sentry) | 🔴 | Frontend + any future API routes |
| E2E smoke tests | 🟠 | Playwright: home → packages → Discord href |
| Dependabot / npm audit in CI | 🟠 | Block merge on critical CVEs |

---

### F. Ecosystem (TheOne monorepo)

These are **outside brandforge.gg** but required for best-in-class *platform*:

| Surface | Gap | Priority |
|---------|-----|----------|
| **Marketplace (`web/`)** | Prod migration + Render deploy smoke test | 🔴 |
| | Sentry on checkout + NOWPayments IPN | 🔴 |
| | Server-side auth on `/dashboard`, `/admin` | 🟠 |
| | Order status emails (Resend) | 🟠 |
| | Listing JSON-LD | 🟢 |
| **LeadForge** | API rate limits on search/stream | 🔴 |
| | SSRF hardening on analyze-site | 🔴 |
| | Automated tests (analyze → credit deduct) | 🟠 |
| | Hide legacy `/campaigns/new` path | 🟠 |
| **mxstermind.com** | Reciprocal nav + shared UTM convention | 🟠 |
| **Monorepo** | Single `DEPLOYMENT_GUIDE.md` ordered runbook | 🟠 |
| | Shared pricing/types package | 🟢 |
| | Supabase CLI migrations in CI (46 manual SQL files) | 🔴 |

See [ecosystem-audit-playbook.md](./ecosystem-audit-playbook.md) and [PLATFORM_AUDIT.md](../PLATFORM_AUDIT.md).

---

### G. Security & compliance

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| HSTS at edge | 🟠 | CF dashboard: enable HSTS preload |
| CSP header | 🟢 | Strict CSP for static marketing site |
| Cookie consent (EU) | 🟠 | Evaluate EU traffic; minimal banner if &gt;5% |
| Admin `/admin/` gate | ⚠️ | Cloudflare Access (recommended) vs client key only |
| Webhook docs | ✅ | `brandforge/docs/API.md` — implement Stripe webhook endpoint |
| Pen test / OWASP ZAP | 🟢 | Annual passive scan on prod |

---

### H. Accessibility & UX

| Gap | Priority | Best-in-class |
|-----|----------|---------------|
| Home a11y 96 | ✅ | Maintain ≥95 on all hubs |
| Full 91-page a11y crawl | 🟠 | Pa11y CI on top 20 URLs |
| Mobile nav focus trap | ✅ | Re-test after header changes |
| Reduced motion | ✅ | Audit inner pages with GSAP |
| Real-device 4G walkthrough | 🟠 | Document in QA checklist |

---

## Best-in-class target state (definition of done)

When BrandForge is **best-in-class** for operator-focused B2B studio sites:

1. **Acquisition:** Mobile Lighthouse ≥85 home, ≥80 site-wide; CrUX “Good” on `/` and `/packages/`.
2. **Discovery:** 90+ URLs, llms.txt, FAQ schema, AI bots allowed, rich results on services/portfolio.
3. **Conversion:** &gt;5% package-page → Discord click (measured); A/B winners documented; Calendly live for custom tier.
4. **Revenue:** Store sells via Stripe with automated delivery; first 10 sales logged; partner referrals attributed.
5. **Trust:** 8+ vouches with verified links; every portfolio case has quantified outcomes; FAQ feedback drives copy updates.
6. **Ops:** Deploy blocked on perf/lint/schema; uptime 99.9% monitored; weekly report auto-posted to Discord.
7. **Ecosystem:** Visitor knows BF vs MM vs marketplace in &lt;10s; cross-links both ways; unified UTM spec.

---

## Recommended roadmap (Sprint 8+)

### Sprint 8 — Performance & CI hardening
- Linux CI Lighthouse full crawl (91 URLs)
- Blog/portfolio bundle split; target FLJS &lt;100 kB on hubs
- Enable full `pre-deploy` on main deploys
- Fix Cloudflare robots (manual + verify)

### Sprint 9 — Revenue completion
- Stripe Payment Links + env in CF build
- Real digital assets (PDFs, Figma links) in store
- Email delivery via Resend or Stripe customer email
- First test sale + runbook

### Sprint 10 — Measurement & growth ops
- GA4 Real-Time in post-deploy script
- Uptime + Discord webhooks
- A/B test #1 winner → ship
- `/launch/` Week 2 campaign + metrics template
- Optional: Microsoft Clarity on home mobile

### Sprint 11 — Ecosystem & client experience
- MXSTERMIND reciprocal nav (coordination)
- Client portal v1 (read-only status + files)
- Events Luma/Discord sync
- Partner spotlight cadence (monthly)

### Sprint 12 — Platform hardening (TheOne)
- Marketplace prod smoke + Sentry
- LeadForge rate limits + tests
- Supabase migration CI
- Unified deployment runbook

---

## Quick reference — files & commands

| Resource | Path |
|----------|------|
| Post-Sprint 7 full audit | [final-sprint-7-report.md](./final-sprint-7-report.md) |
| Executive summary | [final/executive-summary.md](./final/executive-summary.md) |
| Health JSON | [final-health.json](./final-health.json) |
| SEO robots decision | [seo-decision.md](./seo-decision.md) |
| A/B tests | [ab-tests.md](./ab-tests.md) |
| Ecosystem playbook | [ecosystem-audit-playbook.md](./ecosystem-audit-playbook.md) |
| Sprint READMEs | [sprint-3/](./sprint-3/) … [sprint-7/](./sprint-7/) |

```bash
cd brandforge
npm run lint:content
npm run audit:schema
npm run audit:links
npm run pre-deploy          # full gate (not quick)
npm run deploy
```

---

## Recently closed (2026-06-13 gap-fix deploy)

| Item | Status |
|------|--------|
| Broken link `/portfolio/telegram-verification-system/` | ✅ → ops-flow-dashboard |
| `/store/success/` + `purchase_completed` | ✅ |
| Security headers in `_headers` | ✅ partial |
| Home hero idle defer (TBT) | ✅ |
| `faq_feedback` GA alias | ✅ |
| Link checker 403 false positives | ✅ |
| Production link check | ✅ 0 broken |

---

*Maintained as the single source of truth for product gaps. Update after each sprint ship and production audit.*
