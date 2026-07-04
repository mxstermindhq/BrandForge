# TheOne Ecosystem — Multi-Dimensional Audit Playbook

**Version:** 1.0  
**Date:** 2026-06-13  
**Authors (personas):** Principal Architect · CPO · Head of Growth · CISO  
**Scope:** Full `TheOne` monorepo — BrandForge marketing, marketplace (`web/`), LeadForge SaaS, mxstermind studio

---

## 0. Ecosystem context (filled from codebase)

| Dimension | Our reality |
|-----------|-------------|
| **Industry / niche** | B2B digital services — fixed-package creative studio + specialist marketplace for forum operators, Discord communities, Web3 founders, SaaS builders |
| **Core platforms** | **brandforge.gg** — Next.js 15 static export, Cloudflare Workers Assets · **web/** marketplace — Next.js 15 + OpenNext CF + Node `server.js` on Render · **LeadForge** — Next.js 15 on Vercel + Supabase · **mxstermind.com** — static Next.js studio site |
| **Mobile app(s)** | No first-party mobile app in repo. CarSpotLive (portfolio) is client work on App Store — not part of this codebase |
| **Marketing stack** | Discord + Telegram intake (no CRM/form), organic forums (HF, Voided, Patched, BBB, NulledBB), Reddit, X, Threads, LinkedIn, SEO content (71 routes), GA4, internal `/launch/` campaign calendar |
| **Payments** | NowPayments (crypto) on marketplace · Stripe on LeadForge · Escrow/manual on studio packages |
| **Codebase status** | ~4 active apps in one repo; legacy `server.js` (~3.2k lines); 46 Supabase migrations (manual SQL Editor); pre-1.0 LeadForge; static home on brandforge after motion stack removal |
| **Top 3 pain points** | ① **Mobile acquisition perf** — brandforge home LCP 8.6 s, perf 28 · ② **Revenue path fragility** — marketplace depends on unverified prod migrations + Render + NOWPayments IPN · ③ **Attribution & CAC blindness** — Discord-only intake, no unified funnel analytics across 4 surfaces |

---

## How to use this playbook

Each pillar follows the same structure:

1. **Critical benchmarks** — best-in-class for our niche  
2. **Immediate audit checklist** — run this week  
3. **Common red flags** — from our data and prior audits  
4. **Tooling recommendations** — specific tools, not generic categories  

Findings are tagged **🔴 High · 🟠 Medium · 🟢 Low** by business impact.

---

# PILLAR A: CODEBASE & ARCHITECTURE AUDIT

*Principal Software Architect lead*

## A1. Critical benchmarks (our niche)

| Area | Best-in-class for operator-focused B2B services |
|------|--------------------------------------------------|
| **Deploy model** | One command → prod; env parity; rollback in &lt;5 min |
| **API surface** | Typed contracts, OpenAPI or tRPC; idempotent webhooks |
| **Database** | Migrations in CI; RLS on all user tables; no manual SQL Editor drift |
| **Multi-app monorepo** | Shared types for packages/pricing; single auth story or explicit boundaries |
| **Legacy debt** | Dead routes return 410; legacy API behind feature flags or removed |
| **Observability** | Sentry on checkout + auth; structured logs; p95 API latency &lt;300 ms |
| **Cost** | Cloudflare static for marketing; Render autoscale or cold-start budget documented |

## A2. Immediate audit checklist

### Repository topology
- [ ] Map every deploy target: `brandforge/` → CF Workers · `web/` → CF + Render API · `leadforge/` → Vercel · `mxstermind/` → CF
- [ ] List which app owns `brandforge.gg` DNS today (marketing static vs marketplace worker — **verify no route conflict**)
- [ ] Inventory shared env vars across `.env.example` files — flag secrets duplicated or divergent
- [ ] Count lines of active vs dead code: `production-layer.js`, `auth-client.js`, chat/squad handlers in `server.js`

### API & integrations
- [ ] Trace full checkout path: `POST /api/marketplace/checkout` → NOWPayments → IPN → order state
- [ ] Verify Render API version matches latest git commit on `main`
- [ ] Confirm Supabase migrations `20260521`–`20260524` applied on **production** (not just local)
- [ ] Document LeadForge API routes with auth requirements; grep for `createClient` service-role usage
- [ ] List all third-party keys: Supabase, NOWPayments, Stripe, Serper, Gemini, Groq, Resend, Discord, GA

### CI/CD & quality
- [ ] Run `npm run build` in `brandforge/`, `web/`, `leadforge/`, `mxstermind/` — record pass/fail
- [ ] Check for automated tests — currently **none** on LeadForge; marketplace test coverage unknown
- [ ] Review `.github/` workflows — what runs on PR vs main only?
- [ ] Measure bundle size / First Load JS on brandforge home (target &lt;100 kB critical path)

### Scalability & cost
- [ ] Render cold-start latency on first API request after idle
- [ ] Supabase row counts + index usage on `orders`, `listings`, `leads`, `campaigns`
- [ ] Cloudflare Workers asset count and deploy time (brandforge ~320 files)

## A3. Common red flags (our ecosystem)

| Flag | Where seen | Impact |
|------|------------|--------|
| Frontend-only deploy while API stale | CF deploy without Render redeploy | 🔴 Checkout broken silently |
| Manual migration workflow | 46 SQL files, no `config.toml` | 🔴 Prod schema drift |
| Monolithic `server.js` + legacy chat/squad routes | Root API | 🟠 Attack surface, maint burden |
| Dual brandforge apps (`web/` vs `brandforge/`) | Repo | 🟠 README still describes marketplace at brandforge.gg; marketing site is separate app |
| No Sentry on money path | Marketplace checkout | 🔴 Blind to prod errors |
| `audit-perf-all.mjs` stale slug list | brandforge scripts | 🟢 Bad monitoring data |
| LeadForge SSRF partial mitigation | `/api/search/*` | 🔴 Internal network probe risk |
| Service role on all LeadForge API DB | Bypasses RLS if handler bug | 🟠 Data leak vector |

## A4. Tooling recommendations

| Purpose | Tool |
|---------|------|
| Dependency vulnerabilities | `npm audit`, Snyk, or GitHub Dependabot |
| Secret scanning | `gitleaks`, GitHub secret scanning |
| API contract testing | Postman collections or Bruno for checkout/IPN flows |
| DB migration CI | Supabase CLI + linked project; stop manual-only |
| Architecture diagrams | Mermaid in docs (already used in strategy/) |
| Bundle analysis | `@next/bundle-analyzer` on web + brandforge |
| Dead code | `knip` or `ts-prune` on `web/src` |
| Error tracking | Sentry (marketplace + LeadForge API routes first) |

## A5. Priority findings — Architecture

| Priority | Finding | Action |
|----------|---------|--------|
| 🔴 | Marketplace prod path unverified | Apply migrations + redeploy Render + smoke test crypto checkout end-to-end |
| 🔴 | No error tracking on payments | Sentry on `server.js` checkout + IPN handlers |
| 🟠 | Legacy API surface still live | Return 410 on chat/squad/leaderboard or document as deprecated |
| 🟠 | Four apps, four deploy pipelines | Single `DEPLOYMENT_GUIDE.md` runbook with ordered deploy steps |
| 🟠 | LeadForge no tests | Add smoke tests for analyze → stream → credit deduct |
| 🟢 | Stale perf audit script | Import `PORTFOLIO_SLUGS` dynamically in `audit-perf-all.mjs` |

---

# PILLAR B: PLATFORM & PRODUCT (UX) AUDIT

*Chief Product Officer lead*

## B1. Critical benchmarks

| Area | Best-in-class |
|------|---------------|
| **Studio funnel (brandforge)** | Quote request in &lt;3 clicks; package tier clear before Discord; mobile LCP &lt;2.5 s |
| **Marketplace funnel** | Browse → listing → checkout in &lt;5 min; trust signals (reviews, delivery SLA) above fold |
| **LeadForge TTFV** | Paste URL → first lead in &lt;90 s; confidence score explained |
| **Onboarding** | Role clear (buyer/seller); whitelist gate for sellers; no dead ends |
| **Retention loop** | Order status visible; repeat purchase path; email/Discord notification on state change |
| **Accessibility** | WCAG 2.1 AA on marketing + checkout; reduced-motion respected |
| **Cross-device** | Mobile forum operators are primary audience — mobile must not be second-class |

## B2. Immediate audit checklist

### BrandForge marketing (`brandforge/`)
- [ ] Walk mobile home on real 4G device — time to readable hero + packages section
- [ ] Verify every package CTA opens Discord/Telegram with **pre-filled tier message** (`config/site.ts`)
- [ ] Click through: Home → Packages → Portfolio case study → Contact — any broken links?
- [ ] Test `/launch/` campaign copy buttons on mobile Safari + Chrome
- [ ] Screen reader pass on home FAQ (`<details>`) and skip link
- [ ] Compare value prop clarity: brandforge vs mxstermind — can a new visitor tell which to use?

### Marketplace (`web/`)
- [ ] Homepage funnel: Hero → `#browse` → filter Starter/Partner → listing detail → Buy Now
- [ ] Logged-out vs logged-in checkout paths
- [ ] Seller onboarding: `/onboarding` → whitelist → first listing create
- [ ] Buyer dashboard: order status, deliverables, dispute entry
- [ ] Admin panel: can non-admin hit `/admin` URL? (known gap — API guarded, page not)

### LeadForge
- [ ] Primary flow: register → paste URL → analyze → stream → export CSV
- [ ] Credit deduction: confirm balance decrements atomically per lead
- [ ] Billing: Stripe checkout → webhook → credit grant
- [ ] Legacy `/campaigns/new` — still linked in nav? Deprecate or hide?

### Metrics to pull (if analytics exist)
- [ ] Discord click-through rate from package cards (GA event?)
- [ ] Marketplace: browse → listing view → checkout start → paid conversion
- [ ] LeadForge: signup → first search → paid conversion
- [ ] 7-day and 30-day retention per product (likely **missing** — flag as gap)

## B3. Common red flags

| Flag | Signal |
|------|--------|
| Mobile perf 28 on acquisition site | Forum operators on phones bounce before Discord CTA |
| No contact form + no CRM | Cannot retarget or measure lead quality |
| Partner subscription renewal undefined | Month-2 churn on marketplace sellers |
| Dual LeadForge flows | User confusion; support burden |
| Client-only auth gates | Flash of dashboard before redirect |
| No order status emails | Buyers ping Discord for updates |
| Listing JSON-LD missing | Lower organic listing discovery |

## B4. Tooling recommendations

| Purpose | Tool |
|---------|------|
| Session replay | PostHog or Hotjar on checkout + LeadForge search |
| Funnel analytics | PostHog / Plausible with custom events for Discord clicks |
| Heatmaps | Microsoft Clarity (free) on brandforge home mobile |
| Accessibility | axe DevTools, Lighthouse a11y, Pa11y CI |
| Usability tests | 5 forum-operator interviews — record time-to-quote-request |
| Feature flags | LaunchDarkly or env-based flags for LeadForge legacy campaign path |

## B5. Priority findings — Product/UX

| Priority | Finding | Action |
|----------|---------|--------|
| 🔴 | Mobile home LCP 8.6 s | Defer GA; optimize images; target perf 60+ then 85+ |
| 🔴 | No funnel analytics on Discord CTAs | Add GA4 events: `discord_click`, `telegram_click`, `package_tier` |
| 🟠 | Marketplace auth UI not server-gated | Middleware session check on `/dashboard`, `/account`, `/admin` |
| 🟠 | No buyer/seller email on order state | Wire Resend for paid → delivered → completed |
| 🟠 | LeadForge legacy campaign path | Hide from nav or merge into search UX |
| 🟢 | A11y 89 on home | Re-run after perf fixes; fix contrast + marquee reduced-motion |

---

# PILLAR C: MARKETING & GROWTH AUDIT

*Head of Growth Marketing lead*

## C1. Critical benchmarks

| Area | Best-in-class for forum/community GTM |
|------|----------------------------------------|
| **Organic** | Weekly forum presence without spam; value-first posts; 1 link max per thread |
| **SEO** | Hub + spoke content; FAQ schema; mobile CWV pass; llms.txt for AI discovery |
| **Attribution** | Know which channel drove each Discord DM (UTM + ask-on-intake) |
| **CAC** | Track cost per qualified quote request; studio CAC &lt; 30% of Blueprint ACV ($300–500) |
| **Content velocity** | 1 blog/case study per month minimum; weekly social calendar (have `/launch/`) |
| **Conversion** | Landing → intent signal &lt;60 s; package page → Discord &gt;5% click rate |
| **Retention** | Vouch loop; referral from forum reputation; second project within 90 days |

## C2. Immediate audit checklist

### SEO technical (brandforge.gg)
- [ ] Crawl sitemap (~65 URLs) — all 200, canonical correct
- [ ] Resolve robots.txt conflict (Cloudflare Managed blocks AI bots; app allows them)
- [ ] Check Core Web Vitals in Search Console — mobile home likely failing
- [ ] Validate JSON-LD on home, services, portfolio, blog (Rich Results Test)
- [ ] Internal link graph: do blog posts link to `/packages/` and `/services/`?
- [ ] Compare indexed pages vs sitemap count in GSC

### Content & positioning
- [ ] Message consistency across: brandforge home, packages, mxstermind, marketplace listing copy
- [ ] Niche pages (`/for/forum-sellers/` etc.) — aligned with `/launch/` campaign angles?
- [ ] Portfolio case studies — do they include outcome metrics for social proof?
- [ ] Blog — 11 posts; which drive traffic? (GSC top queries)

### Paid & organic channels
- [ ] Audit `/launch/` Week 1 execution — posts published vs calendar?
- [ ] Forum thread tracker: HF, Voided, Patched, BBB, NulledBB — views/replies/DMs
- [ ] Reddit comment templates — adapt per thread, not copy-paste identical
- [ ] LinkedIn + X — thread performance vs single posts
- [ ] Discord server: kickoff posted? Partner server promos sent?

### Attribution & CRM hygiene
- [ ] Do Discord invite links use UTM or custom invite per channel?
- [ ] Intake script: ask "where did you hear about us?" in first Discord message template
- [ ] Spreadsheet or Notion CRM: lead → quote → escrow → delivered → vouch
- [ ] LeadForge: separate brand — does it compete or complement BrandForge positioning?

### CRO
- [ ] A/B test hero line (brand guide has 5 variants — pick one for 2 weeks)
- [ ] Package card click heatmap on mobile
- [ ] Sticky ContactActionBar — conversion vs footer CTA
- [ ] Trust bar (50+ projects, 24h quote) — above fold on mobile?

## C3. Common red flags

| Flag | Meaning |
|------|---------|
| SEO 100 but perf 28 | Rankings will erode as CWV weigh in |
| No paid ads yet but rising CAC | Organic time cost not measured |
| Same Discord link everywhere | Zero attribution |
| Weekly campaign not rotated | `/launch/campaign.ts` stale after Week 1 |
| mxstermind vs brandforge cannibalization | Buyer picks wrong door |
| Marketplace SEO separate from studio | Split domain authority (if same domain, clarify IA) |

## C4. Tooling recommendations

| Purpose | Tool |
|---------|------|
| SEO crawl | Screaming Frog or Sitebulb (≤500 URLs — free tier fine) |
| Rank tracking | GSC + optional Ahrefs/Semrush for forum-adjacent keywords |
| CWV monitoring | PageSpeed Insights API, Calibre, or SpeedCurve |
| Social scheduling | Native + `/launch/` page (already built) |
| Link tracking | Bitly or Discord custom invites per channel |
| CRM (lightweight) | Notion, Airtable, or HubSpot free tier |
| Email (future) | Resend for nurture — not yet wired for studio |
| Competitive intel | Manual forum search for "brand identity package" + price anchors |

## C5. Priority findings — Growth

| Priority | Finding | Action |
|----------|---------|--------|
| 🔴 | No attribution on Discord intake | UTM Discord invites + intake template question |
| 🔴 | Mobile CWV failing on primary landing | Pillar A perf fixes = growth priority |
| 🟠 | robots.txt AI bot conflict | Align Cloudflare dashboard with SEO/GEO strategy |
| 🟠 | Campaign execution tracking empty | Fill Week 1 metrics in `/launch/` sun-prep template |
| 🟠 | No email capture | Consider optional Telegram/Discord-only vs lead magnet on blog |
| 🟢 | llms.txt missing brand-guide | Update `public/llms.txt` |

---

# PILLAR D: SECURITY, COMPLIANCE & PERFORMANCE AUDIT

*Cybersecurity Expert lead*

## D1. Critical benchmarks

| Area | Best-in-class |
|------|---------------|
| **App security** | OWASP Top 10 mitigated; auth on all sensitive routes server-side |
| **Webhooks** | HMAC verify (NOWPayments IPN ✅); idempotent; replay protection |
| **Dependencies** | No critical CVEs; automated PR alerts |
| **Data privacy** | Privacy policy matches data collected; GDPR basics for EU visitors |
| **Scraping products** | LeadForge ToS + acceptable use for contact discovery |
| **Performance** | LCP &lt;2.5 s, INP &lt;200 ms, CLS &lt;0.1 on acquisition pages |
| **API** | Rate limits on expensive routes (search, AI, checkout) |
| **Secrets** | No keys in client bundles; service role server-only |

## D2. Immediate audit checklist

### Security
- [ ] OWASP ZAP or Burp passive scan on `brandforge.gg`, marketplace checkout, LeadForge `/api/search/*`
- [ ] Verify NOWPayments IPN HMAC in `server.js` — test with invalid signature
- [ ] LeadForge SSRF: test analyze-site with `169.254.169.254`, `10.0.0.1`, redirect chains
- [ ] Rate limit audit: LeadForge search/stream (**known gap — none**)
- [ ] Review Supabase RLS policies on `orders`, `listings`, `profiles`, `leads`
- [ ] Admin routes: `requireAdmin` on every `/api/admin/*` handler
- [ ] Check `web/src/middleware.ts` — only proxies API; add auth gates?
- [ ] npm audit in root, web, brandforge, leadforge — fix critical/high
- [ ] CORS headers on Render API — restrict origins?

### Compliance
- [ ] Privacy policies aligned across brandforge, web, leadforge (Discord/Telegram data, GA, Supabase)
- [ ] Cookie/consent — GA on brandforge without banner? (EU visitors)
- [ ] LeadForge outreach compliance — CAN-SPAM, GDPR legitimate interest documented in ToS
- [ ] Crypto payments — tax/refund policy in terms?
- [ ] SOC2 not required at stage — document when threshold hits ($X ARR or enterprise deals)

### Performance
- [ ] Lighthouse mobile on `/`, `/packages/`, `/listing/[id]`, LeadForge `/search`
- [ ] Render API p95 latency under load (k6 or Artillery on listings + checkout)
- [ ] Supabase query plans on slow endpoints
- [ ] Cloudflare cache headers on static assets
- [ ] Font loading strategy — `display: optional` already on brandforge ✅

## D3. Common red flags

| Flag | Risk |
|------|------|
| `/admin` page reachable without server gate | Info disclosure, phishing prep |
| Welcome credits abusable (LeadForge) | Multi-account cost drain |
| Service role in API handlers | Single bug = full DB access |
| No rate limits on AI/search | Bill shock + DoS |
| Cloudflare blocks GPTBot | Conflicts with stated GEO strategy |
| Legacy chat API live | Unmaintained auth paths |
| GA before consent | GDPR complaint vector |

## D4. Tooling recommendations

| Purpose | Tool |
|---------|------|
| DAST | OWASP ZAP, Burp Suite Community |
| SCA | Snyk, Dependabot |
| Secret scan | gitleaks, TruffleHog |
| Rate limiting | Upstash Redis + middleware, or Cloudflare Rate Limiting |
| WAF | Cloudflare managed rules (already on CF) |
| Perf synthetic | Checkly or Better Stack on `/` + checkout health |
| Load test | k6 on marketplace listings API |
| RLS audit | Supabase dashboard + custom SQL policy review |
| Compliance docs | Termly or iubenda for cookie banner if EU traffic meaningful |

## D5. Priority findings — Security & performance

| Priority | Finding | Action |
|----------|---------|--------|
| 🔴 | LeadForge no API rate limits | Add per-IP + per-user limits on `/api/search/*` |
| 🔴 | LeadForge SSRF incomplete | Block private IP ranges + follow redirects safely |
| 🔴 | Mobile home LCP 8.6 s | Security pillar overlaps — perf IS revenue |
| 🟠 | Admin/dashboard page guards | Server middleware auth |
| 🟠 | npm audit not in CI | Add to GitHub Actions on PR |
| 🟠 | GA without consent banner | Evaluate EU traffic; add minimal consent if &gt;5% EU |
| 🟢 | NOWPayments HMAC | Verify + document in runbook; add integration test |

---

# CROSS-PILLAR EXECUTION MATRIX

| # | Initiative | Pillars | Owner | Impact |
|---|------------|---------|-------|--------|
| 1 | Prod marketplace smoke test (migrations + IPN) | A, D | Eng | 🔴 Revenue |
| 2 | Mobile home perf sprint | A, B, D, C | Eng + Growth | 🔴 CAC/SEO |
| 3 | Discord attribution (UTM + intake question) | C, B | Growth | 🔴 Measurement |
| 4 | Sentry on checkout + LeadForge API | A, D | Eng | 🔴 Observability |
| 5 | LeadForge rate limits + SSRF hardening | D, A | Eng | 🔴 Security |
| 6 | Server-side auth middleware (web) | A, B, D | Eng | 🟠 Trust |
| 7 | Order status emails (Resend) | B, C | Product | 🟠 Retention |
| 8 | Week 1 `/launch/` metrics + Week 2 campaign | C | Growth | 🟠 Pipeline |
| 9 | robots.txt / AI bot policy decision | C, D | Growth + Eng | 🟠 GEO |
| 10 | Supabase CLI migrations in CI | A | Eng | 🟠 Scale |

---

# 30-DAY EXECUTION TIMELINE

*Designed for a lean team (1–2 eng, 1 growth/ops) without freezing feature work.*

## Week 1 — Diagnose & secure the money path (Days 1–7)

| Day | Focus | Tasks | Output |
|-----|-------|-------|--------|
| 1 | **A + D** | Prod DB migration check; Render deploy version; NOWPayments IPN test transaction | Pass/fail checklist |
| 2 | **A + D** | Sentry setup on `server.js` checkout + IPN; npm audit critical fixes | Errors visible in prod |
| 3 | **D** | LeadForge rate limits on search/stream; SSRF blocklist PR | Merged PR |
| 4 | **B + C** | GA4 events: `discord_click`, `package_tier`; Discord UTM invites | Events in GA4 debug |
| 5 | **C** | Execute `/launch/` Day 1–3 posts; start forum tracker spreadsheet | Live threads + tracker |
| 6 | **D + A** | Lighthouse baseline: home, packages, listing, LeadForge search | JSON in `audit/` |
| 7 | **All** | Week 1 retro: blockers doc update to `PLATFORM_AUDIT.md` | Shared status |

**Feature freeze:** None. Only production fixes and measurement.

## Week 2 — Acquisition perf & funnel clarity (Days 8–14)

| Day | Focus | Tasks | Output |
|-----|-------|-------|--------|
| 8–9 | **A + D** | Defer GA; image audit on brandforge home; portfolio preview lazy load | PR deployed |
| 10 | **B** | Mobile device test (real phone); fix top 3 UX friction points on package CTAs | Notes + quick fixes |
| 11 | **C** | GSC + Screaming Frog crawl; fix robots.txt policy | SEO action list |
| 12 | **B + A** | Marketplace middleware auth spike (dashboard + admin) | PR or RFC |
| 13 | **C** | `/launch/` Week 2 campaign.ts swap; LinkedIn + HF bump | Campaign live |
| 14 | **All** | Re-run Lighthouse home — target perf &gt;45 mobile | Before/after doc |

## Week 3 — Retention & product hardening (Days 15–21)

| Day | Focus | Tasks | Output |
|-----|-------|-------|--------|
| 15–16 | **B** | Resend integration for order status (paid → delivered) | 3 email templates |
| 17 | **A** | Supabase CLI link + document migration runbook | `docs/db-migrations.md` |
| 18 | **B** | LeadForge: hide or deprecate legacy campaign nav | UX simplification |
| 19 | **D** | OWASP ZAP passive scan; fix high findings | Scan report |
| 20 | **C** | Blog internal linking pass; llms.txt update | PR |
| 21 | **All** | Mid-audit review against cross-pillar matrix | Updated grades |

## Week 4 — Consolidate & automate (Days 22–30)

| Day | Focus | Tasks | Output |
|-----|-------|-------|--------|
| 22 | **A** | CI: build all 4 apps on PR; npm audit gate | GitHub Action |
| 23 | **A** | Update `audit-perf-all.mjs`; full 65-URL crawl | `brandforge-perf-all.json` |
| 24 | **C** | Fill Week 1–3 campaign metrics; plan Week 4 angle | CRM row complete |
| 25 | **B** | 5-user forum operator usability interviews | Qualitative report |
| 26 | **D** | k6 load test marketplace listings API | p95 latency number |
| 27 | **A** | Legacy API 410 plan (chat/squad) — RFC or execute | Tech debt ticket |
| 28 | **C + B** | mxstermind vs brandforge positioning one-pager | Sales clarity doc |
| 29 | **All** | Final audit write-up → `audit/ecosystem-audit-playbook.md` v1.1 | This doc updated |
| 30 | **All** | Leadership readout: scores, $ impact, Q3 priorities | 30-min deck or memo |

---

## Success metrics (Day 30 targets)

| Metric | Current (Jun 13) | Day 30 target |
|--------|------------------|---------------|
| brandforge mobile perf (home) | 28 | ≥50 (stretch 65) |
| brandforge mobile LCP | 8.6 s | &lt;4.0 s (stretch 2.5 s) |
| Marketplace checkout smoke test | Unverified | 100% pass documented |
| Discord clicks tracked in GA4 | No | Yes, by tier + page |
| LeadForge rate limited | No | Yes |
| Sentry on payment path | No | Yes |
| `/launch/` weeks executed | 1 started | 4 complete with metrics |
| Critical npm CVEs | Unknown | 0 open |

---

## Related documents

| Document | Scope |
|----------|-------|
| `audit/brandforge-audit.md` | brandforge.gg production audit (Jun 2026) |
| `PLATFORM_AUDIT.md` | Marketplace codebase audit (May 2026) |
| `leadforge/AUDIT.md` | LeadForge product + security audit |
| `audit/lighthouse.md` | Lighthouse quick reference |
| `audit/performance-audit.md` | Deep perf analysis |
| `docs/strategy/03-monetization-growth.md` | GTM strategy |
| `docs/strategy/02-engineering-platform.md` | Engineering roadmap |

---

*Playbook v1.0 — tailor Week 2–4 depth based on Week 1 marketplace smoke test result. If checkout fails, pause growth work until Pillar A Day 1–2 items pass.*
