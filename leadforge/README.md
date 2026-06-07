# LeadForge

AI-enriched B2B + B2C lead generation SaaS. Users describe their ideal customer, pick source platforms, spend credits, and receive scored leads with contact info, fit analysis, and pitch angles — exportable as CSV.

**Production:** https://leadforge-gilt.vercel.app  
**Stack:** Next.js 15 · Supabase Auth + Postgres · Vercel · Gemini · Serper · Stripe · Resend

---

## What We Built

LeadForge is a full-stack SaaS app developed as a sibling product inside the BrandForge monorepo. It covers the complete loop from sign-up to lead delivery.

### Authentication
- Email/password registration and login via **Supabase Auth**
- **Google OAuth** (Continue with Google on login/register → `/auth/callback`)
- Middleware-gated protected routes
- Auto-provisioned `profiles` row + **500 welcome credits** on first sign-in
- Admin flag when email matches `ADMIN_EMAIL`
- Session via Supabase cookies; `/api/auth/me` returns user + balance

### Campaigns
- Create **B2B** or **B2C** campaigns: product, target, price point, location, quantity (1–5000)
- **8 platforms:** Google, Open Web, Reddit, YouTube, Instagram, TikTok, X/Twitter, LinkedIn
- Optional **AI enrichment** (+50% credit cost)
- Dynamic credit pricing (platform multipliers; LinkedIn = 2×)
- Background pipeline: search → scrape → dedupe → Gemini enrich → batch insert
- Chunked processing with 6-hour candidate cache between runs
- Statuses: `queued`, `running`, `complete`, `failed`, `paused`, `cancelled`
- Cancel queued/failed campaigns with credit refund
- Live status polling on campaign detail page

### Leads
- Paginated list with filters (campaign, status, platform, search, min score, sort)
- Lead drawer: status updates, notes, social links
- **AI cold-email** generation per lead (Gemini)
- Dashboard stats (total, hot 70+, with email, pipeline breakdown)
- **CSV export** via fetch → blob download (streaming, filter-aware)

### Billing
- Credit balance + transaction history
- **4 packs:** Starter 300/$19 · Growth 1000/$49 · Pro 3000/$99 · Scale 7500/$199
- Stripe Checkout + webhook fulfillment (idempotent)
- Low-credit email after purchase (<100 remaining)

### Admin
- Platform stats: users, campaigns, leads, revenue, completion rate
- User list with balances; manual credit grants
- Admin nav when `is_admin=true`
- `/api/admin/campaigns` exists (no admin UI for it yet)

### Marketing
- Landing page (product pitch, 4-step flow, platforms)
- Pricing page

### Email (Resend, best-effort)
- Welcome on registration
- Leads-ready when campaign completes
- Low-credits warning

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js    │────▶│  Supabase Auth   │     │  Supabase       │
│  App Router │     │  (cookies/OAuth) │     │  Postgres (RLS) │
└──────┬──────┘     └──────────────────┘     └────────┬────────┘
       │                                                │
       │  waitUntil(driveCampaign)                      │
       ▼                                                │
┌─────────────┐     ┌──────────┐     ┌─────────┐         │
│  Campaign   │────▶│  Serper  │────▶│ Scraper │─────────┘
│  Processor  │     │  / CSE   │     │ + Gemini│
└─────────────┘     └──────────┘     └─────────┘
```

**Dual runtime:** When `NEXT_PUBLIC_SUPABASE_URL` is set (Vercel production), the app uses Supabase + `waitUntil` for background jobs. Without it, `next.config.ts` boots OpenNext Cloudflare dev bindings (D1, KV, Queues) for local/CF deploy.

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 (App Router, Route Handlers) |
| UI | React 18, Tailwind CSS, custom `components/ui/` |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase Postgres (production) · Cloudflare D1 (legacy local) |
| AI | Google Gemini (`gemini-2.5-flash-lite` default) |
| Search | Serper.dev → Google CSE → DuckDuckGo fallback |
| Billing | Stripe Checkout + webhooks |
| Email | Resend |
| Deploy | Vercel (primary) · Cloudflare Workers (alternate) |

---

## Folder Structure

```
leadforge/
├── app/
│   ├── (marketing)/          # /, /pricing
│   ├── (auth)/               # /auth/login, register, callback
│   ├── (app)/                # dashboard, campaigns, leads, billing, admin
│   └── api/                  # REST route handlers
├── components/
│   ├── app/AppShell.tsx        # Sidebar + session
│   ├── auth/GoogleSignInButton.tsx
│   ├── leads/LeadsView.tsx, LeadDrawer.tsx
│   └── ui/index.tsx            # Button, Card, Badge, Field, etc.
├── lib/                        # Business logic (see below)
├── workers/campaign-processor.ts
├── types/index.ts              # Shared TypeScript contracts
├── supabase/schema.sql         # Postgres schema (production)
├── schema.sql                  # D1/SQLite schema (Cloudflare legacy)
├── scripts/apply-supabase-schema.mjs
├── middleware.ts
├── wrangler.toml
└── vercel.json
```

---

## API Routes

All JSON APIs return `{ success, data?, error?, message? }`.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/auth/register` | Sign up, create profile, welcome credits |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Current user + credit balance |
| `GET` | `/auth/callback` | OAuth code exchange + profile provision |
| `GET/POST` | `/api/campaigns` | List / create campaigns |
| `GET/DELETE` | `/api/campaigns/[id]` | Detail / cancel + refund |
| `GET` | `/api/campaigns/[id]/status` | Lightweight status poll |
| `GET/PATCH` | `/api/leads`, `/api/leads/[id]` | List / update leads |
| `POST` | `/api/leads/[id]/cold-email` | AI cold email |
| `GET` | `/api/leads/stats` | Dashboard aggregates |
| `GET` | `/api/leads/export` | CSV export |
| `GET` | `/api/billing/balance` | Balance + transactions |
| `POST` | `/api/billing/checkout` | Stripe Checkout session |
| `POST` | `/api/billing/webhook` | Stripe fulfillment |
| `GET` | `/api/admin/stats` | Platform stats |
| `GET` | `/api/admin/users` | User list |
| `GET` | `/api/admin/campaigns` | All campaigns |
| `POST` | `/api/admin/credits` | Manual credit grant |

**Protected:** pages `/dashboard`, `/campaigns`, `/leads`, `/billing`, `/admin` and matching APIs (middleware + `requireAuth` / `requireAdmin`).

---

## Database (Supabase Postgres)

Defined in `supabase/schema.sql`.

| Table | Purpose |
|-------|---------|
| `profiles` | 1:1 with `auth.users` — email, name, `is_admin` |
| `credits` | Per-user balance + `lifetime_purchased` |
| `transactions` | Stripe purchases (`pending` / `complete` / `failed`) |
| `campaigns` | Lead-gen runs (product, platforms JSONB, status, cursor) |
| `leads` | Enriched leads (contact, score, fit, pitch, socials, status) |
| `campaign_candidates` | Processor cache between chunked runs (6h TTL) |

**RPC:** `deduct_credits(user_id, amount)` — atomic conditional deduction.  
**RLS:** Users see own rows; service-role client bypasses RLS for API routes.

---

## Key Lib Modules

| Module | Role |
|--------|------|
| `lib/runtime.ts` | Runtime switch: Supabase env vs Cloudflare; `waitUntil` |
| `lib/db.ts` | All data access (profiles, credits, campaigns, leads, admin) |
| `lib/auth.ts` | `requireAuth`, `requireAdmin`, `signOut` |
| `lib/auth-provision.ts` | OAuth profile + welcome credits on first sign-in |
| `lib/supabase/*` | Browser, server, middleware, admin clients |
| `lib/gemini.ts` | Lead enrichment + cold-email generation |
| `lib/search.ts` | Serper / Google CSE / DuckDuckGo |
| `lib/scraper.ts` | Query build, SERP fetch, URL extract, dedupe |
| `lib/campaign-cache.ts` | Candidate cache (Postgres or KV) |
| `lib/stripe.ts` | Checkout + webhook verification |
| `lib/resend.ts` | Transactional email |
| `lib/constants.ts` | Platforms, packs, credit math, tuning |
| `workers/campaign-processor.ts` | Full scrape → enrich → insert pipeline |

---

## UI Pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/pricing` | Credit packs |
| `/auth/login` | Login (email + Google) |
| `/auth/register` | Register (email + Google) |
| `/dashboard` | Stats + recent campaigns |
| `/campaigns` | Campaign list |
| `/campaigns/new` | Create campaign |
| `/campaigns/[id]` | Detail, leads, cancel |
| `/leads` | All leads, filters, export |
| `/billing` | Balance, buy credits |
| `/admin` | Stats, users, credit grants |

---

## Credit Economics

| Item | Value |
|------|-------|
| Base cost | 1 credit / lead |
| LinkedIn | 2× multiplier |
| AI enrichment | +50% |
| Welcome bonus | 500 credits |
| Packs | 300/$19 · 1000/$49 · 3000/$99 · 7500/$199 |

---

## Environment Variables

Copy `.dev.vars.example` → `.env.local` for local dev.

### Required (Supabase / Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### App
```
APP_URL=http://localhost:3003
APP_ENV=development
ADMIN_EMAIL=
```

### AI + Search
```
GEMINI_API_KEY=
GEMINI_MODEL=                    # optional, default gemini-2.5-flash-lite
SEARCH_PROVIDER=serper
SERPER_API_KEY=
GOOGLE_CSE_KEY=
GOOGLE_CSE_CX=
```

### Billing + Email (optional locally)
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

### Schema deploy (optional)
```
SUPABASE_ACCESS_TOKEN=           # personal token for scripts/apply-supabase-schema.mjs
```

### Google OAuth (configured in Supabase Dashboard, not env vars)
1. Enable Google provider in **Auth → Providers**
2. Add redirect URLs in **Auth → URL Configuration:**
   - `http://localhost:3003/auth/callback`
   - `https://leadforge-gilt.vercel.app/auth/callback`

---

## Development

```bash
cd leadforge
npm install
cp .dev.vars.example .env.local   # fill in Supabase + API keys

# Apply schema (one of):
#   Paste supabase/schema.sql into Supabase SQL Editor
#   SUPABASE_ACCESS_TOKEN=... node scripts/apply-supabase-schema.mjs

npm run dev          # http://localhost:3003
npm run typecheck
npm run lint
npm run build
```

**Supabase path (recommended):** Set Supabase env vars in `.env.local`. Campaigns process in background via `waitUntil` — no Cloudflare queue needed.

**Cloudflare path (legacy):** Omit Supabase vars; run `npm run db:init:local` then `npm run cf:preview`.

---

## Deployment

### Vercel (production)
```bash
npm run vercel:deploy
# or: npx vercel deploy --prod
```
Set all env vars in the Vercel project dashboard. Remove obsolete `JWT_SECRET` if present.

### Supabase
- Schema: `supabase/schema.sql`
- Disable email confirmation for instant sign-up (`mailer_autoconfirm`)
- Site URL: `https://leadforge-gilt.vercel.app`

### Cloudflare (alternate)
```bash
npm run cf:deploy
```
Requires real D1/KV IDs in `wrangler.toml` (currently placeholders).

---

## npm Scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev -p 3003` |
| `build` | `next build` |
| `start` | `next start -p 3003` |
| `lint` | `next lint` |
| `typecheck` | `tsc --noEmit` |
| `vercel:deploy` | `vercel --prod` |
| `cf:build` / `cf:preview` / `cf:deploy` | OpenNext Cloudflare |
| `db:init:local` / `db:init:remote` | D1 schema init |

---

## Known Limitations

| Item | Detail |
|------|--------|
| Dual-runtime | Migrated from D1/KV/JWT to Supabase; CF path remains but is secondary |
| CF deploy | `wrangler.toml` has placeholder D1/KV IDs; queue consumer not wired to default worker |
| Stripe prices | Packs use inline `price_data`; `stripePriceId` fields are empty |
| Admin campaigns UI | API exists; no page yet |
| No automated tests | — |
| Resend sender | Uses `onboarding@resend.dev`; needs custom domain for production |
| Search without keys | Falls back to DuckDuckGo HTML — lower quality |
| Pause/resume | `paused` status in schema; no UI/API |
| Legacy files | `schema.sql` (D1), `lib/session-cookie.ts` unused |

---

## Milestone History

| Phase | Delivered |
|-------|-----------|
| M1 | Scaffold, schema, types, core lib |
| M2 | API routes + campaign queue worker |
| M3 | Full UI (dashboard, campaigns, leads, billing, admin) |
| — | Lead pipeline fixes (Serper num≤10, Gemini model default) |
| — | CSV export blob download fix |
| — | Vercel deployment |
| — | Supabase Auth + Postgres migration |
| — | Google OAuth |
| — | Schema applied + auth config via Management API |

---

## Related Paths in Monorepo

LeadForge lives at `TheOne/leadforge/` alongside `web/` (BrandForge marketing site). It is a standalone Next.js app with its own `package.json`, Vercel project, and Supabase backend.
