# Roadmap — mxstermind $10B Path

## Vision

> The professional OS for the AI era. Your identity, your work, your intelligence, your income — all in one place.

mxstermind is not a marketplace. It is the operating system where professionals live. Every layer compounds the others. The mx Score is the moat. The network is the lock-in. The AI suite is the unfair advantage.

---

## Platform Layers (All 6 must ship to win)

```
Layer 1 — Identity & Network    LinkedIn replacement
Layer 2 — Marketplace           Upwork + Toptal replacement
Layer 3 — AI Intelligence       Claude + Perplexity replacement
Layer 4 — AI Creation Suite     Midjourney + Runway replacement
Layer 5 — Workspace             Notion + Slack replacement
Layer 6 — Economy               Wallet, USDT earnings, season rewards
```

---

## What Works Today

- Supabase Auth (client) — signup, signin, session; server validates JWT on `/api/*`
- Profile and `user_settings` persistence; public profile API with reviews and ratings
- Specialist marketplace gate: bio, skills, avatar, ≥1 published portfolio, availability
- Services and project requests (create / update / delete for owners); listing filters
- Bids: submit, owner review modal, **accept** → project + conversation + `bid_outcome` notification; **decline** → `rejected` bid + `bid_outcome` notification
- Unified chat (service & request context), legacy project chat, **chat file uploads** (`chat-files` bucket), typing + leave
- Project workspace: milestone board columns, role-gated status transitions, deliverables, notifications on key events
- Post-project **reviews** (eligibility + mutual review flow), rolling average + **Top Rated** hint at 4.8+ with 3+ completions
- **Marketplace stats** — `GET /api/marketplace-stats` (listed services, bids, sellers, budget signals); client refresh on nav + interval
- **Notifications** — in-app (Realtime when published) + **Resend** email on insert (respects email toggle); mark read / mark all read; bell badge
- **Service cover** and **profile avatar** via JSON `dataUrl` uploads (Storage: `service-covers`, `avatars`)
- Hash deep links: `#service=`, `#request=`, `#project=`, profile views
- Leaderboard from real `profiles` data; agent runs + research stubs persisted

### Phase 1 delivery checklist (this repo)

| Area | Status | Notes |
|------|--------|--------|
| **1.1** UI / polish | **Mostly done** | Real stats; service cover upload; Docs nav removed; guided empty states; single sign-out in shell |
| **1.2** Project room | **Partial** | Milestones, chat files, status actions, notifications; **no** real escrow/payout queue |
| **1.3** Reviews | **Partial** | Enforced text + stars; public surface; Top Rated; **no** 7-day auto-close job |
| **1.4** Marketplace stats | **Partial** | Accurate aggregates; updates on **polling** / navigation, not per-event materialized counters |
| **1.5** Notifications | **Partial** | Core types wired (bid, message, project, review); **leaderboard_shift** / **reward** types exist — limited server-generated events |
| **1.6** Profile completion | **Mostly done** | Avatar, bio, skills, portfolio, availability, completion meter, marketplace hide |

**Still open for “one complete transaction” (Phase 1 goal):** payments / escrow (Stripe), automated payouts, admin dispute resolution tools, optional notification event hardening.

**Repo / ops:** Use **`.env`** locally for real keys; keep **`.env.example`** placeholder-only (never commit secrets). `GET /api/ai/status` exposes only whether LLMs are configured + provider id.

### Next execution queue (suggested order)

1. **Stripe** — deposit / escrow skeleton + fee line at bid accept (Phase 1 close-the-loop).
2. **Notifications** — emit `leaderboard_shift` / `reward` from real events (or remove from product copy until wired).
3. **Reviews** — scheduled job or bootstrap sweep for “stale” prompts (optional; expiry already blocks late submits).
4. **Stats** — optional materialized counters vs polling-only (1.4 hardening).

---

## Phase 1 — Core Loop (Ship First, Everything Else Blocked)

**Goal: One complete transaction. Request → bid → project → delivery → review → payment.**
**Target: $50K GMV, 10 five-star outcomes.**

### 1.1 Fix Broken UI (Day 1)
- Replace all `—` marketplace stats with real DB counts
- Remove duplicate "Sign Out" buttons
- Remove "mxAI (later)" label — ship or hide
- Replace palette emoji on service cards with real image upload
- Remove "Docs" from sidebar (not ready)
- Empty states on bio/skills/portfolio — show guided prompts not blank space

### 1.2 Project Room (Week 1)
- Auto-created on bid acceptance
- Participants: client + specialist only (enforced server-side)
- Components:
  - Real-time chat (Supabase Realtime)
  - Milestone board: To Do / In Progress / Review / Done
  - File attachments in chat (Supabase Storage)
  - "Mark Delivered" (specialist) → notifies client
  - "Approve Delivery" (client) → triggers review + queues payout
  - "Request Revision" (client) → resets to In Progress
  - "Open Dispute" (both) → flags for admin
- Project status bar: active / in review / completed / disputed

### 1.3 Reviews (Week 1)
- Triggered only on project approval
- Both sides must review each other
- Fields: 1–5 stars + text (min 20 chars enforced)
- Review visible on public profile immediately
- Rating = rolling average, 1 decimal display
- Top Rated badge: auto-awarded at 4.8+ with 3+ completed jobs
- No review in 7 days = auto-close, no score impact

### 1.4 Marketplace Stats (Week 1)
- Wire real counts: listed services, total bids, avg price, unique sellers
- Update on every transaction event (not just on page load)

### 1.5 Notifications (Week 1–2)
Real-time via Supabase Realtime + email via Resend:
- New bid on your request
- Bid accepted / rejected
- New message in any thread
- Project status changed
- Review received
- Leaderboard position changed
- Reward earned

Notification center:
- Mark read / mark all read
- Click → navigates to relevant page
- Badge count on bell icon

### 1.6 Profile Completion (Week 2)
Every profile needs:
- Avatar upload (Supabase Storage)
- Bio (min 100 chars for specialists, enforced)
- Skills (tag input, max 15)
- Portfolio items (image + title + description + link)
- Availability toggle: available / busy / not taking work
- Profile completion meter — incomplete specialist profiles hidden from marketplace

---

## Phase 2 — AI Layer (Week 3–4)

**Rule: AI assists humans. Every AI output is labeled and requires human confirmation before it reaches another user.**

### 2.1 mx Agent — Basic (Week 3)
**Shipped (this repo):** `POST /api/ai/chat` — **Anthropic**, **OpenAI**, **Groq**, **OpenRouter**, **Mistral**, **Together**, **xAI**, or **Gemini** via named `.env` keys + `AI_PROVIDER` (or legacy `AI_API_KEY`). Home hero + task modes; **Copy** / **Draft request**; optional milestone draft on agent tasks. Usage: `user_settings.ai_settings.mxAgentChatTotal`.

**Still out:** streaming (SSE); dedicated sidebar AI thread UX (list items remain stub); billing tiers.

### 2.2 Smart Matching (Week 3)
**Shipped:** `GET /api/requests/:id/matches` (owner-only) — top 3 specialists from skills, listing categories, text overlap, ratings, and completed job count. Shown on **request detail** for the poster with **View profile**. Not ML — interpretable heuristics only.

**Still out:** match score explanations from an LLM; surfacing at post time before save.

### 2.3 Brief Builder (Week 4)
**Partial:** Home mx Agent mode **Structured request brief** + **Draft request from this** into the post-request modal.

**Still out:** dedicated brief-builder stepper; auto skills/tags from AI

### 2.4 Deep Research (Week 4)
**Shipped (baseline):** `POST /api/research` creates a `research_runs` row; with **LLM keys** configured, mx Agent fills **`results.body`** and persists **`completed`**. UI shows memo + disclaimers; counts toward **`mxAgentChatTotal`**.

**Still out:** live web citations (Perplexity / browse); **mx Docs** save; one-click share into project room; Pro gating.

### 2.5 mx Image Generation (Week 4)
**Shipped (baseline):** `POST /api/ai/image` — **DALL·E 3** via `AI_IMAGE_KEY` or `OPENAI_API_KEY` / OpenAI-style legacy key. **mx Agent** page: **Generate image**. Ephemeral URL (not yet in **`mx-images`**).

**Still out:** Replicate / fal.ai; watermark + username; durable Storage; wallet metering.

---

## Phase 3 — Network & Economy (Week 5–6)

### 3.1 Feed + Follow System
- Follow specialists and clients
- Feed: projects completed in your network, insights shared, squad wins, leaderboard moves
- Follow-based discovery — better than search for trust signals
- Feed events written on: project completion, badge award, service listing, review posted

### 3.2 mx Score (Wire Up Fully)
```
mx_score = (jobs_completed × 10) + (avg_rating × 20) +
           (bid_win_rate × 5) + (on_time_rate × 15) +
           (network_invites × 3) + (endorsements × 2)
```
- Computed nightly via cron
- Displayed on profile, leaderboard, search results
- Tier badges on profile card
- Score history chart on profile (last 12 months)

### 3.3 Leaderboard (Real Data)
- Season credits tied to actual completed work
- Title ladder enforced at score thresholds
- USDT reward pool shown on leaderboard page (start at $0, display the mechanic)
- Filter by: track, season, time window
- Animated rank changes when score updates

### 3.4 mx Wallet
- Balance shown in header
- Credits earned on project approval (after platform fee)
- Platform fee: 15% on all marketplace transactions
- Fee shown transparently at bid stage before acceptance
- Withdrawal: bank or crypto (USDT) — Phase 3 beta, full in Phase 4
- Wallet events log: every credit and debit with reason

### 3.5 Invite & Network Effects
- Unique invite link per user
- Track: who was invited, jobs created from their network
- Season credits awarded for network contribution
- Invite page shows your network stats

---

## Phase 4 — Squads & Retainers (Week 7–8)

### 4.1 Outcome Squads
The core differentiator. No other platform offers this.

A Squad = 1 verified human expert + 1 mx Agent + 1 defined deliverable + price guarantee.

- Squad Builder: client describes goal → AI suggests composition → human reviews → client approves
- Squad profiles: visible in marketplace as distinct product from individual services
- Squad pricing: fixed price, not hourly
- Squad track record: separate rating from individual profile

Example Squad types:
- Brand Identity Squad ($3,500 fixed / 5 days)
- Growth Strategy Squad ($2,500 fixed / 7 days)
- MVP Spec Squad ($4,000 fixed / 10 days)

### 4.2 Retainers
- Monthly subscription: client retains a specialist or squad
- Automated monthly billing via Stripe
- Retainer dashboard: monthly deliverables, usage, renewal
- Retainer pricing: negotiated in chat, locked on acceptance
- Cancel anytime, prorated refund
- Retainer GMV counts toward leaderboard credits

### 4.3 Elite Tier (Toptal Equivalent)
- Application required to list services
- Portfolio review + test project + mx Score baseline
- Acceptance rate target: under 10%
- Elite badge on profile and service cards
- Priority placement in search results
- Higher take-home rate: 90% vs 85% standard

---

## Phase 5 — Workspace & Mobile (Month 3)

### 5.1 mx Docs
- Collaborative documents per project or standalone
- AI-assisted: summarize, expand, rewrite
- Export to PDF or share link
- Version history

### 5.2 mx Boards
- Kanban for project management (inside project room)
- Drag-and-drop milestones
- Due dates, assignees, priority flags

### 5.3 Mobile App (iOS + Android)
- React Native or PWA
- Core flows only: chat, notifications, project status, wallet
- Push notifications
- Camera → portfolio upload

### 5.4 mx Video + Voice (Later)
- Short-form video generation for client deliverables
- Voiceovers and podcast production
- Both human-directed, AI-executed

---

## Phase 6 — Enterprise & API (Month 6)

### 6.1 mx Intelligence API
- License the matching engine to enterprises
- Enterprises build internal talent marketplaces on mxstermind rails
- Target: 10 enterprise clients at $500K/year = $5M ARR

### 6.2 Pro Plan (Define Clearly)
Current "Upgrade" button needs real value behind it.

Pro ($99/month):
- Unlimited mx Agent chat threads (free tier: 20/month)
- Access to Deep Research
- Priority search placement
- Analytics dashboard (views, click-through, conversion)
- Custom Squad builder
- Early access to new AI tools

### 6.3 mx Token (Long Term)
- Platform governance
- Premium feature access
- Staking for higher leaderboard reward share
- Not before $10M GMV — don't distract with crypto before product works

---

## Monetization Summary

| Stream | Model | $10B Path |
|--------|-------|-----------|
| Project commission | 15% of GMV | 670K projects/year at $10K avg |
| Retainer subscriptions | $2,500/month | 33K retainers = $1B ARR |
| Pro plan | $99/month | 840K Pro users = $1B ARR |
| mx Intelligence API | $500K/year enterprise | 2,000 enterprises = $1B ARR |
| AI credit usage | Per-use billing | Bundled margin |
| Elite placement | Auction-based | Platform take on featured slots |

---

## Pages to Build (Not Yet Existing)

| Route | Description |
|-------|-------------|
| `/onboarding` | Role selection + profile basics + first action |
| `#project=<id>` | Full project room (already linked, needs build) |
| `#request=<id>` | Single request + all bids |
| `#service/create` | Create service form with image upload |
| `#request/create` | Create request form with AI brief builder |
| `#profile/edit` | Full profile editor (avatar, bio, skills, portfolio) |
| `#notifications` | Full notification center |
| `#wallet` | Balance, transactions, withdraw |
| `#workspace` | mx Docs + Boards |
| `#feed` | Activity feed |
| `#squads` | Squad marketplace |
| `#admin` | Admin dashboard |
| `/terms` | Legal — required before launch |
| `/privacy` | Legal — required before launch |

---

## Release Gates (Nothing Ships Without These)

### Gate 1 — Internal Beta
- [ ] Project room functional end-to-end
- [ ] Reviews wired to real data
- [ ] Notifications real-time
- [ ] Marketplace stats showing real counts
- [ ] RLS audit complete
- [ ] Rate limiting on sensitive routes
- [ ] CORS locked to known origins
- [ ] No secrets in client bundle
- [ ] Error boundaries on all major components
- [ ] 404 and 500 pages exist

### Gate 2 — Public Beta (First 1,000 Users)
- [ ] Onboarding flow complete
- [ ] mx Agent basic (chat + brief builder)
- [ ] Image upload on services and profiles
- [ ] Profile completion meter
- [ ] Email notifications live (Resend)
- [ ] Terms and Privacy pages
- [ ] Account deletion flow
- [ ] File uploads: content-type validated
- [ ] Admin panel: user management + dispute queue

### Gate 3 — Growth (10,000 Users)
- [ ] Wallet and payouts (Stripe)
- [ ] mx Score fully computed and displayed
- [ ] Leaderboard tied to real season credits
- [ ] Squads MVP
- [ ] Feed + follow system
- [ ] Deep Research functional
- [ ] mx Image generation live
- [ ] Mobile PWA
- [ ] Automated tests: auth, bootstrap, bid accept, project status, payout
- [ ] Load tested to 10K concurrent users

---

## Build Order for Coding Agent

```
Week 1:
  Day 1–2:  Fix broken UI + marketplace stats
  Day 3–4:  Project room (chat + milestones + file upload)
  Day 5–6:  Reviews + notifications (real-time + email)
  Day 7:    Profile completion + image upload

Week 2:
  Day 1–2:  Search + filters (services, profiles, requests)
  Day 3–4:  Leaderboard real data + mx Score cron
  Day 5–6:  Onboarding flow
  Day 7:    Admin panel (stats + user management)

Week 3:
  Day 1–2:  mx Agent (Claude API + streaming)
  Day 3–4:  Brief builder + smart matching
  Day 5–6:  mx Wallet (balance display + transaction log)
  Day 7:    Deep Research shell

Week 4:
  Day 1–2:  mx Image generation
  Day 3–4:  Squads MVP
  Day 5–6:  Retainers + billing (Stripe)
  Day 7:    Security audit + rate limiting pass

Week 5:
  Day 1–2:  Feed + follow system
  Day 3–4:  Elite tier vetting pipeline
  Day 5–6:  Mobile PWA
  Day 7:    Load test + fix
```

---

## Coding Agent Standing Rules

```
1.  Mobile-first on all new components
2.  Dark theme CSS variables only — never hardcode colors
3.  Every AI output labeled "AI suggestion" — human confirms before sending
4.  Empty states: helpful copy, never dashes or blank space
5.  Optimistic UI on all message sends and status updates
6.  All chat is real-time via Supabase Realtime
7.  All AI calls async with loading skeletons — never block UI
8.  Every new page: title, breadcrumb, empty state, error state, loading state
9.  Marketplace stats update on every transaction event
10. Every feature ships behind a feature flag
11. File uploads: validate content-type server-side, not just extension
12. Rate limit all mutating endpoints before marking any feature done
13. Never log PII
14. Audit log every payment, dispute, and admin action
15. No feature is done until it has an empty state and an error state
```