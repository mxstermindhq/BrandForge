# BrandForge Platform Audit

**Audit date:** 2026-05-19  
**Scope:** Full repository (`TheOne`) — Next.js web app, Node API, Supabase, legacy assets  
**Method:** File reads, route mapping, grep/import tracing, migration review. No assumptions without code evidence.

---

## Section 0: Codebase Map

### 0.1 Top-level directories

| Path | Purpose |
|------|---------|
| `web/` | **Primary product** — Next.js 15 App Router, Tailwind, OpenNext/Cloudflare Workers deploy |
| `src/server/` | **Backend logic** — marketplace, chat, AI, payments, ratings (imported by root `server.js`) |
| `src/agents/`, `src/core/`, `src/marketplace/`, `src/verticals/` | TypeScript scaffolding for multi-agent workflows; **not wired** into `server.js` routes |
| `supabase/` | SQL schema baseline + 40 migration files (manual SQL Editor workflow; no `config.toml`) |
| `server.js` | **HTTP API** (~3.2k lines) — all `/api/*` handlers, static file fallback |
| `scripts/` | Discord bot, asset generation, Resend test |
| `docs/` | Strategy, architecture, deployment guides |
| `data/` | `platform-state.json`, `professional-titles.json` (local/seed) |
| `images/` | Design artifacts (`artifact.tsx`) — not production routes |
| `js/` | Empty or minimal (not primary) |
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
| `web/next.config.mjs` | Standalone output, API rewrites/proxy env, security headers, `images.unoptimized: true`, unique `generateBuildId` |
| `web/wrangler.jsonc` | Cloudflare Worker: `brandforge`, vars for API URL + Supabase public keys |
| `web/tailwind.config.ts` | MD3-style CSS variables from `globals.css`; `darkMode: "class"` |
| `web/src/middleware.ts` | **Only** proxies `/api/*` to `API_PROXY_DESTINATION` — no auth, no bot blocking |
| `.env.example` (root) | Supabase, AI keys, Resend, NOWPayments, Discord, cron secret |
| `web/.env.example` | `NEXT_PUBLIC_*` for web (if present) |
| `railway.json`, `render.yaml` | API hosting (Render URL in wrangler: `brandforge-api-rwwo.onrender.com`) |
| `orchestration.config.ts` | Agent workflow config (verticals) |

### 0.3 Routing structure

#### Next.js App Router (`web/src/app/`)

**Route groups (URL-invisible):**

| Group | Shell | Public URLs |
|-------|--------|-------------|
| `(landing)` | `LandingNav`, `landing-layout` | `/`, `/about`, `/login`, `/help`, `/work/[slug]`, `/offer/[id]`, legal pages |
| `(main)` | `AppShell` + sidebar | `/marketplace`, `/chat`, `/plans`, `/settings`, `/leaderboard`, `/squads`, `/ai/*`, `/bid/*`, etc. |
| `(member)` | Landing theme on profiles | `/{username}`, `/{username}/service/[id]`, `/{username}/request/[id]`, `/{username}/blog` |
| Root | Global providers | `/auth/callback`, `/payment/success`, `/payment/cancelled` |

**Redirects (next.config + pages):** `/messages` → `/chat`, `/p/:user` → `/:user`, `/explore` → `/`, `/requests` & `/services` list → `/marketplace`, `/ai/studio` → `/studio` (**no `/studio` page exists**).

**Next.js API routes** (`web/src/app/api/` — 16 handlers):

| Route | Behavior |
|-------|----------|
| `/api/bootstrap` | **STUB** — returns `{ test: "worker is working" }` only |
| `/api/talent` | Proxies to Node `/api/talent` |
| `/api/auth/me` | Auth proxy |
| `/api/chat/*` | Chat threads/messages (partial; checks auth on some) |
| `/api/landing-interest` | POST email to Supabase `landing_interest_submissions` |
| `/api/health`, `/api/stats/network`, `/api/marketplace/*`, `/api/feed`, `/api/activity/recent`, `/api/leaderboard/performance`, `/api/ai/status` | Mix of proxies and local handlers |

**Production API path:** Browser → Cloudflare Worker → `middleware.ts` fetch → Render Node `server.js` `/api/*`.

#### Node API (`server.js`)

100+ endpoints including: auth, bootstrap, marketplace CRUD, bids, projects, contracts, chat (legacy + unified), AI chat/image, squads, agents, leaderboard, privileges/currency, Stripe chat deposit, NOWPayments IPN stub, cron, sitemaps, feed, reviews, settings.

**Not implemented in `server.js` but documented in `web/src/content/api-reference.ts`:** Stripe webhook, bid escrow checkout, plan crypto-intent, full admin API.

### 0.4 Components map

#### `web/src/components/` (shared)

| Folder | Examples | Usage |
|--------|----------|--------|
| `layout/` | `AppShell`, `Sidebar`, `OnboardingRedirect`, banners | Active — main app shell |
| `ui/` | `AuthWall`, `PageRouteLoading`, `IslamicPattern`, skeletons | Mixed — several unused |
| `marketplace/` | `SmartMatchEngine`, hero stats | Active in `UnifiedMarketplace` |
| `messages/` | `ChatEmbeds` | Active in `SimpleChat` |
| `deal-rooms/` | `AIAssistantPanel` | Active in `SimpleChat` |
| `ai/` | Brief/proposal/career tools | Active with `AuthWall` |
| `leaderboard/` | `WoWRankingSystem.tsx` (exports `PerformanceLeaderboard`) | Active |
| `auth/` | `AuthGuard` | **Orphan — never imported** |
| `agents/`, `deal/`, `squads/`, `trust/`, `landing/` | Various | **Mostly orphan** |

#### Colocated page components

- `(landing)/_components/` — ~25 files; **~15 unused** on current `/` page
- `(main)/**/_components/` — marketplace, chat, plans, settings, etc.
- `(member)/[username]/_components/` — `UnifiedProfileView`, `ProfileHeader`, `ProofPanels`, `ProfileCTA`; `ProfileFaq` **unused**

### 0.5 Backend modules (`src/server/`)

| Module | Responsibility |
|--------|----------------|
| `platform-repository.js` | Core data access (~6k lines): profiles, services, requests, bids, projects, chat, contracts, bootstrap |
| `auth-service.js` | Supabase JWT validation, profile/settings bootstrap |
| `rating-service.js` | RP, tiers, leaderboard, deal win/loss |
| `currency-service.js` | Honor/Conquest in-app currency |
| `ai-chat.js` | Multi-provider LLM |
| `stripe-payments.js` | Checkout sessions (escrow + simple) |
| `nowpayments.js` | Invoice + IPN signature verify |
| `notify-email.js` | Resend transactional |
| `agent-infra-repository.js` | Separate AI agent marketplace tables |
| `http-guards.js` | CORS, rate limit (exempts payment webhooks) |

### 0.6 Database

| Source | Contents |
|--------|----------|
| `supabase/schema.sql` | 22 core tables — **no RLS** |
| `supabase/migrations/*.sql` | Social, squads, gamification, contracts, curated operators, talent directory fields, etc. |
| App seed | `web/src/content/operator-seed.ts`, `operator-media.ts` |
| Runtime | `curated_operators` table optional; app falls back to seed |

**Critical migration issues:** conflicting `notifications` schemas, `saved_specialists` column naming (`client_id` vs `user_id`), duplicate squad table definitions, `crypto_payment_intents` alter-only with no CREATE in repo.

### 0.7 Third-party integrations

| Integration | Where | Status |
|-------------|-------|--------|
| Supabase Auth + DB + Storage | `auth-service`, `platform-repository`, browser client | **Live** |
| Cloudflare Workers (OpenNext) | `web/wrangler.jsonc`, deploy scripts | **Live** (frontend) |
| Render/Railway | Node API | **Live** (per wrangler API URL) |
| Stripe | `stripe-payments.js`, `POST /api/checkout/chat-deposit` | **Partial** — no webhook route |
| NOWPayments | `nowpayments.js`, contract crypto-intent | **Partial** — IPN stub |
| Resend | `notify-email.js`, `.env.example` | **Optional** — depends on env |
| Discord/Telegram | `scripts/discord-bot.mjs`, env | **Optional** |
| LLM providers | `ai-chat.js` | **Configurable** via env keys |
| Sentry/Posthog/GA | — | **Not found in codebase** |

### 0.8 Utility / lib (`web/src/lib/`)

`api.ts`, `operators.server.ts`, `profile-view-model.ts`, `reserved-paths.ts`, `schemas/operator.schema.ts`, `supabase/browser.ts`, `human-chat-threads.ts`, `image-url.ts`, `metadata-api.ts`, etc.

### 0.9 Dead / orphan files (evidence: zero imports)

**Legacy (repo root):** `production-layer.js`, `auth-client.js`, `test-script.js`, root `404.html` / `500.html` (superseded by Next).

**Web components (no external imports):**  
`AuthGuard.tsx`, `AgentStudio.tsx`, `AGIAgents.tsx`, `AgentMarketplace.tsx`, `ContractGenerator.tsx`, `EnhancedChatInput.tsx`, `ChatDealRoomList.tsx`, `DealRoomShowcase.tsx`, `OutcomeSquads.tsx` (only self-imports), `TrustChipsRow.tsx`, `Skeleton.tsx`, `SkeletonCard.tsx`, `LastActiveAgo.tsx`, `ShareWinModal.tsx`, deal/* modals.

**Landing components not on `/`:**  
`LandingHero`, `LoginHero`, `OperatorCard`, `TalentFilterBar`, `OfficialPackages`, `MarketplaceShowcase`, `PlansShowcase`, `HowItWorks`, `FeaturesGrid`, `AskAICards`, `AuthRedirect`, `LandingProfileMenu`, etc.

**Duplicate private routes:**  
`(main)/_requests/**/page.tsx`, `(main)/_services/**/page.tsx` — underscore folders are private segments; canonical routes are `/requests/*`, `/services/*`.

**Scaffolding never routed:**  
`src/agents/*.ts`, `src/core/*.ts` — not required by `server.js`.

### 0.10 Orphaned features (built but not productized)

| Feature | Evidence |
|---------|----------|
| Profile editor modal | `ProfileEditor.tsx` + `useLandingUI` — **no caller** for `openProfileEditor` |
| Landing email capture UI | Removed from `DirectoryHero`; API + DB table remain |
| `/studio` route | Redirect target missing |
| Admin API | Documented only in `api-reference.ts` |
| `AuthGuard` | Defined, never used — `(main)` routes are **not** server-protected |

---

## Phase 2 — Department Audits

### ARCHITECTURE & STACK

**Status:** PARTIAL — dual-stack works for deploy, but product logic is split and duplicated.

**Files audited:** `package.json`, `web/package.json`, `web/next.config.mjs`, `web/tsconfig.json`, `web/wrangler.jsonc`, `web/src/middleware.ts`, `server.js`, `README.md`, `src/server/env.js`

#### What's Done & Working

- Next.js 15 App Router only in `web/` — no `pages/` router.
- TypeScript `strict: true` in web; Zod validation for `CuratedOperator`.
- Cloudflare deploy path: `npm run cf:build` → OpenNext → Worker + assets.
- API proxy: middleware + rewrites send `/api` to Render Node API.
- Unique `generateBuildId` prevents stale webpack manifest crashes.

#### What Exists But Is Broken / Unused

- **Two bootstrap paths:** Real data in Node `GET /api/bootstrap`; Cloudflare route `web/src/app/api/bootstrap/route.ts` returns a test stub — if anything hit the Worker-local route instead of proxy, app would break.
- **Legacy SPA** `production-layer.js` (~4k lines) — parallel UI model, unmaintained.
- **TypeScript agents** under `src/agents/` — not integrated with HTTP layer.
- **Root `server.js` also serves static files** — overlapping responsibility with Next.

#### What's Missing / Must Be Built

- Single source of truth for which product mode is canonical (curated directory vs full marketplace).
- CI that runs `web` build + API smoke tests on every push.
- Supabase CLI migration pipeline (no `config.toml`).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Delete or wire `web/src/app/api/bootstrap/route.ts` to proxy Node bootstrap | S | HIGH |
| 🔴 CRITICAL | Remove unauthenticated `POST /api/apply-migration` | S | HIGH |
| 🟠 HIGH | Archive `production-layer.js` + document deprecation | S | MED |
| 🟠 HIGH | Add integration test: landing + bootstrap + profile | M | HIGH |
| 🟡 MEDIUM | Consolidate env docs (`web/.env.local` vs root `.env`) | S | MED |

---

### AUTHENTICATION & SECURITY

**Status:** PARTIAL — Supabase auth works at API layer; web route protection is inconsistent.

**Files audited:** `src/server/auth-service.js`, `server.js` (requireUser), `web/src/components/auth/AuthGuard.tsx`, `web/src/components/layout/OnboardingRedirect.tsx`, `web/src/providers/AuthProvider.tsx`, `web/src/middleware.ts`, `src/server/http-guards.js`, `server.js` L412-467

#### What's Done & Working

- API mutations use `requireUser()` → Bearer JWT → `getUserFromAccessToken` (`server.js` L353-361).
- Cron endpoints use `verifyCronSecret`.
- Security headers on all routes (`next.config.mjs` L123-148).
- CORS allowlist when configured (`http-guards.js`).
- Rate limiting on mutating methods (exempts payment webhooks).

#### What Exists But Is Broken / Unused

- **`AuthGuard.tsx`** — complete redirect-to-`/` logic, **never imported**.
- **`(main)` layout** — no auth wrapper; `/chat`, `/settings` load for anonymous users (API 401s / empty UI).
- **`POST /api/apply-migration`** — runs DDL via service role **with no auth** (`server.js` L412-467).
- **`GET /api/auth/config`** — returns `anonKey` to any caller (`server.js` L469-475) — public by design but increases key surface.
- **`isPlatformAdmin`** typed in `BootstrapProvider` but **never set** by API bootstrap.
- Admin whitelist (`mxstermind.com@gmail.com`) — **not implemented** in server code.

#### What's Missing / Must Be Built

- Middleware or layout-level session gate for `(main)/*`.
- Server-side admin role checks for privileged routes.
- Stripe/NOWPayments webhook signature verification on live routes.
- RLS on `profiles`, `projects`, `messages` if any client uses anon key directly.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Remove or auth-gate `/api/apply-migration` | S | HIGH |
| 🔴 CRITICAL | Wrap `(main)/layout` with session check (or use AuthGuard) | M | HIGH |
| 🟠 HIGH | Implement `isPlatformAdmin` in bootstrap + guard admin routes | M | HIGH |
| 🟠 HIGH | Complete NOWPayments IPN + Stripe webhook handlers | L | HIGH |
| 🟡 MEDIUM | Audit Supabase anon policies — no broad INSERT on sensitive tables | M | MED |

**SEO / crawler 403 note:** No middleware lines block crawlers. `web/src/middleware.ts` only proxies API. `robots.ts` allows `/` and disallows `/chat`, `/api`, etc. **403s for Googlebot would come from Cloudflare Bot Fight Mode or WAF — not from this repo's Next middleware.**

---

### DATABASE & DATA LAYER

**Status:** PARTIAL — rich schema in migrations; production state uncertain; RLS incomplete.

**Files audited:** `supabase/schema.sql`, `supabase/migrations/20260518_curated_operators.sql`, `20260516_talent_directory_fields.sql`, `project_contracts_unified_embed_rls.sql`, `profiles_role_member_moderator.sql`, `web/src/lib/operators.server.ts`, `src/server/platform-repository.js` (samples)

#### What's Done & Working

- Core marketplace tables in `schema.sql`: profiles, services, requests, bids, projects, dual chat systems.
- `curated_operators` migration with public SELECT RLS.
- `operators.server.ts` fetches curated rows with Zod validation; falls back to `OPERATOR_SEED`.
- Server uses **service role** for most operations — bypasses missing RLS on core tables.
- Talent directory API + profile fields migration (`availability`, `directory_category`, etc.).

#### What Exists But Is Broken / Unused

- **`curated_operators` table** may be unapplied — build logs showed `getCuratedOperators: fetch failed 404`; seed fallback masks this.
- **Conflicting migrations** for notifications, squads, saved_specialists (documented in Section 0.6).
- **`crypto_payment_intents`** — alter migration only; CREATE missing.
- **Role model drift:** `schema.sql` uses `client`/`specialist`; later migration uses `member`/`moderator`.

#### What's Missing / Must Be Built

- Migration runner + single canonical social/notification schema.
- RLS policies for profiles/projects if client-side Supabase writes expand.
- Indexes audit for leaderboard and marketplace list queries.
- Seed script for `curated_operators` matching `operator-seed.ts`.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Apply `20260518_curated_operators.sql` + seed in Supabase | S | HIGH |
| 🔴 CRITICAL | Freeze migration order; resolve `notifications` / `squads` conflicts | L | HIGH |
| 🟠 HIGH | Add RLS or ban direct anon writes on `profiles` | M | HIGH |
| 🟡 MEDIUM | Add `crypto_payment_intents` CREATE migration | S | MED |

---

### DESIGN SYSTEM & UI

**Status:** PARTIAL — two visual systems (landing light tokens vs MD3 dark app).

**Files audited:** `web/src/styles/tokens.css`, `web/src/app/globals.css`, `web/tailwind.config.ts`, `web/src/app/layout.tsx`, `(landing)/layout.tsx`, `(member)/layout.tsx`, `TalentDirectory.tsx`, `OperatorCard.tsx` (orphan)

#### What's Done & Working

- Semantic tokens in `tokens.css` + landing CSS variables in `globals.css` (`landing-layout`).
- Fonts: Cormorant Garamond, DM Sans, Geist Mono via `next/font`.
- Framer Motion on landing directory (reduced-motion respected).
- `IslamicPattern.tsx` for texture (landing/profile).
- Shared UI primitives: `PageRouteLoading`, `AuthWall`, `AnimatedCounter`.

#### What Exists But Is Broken / Unused

- **Tailwind theme** maps MD3 variables (`--color-primary`, surfaces) — landing uses different `--color-text-primary` tokens — **inconsistent**.
- **Dark mode** configured (`darkMode: "class"`) but landing is light-first; app shell defaults differ.
- **Orphan components** with old styling (`LandingHero`, `OperatorCard`) diverge from inline `TalentDirectory` cards.
- **`ProfileFaq`** built but not in `UnifiedProfileView` (tabs: About, Work, Reviews only).

#### What's Missing / Must Be Built

- Single token file consumed by both `(landing)` and `(main)`.
- Component audit pass — delete unused landing sections.
- Systematic loading/error/empty states on all `(main)` routes.
- a11y audit (focus rings exist on some landing work; not verified globally).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Unify tokens: landing + app from one `tokens.css` | M | HIGH |
| 🟠 HIGH | Delete or merge orphan landing components | M | MED |
| 🟡 MEDIUM | Wire `ProfileFaq` or remove file | S | LOW |
| 🟡 MEDIUM | Standardize skeleton/empty across marketplace + chat | M | MED |

---

### MARKETPLACE CORE

**Status:** PARTIAL — backend CRUD exists; product positioning shifted to curated directory.

**Files audited:** `server.js` (marketplace routes), `platform-repository.js` (grep), `UnifiedMarketplace.tsx`, `TalentDirectory.tsx`, `NewRequestForm.tsx`, `BidPageClient.tsx`, `(member)/[username]/*`

#### What's Done & Working

- Create/list services and requests via API.
- Bid flow: POST bid, accept/reject, counter-offer (`server.js`).
- Smart match POST `/api/marketplace/smart-match`.
- Public marketplace UI: `UnifiedMarketplace` with search, tabs, collections, bookmarks.
- Curated landing directory: profiles/services/work views with URL state (`?view=&filter=&q=`).
- Member public profiles at `/{username}` with curated + registered logic.

#### What Exists But Is Broken / Unused

- **List routes redirect:** `/requests`, `/services` → `/marketplace` — old list clients orphaned.
- **`RequestsClient` / `ServicesClient`** — never imported.
- **Transactional marketplace UX** vs landing copy ("Start a conversation" / Telegram) — **misaligned**.
- **Bid accept** does not trigger escrow checkout in route layer.
- **Specialist readiness gate** in `platform-repository.js` still references `role === 'specialist'` while roles migrated to `member`.

#### What's Missing / Must Be Built

- Clear "directory-only" mode: disable or hide open bidding if not product goal.
- End-to-end deal flow: bid → contract → payment → delivery (partially in DB, not wired in UI).
- Registered users in landing directory (removed; only curated seed operators).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Decide: marketplace vs directory — hide unused flows | M | HIGH |
| 🟠 HIGH | Fix role checks (`specialist` → `member`) in repository | S | MED |
| 🟡 MEDIUM | Connect bid accept to Stripe escrow session | L | HIGH |
| 🟢 LOW | Remove dead `RequestsClient` / `ServicesClient` | S | LOW |

---

### CHAT & MESSAGING

**Status:** PARTIAL — large client implementation; dual backend chat models.

**Files audited:** `SimpleChat.tsx` (header + structure), `ChatEmbeds.tsx`, `server.js` chat routes, `supabase/schema.sql` (chat tables), `web/src/app/api/chat/**`

#### What's Done & Working

- **`SimpleChat.tsx`** (~1,700 lines): AI models, agents, human deal rooms, embeds, sidebar threads from bootstrap.
- APIs: `/api/chat/:id/messages`, `/api/chats`, legacy + unified paths in `server.js`.
- Message embeds for contracts, listings, milestones (`ChatEmbeds.tsx`).
- `AIAssistantPanel` in deal sidebar.
- Typing/presence tracked in-memory on API server (`presenceByUserId`).

#### What Exists But Is Broken / Unused

- **`EnhancedChatInput`**, **`ChatDealRoomList`** — not imported.
- **Realtime:** no Supabase realtime subscription in SimpleChat — likely polling/refetch.
- **Dual schemas:** `conversations`/`messages` vs `unified_chats`/`unified_messages` — complexity + migration risk.
- **No route auth** — guests can open `/chat` UI.

#### What's Missing / Must Be Built

- Message delivery guarantees, read receipts consistency across chat types.
- File upload pipeline end-to-end test.
- Push/email on new message (`notify-email.js` exists but coverage unclear).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Require auth on `/chat` routes | S | HIGH |
| 🟠 HIGH | Pick unified vs legacy chat — deprecate one | L | HIGH |
| 🟡 MEDIUM | Wire notifications for new messages | M | MED |
| 🟢 LOW | Remove unused chat components | S | LOW |

---

### AI & AGENTS

**Status:** PARTIAL — LLM chat live; agent marketplace separate; task tree not productized.

**Files audited:** `src/server/ai-chat.js`, `src/server/ai-content-generator.js`, `ai-image.js`, `SimpleChat.tsx`, `src/server/agent-infra-repository.js`, `web/src/app/(main)/ai/**`, `src/agents/*.ts`

#### What's Done & Working

- Multi-provider AI chat API (`POST /api/ai/chat`) with provider env keys.
- AI tools pages: brief generator, proposal writer, career assistant (with `AuthWall`).
- Image generation endpoint.
- Model list in SimpleChat (GPT, Grok, Gemini, Claude).
- Agent infra tables + repository for template marketplace.

#### What Exists But Is Broken / Unused

- **`/ai/studio` → `/studio`** — broken redirect.
- **`StudioClient.tsx`** — orphan.
- **TypeScript agent swarm** (`src/core/orchestration-engine.ts`) — not called from API.
- **Agent components** (`AgentStudio`, `AGIAgents`) — orphan.

#### What's Missing / Must Be Built

- Plan-based token limits enforced server-side (UI copy mentions quotas; enforcement unclear).
- Streaming responses in UI (if desired).
- Agent mode task tree / live progress — not found in production UI.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Fix or remove `/ai/studio` redirect | S | MED |
| 🟡 MEDIUM | Enforce AI usage limits per `top_member` / plan | M | HIGH |
| 🟢 LOW | Delete unused agent TS scaffolding or wire one vertical | L | LOW |

---

### PAYMENTS & MONETIZATION

**Status:** BROKEN for production monetization — partial implementations only.

**Files audited:** `stripe-payments.js`, `stripe-connect-service.js`, `nowpayments.js`, `server.js` (checkout, IPN), `PlansClient.tsx`, `plan_payment_intents.sql`, `crypto_payment_intents_nowpayments.sql`

#### What's Done & Working

- Stripe client + `createEscrowCheckoutSession` + `createSimpleUsdCheckoutSession`.
- `POST /api/checkout/chat-deposit` when `STRIPE_SECRET_KEY` set.
- `POST /api/contracts/:id/crypto-intent` creates NOWPayments invoice.
- Plans UI with tiers ($0 / $29 / $79 / $199) and crypto checkout attempt.
- 15% platform fee math (`marketplace-fees.js`).
- Payment success/cancel pages exist.

#### What Exists But Is Broken / Unused

- **`POST /api/nowpayments/ipn`** — empty handler, returns `{ ok: true }` (`server.js` L2200-2207).
- **Stripe webhook** — not routed; `constructWebhookEvent` unused.
- **Stripe Connect** — stubs throw "not implemented".
- **Plan crypto-intent** — referenced in `PlansClient`, **no matching `server.js` route** found.
- **Bid escrow checkout** — library only.

#### What's Missing / Must Be Built

- Idempotent webhook handlers updating `plan_payment_intents` / `contract_payment_intents`.
- Feature gating tied to payment status (not just `top_member` flag).
- Billing portal / subscription management.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🔴 CRITICAL | Implement NOWPayments IPN with `verifyNowpaymentsIpnSignature` | M | HIGH |
| 🔴 CRITICAL | Add Stripe webhook → fulfill checkout sessions | M | HIGH |
| 🟠 HIGH | Implement `POST /api/plans/crypto-intent` or remove Plans checkout UI | M | HIGH |
| 🟡 MEDIUM | Stripe Connect or simplify to manual invoicing for directory model | XL | MED |

---

### ONBOARDING & USER FLOWS

**Status:** PARTIAL

**Files audited:** `OnboardingRedirect.tsx`, `WelcomeClient.tsx`, `ProfileEditor.tsx`, `SettingsClient.tsx`, `server.js` onboarding routes, `onboarding_completed_at.sql`

#### What's Done & Working

- `/welcome` flow for username + title (`pendingOnboarding` from auth me).
- `POST /api/onboarding/complete`.
- Profile PUT APIs; avatar upload; username availability check.
- `ProfileSetupBanner` in app shell.
- Settings page with plan display, profile fields, social import.

#### What Exists But Is Broken / Unused

- **Landing `ProfileEditor`** — no UI opens it (`useLandingUI` dead).
- **Email capture** on hero removed; `landing_interest_submissions` API remains.

#### What's Missing / Must Be Built

- Role selection (specialist vs client) if still needed — roles collapsed to `member`.
- Email verification UX.
- Directory onboarding for curated operators (admin tooling).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Wire profile editor entry from nav or remove dead code | S | MED |
| 🟡 MEDIUM | Align onboarding with directory-first positioning | M | MED |

---

### LEADERBOARD & RANKING

**Status:** PARTIAL — gamification-heavy, conflicts with "no gamification" product goal.

**Files audited:** `rating-service.js`, `WoWRankingSystem.tsx`, `StoreClient.tsx`, `server.js` leaderboard routes, `20260403_currency_rating.sql`

#### What's Done & Working

- `GET /api/leaderboard/:type` — rating, honor, conquest, performance, etc.
- Leaderboard page uses `PerformanceLeaderboard` component.
- Deal win/loss updates RP (`processDealWin`).
- Bootstrap includes leaderboard slice.

#### What Exists But Is Broken / Unused

- **Honor / Conquest store** (`/store`) — full gamification economy live in UI.
- **RP tiers** with names like `gladiator`, `undisputed` — gaming lexicon.
- **Activity RP** for messages/bids (`processActivity`) — incentivizes noise.

#### What's Missing / Must Be Built

- If product is trust-first directory: replace RP with **verified milestones**, **years exp**, **completion rate** (already on curated cards).
- Server-side ranking for directory operators separate from game RP.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Hide `/store` and RP mechanics for directory MVP | M | HIGH |
| 🟡 MEDIUM | Expose close rate / delivery metrics on profiles (real data) | L | HIGH |
| 🟢 LOW | Rename tiers to professional language if keeping system | S | MED |

---

### SEO & DISCOVERABILITY

**Status:** PARTIAL — good metadata on key pages; sitemap/robots drift from actual routes.

**Files audited:** `robots.ts`, `sitemap.ts`, `(landing)/page.tsx`, `(member)/[username]/page.tsx`, `next.config.mjs` redirects

#### What's Done & Working

- Root + landing metadata, OG images, JSON-LD on homepage.
- Dynamic sitemap with profiles, services, requests, squads.
- `metadataBase` set to `https://brandforge.gg`.
- Profile URLs at `/{username}` with redirects from `/p/`.

#### What Exists But Is Broken / Unused

- **robots.ts** allows `/marketplace`, `/agents`, `/studio/` — some redirect or don't exist as intended.
- **Sitemap** includes legacy `/p/` URLs at low priority.
- **Metadata on work/offer pages** — should verify per-route (curated work pages exist).

#### What's Missing / Must Be Built

- Canonical tags on duplicate paths.
- Structured data for `Person` / `Service` on operator profiles.
- Cloudflare Bot Fight documentation (external).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Align `robots.ts` + sitemap with actual public routes | S | MED |
| 🟡 MEDIUM | Add JSON-LD for curated profiles and service offers | M | MED |
| 🟡 MEDIUM | Document Cloudflare crawler allowlist (dashboard setting) | S | MED |

**Middleware 403:** Not caused by app code. Check Cloudflare **Security → Bots** and WAF rules.

---

### PERFORMANCE & INFRASTRUCTURE

**Status:** PARTIAL

**Files audited:** `next.config.mjs`, `web/package.json`, `wrangler.jsonc`, `platform-repository.js` (pagination grep implied), image config

#### What's Done & Working

- `images.unoptimized: true` for Cloudflare compatibility.
- Long-cache static assets in production headers.
- `compress: true`, `reactStrictMode`.
- API rate limiting per IP.

#### What Exists But Is Broken / Unused

- **No image optimization** — larger LCP on portfolio imagery.
- **SimpleChat** bundle weight — 1.7k lines client component.
- **In-memory presence** on API — not durable across instances.

#### What's Missing / Must Be Built

- Error monitoring (Sentry).
- Pagination audit on marketplace lists.
- Multi-instance presence (Redis).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Code-split `SimpleChat` / lazy load heavy routes | M | MED |
| 🟡 MEDIUM | Add Sentry or Cloudflare Workers logging | M | MED |
| 🟡 MEDIUM | CDN cache policy for `/public/images/**` | S | MED |

---

### CONVERSION & GROWTH

**Status:** PARTIAL — landing optimized for directory; funnels fragmented.

**Files audited:** `(landing)/page.tsx`, `DirectoryHero.tsx`, `ProfileCTA.tsx`, `GuarantorStrip.tsx`, `landing-interest` route, `PlansClient.tsx`

#### What's Done & Working

- Clear directory-first homepage flow.
- Telegram/mxstermind CTAs on cards and profiles.
- Trust copy blocks (`TrustStandards`, `GuarantorStrip`, FAQ).
- Curated operator cards with work/service deep links.

#### What Exists But Is Broken / Unused

- Removed hero email capture; interest API orphaned.
- **Plans showcase** on landing not rendered.
- **Signup** goes to `/login` — no dedicated conversion landing A/B.

#### What's Missing / Must Be Built

- Single primary CTA metric tracking.
- Operator intake form → admin publish pipeline.
- Pricing page aligned with directory (not marketplace escrow).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | One CTA path: Telegram + optional interest form | S | HIGH |
| 🟡 MEDIUM | Admin workflow to publish operators from seed → DB | M | HIGH |
| 🟢 LOW | Remove dead Plans/OfficialPackages components | S | LOW |

---

### NOTIFICATIONS & COMMS

**Status:** PARTIAL

**Files audited:** `notify-email.js`, `NotificationCenter.tsx`, `supabase/schema.sql` (notifications), migrations

#### What's Done & Working

- `notifications` table (multiple schema variants in migrations).
- `NotificationCenter.tsx` component exists.
- Resend integration stubbed in env.
- Discord bot scripts for deals channel.

#### What Exists But Is Broken / Unused

- Notification schema conflicts across migrations.
- Email templates not found as dedicated files.
- Push notifications — not present.

#### What's Missing / Must Be Built

- Reliable in-app notification delivery + read state.
- Transactional email for bid/message events.
- User notification preferences enforcement.

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟡 MEDIUM | Pick one notifications schema and migrate | M | MED |
| 🟡 MEDIUM | Wire Resend for key events (bid, message) | M | MED |

---

### ADMIN & OPERATIONS

**Status:** NOT STARTED (as a product surface)

**Files audited:** `api-reference.ts`, `BootstrapProvider.tsx`, grep admin in `server.js`

#### What's Done & Working

- `profiles.role` includes `admin`, `moderator`.
- Discord scripts for operational notifications.
- Cron endpoints for honor/RP decay (if configured).

#### What Exists But Is Broken / Unused

- **Admin API** documented, not implemented.
- **`isPlatformAdmin`** never populated.
- No admin UI routes.

#### What's Missing / Must Be Built

- Admin panel: user management, curated operator CRUD, interest submissions review.
- Secure admin guard (email allowlist or role).

#### Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 🟠 HIGH | Minimal admin: curated_operators CRUD + interest list | L | HIGH |
| 🟡 MEDIUM | Implement bootstrap `isPlatformAdmin` + route guards | M | MED |

---

## Phase 3 — Master Action Matrix

| # | Department | Finding | Priority | Effort | Impact | Action |
|---|-----------|---------|----------|--------|--------|--------|
| 1 | Security | Unauthenticated `POST /api/apply-migration` | 🔴 CRITICAL | S | HIGH | Remove or require admin JWT in `server.js` |
| 2 | Payments | NOWPayments IPN is no-op | 🔴 CRITICAL | M | HIGH | Implement signature verify + DB fulfill in `server.js` |
| 3 | Payments | No Stripe webhook | 🔴 CRITICAL | M | HIGH | Add `POST /api/stripe/webhook` using `constructWebhookEvent` |
| 4 | Architecture | Bootstrap API route returns stub on Worker | 🔴 CRITICAL | S | HIGH | Proxy `web/src/app/api/bootstrap/route.ts` to Node |
| 5 | Database | `curated_operators` table may be missing | 🔴 CRITICAL | S | HIGH | Apply migration + seed in Supabase |
| 6 | Auth | `(main)` routes not session-gated | 🔴 CRITICAL | M | HIGH | Use `AuthGuard` or middleware on app shell |
| 7 | Product | Two visions: marketplace vs curated directory | 🟠 HIGH | M | HIGH | Product decision + hide dead marketplace UX |
| 8 | Database | Migration conflicts (notifications, squads) | 🟠 HIGH | L | HIGH | Reconcile migrations; document apply order |
| 9 | Payments | Plans crypto checkout calls missing API | 🟠 HIGH | M | HIGH | Implement `/api/plans/crypto-intent` or disable UI |
| 10 | SEO | robots/sitemap reference stale routes | 🟠 HIGH | S | MED | Update `robots.ts` + `sitemap.ts` |
| 11 | Design | Dual token systems (landing vs app) | 🟠 HIGH | M | MED | Unify `tokens.css` usage |
| 12 | Chat | Dual chat schemas | 🟠 HIGH | L | HIGH | Deprecate legacy or unified |
| 13 | Leaderboard | RP/Honor/Conquest contradicts trust directory | 🟠 HIGH | M | HIGH | Hide store/RP for MVP |
| 14 | Code health | ~30 orphan components | 🟡 MEDIUM | M | MED | Delete or wire landing components |
| 15 | Routing | `/ai/studio` → missing `/studio` | 🟡 MEDIUM | S | MED | Fix redirect target |
| 16 | Profile | `ProfileEditor` never opened | 🟡 MEDIUM | S | MED | Add nav action or remove |
| 17 | Marketplace | `specialist` role checks outdated | 🟡 MEDIUM | S | MED | Update `platform-repository.js` |
| 18 | Observability | No Sentry/analytics | 🟡 MEDIUM | M | MED | Add error tracking |
| 19 | Performance | SimpleChat monolith | 🟡 MEDIUM | M | MED | Code-split chat |
| 20 | Admin | No admin panel | 🟡 MEDIUM | L | HIGH | Build minimal ops UI |
| 21 | Legacy | `production-layer.js` unused | 🟢 LOW | S | LOW | Archive |
| 22 | API docs | `api-reference.ts` ahead of implementation | 🟢 LOW | M | LOW | Mark unimplemented endpoints |

---

## Phase 4 — Executive Summary

### Platform Readiness Score (0–10)

| Department | Score | Note |
|------------|-------|------|
| Architecture & Stack | 6 | Deploy works; split brain between web/API/legacy |
| Authentication & Security | 4 | API auth OK; web routes exposed; migration endpoint critical |
| Database & Data Layer | 5 | Rich schema; migration chaos; RLS gaps |
| Design System & UI | 6 | Strong landing polish; app/landing split |
| Marketplace Core | 5 | Backend exists; product pivoted to directory |
| Chat & Messaging | 5 | Feature-rich but heavy and dual-stack |
| AI & Agents | 5 | LLM works; agent product immature |
| Payments & Monetization | 2 | Not production-safe |
| Onboarding & User Flows | 6 | Welcome flow OK; landing editor dead |
| Leaderboard & Ranking | 4 | Works but wrong product fit |
| SEO & Discoverability | 7 | Solid base; route drift |
| Performance & Infrastructure | 6 | CF deploy OK; monitoring weak |
| Conversion & Growth | 7 | Landing aligned to directory MVP |
| Notifications & Comms | 4 | Partial |
| Admin & Operations | 1 | Effectively absent |

**Overall platform readiness for paying marketplace users: ~4/10**  
**Overall readiness for curated directory + manual matching (current positioning): ~6/10**

### Top 5 Blockers

1. **Payment webhooks not implemented** — money can leave users without platform fulfillment.
2. **`POST /api/apply-migration` unauthenticated** — arbitrary schema mutation risk.
3. **No web session protection on `(main)`** — broken UX and data exposure surface.
4. **Supabase migration state unknown** — `curated_operators`, conflicting social tables.
5. **Bootstrap stub on Worker** — if proxy misconfigured, entire authenticated app breaks.

### Top 5 Quick Wins

1. Remove or auth-gate `/api/apply-migration` (minutes).
2. Fix `web/src/app/api/bootstrap/route.ts` to proxy Node (minutes).
3. Apply `20260518_curated_operators.sql` + seed four operators (hours).
4. Hide `/store`, `/leaderboard` gamification from nav for directory MVP (hours).
5. Delete 10+ unused landing components to reduce confusion (hours).

### What NOT to Build (defer or kill)

- Full Stripe Connect marketplace escrow — defer until directory proves traction.
- Agent swarm orchestration (`src/core/*`) — scaffold only; kill or park.
- Legacy `production-layer.js` SPA — kill.
- Honor/Conquest economy expansion — conflicts with trust-first positioning.
- `/studio` AI studio route — fix redirect or kill until spec exists.
- Documented-but-unimplemented admin API — don't build full surface until minimal CRUD exists.

### Recommended Build Order (next sprints)

1. **Security & stability:** migration endpoint, bootstrap proxy, auth layout, apply curated_operators migration.
2. **Directory MVP hardening:** unified design tokens, operator content from DB, profile/work/offer pages QA, single CTA path.
3. **Payments truth:** NOWPayments IPN + Stripe webhook OR disable all checkout buttons until ready.
4. **De-scope marketplace:** hide bids/requests creation from nav or gate behind feature flag.
5. **Admin minimal:** interest submissions + curated operator editor.
6. **SEO pass:** robots, sitemap, JSON-LD for profiles.
7. **Chat simplification:** auth-gate, deprecate legacy chat schema.
8. **Observability:** Sentry + basic analytics.

---

*End of audit. All findings tied to repository paths read during this session.*
