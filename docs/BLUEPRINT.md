# TheOne / mxstermind — Master blueprint

**Purpose:** One document for the business, product, users, brand, engineering, marketing, and roadmap.  
**Audience:** Founders, design, engineering, marketing, investors, and partners.  
**Status:** Living document — update when strategy, stack, or positioning changes.

---

## Table of contents

1. [Executive summary](#1-executive-summary)  
2. [Business & positioning](#2-business--positioning)  
3. [Users & journeys](#3-users--journeys)  
4. [Product & deal flow](#4-product--deal-flow)  
5. [Brand & design system](#5-brand--design-system)  
6. [Engineering & operations](#6-engineering--operations)  
7. [Marketing & go-to-market](#7-marketing--go-to-market)  
8. [Monetization & financial model](#8-monetization--financial-model)  
9. [Roadmap & phases](#9-roadmap--phases)  
10. [Risks, compliance & decisions](#10-risks-compliance--decisions)  
11. [Glossary](#11-glossary)  
12. [Document control](#12-document-control)

---

## 1. Executive summary

**What we are building:** A **marketplace + deal operating system** for the AI era — where specialists list services, buyers post briefs, and **negotiation, contracts, and (when configured) payments** stay in **one chat thread** so every deal is traceable end-to-end.

**Strategic bet:** Reduce context switching. Discovery, structured offers, counters, contract cards, escrow, and notifications should replace scattered email, ad-hoc invoices, and separate CRM for core deal workflows.

**North-star metric:** *How few steps and how little time from “interested” to “money committed under clear terms”?*

**Public framing (repo):** *The professional OS for the AI era* — one identity, marketplace, and workspace where humans lead and AI accelerates.

**Working names:** The codebase and some UI may use **mxstermind**, **BrandForge**, or **TheOne** during iteration; align customer-facing naming before launch.

---

## 2. Business & positioning

### 2.1 Problem

- Buyers need **clarity, speed, and safe payment** when hiring specialists.  
- Sellers need **qualified leads, minimal admin, and predictable payout**.  
- The platform needs **GMV, take rate, and subscription revenue** without eroding trust.

### 2.2 Solution

A single surface where:

- **Supply:** Published services, profiles, portfolios, trust signals (reviews, activity).  
- **Demand:** Project requests, browsing, matching hints.  
- **Execution:** Deal rooms (chat), structured embeds (bids, offers, counters), projects, contracts, optional crypto/card flows.

### 2.3 Differentiation (target state)

- **Deal thread as source of truth** — terms and events visible in one timeline.  
- **AI-assisted workflows** — labeled suggestions; human confirmation before externalizing AI output to another party.  
- **Honor, Conquest, competitive RP & seasons** — shipped: weekly Honor decay, permanent Conquest, tiered RP, Neon Score leaderboard tabs, privilege store, public profile economy block; cron-gated RP decay when `competitive_mode` is on (see §6).  
- **Squads & retainers** (later) — outcome-based bundles and recurring relationships.

### 2.4 Vision layers (long-term)

Identity & network → Marketplace → AI intelligence → Creation suite → Workspace → Economy (wallet, rewards). Not all layers are fully shipped; see [§9 Roadmap](#9-roadmap--phases).

---

## 3. Users & journeys

### 3.1 Personas

| Persona | Goals | Fears |
|--------|--------|--------|
| **Buyer / client** | Fast clarity, escrow-safe pay, good delivery | Scams, vague scope, slow replies |
| **Specialist / seller** | Fair leads, fast close, clear payout | Admin overhead, disputes, platform fees |
| **Platform operator** | GMV, MRR, retention, trust | Regulatory, chargebacks, concentration risk |

### 3.2 Happy path — “fast deal” (target)

| Step | User action | System |
|------|-------------|--------|
| 1 | Land on home, scan services/requests | Bootstrap, search, stats |
| 2 | Open listing or brief | Detail pages, CTAs to bid or start chat |
| 3 | Negotiate in deal room | Embeds: offer, counter, phases |
| 4 | Accept terms | Project + contract draft, notifications |
| 5 | Sign contract (both) | Contract card + API |
| 6 | Pay (when enabled) | Contract-level checkout, references, confirmations |
| 7 | Deliver & review | Thread + project status, reputation loop |

**Product target:** For simple deals, meaningful commitment (signed contract or payment) within **one session** where possible.

### 3.3 Friction to watch

- **Dual chat systems** (legacy + unified) — consolidate internally; users should see one thread.  
- **Contract editing UX** — prefer inline forms over opaque prompts.  
- **Payment narrative** — one story: pay on contract where possible, not mixed legacy bid invoices.  
- **Mobile** — dense embeds and checkout need real-device QA.  
- **Trust** — KYC, disputes, and enterprise readiness are phased.

---

## 4. Product & deal flow

### 4.1 Runtime architecture

| Layer | Location | Role |
|--------|----------|------|
| **API** | Repo root `server.js` + `src/server/` | HTTP `/api/*`, CORS, webhooks (e.g. Stripe, NOWPayments IPN) |
| **Web** | `web/` (Next.js App Router) | Product UI; typical dev port **3001** |
| **Data** | Supabase (Postgres, Auth, Storage) | Profiles, chats, projects, contracts, marketplace |

**Local dev:** `npm run dev:all` — API **:3000**, web **:3001**. Prefer browser calls to the **web origin**; Next can proxy `/api` to Node in development.

**Core backend:** `createPlatformRepository` in `src/server/platform-repository.js` — marketplace, chats, bids, projects, contracts, notifications, bootstrap, AI hooks, **Honor/Conquest/RP hooks** (non-blocking try/catch on listing, bid, deal-room message, dual contract sign, review, contract cancel, dispute→cancel).  
**Companion services:** `src/server/currency-service.js` (balances, ledger, catalog, `purchase_privilege` RPC), `src/server/rating-service.js` (RP math, leaderboard queries, Undisputed cap helper).  
**Config:** `src/server/env.js` (includes optional `CRON_SECRET` for decay endpoints — set on host, not committed).  
**Marketplace fee math:** `marketplace-fees.js` — platform fee **15%** (`PLATFORM_FEE_BPS = 1500`); disclose at pay time in production.

### 4.2 Main routes (web)

| Area | Routes | Notes |
|------|--------|--------|
| Home + marketplace | `/` | Hub: stats, services, members, requests |
| Chat / deal rooms | `/chat`, `/chat/[id]` | Human threads; embeds |
| Services | `/services`, `/services/new`, `/services/[id]` | Listings; inquiry → thread |
| Requests | `/requests`, `/requests/new`, `/requests/[id]` | Briefs; bids; accept flows |
| Plans | `/plans` | Tiers (Free, Starter, Architect, Scale) |
| Profiles | `/p/[username]` | Public profile: services, open requests, recent contracts (no amounts), reviews, Honor/Conquest/Neon, RP/tier block |
| Leaderboard | `/leaderboard` | Season 1 copy, Neon/Honor/Conquest/Streak tabs; live data from `/api/leaderboard/*` |
| Store | `/store` | Privilege catalog; purchase with Honor/Conquest (`POST /api/privileges/purchase`) |
| AI / studio | `/ai/*`, `/studio` | Adjacent workflows |
| Settings | `/settings` | Account, billing, discovery |
| Marketing | `/marketing` | Distribution hub |

### 4.3 Deal flows (concepts)

**Service package path**

1. Buyer sends **service offer** (`service_bid` embed).  
2. Seller **accepts** or **counter-offer** (`deal_counter_offer`).  
3. On accept: **project**, **draft contract**, **deal_win** phase, notifications.

**Request / bid path**

1. Specialist submits **bid**; **bid_proposal** embed in thread.  
2. Client **accepts** via API.  
3. Direction: **contract-first** payment vs legacy bid-level invoices — align UX copy with implemented path.

**Contracts & payment**

- `project_contracts` drives **`contract_card`** embeds (draft → sent → signed → awaiting_funds / funds_held, etc.).  
- **NOWPayments** / **Stripe** (when configured) for subscriptions and contract escrow.  
- IPN for crypto must hit the **Node** API (`/api/nowpayments/ipn`), not only Next.

### 4.4 Data model (high level)

| Concept | Examples | Deal relevance |
|---------|----------|----------------|
| Identity | `profiles`, `user_settings` | Roles, billing, activity |
| Listings | `service_packages`, `project_requests` | Supply & demand |
| Matching | `bids`, legacy conversations | Request deals |
| Messaging | `messages`, `unified_chats`, `unified_messages` | Single-thread story |
| Delivery | `projects`, milestones | Post-accept |
| Trust | `project_reviews` | Credibility |
| Payments | intents, Stripe metadata | Revenue |
| Contracts | `project_contracts` | Terms + gating |
| **Economy (shipped)** | `user_currencies`, `currency_ledger` | Honor & Conquest balances + immutable ledger |
| **Competitive** | `user_ratings`, `rating_history` | RP, tier, streaks, weekly deal counters; RP decay audit |
| **Store** | `privilege_catalog`, `user_privileges` | Purchasable perks (RPC `purchase_privilege`) |
| **Seasons** | `seasons` | Season 1 row: dates, prize pool JSON, `tier_floors`, `competitive_mode`, `rp_decay_rate` |

**Migration:** `supabase/migrations/20260403_currency_rating.sql` — tables, RLS (public read where defined), RPCs (`increment_currency`, `apply_honor_decay`, `apply_rp_decay`, `update_user_tier`, `calculate_tier`, `tier_floor_rp`, `purchase_privilege`), seed catalog + Season 1, backfill `user_currencies` / `user_ratings` from existing profiles (RP seed uses completed `projects` count × 25; no dependency on optional `profiles` columns).

Full baseline DDL: `supabase/schema.sql` + all migrations.

### 4.5 External dependencies

| System | Use |
|--------|-----|
| **Supabase** | Auth, DB, storage (`avatars`, `service-covers`, `chat-files`, …) |
| **Stripe** | Card checkout patterns, webhooks |
| **NOWPayments** | Hosted crypto invoices, IPN |
| **Resend** | Transactional email |
| **AI providers** | Agent, research, image (env-specific) |

---

## 5. Brand & design system

### 5.1 Naming & voice

- **Customer-facing app title (Next metadata):** **BrandForge** (`web/src/app/layout.tsx`).  
- **Repo / API legacy strings:** `mxstermind`, `TheOne` still appear in package names, `server.js` banners, or paths — align before external launch.  
- **Rename checklist:** Search `mxstermind`, `BrandForge`, `TheOne`; update metadata, legal copy, and visible wordmarks in one change set.

### 5.2 Typography (Next app)

Loaded in `web/src/app/layout.tsx` (Google Fonts) with CSS variables:

| Role | Font | Tailwind / variable |
|------|------|---------------------|
| Headline / display | **Inter Tight** (400–900) | `font-headline`, `--font-headline` |
| Body | **Inter** (300–800) | `font-body`, `--font-body` (Geist is not in `next/font/google`; Inter is the documented substitute) |
| Mono | JetBrains Mono | `--font-mono` |

**Icons:** Material Symbols Outlined — class `.material-symbols-outlined` in `globals.css`.

### 5.3 Color system (canonical)

**Single dark theme.** Semantic tokens on `html` in `web/src/app/globals.css`; mapped in `web/tailwind.config.ts`.

**Surfaces:** Near-black greys — e.g. `--color-background` `#0a0a0b`, stepped containers through `--color-surface-container-low` … `--color-surface-container-highest`.

**Brand:** **Electric blue** primary (`--color-primary` `#4f8ef7`); **secondary** slate-blue (`--color-secondary` `#7b9fd4`, Honor-adjacent in product copy); **primary-container** deep blue (`#1a4db8`, Conquest-adjacent). Severity: `--color-critical`, `--color-medium`, `--color-low`, etc.

**Competitive tiers (leaderboard / profile rings & badges):** `--tier-challenger` … `--tier-undisputed`; rank accents `--rank-gold` / silver / bronze; Undisputed row/pill uses `bf-undisputed-row` / `bf-undisputed-pill` animations in `globals.css`.

**Rule:** Prefer CSS variables or Tailwind tokens mapped to them — avoid raw hex in new TSX.

**Light mode:** Not implemented.

**Economy UI semantics (product):**

- **Honor** — activity currency (weekly decay via cron + RPC).  
- **Conquest** — deal/review currency (permanent for the season).  
- **Neon Score** — `Honor + (Conquest × 10)` for leaderboard “Season rating” sort.  
- **RP (rating points)** — drives **tier** title (Challenger → Undisputed); weekly RP decay only when active season has `competitive_mode = true`.

### 5.4 Layout & components

- **Radius:** See `tailwind.config.ts` (`rounded-xl` on cards via `.surface-card` in `globals.css`).  
- **Logo:** `web/src/app/icon.svg` — verify accent matches current primary token if rebranding.  
- **Standalone `404.html` (repo root):** May use a **different** palette — align on rebrand or document as intentional static exception.

### 5.5 Accessibility & refresh discipline

- Verify **on-primary** contrast for CTAs.  
- Form focus/caret tied to primary — changing hue affects perceived focus.  
- When rebranding: update `globals.css` variables first, then Tailwind if needed, then `icon.svg`, `404.html`, legal/meta last.

---

## 6. Engineering & operations

### 6.1 Auth & security

- **Client:** Supabase Auth; `Authorization: Bearer <access_token>` on API calls.  
- **Server:** Validates JWT; `platform-repository.js` enforces ownership. Service role bypasses RLS — **never** skip app-level checks in new code.  
- **Rules:** Rate limits on sensitive routes; CORS locked in production; validate JSON bodies; sniff upload content-types; no service role or secrets in client bundle; verify webhooks; minimize PII in logs.

### 6.2 API surface (pattern)

Implemented routes live in `server.js` and call `platform-repository` (and service-layer helpers it exposes). Examples:

- `GET /api/bootstrap` — main payload (services, requests, chats, profile, **leaderboard rows merged with `user_ratings` / `user_currencies` when present**, marketplace stats, …).  
- Marketplace: services, requests, bids, accept/reject.  
- Chat: `GET /api/chat/:id`, `POST /api/chat/files` (legacy), `POST /api/chat/:id/files` (unified), `POST /api/chats/:id/*` (unified aliases).  
- Projects, notifications, AI (`/api/ai/chat`, `/api/ai/image`, …), research, portfolios, settings.  
- **Economy & ladder (Node API):**  
  - `GET /api/leaderboard/:type` — `type` = `rating` | `honor` | `conquest` | `streak`; includes active `season` metadata in JSON.  
  - `GET /api/season/current`  
  - `GET /api/privileges/catalog`  
  - `POST /api/privileges/purchase` (auth) — body `{ privilegeSlug }`  
  - `GET /api/users/:id/currency` — balances + Neon Score  
  - `GET /api/users/:id/rating`  
  - `GET /api/users/:id/ledger` — query `currency`, `limit`, `offset`  
  - `GET /api/users/:id/privileges`  
  - `POST /api/cron/decay-honor` | `POST /api/cron/decay-rp` — require `CRON_SECRET` (Bearer or JSON `secret` / `CRON_SECRET`); schedule weekly (e.g. Monday UTC) on the **same host as `server.js`** (Next-only hosts need an external job hitting the API URL).

**AI env:** Configure provider keys per `env.js` / README; `GET /api/ai/status` for non-secret capability flags.

### 6.3 Storage buckets (in use)

| Bucket | Use |
|--------|-----|
| `avatars` | Profile photos |
| `service-covers` | Listing covers |
| `chat-files` | Chat attachments (unified + legacy) |

Create as **public** in Supabase if uploads fail.

### 6.4 Realtime

Notifications and chat can use Supabase Realtime subscriptions (see client patterns). Ensure `unified_messages` (and others) are in the Realtime publication where needed.

### 6.5 Commands (typical)

| Command | Purpose |
|---------|---------|
| `npm run dev:all` | API + web for full-stack dev |
| `npm run dev` / `npm start` | Per package README |

Schema changes: apply migrations under `supabase/migrations/` (notably `20260403_currency_rating.sql` for economy tables + RPCs).

### 6.6 Honor, Conquest, competitive RP (shipped)

**Currencies (Postgres + RPC `increment_currency`):**

- **Honor** — earned: listing published (+50), bid placed (+25), deal-room user message (+10, thread must have a `project_contracts` row for that `unified_chat_id` or chat metadata `deal` / `dealRoom`). Weekly **decay** ~5% via `apply_honor_decay` (ISO-week idempotent per user).  
- **Conquest** — earned: both parties sign contract (+250 each), review received by reviewee (+100). No weekly decay.

**Rating (RP) — `user_ratings` + `update_user_tier` / `calculate_tier`:**

- Increments on activity (bid/listing/message caps) and **deal win** formula on dual signature (streak multiplier, etc.) — see `src/server/rating-service.js`.  
- **Losses:** contract cancelled by user (`deal_cancelled`), dispute flow → project `cancelled` from `disputed` (`dispute_lost` both parties).  
- **Undisputed cap:** approximate top 1% of users with `last_deal_at` in last 30 days — enforced in JS after tier refresh.  
- **RP weekly decay:** `apply_rp_decay` only when active `seasons.competitive_mode = true` (off until you flip it, e.g. competitive start date).

**Neon Score:** `Honor + Conquest × 10` — used for default leaderboard ordering and profile “season” card.

**Privilege store:** Rows in `privilege_catalog`; purchases via `purchase_privilege` RPC (atomic ledger + `user_privileges`). UI: `/store`.

**Legacy note:** Older docs referred to “mx Score” as a single composite; the live system splits **Honor / Conquest / RP** as above. Any legacy `mx_score` or `season_rating` columns on `profiles`, if present, are **read-only / not written** by this stack.

### 6.7 Feature flags

Ship risky features behind flags (DB `feature_flags` or admin toggles): AI surfaces, squads, retainers, wallet, feed, etc.

### 6.8 Coding standards (summary)

- Mobile-first new UI; semantic CSS variables, not raw hex in components.  
- Label AI output; human confirm before sending to counterparty.  
- Empty, loading, and error states on major surfaces.  
- Optimistic UI where safe; server validates all mutations.

---

## 7. Marketing & go-to-market

### 7.1 Ideal customer profile (ICP)

Early focus examples: **AI implementation freelancers**, **creative ops**, **niche B2B services** — segments that close deals in chat and care about speed and clarity.

### 7.2 Channels

- Founder-led outbound and community (Discord, Reddit, niche Slacks).  
- Partner agencies and **“how we run deals in one thread”** content.  
- Product-led: free tier completes real deals (viral loop) with clear upgrade limits.

### 7.3 Messaging pillars

- **One thread from interest to paid terms.**  
- **Structured deals** — not lost in email.  
- **AI assists; humans decide** — trust-safe positioning.

### 7.4 Launch & growth phases (summary)

- **Phase 0:** Instrumentation, single payment narrative in copy, staging with sandboxes.  
- **Phase 1:** Smooth accept → contract → sign → pay; mobile pass; notifications on money events.  
- **Phase 2:** ICP outreach, promotions (e.g. Architect discount or fee waiver on first GMV band).  
- **Phase 3:** Self-serve checklist, trust badges, Scale sales assist, retention on abandoned negotiates.

### 7.5 Near-term content & assets

- Case studies: time-to-contract before/after.  
- Clear comparison: “marketplace + deal OS” vs generic chat or generic freelance boards.  
- Legal pages: terms, privacy, policies — required before broad public launch.

---

## 8. Monetization & financial model

### 8.1 Revenue lines

1. **Subscriptions** — Starter / Architect / Scale (amounts mirrored server + UI, e.g. ~$29 / $79 / $199 monthly with yearly options).  
2. **Marketplace take rate** — **15%** of escrowed deal value (see `marketplace-fees.js`); cash timing follows deal closure, not classic MRR.  
3. **Future:** boosts, verified tiers, API, enterprise SOW — optional.

### 8.2 Path to ~$10k monthly revenue (planning)

- **SaaS-only:** ~120–180 paying accounts at blended ~$50–79 ARPU.  
- **Blended:** e.g. **~$50k GMV/month at ~$7.5k (15% take)** plus **~$2.5k** subscriptions — define internally whether “$10k” means strict **MRR** or **MRR + marketplace margin**.

### 8.3 Pricing philosophy

- **Free** must complete real deals with limits that justify upgrade.  
- **Starter** — solo distribution.  
- **Architect** — daily deal volume + AI.  
- **Scale** — teams, compliance, escrow posture — anchors enterprise conversations.

### 8.4 Long-range monetization (vision)

Commission on projects, retainers, Pro plans, enterprise API licensing, optional placement — see roadmap for $10B-style scenario math (illustrative only until validated).

---

## 9. Roadmap & phases

### 9.1 Shipped / partial (this repo — high level)

Auth, profiles, settings, marketplace gate for specialists, services & requests, bids accept/decline, unified + legacy chat, file uploads, typing, projects & milestones, reviews & eligibility, notifications + email, marketplace stats, **leaderboard page (Season 1, four tabs, live API)**, **Honor / Conquest / RP / tiers / ledger / privilege store (full stack)**, **public profile** with inline services, open requests, contract list (no amounts), economy + reviews, agent/research/image baselines, bootstrap-driven home, **Store** nav entry.

**Gaps for “one complete transaction”:** hardened escrow/payout automation, admin disputes, some notification event types, optional materialized stats, streaming AI UX, full wallet, **privilege entitlements not yet enforced** across listing limits / fees / homepage placement (catalog + purchase are live; product rules TBD).

### 9.2 Near-term execution queue

1. **Payments** — Stripe / escrow skeleton aligned with contract-first story.  
2. **Notifications** — emit or remove copy for events not yet wired.  
3. **Reviews** — optional scheduled nudges / stale handling.  
4. **Stats** — materialized counters vs polling-only.

### 9.3 Phased product roadmap (condensed)

| Phase | Theme | Examples |
|-------|--------|----------|
| **1** | Core loop | Project room polish, reviews, notifications, profile completion, real stats |
| **2** | AI layer | Agent polish, matching, brief builder, research, image — streaming & metering |
| **3** | Network & economy | Feed/follow; **economy v1 shipped** (Honor/Conquest/RP/store/cron hooks); wallet display & on-chain events; enforce purchased privileges in product rules |
| **4** | Squads & retainers | Outcome squads, monthly retainers, elite tier |
| **5** | Workspace & mobile | Docs, boards, PWA / native |
| **6** | Enterprise & API | Intelligence API, compliance, annual deals |

### 9.4 Release gates (checklist culture)

- **Internal beta:** E2E project path, RLS review, rate limits, CORS, no client secrets, error boundaries,404/500.  
- **Public beta:** Onboarding, email notifications, terms/privacy, account deletion, file validation, admin basics.  
- **Growth:** Wallet/payouts, **privilege effects** wired to product limits, feed, squads MVP, tests, load testing.

---

## 10. Risks, compliance & decisions

| Area | Notes |
|------|--------|
| **Regulatory** | Escrow + crypto + marketplace — jurisdiction-specific; counsel before scale. |
| **Chargebacks / disputes** | Thread + contract as evidence; clear SLAs. |
| **Concentration** | Few power sellers; balance discovery & seasons. |
| **Technical debt** | Dual chat transports — migrate consciously. |
| **Vendors** | Stripe / NOWPayments outages — status UX and retries. |

**Leadership decisions:** primary geography & payment methods; first vertical; definition of revenue targets; free-tier limits.

---

## 11. Glossary

| Term | Meaning |
|------|--------|
| **Deal room** | Human chat thread with listing context |
| **Embed** | Structured `metadata.embed` rendered as a card |
| **Legacy chat** | `conversations` / `messages` |
| **Unified chat** | `unified_chats` / `unified_messages` |
| **GMV** | Gross merchandise value through the platform |
| **MRR** | Monthly recurring revenue (subscriptions) |
| **Honor** | Weekly activity currency (decay Mondays via cron); spent in Store |
| **Conquest** | Permanent season currency from deals & reviews; spent in Store |
| **Neon Score** | `Honor + (Conquest × 10)`; default “Season rating” ladder sort |
| **RP** | Competitive rating points; tier titles Challenger → Undisputed; decay when season `competitive_mode` |
| **mx Score** | Legacy umbrella term in some copy; live system uses Honor + Conquest + RP (see §6.6) |

---

## 12. Document control

- **Replaces:** `MASTERMIND_BLUEPRINT.md`, `BRAND_GUIDE.md`, `DEVELOPMENT.md`, `ROADMAP.md` (removed as separate files).  
- **Owner:** Founder + product; engineering validates technical sections each release; design owns §5 when tokens change.  
- **Cadence:** Update after phase reviews, rebrands, or material pivots.  
- **Recent:** Economy + competitive ladder + Store + profile overhaul documented (Honor/Conquest/RP, `20260403_currency_rating.sql`, Node API routes in §6.2).

---

*This blueprint is a planning artifact. Execution requires legal review for payments, terms alignment, and measured funnel data.*
