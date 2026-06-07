# LeadForge — Full Product, Code, Marketing & Security Audit

**Last updated:** June 2026  
**Production:** https://leadforge-gilt.vercel.app  
**Repo path:** `TheOne/leadforge/` (sibling to BrandForge `web/`)  
**Version:** 0.1.0 (pre-1.0, active development)

---

## Executive summary

LeadForge is a B2B/B2C lead-generation SaaS built on Next.js 15, Supabase, and Vercel. The **primary user flow** is now website-first: paste a product/service URL → AI infers ideal buyer persona → live multi-platform scrape with scored leads and emails. A legacy **campaign queue** path still exists for batch runs.

**Strengths**
- End-to-end loop: auth → analyze → stream leads → export CSV → billing
- Buyer-focused AI (ICP from site content, intent queries, email extraction)
- Supabase Auth + RLS + atomic credit deduction
- Stripe webhook idempotency
- Marketing site with live demo + internal distribution kit (`/launch`)
- Gemini → Groq → heuristic fallback chain for site analysis

**Top risks (address soon)**
| Risk | Severity | Notes |
|------|----------|-------|
| No API rate limiting | High | Search/stream routes can burn Serper/Gemini credits; welcome credits abusable via multi-account signup |
| SSRF partial mitigation only | High | Blocks localhost; no block for RFC1918, metadata IPs, or redirect chains to internal hosts |
| Service role on all API DB access | Medium | Correct for server routes; any route bug bypasses RLS — audit each handler |
| Scraping / outreach compliance | Medium | Product facilitates contact discovery; users need clear ToS + acceptable-use policy |
| Admin gate client-only on `/admin` page | Low | APIs protected by `requireAdmin`; page shows “Not authorized” but is reachable |
| No automated tests | Medium | Regressions likely as pipeline grows |
| Dual runtime (Supabase + Cloudflare legacy) | Low | Increases cognitive load; CF path unmaintained |

---

## 1. Product design & user flows

### 1.1 Primary flow — Website URL search (`/search`)

```
Register/Login → Paste site URL → POST /api/search/analyze-site
  → Crawl site (/, /about, /pricing, …) → Gemini analyzeWebsite()
  → Review ICP (ConfidenceRing, IntentReview) → Confirm channels + quantity
  → POST /api/search/stream (SSE) → Per-channel intent queries → Serper
  → Email extract from SERP/snippets/contact pages → Gemini enrichLeadWithPersona()
  → Leads stream to UI → Saved as campaign + leads in Postgres
  → Export CSV / manage in /leads
```

**UX phases** (`app/(app)/search/page.tsx`): `input` → `analyzing` → `confirm` → `searching` → `done`

**Key components**
| Component | Role |
|-----------|------|
| `SiteUrlInput` | URL entry + channel pre-select |
| `IntentReview` | ICP review, analysis source banner (gemini/groq/heuristic) |
| `ConfidenceRing` | Visual confidence % |
| `ChannelBar` | Platform toggles |
| `StreamLeadCard` | Live lead cards with email badges |
| `PersonaChips` | Editable persona facets |

### 1.2 Legacy flow — Campaign queue

Still available via `/campaigns/new` and `/api/campaigns`:
- Manual product/target/location fields
- Background processor (`workers/campaign-processor.ts`) with chunked enrich
- Apollo/Apify hooks in scraper-router (optional env keys)
- Status polling on `/campaigns/[id]`

**Recommendation:** Converge on search flow UI or clearly deprecate campaign creation in nav.

### 1.3 Supporting flows

| Flow | Route | Notes |
|------|-------|-------|
| Dashboard | `/dashboard` | Stats, recent campaigns |
| Leads CRM | `/leads` | Filters, drawer, cold email, CSV export |
| Billing | `/billing` | Balance, Stripe checkout |
| Admin | `/admin` | Stats, user list, manual credit grants |
| Auth | `/auth/login`, `/register`, `/auth/callback` | Email + Google OAuth |

### 1.4 Credit economics

| Item | Value |
|------|-------|
| Base | 1 credit ≈ 1 lead |
| LinkedIn | 2× multiplier |
| AI enrichment | +50% (stream route uses enrich=true) |
| Welcome bonus | 500 credits |
| Packs | 300/$19 · 1000/$49 · 3000/$99 · 7500/$199 |

Credits deducted via `deduct_credits()` RPC before stream processing; insufficient balance returns 402.

---

## 2. Design system & UX

### 2.1 Visual identity

Aligned with BrandForge: dark luxury minimalism.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#080808` / `#0f0f0f` | Page / cards |
| Gold accent | `#c9a84c` | CTAs, brand, highlights |
| Text | `#f0f0f0` / `#666666` | Body / muted |
| Borders | `#222222` | Cards, inputs |

**Fonts** (`globals.css`, `tailwind.config.ts`)
- Display: Cormorant Garamond
- Body: Outfit
- Mono: DM Mono (labels, stats, code)

**UI kit:** `components/ui/index.tsx` — Button, Card, Badge, Field, Spinner, StatCard, etc.

### 2.2 Marketing surfaces

| Route | Purpose | Indexed |
|-------|---------|---------|
| `/` | Hero, live `LandingDemo`, how-it-works, platforms, pricing teaser, contact | Yes |
| `/pricing` | Credit packs | Yes |
| `/launch` | Internal distribution kit — copy-ready posts for Discord, forums, Reddit, etc. | **No** (`noindex`) |

**Contact** (same as BrandForge): Discord `discord.gg/a8Nz2R6M55`, Telegram `t.me/Notmxstermind`  
**Components:** `ContactBar`, `ContactCTA`, `LandingDemo`, `CopyBlock`  
**Copy source:** `lib/distribution-copy.ts`

### 2.3 App shell

`AppShell`: sidebar nav (Search first), credit balance, admin link when `is_admin`. Session from `/api/auth/me`.

### 2.4 UX gaps

- Root metadata still says “Describe your ideal customer” — outdated vs URL-first flow
- `/campaigns/new` duplicates mental model vs `/search`
- No onboarding tour after signup
- No empty-state video/GIF on search page
- Pause/resume campaigns in schema but no UI
- Mobile: sticky contact bar + header stack — test on small viewports

---

## 3. Marketing & go-to-market

### 3.1 Positioning

**One-liner:** Paste your site → AI buyer persona → scrape matching leads across 8 platforms.

**Audience:** B2B SaaS founders, agencies, ecom brands, forum/digital sellers doing outbound.

**Differentiators vs generic lead tools**
- Buyer inferred from *your* site, not a static filter form
- Intent-based queries (not title+industry concatenation)
- Multi-platform in one session with live stream
- 500 free credits for community trials (Discord-first launch)

### 3.2 Channels & assets

| Asset | Location |
|-------|----------|
| Public landing | `/` |
| Live product demo (mock) | `LandingDemo` on homepage |
| Distribution posts | `/launch` (bookmark only) |
| Discord/Telegram | Header, footer, ContactBar |
| Pricing | `/pricing` |

### 3.3 Suggested GTM improvements

1. **UTM parameters** on all outbound links (`?utm_source=hackforums&utm_medium=forum`)
2. **Referral codes** in signup (track forum → conversion)
3. **Screenshot pack** in `/launch` (upload to imgur/CDN for forum rules)
4. **Case study** — run BrandForge through LeadForge, publish results on landing
5. **Indie Hackers / HN** — add copy blocks to `/launch`
6. **Custom domain** — `leadforge.gg` or subdomain of brandforge.gg for trust
7. **Privacy + Terms pages** — required before paid ads and some forums
8. **Resend custom domain** — move off `onboarding@resend.dev`

### 3.4 Messaging consistency

Update all touchpoints to URL-first language:
- App layout metadata
- Welcome email
- Discord announcement (already aligned)
- README (updated)

---

## 4. Architecture

### 4.1 Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 App Router |
| UI | React 18, Tailwind 3 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase Postgres (production) |
| AI | Google Gemini (`gemini-2.5-flash-lite`), Groq fallback |
| Search | Serper → Google CSE → DuckDuckGo HTML |
| Billing | Stripe Checkout + webhooks |
| Email | Resend |
| Deploy | Vercel (primary) |

### 4.2 Runtime model

```
Browser → Next.js middleware (Supabase session) → Route handlers
  → lib/db.ts (service role Supabase client)
  → External: Gemini, Serper, Stripe, Resend, target websites (crawl)
```

`lib/runtime.ts` + `lib/cloudflare.ts`: dual-env shim for legacy Cloudflare D1/KV/Queues. **Production uses Supabase only** when `NEXT_PUBLIC_SUPABASE_URL` is set.

`waitUntil` from `@vercel/functions` for background email and campaign jobs.

### 4.3 Folder map (current)

```
leadforge/
├── app/
│   ├── (marketing)/     /, /pricing, /launch
│   ├── (auth)/          login, register, callback
│   ├── (app)/           search, dashboard, campaigns, leads, billing, admin
│   └── api/             REST + SSE stream
├── components/
│   ├── marketing/       LandingDemo, ContactBar, CopyBlock
│   ├── search/          SiteUrlInput, IntentReview, StreamLeadCard, …
│   ├── leads/           LeadsView, LeadDrawer
│   ├── app/             AppShell
│   ├── auth/            GoogleSignInButton
│   └── ui/              Design system
├── lib/
│   ├── site-analyzer.ts       Crawl + analyze pipeline
│   ├── website-analysis-bridge.ts  Heuristic + persona mapping
│   ├── website-analysis-coerce.ts  Gemini JSON repair
│   ├── channel-search.ts      Intent queries + searchChannel
│   ├── email-extract.ts       Email from HTML/SERP
│   ├── gemini.ts              AI enrichment + cold email
│   ├── enrich-fallback.ts     Groq + heuristic enrich
│   ├── search.ts              Serper/CSE/DDG
│   ├── stream-lead.ts         SSE payload shaping
│   ├── distribution-copy.ts   Marketing post templates
│   ├── site.ts                Contact URLs
│   ├── db.ts, auth.ts, stripe.ts, resend.ts, constants.ts
│   └── supabase/              Client factories
├── workers/campaign-processor.ts  Legacy batch pipeline
├── supabase/              schema.sql + migrations
└── types/index.ts         Shared contracts
```

### 4.4 Search pipeline (detailed)

**Analyze site** (`lib/site-analyzer.ts`)
1. `normalizeSiteUrl()` — https, block localhost
2. Fetch up to 7 paths with 8s timeout each
3. Strip HTML, extract `__NEXT_DATA__`, JSON-LD
4. `analyzeWebsite()` (Gemini) → coerce JSON → on failure Groq → on failure heuristic (45–70% confidence)

**Stream search** (`app/api/search/stream/route.ts`)
1. Auth + credit check + deduct upfront
2. Create campaign row for audit trail
3. For each channel: `buildIntentQueries()` → `searchChannel()` → raw leads
4. Optional contact-page email fetch (non-social URLs)
5. `enrichLeadWithPersona()` with email/intent score bonuses
6. SSE events: `lead`, `channel_status`, `progress`, `done`, `error`
7. Persist leads via `createLead()`

**maxDuration:** 120s on Vercel (`vercel.json`); route exports 300 — align these.

---

## 5. Database

**Schema:** `supabase/schema.sql`

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, `is_admin` |
| `credits` | Balance, `lifetime_purchased` |
| `transactions` | Stripe purchases |
| `campaigns` | Search + batch runs |
| `leads` | Enriched lead rows |
| `campaign_candidates` | Dedup cache (6h) |
| `campaign_staging_cache` | Legacy chunk resume |

**Migrations to apply if missing**
- `supabase/migration-email-fields.sql` — email_confidence, email_source, company_domain
- `supabase/migration-candidate-dedup.sql` — dedup index/function
- `supabase/migration-search-rebuild.sql` — search-related columns

**RLS:** Enabled on user tables; policies restrict to `auth.uid()`. API uses **service role** — application layer must enforce `user_id` on every query.

**RPC:** `deduct_credits(user_id, amount)` — atomic conditional update.

**Gap:** `campaign_candidates` and `campaign_staging_cache` have RLS enabled but **no policies** in schema — verify in Supabase dashboard (may block direct client access; service role unaffected).

---

## 6. API reference

Standard envelope: `{ success, data?, error?, message? }`

### Auth
| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Session |
| GET | `/api/auth/me` | Session |
| GET | `/auth/callback` | OAuth |

### Search (primary)
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| POST | `/api/search/analyze-site` | Yes | Crawl + ICP, max 60s |
| POST | `/api/search/stream` | Yes | SSE, max 120s Vercel |
| POST | `/api/search/analyze` | Yes | Legacy text intent |

### Campaigns & leads
| Method | Route | Auth |
|--------|-------|------|
| GET/POST | `/api/campaigns` | Yes |
| GET/DELETE | `/api/campaigns/[id]` | Yes |
| GET | `/api/campaigns/[id]/status` | Yes |
| GET/PATCH | `/api/leads`, `/api/leads/[id]` | Yes |
| POST | `/api/leads/[id]/cold-email` | Yes |
| GET | `/api/leads/stats` | Yes |
| GET | `/api/leads/export` | Yes |

### Billing & admin
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/billing/balance` | Yes |
| POST | `/api/billing/checkout` | Yes |
| POST | `/api/billing/webhook` | Stripe signature |
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/campaigns` | Admin |
| POST | `/api/admin/credits` | Admin |

**Middleware-protected:** pages under `/dashboard`, `/search`, `/campaigns`, `/leads`, `/billing`, `/admin` and matching API prefixes.

---

## 7. Security audit

### 7.1 Authentication & authorization

| Control | Status | Detail |
|---------|--------|--------|
| Supabase Auth | ✅ | Email/password + Google OAuth |
| Middleware session check | ✅ | Redirects unauthenticated users |
| `requireAuth` / `requireAdmin` in routes | ✅ | Admin APIs enforced server-side |
| Admin page UI gate | ⚠️ | Client-only; APIs still safe |
| `is_admin` from email match | ⚠️ | Single `ADMIN_EMAIL` env; no role management UI |
| OAuth redirect | ⚠️ | Requires Google Console + Supabase URL config |

**Improvements**
- Middleware admin check for `/admin` routes (403 redirect)
- Role table instead of env email
- Audit log for admin credit grants

### 7.2 API abuse & rate limiting

| Vector | Current | Recommendation |
|--------|---------|----------------|
| Multi-account signup for 500 credits | Unrestricted | CAPTCHA, email verification, IP rate limit, lower trial credits |
| `/api/search/analyze-site` crawl | Any authenticated user | Per-user daily crawl quota; max URL length |
| `/api/search/stream` | Up to 5000 qty | Cap trial accounts at 50/stream |
| Gemini/Serper cost | No global budget | Env-based daily spend cap + alerting |
| Cold email generation | Per lead | Rate limit 20/hour/user |

**No rate limiting middleware exists today.**

### 7.3 SSRF (site analyzer)

**Current controls** (`normalizeSiteUrl`)
- http/https only
- Blocks `localhost`, `127.0.0.1`, `*.local`

**Missing**
- Private IP ranges (10.x, 172.16–31, 192.168.x)
- Link-local / cloud metadata (169.254.169.254)
- Redirect following to internal hosts after initial URL check
- DNS rebinding

**Recommendation:** Use a URL validation library + resolve DNS and reject private IPs before fetch; limit redirects to 3; optional domain allowlist mode for enterprise.

### 7.4 Secrets & env

| Secret | Exposure risk |
|--------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never `NEXT_PUBLIC_` |
| `GEMINI_API_KEY`, `SERPER_API_KEY` | Server only via `getEnv()` |
| `STRIPE_WEBHOOK_SECRET` | Verified on webhook |
| `.env.local`, `.dev.vars` | Gitignored — verify not in repo |

**Action:** Rotate keys if ever committed; use Vercel env for production.

### 7.5 Data protection

| Topic | Status |
|-------|--------|
| RLS on user data | ✅ |
| Service role bypass | By design — enforce in app code |
| Lead PII (emails, names) | Stored in Postgres — encrypt at rest (Supabase default) |
| CSV export | Authenticated, user-scoped |
| GDPR deletion | No self-serve account delete — add Supabase cascade or manual process |
| Privacy policy / DPA | **Missing** — needed for EU users |

### 7.6 Stripe

- Webhook signature verification ✅
- Idempotent session handling ✅
- Metadata validates `userId` + `packId` ✅
- **Gap:** No replay protection beyond Stripe idempotency; failed partial states should be monitored

### 7.7 Client security

- No CSP headers configured
- No `X-Frame-Options` / HSTS in `next.config.ts`
- Supabase cookies HttpOnly (Supabase default)
- XSS: React escapes by default; `raw_data` in leads is stored not rendered as HTML ✅

### 7.8 Scraping & third-party ToS

LeadForge orchestrates Google search (Serper) and fetches public pages. Users may violate:
- LinkedIn / Instagram / TikTok Terms of Service when using scraped data
- CAN-SPAM / GDPR for unsolicited email
- Forum rules when mass outreach

**Recommendation:** Publish **Acceptable Use Policy** prohibiting spam, illegal outreach, and credential stuffing. Log acknowledgment at signup.

---

## 8. Safety & compliance checklist

| Item | Priority | Action |
|------|----------|--------|
| Terms of Service | P0 | Legal page + signup checkbox |
| Privacy Policy | P0 | Data collected, retention, third parties (Gemini, Supabase, Stripe) |
| Acceptable Use (anti-spam) | P0 | Block abusive use cases in ToS |
| Email verification | P1 | Supabase confirm email before credits |
| Account deletion | P1 | User-initiated delete + data export |
| Robots/noindex internal pages | ✅ | `/launch` |
| Do Not Contact / opt-out | P2 | Honor requests; don’t re-scrape |
| SOC2 / pen test | P3 | Pre-enterprise sales |

---

## 9. Reliability & operations

### 9.1 External dependencies

| Service | Failure mode | Fallback |
|---------|--------------|----------|
| Gemini | 429/503 | Retry + Groq + heuristic |
| Serper | Quota/error | Google CSE → DuckDuckGo |
| Supabase | Outage | Full app down |
| Vercel | Function timeout | Stream may truncate at 120s |
| Stripe | Webhook miss | Manual credit reconcile via admin |
| Resend | Fail | Best-effort; no retry queue |

### 9.2 Observability gaps

- No structured logging (Datadog/Sentry)
- No uptime monitoring on `/api/auth/me`
- Console.warn in apollo/apify/scraper — not aggregated
- No campaign failure alerting

**Recommendation:** Sentry for API routes; Vercel log drain; admin email on campaign `failed`.

### 9.3 Deployment

- **Production:** `npm run vercel:deploy` → https://leadforge-gilt.vercel.app
- **Node:** engines `>=20 <22`; Vercel build uses Node 20
- **Migrations:** Manual via Supabase SQL Editor
- **Google OAuth:** Supabase callback `https://<project>.supabase.co/auth/v1/callback`; app callback `/auth/callback`

---

## 10. Technical debt & known limitations

| Item | Detail |
|------|--------|
| Dual runtime | Cloudflare D1/KV path legacy; `db:init:*` scripts stubbed |
| Campaign vs search | Two parallel product paths |
| `schema.sql` (root) | D1 legacy duplicate |
| `lib/session-cookie.ts` | Unused after Supabase migration |
| Apollo/Apify | Wired in campaign processor only; not in live search stream |
| Stripe `stripePriceId` | Empty; inline `price_data` only |
| Admin campaigns UI | API only |
| Tests | None |
| ESLint warnings | Unused vars in logout, db, route-helpers |
| `vercel.json` maxDuration 120 vs route 300 | Misaligned |
| RLS policies incomplete | `campaign_candidates` policies missing |

---

## 11. Improvement roadmap (prioritized)

### P0 — Before scaling marketing
1. Terms of Service + Privacy Policy pages
2. Email verification before granting welcome credits
3. SSRF hardening on site analyzer
4. Per-user rate limits on analyze + stream APIs
5. Apply pending Supabase migrations in production

### P1 — Product quality
1. Unify on `/search` as primary; hide or redirect `/campaigns/new`
2. Update root metadata + welcome email copy
3. Sentry + basic API metrics
4. UTM + referral tracking on signup
5. Screenshot/media section on `/launch`
6. Middleware admin route guard

### P2 — Growth & monetization
1. Custom domain + Resend domain
2. Stripe Price IDs (recurring optional)
3. Case study on landing (BrandForge ICP demo)
4. Apollo/Apify integration in stream path for LinkedIn/IG depth
5. Pause/resume campaigns or remove dead code

### P3 — Engineering excellence
1. Vitest/Playwright for analyze-site + credit deduction
2. Remove Cloudflare dual-runtime code path
3. CSP + security headers in `next.config.ts`
4. Account deletion + GDPR export
5. Admin audit log

---

## 12. Environment variables (reference)

See `.dev.vars.example` and README. Critical production vars:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_URL
ADMIN_EMAIL
GEMINI_API_KEY
GROQ_API_KEY          # recommended fallback
SERPER_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
```

Optional: `APOLLO_API_KEY`, `APIFY_API_KEY`, `GOOGLE_CSE_*`

---

## 13. Related documents

| Doc | Purpose |
|-----|---------|
| `README.md` | Quick start, scripts, deploy |
| `AUDIT.md` | This document |
| `supabase/schema.sql` | Database source of truth |
| `/launch` (live) | Marketing copy kit |

---

*Maintainers: update this audit after major features (new platforms, auth changes, billing). Bump “Last updated” and add a changelog section below.*

### Changelog

| Date | Change |
|------|--------|
| Jun 2026 | Initial full audit — URL search flow, marketing `/launch`, security review |
