# BrandForge Platform Audit

**Audit date:** 2026-05-24  
**Commit audited:** `bbfb67e` — *Simplify marketplace to Starter/Partner and three role filters*  
**Scope:** Full repository (`TheOne`) — Next.js web app, Node API, Supabase, legacy assets  
**Method:** File reads, route mapping, grep/import tracing, migration review. No assumptions without code evidence.  
**Prior audit:** 2026-05-19 (this document supersedes it).

---

## Section 0: Codebase Map

### 0.1 Top-level directories

| Path | Purpose |
|------|---------|
| `web/` | **Primary product** — Next.js 15 App Router, Tailwind, OpenNext/Cloudflare Workers deploy |
| `src/server/` | **Backend logic** — marketplace commerce, auth, trust, payments, legacy chat/squads |
| `data/` | `brandforge-official-catalog.json` (6 official listings), platform seed JSON |
| `supabase/` | SQL schema baseline + **46** migration files (manual SQL Editor workflow; no `config.toml`) |
| `server.js` | **HTTP API** (~3.2k lines) — all `/api/*` handlers, static file fallback |
| `scripts/` | Discord bot, asset generation, Resend test |
| `docs/` | Strategy, architecture, deployment guides |
| `production-layer.js` | **Legacy client SPA** (~4.1k lines IIFE) — not imported anywhere in active stack |
| `auth-client.js` | Legacy auth helper — not referenced by `web/` or `server.js` |
| `.cursor/`, `.github/` | Tooling / CI |
| Root `package.json` | Orchestrates `dev:all`, `cf:build`, Discord scripts |

### 0.2 Key config files

| File | Role |
|------|------|
| `package.json` (root) | Node API + wrangler; `dev:all` runs API + web |
| `web/package.json` | Next 15.5.15, React 18, Framer Motion, Zod 4, OpenNext Cloudflare |
| `web/tsconfig.json` | `strict: true`, path alias `@/*` → `./src/*` |
| `web/next.config.mjs` | Standalone output, API rewrites/proxy env, security headers, **40+ legacy redirects → `/`**, `/marketplace` → `/` |
| `web/wrangler.jsonc` | Cloudflare Worker: `brandforge`, vars for API URL + Supabase public keys |
| `web/tailwind.config.ts` | MD3-style CSS variables from `globals.css`; `darkMode: "class"` |
| `web/src/middleware.ts` | **Only** proxies `/api/*` to `API_PROXY_DESTINATION` — no auth, no bot blocking |
| `.env.example` (root) | Supabase, AI keys, Resend, NOWPayments, Discord, cron secret |
| `railway.json`, `render.yaml` | API hosting (Render URL in wrangler: `brandforge-api-rwwo.onrender.com`) |

### 0.3 Routing structure

#### Next.js App Router (`web/src/app/`)

**Route groups (URL-invisible):**

| Group | Shell | Public URLs |
|-------|--------|-------------|
| `(landing)` | `ForgeLayoutRouter`, summer-sky | `/`, `/about`, `/login`, `/help`, `/work/[slug]`, legal pages |
| `(shop)` | `ForgeSiteShell` | `/listing/[id]`, `/dashboard`, `/dashboard/orders/[id]`, `/checkout/success` |
| `(member)` | Profile layout | `/{username}`, `/{username}/service/[id]`, `/{username}/blog` |
| `account/` | `ForgeSiteShell` + `OnboardingGate` | `/account`, `/account/listings/*` |
| `admin/` | Root layout only | `/admin` |
| `onboarding/` | Onboarding layout | `/onboarding`, `/onboarding/service` |
| Root | Global providers | `/auth/callback` |

**Removed since May 19:** entire `(main)/` group — no `AppShell`, `Sidebar`, `SimpleChat`, `UnifiedMarketplace`, `/marketplace`, `/chat`, `/plans`, `/leaderboard`, `/squads`, `/ai/*`.

**Homepage funnel:** `ForgeLanding` → `ForgeHero` → `ListingBrowse` (`#browse`) → `ForgeHowItWorks` → `ForgeStats` → `ForgeTalentStrip` → `ForgeFinalCTA`.

Browse URL: `/#browse?term=starter|partner&category=Developer|Designer|Video Editor`.

**Redirects (next.config.mjs):** `/marketplace` → `/`; `/marketplace/:category` → `/?term=starter&category=:category`; legacy app routes (`/chat`, `/plans`, `/store`, `/leaderboard`, `/squads`, `/agents`, `/ai`, `/bid`, `/requests`, `/services`, `/settings`, `/studio`, etc.) → `/`.

#### Next.js API routes (`web/src/app/api/` — 9 handlers)

| Route | Behavior |
|-------|----------|
| `/api/health` | Health check |
| `/api/events` | Directory analytics → Supabase |
| `/api/talent` | Proxies to Node `/api/talent` |
| `/api/auth/me` | Auth proxy |
| `/api/me/listings` | Seller listings proxy |
| `/api/marketplace/listings` | Proxies Node marketplace listings |
| `/api/stats/network` | Network stats proxy |
| `/api/ai/status` | AI status proxy |
| `/api/landing-interest` | POST email to Supabase `landing_interest_submissions` |

**Removed since May 19:** `/api/bootstrap` stub, `/api/chat/*`, `/api/feed`, `/api/leaderboard/*`.

**Production API path:** Browser → Cloudflare Worker → `middleware.ts` fetch → Render Node `server.js` `/api/*`.

#### Node API (`server.js`)

Marketplace-critical endpoints:

| Endpoint | Module |
|----------|--------|
| `GET /api/marketplace/listings` | `platform-repository.js` + official catalog merge |
| `POST /api/marketplace/checkout` | `marketplace-commerce.js` |
| `POST /api/nowpayments/ipn` | HMAC verify → mark order paid |
| `GET /api/orders/:id`, `GET /api/dashboard/*` | Order hub |
| `POST /api/orders/:id/:action` | `marketplace-ship-routes.js` |
| `GET/POST /api/admin/*` | Admin overview, whitelist, disputes, ban |

Legacy still live: chat, squads, leaderboard, agents, full bootstrap payload.

### 0.4 Official catalog (6 listings)

Source: `data/brandforge-official-catalog.json`

| Slug | Tier | Category | Price |
|------|------|----------|-------|
| `developer-starter` | Starter | Developer | $799 |
| `developer-partner` | Partner | Developer | $1,299/mo |
| `designer-starter` | Starter | Designer | $597 |
| `designer-partner` | Partner | Designer | $999/mo |
| `video-editor-starter` | Starter | Video Editor | $697 |
| `video-editor-partner` | Partner | Video Editor | $1,199/mo |

Loaded by `src/server/brandforge-official-catalog.js`; merged in `platform-repository.js` (1 listing per category cap).

Tier enforcement: `web/src/lib/package-tiers.ts` (Starter $300–$1,500; Partner $500–$15,000).  
Categories: `web/src/lib/marketplace-categories.ts` — Developer, Designer, Video Editor.

### 0.5 Components map

#### Active marketplace / commerce

| Path | Role |
|------|------|
| `web/src/components/marketplace/ListingBrowse.tsx` | Homepage browse section |
| `web/src/components/marketplace/ListingFilters.tsx` | Tier + category filters |
| `web/src/components/listings/CryptoCheckoutButton.tsx` | NOWPayments checkout |
| `web/src/components/listings/ServiceDetailView.tsx` | Listing detail + trust |
| `web/src/components/orders/OrderDetailClient.tsx` | Order lifecycle + reviews |
| `web/src/components/admin/AdminPanel.tsx` | Admin ops UI |
| `web/src/components/conversion/ConversionCTA.tsx` | Buy Now / Discord hierarchy |
| `web/src/components/theme/SummerSkyBackground.tsx` | Site-wide light theme |

#### Orphan / dead (zero or no page imports)

| Path | Note |
|------|------|
| `web/src/components/auth/AuthGuard.tsx` | Never imported |
| `web/src/components/trust/TrustChipsRow.tsx` | Replaced by `filterProfileTrust` |
| `web/src/components/marketplace/MarketplaceFilters.tsx` | Replaced by `ListingFilters` |
| `web/src/components/marketplace/FeaturedCarousel.tsx` | Uses static `web/src/lib/marketplace/data.ts` |
| `web/src/components/ai/*.tsx` | No page imports |
| `(landing)/_components/DirectoryHero.tsx`, `TalentDirectory.tsx` | Exported but not on `/` |
| `(shop)/offers/page.tsx` | `/offers` redirects to `/` |
| `web/src/lib/marketplace/data.ts` | 20+ fictional products — legacy |

### 0.6 Backend modules (`src/server/`)

| Module | Responsibility |
|--------|----------------|
| `platform-repository.js` | Core data access (~6k lines): profiles, services, marketplace, bootstrap |
| `marketplace-commerce.js` | Checkout, IPN, order lifecycle, seller whitelist gate |
| `trust-metrics.js` | Real trust metrics with thresholds |
| `routes/marketplace-ship-routes.js` | Orders, admin, trust, smart-match APIs |
| `brandforge-official-catalog.js` | Loads 6-listing JSON catalog |
| `package-tiers.js` | Server-side tier/category normalize |
| `auth-service.js` | Supabase JWT validation |
| `nowpayments.js` | Invoice + IPN HMAC verify |
| `http-guards.js` | CORS, rate limit (exempts payment webhooks) |
| `rating-service.js`, `currency-service.js` | Legacy gamification — API redirected, tables remain |

### 0.7 Database

| Source | Contents |
|--------|----------|
| `supabase/schema.sql` | 22 core tables — **no RLS** on baseline |
| `supabase/migrations/*.sql` | 46 files including ship-mode migrations below |
| App seed | `web/src/content/operator-seed.ts`, `operator-media.ts` |

**Ship-mode migrations (must be applied on prod Supabase):**

| File | Summary |
|------|---------|
| `20260521_service_listing_terms.sql` | `listing_type`, `ends_at`, `billing_interval` on `service_packages` |
| `20260522_marketplace_productization.sql` | Roles; `seller_whitelist`; `marketplace_orders`, `marketplace_payment_intents`, `saved_listings`, `listing_views`; RLS |
| `20260523_marketplace_trust_reviews.sql` | Order statuses (`revision_requested`, `disputed`); `marketplace_order_events`, `marketplace_order_reviews`, `platform_analytics_events` |
| `20260524_starter_partner_tiers.sql` | `short_term`/`long_term` → `starter`/`partner` |

**Older issues still present:** conflicting `notifications` schemas, `saved_specialists` column naming, duplicate squad table definitions.

### 0.8 Third-party integrations

| Integration | Where | Status |
|-------------|-------|--------|
| Supabase Auth + DB + Storage | `auth-service`, `platform-repository` | **Live** |
| Cloudflare Workers (OpenNext) | `web/wrangler.jsonc` | **Live** (frontend) |
| Render/Railway | Node API | **Live** — must redeploy after backend changes |
| NOWPayments | `nowpayments.js`, `marketplace-commerce.js` | **Shipped** — invoice + HMAC IPN |
| Stripe | `stripe-payments.js` | **Partial** — no `/api/stripe/webhook` route |
| Resend | `notify-email.js` | **Optional** — not wired for order events |
| Discord/Telegram | `scripts/discord-bot.mjs`, CTAs | **Optional** — Discord secondary CTA |
| LLM providers | `ai-chat.js` | **Legacy** — UI removed |
| Sentry/Posthog/GA | — | **Not found** |

### 0.9 Dead / orphan files (evidence: zero imports or redirected)

**Legacy (repo root):** `production-layer.js`, `auth-client.js`, `test-script.js`.

**Web:** See Section 0.5 orphan table.

**Scaffolding never routed:** `src/agents/*.ts`, `src/core/*.ts` — not required by `server.js`.

### 0.10 Delta from prior audit (May 19 → May 24)

| Area | Before | After |
|------|--------|-------|
| Product mode | Directory vs marketplace split brain | Unified: homepage packages + talent strip |
| `/marketplace` | Primary browse | Removed → `/#browse` |
| Payments | IPN stub | Crypto checkout end-to-end |
| Admin | Documented only | Panel + whitelist + disputes |
| Security | Unauthenticated `POST /api/apply-migration` | **Removed** |
| Bootstrap | Worker stub at `/api/bootstrap` | Stub **removed** |
| App shell | `(main)` chat/plans/leaderboard | Removed — `(shop)` commerce only |
| Design | Dark forge + light landing split | Summer-sky light site-wide |
| Trust | Fake/gamified metrics | Real, threshold-gated |
| Catalog | Curated operators focus | 6 official Starter/Partner packages |

---

## Phase 2 — Department Audits

### ARCHITECTURE & STACK

**Status:** GOOD — product stack is coherent; legacy API surface remains.

**Grade: 7/10** (was 6)

**Files audited:** `package.json`, `web/next.config.mjs`, `web/src/middleware.ts`, `server.js`, `src/server/routes/marketplace-ship-routes.js`

#### What's Done & Working

- Single Next.js 15 app with clear route groups: `(landing)` marketing, `(shop)` commerce, `account/` seller tools.
- `(main)` removed — no split-brain app shell vs landing.
- Cloudflare deploy path: `npm run cf:build` → OpenNext → Worker + assets.
- Marketplace ship routes modularized; tried first in `routeApi`.
- Bootstrap stub on Worker removed — Node `GET /api/bootstrap` is sole source.

#### What Exists But Is Broken / Unused

- `production-layer.js` — 4k-line parallel SPA still at repo root.
- Node API still exposes chat/squads/leaderboard/bootstrap payloads for dead clients.
- Static fictional catalog in `web/src/lib/marketplace/data.ts`.
- TypeScript agent scaffolding — not wired.

#### What's Missing / Must Be Built

- CI that runs web build + API smoke tests on every push.
- Supabase CLI migration pipeline.
- Feature flags to disable legacy API routes.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Archive `production-layer.js` + document deprecation | S | MED |
| 🟠 HIGH | Gate or remove legacy chat/squad/leaderboard API routes | M | MED |
| 🟡 MEDIUM | Delete orphan static catalog + dead pages | S | MED |
| 🟡 MEDIUM | Integration test: browse → checkout → IPN → order | M | HIGH |

---

### AUTHENTICATION & SECURITY

**Status:** PARTIAL — API auth solid; page protection client-only.

**Grade: 6/10** (was 4)

**Files audited:** `src/server/auth-service.js`, `server.js`, `web/src/middleware.ts`, `src/server/http-guards.js`, `src/server/routes/marketplace-ship-routes.js`, `web/src/components/auth/AuthGuard.tsx`

#### What's Done & Working

- API mutations use `requireUser()` → Bearer JWT → Supabase validation.
- **`POST /api/apply-migration` removed** (critical fix from prior audit).
- Admin APIs use `requireAdmin` — DB role check (`admin` | `moderator`).
- NOWPayments IPN: raw body + HMAC-SHA512; rate-limit exempt.
- Order access: buyer/seller only via `loadOrderParty`.
- RLS on `marketplace_orders`, `seller_whitelist`.
- Security headers on all routes (`next.config.mjs`).
- Cron endpoints use `verifyCronSecret`.

#### What Exists But Is Broken / Unused

- **`AuthGuard.tsx`** — complete redirect logic, **never imported**.
- **`/admin`, `/dashboard`, `/account/*`** — client-side `useEffect` redirect only; no Next middleware gate. Any logged-in user can load `/admin` UI (API returns 403).
- CORS allows `*` fallback when origins unset.
- No `isPlatformAdmin` in bootstrap.

#### What's Missing / Must Be Built

- Server-side admin page guard (middleware or layout with role check).
- Stripe webhook (documented in `api-reference.ts`, not routed).
- RLS audit on core `profiles` if anon client writes expand.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Server-side admin role gate on `/admin` layout | S | HIGH |
| 🟠 HIGH | Middleware session check for `/dashboard`, `/account/*` | M | HIGH |
| 🟡 MEDIUM | Remove CORS `*` fallback in production | S | MED |
| 🟢 LOW | Delete unused `AuthGuard` or wire it | S | LOW |

**SEO / crawler 403 note:** No middleware lines block crawlers. 403s for Googlebot would come from Cloudflare Bot Fight Mode or WAF — not from this repo's Next middleware.

---

### DATABASE & DATA LAYER

**Status:** PARTIAL — ship migrations well-scoped; production apply state unknown.

**Grade: 6.5/10** (was 5)

**Files audited:** `supabase/schema.sql`, `20260521`–`20260524` migrations, `platform-repository.js`, `marketplace-commerce.js`

#### What's Done & Working

- Marketplace schema: orders, payment intents, order events, reviews, analytics events.
- Seller whitelist table + server gate `canUserCreateListings`.
- Starter/Partner tier migration with data backfill.
- Trust metrics computed from real order/review data only.
- Server uses service role — bypasses incomplete RLS on legacy tables.

#### What Exists But Is Broken / Unused

- Older migration conflicts (notifications, squads) still in repo — not reconciled.
- `curated_operators` + seed migrations exist; homepage falls back to `OPERATOR_SEED` if DB fetch fails.
- `refunded` status — not in order status check constraints; not wired in UI.
- Role model drift: `schema.sql` vs later migrations (`member`, `buyer`, `seller`).

#### What's Missing / Must Be Built

- Confirmed production apply of `20260521`–`20260524`.
- Migration runner + documented apply order.
- Indexes audit under load.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Apply `20260521`–`20260524` on production Supabase | S | HIGH |
| 🟠 HIGH | Smoke test: checkout creates row in `marketplace_orders` | S | HIGH |
| 🟡 MEDIUM | Reconcile notifications/squads migration conflicts | L | MED |
| 🟢 LOW | Add `refunded` status if refunds are in scope | M | LOW |

---

### DESIGN SYSTEM & UI

**Status:** GOOD — unified light summer-sky theme site-wide.

**Grade: 7.5/10** (was 6)

**Files audited:** `web/src/styles/summer-sky.css`, `web/src/app/layout.tsx`, `web/src/app/globals.css`, `web/tailwind.config.ts`, `(shop)/layout.tsx`, `(landing)/layout.tsx`

#### What's Done & Working

- `summer-sky.css` + `SummerSkyBackground.tsx` — animated sky, light forge tokens globally.
- Root layout defaults to **light** theme; dark forge vignette disabled.
- `(shop)` + `(account)` share `ForgeSiteShell`; landing uses `ForgeLayoutRouter`.
- Consistent CTA styling: `forge-btn-primary` / `forge-btn-secondary`.
- Framer Motion + reduced-motion respected on landing.
- Fonts: Cormorant Garamond, DM Sans, Geist Mono.

#### What Exists But Is Broken / Unused

- `globals.css` still contains legacy Warcraft/dark MD3 blocks underneath summer-sky overrides.
- Orphan landing components: `DirectoryHero`, `TalentDirectory`, `MarketplaceFilters`, `FeaturedCarousel`.
- `(shop)/offers/page.tsx` exists but `/offers` redirects to `/`.

#### What's Missing / Must Be Built

- Full token purge (single source of truth).
- Systematic empty/error states on all account pages.
- Global a11y audit.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Delete orphan components + static `data.ts` catalog | M | MED |
| 🟡 MEDIUM | Purge unused dark/WoW CSS from `globals.css` | M | MED |
| 🟢 LOW | Remove dead `(shop)/offers` page | S | LOW |

---

### MARKETPLACE CORE

**Status:** SHIPPED — focused crypto marketplace with official catalog.

**Grade: 8/10** (was 5)

**Files audited:** `ListingBrowse.tsx`, `ListingFilters.tsx`, `marketplace-commerce.js`, `brandforge-official-catalog.js`, `platform-repository.js`, `ConversionCTA.tsx`

#### What's Done & Working

- Homepage browse: Starter/Partner tabs + Developer / Designer / Video Editor filters.
- 6 official listings with tier/category normalization.
- Listing detail at `/listing/[id]` with trust fetch, `CryptoCheckoutButton`, auto-start via `?checkout=1`.
- Seller listing CRUD at `/account/listings/*` with whitelist gate.
- Smart match API (`POST /api/marketplace/smart-match`).
- Curated talent strip on homepage (`ForgeTalentStrip`).
- CTA hierarchy: **Buy Now** primary, **Ask Questions** (Discord) secondary.

#### What Exists But Is Broken / Unused

- Old bid/request/project flows — API exists, UI removed/redirected.
- `/offer/[id]` page redirects to `/listing/[id]` but file remains.
- Partner subscription billing renewal — checkout creates invoice; recurring billing loop not evident.

#### What's Missing / Must Be Built

- Seller payout / Connect flow (manual ops assumed).
- Dispute resolution workflow beyond status flag + admin list.
- Refund path.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Document Partner subscription renewal ops | S | HIGH |
| 🟠 HIGH | Admin dispute resolution actions (refund, force-complete) | M | HIGH |
| 🟡 MEDIUM | Remove dead offer/bid API surface or gate behind admin | M | MED |

---

### TRUST & REVIEWS

**Status:** SHIPPED — real metrics only, threshold-gated.

**Grade: 8/10** (new department)

**Files audited:** `src/server/trust-metrics.js`, `web/src/lib/trust-thresholds.ts`, `20260523_marketplace_trust_reviews.sql`, `OrderDetailClient.tsx`, `ServiceDetailView.tsx`

#### What's Done & Working

- Server thresholds: min 3 completed orders, 3 reviews, etc.
- Frontend mirrors thresholds — **hides** sub-threshold metrics (no fake zeros).
- Review flow: completed order → buyer submits rating/headline/body → `marketplace_order_reviews`.
- Trust on profiles and listing detail pages.
- APIs: `GET /api/profiles/:username/trust`, `GET /api/listings/:id/trust`.

#### What's Missing / Must Be Built

- Admin moderation of reviews.
- Dispute impact on seller trust score.

---

### ORDERS & FULFILLMENT

**Status:** SHIPPED

**Grade: 7.5/10** (new department)

**Files audited:** `marketplace-commerce.js`, `marketplace-ship-routes.js`, `OrderDetailClient.tsx`, `web/src/app/(shop)/dashboard/**`

#### What's Done & Working

**Lifecycle:** `pending` → (IPN) → `paid` → `in_progress` → `delivered` → (`revision_requested` | `completed` | `disputed`)

- Seller: start, deliver (note/URL).
- Buyer: approve, request revision, open dispute, submit review.
- Dashboard: `/dashboard`, `/dashboard/orders/[id]`.
- Order events logged in `marketplace_order_events`.
- Checkout success page polls order status.

#### What's Missing / Must Be Built

- Admin force-complete / refund from UI.
- `refunded` status not implemented.
- Email notifications on status change.

---

### CHAT & MESSAGING

**Status:** DEPRECATED in product — API legacy remains.

**Grade: 2/10** (was 5)

**Files audited:** `server.js` chat routes, `supabase/schema.sql` chat tables

#### What's Done & Working

- Nothing in current product UI — `/chat`, `/messages` redirect to `/`.

#### What Exists But Is Broken / Unused

- Full chat API in `server.js`: threads, messages, typing, files.
- Dual chat schemas in DB (`conversations` vs `unified_chats`).
- Bootstrap still returns chat slices for `production-layer.js`.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Return 410 on chat routes or remove handlers | M | MED |
| 🟢 LOW | Archive chat components if any remain | S | LOW |

---

### AI & AGENTS

**Status:** DEPRECATED in product UI.

**Grade: 2/10** (was 5)

- `/ai/*`, `/studio`, `/agents` all redirect home.
- `web/src/components/ai/*` — orphan (no page imports).
- `POST /api/ai/chat` may still exist on Node API.
- Agent infra tables + repository remain.

**Recommendation:** Return 410 on AI routes or document as internal-only.

---

### PAYMENTS & MONETIZATION

**Status:** GOOD for crypto marketplace — Stripe not wired.

**Grade: 7/10** (was 2)

**Files audited:** `marketplace-commerce.js`, `nowpayments.js`, `server.js` IPN route, `CryptoCheckoutButton.tsx`, `src/server/env.js`

#### What's Done & Working

- **Full NOWPayments flow:**
  - `POST /api/marketplace/checkout` → creates order + payment intent → NOWPayments invoice URL.
  - `POST /api/nowpayments/ipn` → HMAC verify → `markMarketplaceOrderPaid`.
  - Success page polls `GET /api/orders/:id`.
- Loud checkout failures in UI — no silent Discord redirect on fail.
- 15% platform fee math (`marketplace-fees.js`).
- Env: `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NOWPAYMENTS_SANDBOX`.

#### What Exists But Is Broken / Unused

- **No Stripe webhook route** — `constructWebhookEvent` unused.
- Plan crypto-intent UI removed with `/plans` redirect.
- Partner recurring charges — single invoice at checkout; renewal unclear.

#### What's Missing / Must Be Built

- Idempotent webhook replay handling / dead-letter logging.
- Refund IPN handling.
- Seller payout automation.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Verify NOWPayments keys + IPN URL on Render production | S | HIGH |
| 🟠 HIGH | End-to-end payment smoke test (sandbox → paid order) | S | HIGH |
| 🟡 MEDIUM | Webhook idempotency + structured logging | M | MED |
| 🟢 LOW | Remove Stripe references from docs or implement webhook | L | LOW |

---

### ONBOARDING & USER FLOWS

**Status:** GOOD

**Grade: 7/10** (was 6)

**Files audited:** `OnboardingGate.tsx`, `web/src/app/onboarding/**`, `CreateListingForm.tsx`, `AccountHome.tsx`

#### What's Done & Working

- `OnboardingGate` on landing + account layout.
- `/onboarding`, `/onboarding/service` for post-signup.
- Login with `?next=` return path (checkout, dashboard).
- Seller whitelist messaging in account flows.

#### What's Missing / Must Be Built

- Email verification UX.
- Buyer vs seller role selection (collapsed to buyer default + whitelist for sellers).

---

### LEADERBOARD & RANKING

**Status:** REMOVED from product.

**Grade: 1/10** (was 4)

- `/leaderboard`, `/store` redirect home.
- RP/Honor/Conquest API + DB tables still in repo.
- Correct for current positioning — trust metrics replace gamification.

---

### SEO & DISCOVERABILITY

**Status:** GOOD — updated for new routes.

**Grade: 7.5/10** (was 7)

**Files audited:** `robots.ts`, `sitemap.ts`, `(landing)/page.tsx`, `(member)/[username]/page.tsx`

#### What's Done & Working

- `robots.ts` — no stale `/marketplace`, `/chat`, `/studio` allows; disallows `/api/`, `/auth/`.
- `sitemap.ts` — fetches live starter/partner listings + talent profiles from API.
- Homepage metadata + JSON-LD.
- Profile URLs at `/{username}`.

#### What Exists But Is Broken / Unused

- `robots.ts` still allows `/offer/` (redirects to listing).
- Sitemap omits listings if API fetch fails (degrades to static only).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Add JSON-LD `Product`/`Service` on listing pages | M | MED |
| 🟡 MEDIUM | Document Cloudflare crawler allowlist (dashboard setting) | S | MED |

---

### PERFORMANCE & INFRASTRUCTURE

**Status:** PARTIAL

**Grade: 6.5/10** (was 6)

**Files audited:** `next.config.mjs`, `wrangler.jsonc`, `render.yaml`

#### What's Done & Working

- Lighter frontend without 1.7k-line `SimpleChat`.
- `images.unoptimized: true` for Cloudflare.
- API rate limiting (IPN/webhook exempt).
- Unique `generateBuildId`.

#### What Exists But Is Broken / Unused

- Render cold start on first API hit after idle.
- No error monitoring (Sentry).
- In-memory presence on legacy chat API.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Render health ping / keep-warm for checkout path | S | MED |
| 🟡 MEDIUM | Add Sentry on web + API | M | MED |

---

### CONVERSION & GROWTH

**Status:** GOOD — unified crypto-buy funnel.

**Grade: 8/10** (was 7)

**Files audited:** `ConversionCTA.tsx`, `ForgeLanding.tsx`, `ForgeHero.tsx`, `web/src/lib/analytics.client.ts`

#### What's Done & Working

- Primary CTA hierarchy: **Buy Now** → `/listing/[id]?checkout=1`; **Ask Questions** → Discord.
- Homepage hero → `#browse` → listing → checkout.
- Analytics events: `checkout_start`, `checkout_redirect`, `checkout_error`.
- Trust copy blocks on landing.

#### What Exists But Is Broken / Unused

- Some legal/marketing pages may still mention Telegram-first flows.
- `landing-interest` API exists; hero email capture removed.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Copy audit: align all pages to crypto checkout funnel | S | MED |
| 🟡 MEDIUM | Funnel dashboard from `platform_analytics_events` | M | MED |

---

### NOTIFICATIONS & COMMS

**Status:** PARTIAL — unchanged.

**Grade: 4/10** (was 4)

**Files audited:** `notify-email.js`, notification migrations

#### What's Done & Working

- Resend integration stubbed in env.
- Discord bot scripts for ops.

#### What Exists But Is Broken / Unused

- Notification schema conflicts across migrations.
- No transactional emails wired for order events.
- In-app notification center not in current UI.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Wire Resend for order status events | M | MED |
| 🟡 MEDIUM | Pick one notifications schema and migrate | M | MED |

---

### ADMIN & OPERATIONS

**Status:** SHIPPED (minimal viable)

**Grade: 7.5/10** (was 1)

**Files audited:** `AdminPanel.tsx`, `marketplace-ship-routes.js`, `20260522_marketplace_productization.sql`

#### What's Done & Working

- `/admin` → `AdminPanel`: overview KPIs, orders list, disputes, seller whitelist CRUD, user ban (`is_public: false`).
- Server-enforced `requireAdmin` on all `/api/admin/*`.
- Seller whitelist gates listing creation.

#### What Exists But Is Broken / Unused

- No server-side page guard on `/admin`.
- No curated operator CRUD in admin.
- No refund/dispute resolution actions.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Server-side admin gate on `/admin` | S | HIGH |
| 🟠 HIGH | Dispute resolution actions in admin | M | HIGH |
| 🟡 MEDIUM | Curated operator CRUD in admin | L | MED |

---

## Phase 3 — Master Action Matrix

| # | Department | Finding | Priority | Effort | Impact | Action |
|---|-----------|---------|----------|--------|--------|--------|
| 1 | Database | Ship migrations may be unapplied on prod | 🔴 CRITICAL | S | HIGH | Apply `20260521`–`20260524` on Supabase; smoke test checkout |
| 2 | Payments | NOWPayments env must be live on Render | 🔴 CRITICAL | S | HIGH | Verify API key, IPN secret, callback URL on production |
| 3 | Ops | Backend changes require Render redeploy | 🔴 CRITICAL | S | HIGH | Redeploy API after latest commits; Cloudflare alone insufficient |
| 4 | Security | `/admin` UI not role-gated at page level | 🟠 HIGH | S | HIGH | Server-side admin check in layout/middleware |
| 5 | Security | Dashboard/account client-only auth | 🟠 HIGH | M | HIGH | Middleware session gate |
| 6 | Marketplace | Partner subscription renewal undefined | 🟠 HIGH | M | HIGH | Document/implement renewal billing |
| 7 | Admin | Disputes list-only, no resolution actions | 🟠 HIGH | M | HIGH | Add force-complete, refund, message buyer/seller |
| 8 | Legacy | Chat/squad/leaderboard API still live | 🟡 MEDIUM | M | MED | Return 410 or remove handlers |
| 9 | Code health | Orphan static catalog + dead pages | 🟡 MEDIUM | S | MED | Delete `data.ts` products, offers page, unused components |
| 10 | Payments | No Stripe webhook | 🟡 MEDIUM | L | LOW | Remove from docs or implement if needed |
| 11 | Observability | No Sentry | 🟡 MEDIUM | M | MED | Add error tracking on checkout path |
| 12 | SEO | Listing JSON-LD missing | 🟡 MEDIUM | M | MED | Add structured data on `/listing/[id]` |
| 13 | Notifications | No order status emails | 🟡 MEDIUM | M | MED | Wire Resend for paid/delivered/completed |
| 14 | Database | Old migration conflicts unresolved | 🟡 MEDIUM | L | MED | Reconcile notifications/squads |
| 15 | Legacy | `production-layer.js` | 🟢 LOW | S | LOW | Archive |

---

## Phase 4 — Executive Summary

### Platform Readiness Score (0–10)

| Department | May 19 | May 24 | Note |
|------------|--------|--------|------|
| Architecture & Stack | 6 | **7** | `(main)` removed; cleaner shop/landing split |
| Authentication & Security | 4 | **6** | Critical holes fixed; page guards still weak |
| Database & Data Layer | 5 | **6.5** | Ship migrations solid; prod state unverified |
| Design System & UI | 6 | **7.5** | Summer-sky unified light theme |
| Marketplace Core | 5 | **8** | Starter/Partner + 6 listings + browse on `/` |
| Trust & Reviews | — | **8** | Real metrics, threshold-gated |
| Orders & Fulfillment | — | **7.5** | Full lifecycle shipped |
| Chat & Messaging | 5 | **2** | UI removed; API legacy |
| AI & Agents | 5 | **2** | UI removed |
| Payments & Monetization | 2 | **7** | Crypto checkout shipped; no Stripe |
| Onboarding & User Flows | 6 | **7** | OnboardingGate + seller whitelist |
| Leaderboard & Ranking | 4 | **1** | Correctly de-scoped |
| SEO & Discoverability | 7 | **7.5** | robots/sitemap updated |
| Performance & Infrastructure | 6 | **6.5** | Lighter frontend; Render cold start |
| Conversion & Growth | 7 | **8** | Buy Now primary, homepage browse |
| Notifications & Comms | 4 | **4** | Unchanged |
| Admin & Operations | 1 | **7.5** | Admin panel + whitelist shipped |

### Reality Score

| Scenario | Score | Condition |
|----------|-------|-----------|
| **Paying crypto marketplace users** | **7/10** | IF migrations applied + Render redeployed + NOWPayments configured |
| Same, without prod DB/env | **5/10** | Checkout fails or orders table missing |
| **Curated directory + manual Discord** | **7.5/10** | Homepage talent strip + Discord CTAs work today |
| **May 19 baseline** | 4/10 marketplace / 6/10 directory | For comparison |

### Top 5 Blockers (production money path)

1. **Supabase migrations `20260521`–`20260524` must be applied** — without them, checkout/order APIs fail.
2. **Render API must run latest backend** — frontend-only Cloudflare deploy is not enough.
3. **NOWPayments production keys + IPN URL** — misconfiguration = paid crypto, unpaid order.
4. **Partner subscription renewal** — unclear automated rebill; risk after month 1.
5. **Dispute/refund ops** — status exists; no admin resolution workflow.

### Top 5 Quick Wins

1. Production smoke test: `/#browse` → listing → checkout → IPN → dashboard order.
2. Server-side admin gate on `/admin` (1 file).
3. Delete orphan `web/src/lib/marketplace/data.ts` + unused components.
4. Render keep-warm ping on `/api/health`.
5. Copy pass: remove Telegram-first language from help/legal pages.

### What NOT to Build (defer or kill)

- Full Stripe Connect marketplace — crypto path is canonical now.
- Chat/squads/leaderboard product surfaces — already redirected; kill API next.
- Agent swarm orchestration (`src/core/*`) — scaffold only.
- Honor/Conquest economy — conflicts with trust-first model.
- `/marketplace` standalone page — correctly killed; browse stays on `/`.
- `production-layer.js` SPA — archive.

### Recommended Build Order

1. **Prod verification:** apply migrations, redeploy Render, NOWPayments smoke test.
2. **Ops hardening:** admin dispute actions, order emails, webhook idempotency logging.
3. **Security:** server-side guards on `/admin`, `/dashboard`, `/account`.
4. **Legacy cleanup:** remove chat/squad API, static catalog, dead pages.
5. **Partner billing:** define and implement subscription renewal.
6. **Observability:** Sentry on checkout + IPN path.

### Operational Checklist (before taking real money)

1. Apply Supabase migrations `20260521`–`20260524`.
2. Redeploy Render API with latest `server.js` + `src/server/*`.
3. Set `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` on Render; confirm IPN hits `https://brandforge-api-rwwo.onrender.com/api/nowpayments/ipn`.
4. Run sandbox payment → confirm order moves `pending` → `paid` → dashboard visible.
5. Confirm trust UI shows **nothing** (not zeros) for sellers below thresholds.

---

*End of audit. All findings tied to repository at commit `bbfb67e`.*
