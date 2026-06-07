# LeadForge

AI buyer intelligence + multi-platform lead scraping for B2B and B2C. Paste your product or service website, get an ideal buyer persona, then stream scored leads with emails and pitch angles — exportable as CSV.

**Production:** https://leadforge-gilt.vercel.app  
**Stack:** Next.js 15 · Supabase Auth + Postgres · Vercel · Gemini · Groq · Serper · Stripe · Resend  
**Full audit (design, code, marketing, security):** [AUDIT.md](./AUDIT.md)

---

## How it works

1. **Paste your website** — product, service, SaaS, or agency URL  
2. **Analyze** — AI infers who buys (titles, intent signals, pain points, platforms)  
3. **Search & scrape** — intent-based queries across 8 channels; leads stream live  
4. **Contact & export** — fit scores, emails, cold-email drafts, CSV export  

**500 free credits** on signup. Support on [Discord](https://discord.gg/a8Nz2R6M55) and [Telegram](https://t.me/Notmxstermind) (same as BrandForge).

---

## Features

### Website URL search (primary)
- `/search` — paste URL → `POST /api/search/analyze-site` → review ICP → `POST /api/search/stream` (SSE)
- Crawls site pages + `__NEXT_DATA__` / JSON-LD for rich context
- AI chain: **Gemini → Groq → heuristic** with JSON coercion (`lib/website-analysis-coerce.ts`)
- Intent queries per channel (`lib/channel-search.ts`) — not generic keyword dumps
- Email extraction from SERP snippets and contact pages (`lib/email-extract.ts`)
- Score bonuses for verified email + intent match

### Authentication
- Email/password + **Google OAuth** via Supabase
- Middleware-gated app routes; auto-provisioned profile + welcome credits
- Admin when email matches `ADMIN_EMAIL`

### Leads & campaigns
- Live search saves to `campaigns` + `leads` for CRM-style management
- `/leads` — filters, drawer, status, notes, AI cold email, CSV export
- Legacy batch campaigns via `/campaigns` + background processor (optional Apollo/Apify)

### Billing
- Credit packs: Starter 300/$19 · Growth 1000/$49 · Pro 3000/$99 · Scale 7500/$199
- Stripe Checkout + idempotent webhooks
- LinkedIn leads cost 2× credits; enrichment +50%

### Admin
- Platform stats, user balances, manual credit grants (`/admin`)

### Marketing
- Landing with auto-cycling **live demo** (`LandingDemo`)
- Discord/Telegram contact bar (BrandForge channels)
- **Internal distribution kit:** `/launch` — copy-ready forum/social posts (`noindex`, not in nav)

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js    │────▶│  Supabase Auth   │     │  Supabase       │
│  App Router │     │  (cookies/OAuth) │     │  Postgres (RLS) │
└──────┬──────┘     └──────────────────┘     └────────┬────────┘
       │                                                │
       │  /api/search/stream (SSE)                      │
       ▼                                                │
┌─────────────┐     ┌──────────┐     ┌─────────┐         │
│ Site crawl  │────▶│  Serper  │────▶│ Gemini  │─────────┘
│ + analyze   │     │  / CSE   │     │ + Groq  │
└─────────────┘     └──────────┘     └─────────┘
```

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 (App Router) |
| UI | React 18, Tailwind (gold/dark BrandForge-aligned theme) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase Postgres |
| AI | Gemini (`gemini-2.5-flash-lite`), Groq fallback |
| Search | Serper → Google CSE → DuckDuckGo |
| Billing | Stripe |
| Email | Resend |
| Deploy | Vercel |

---

## Folder structure

```
leadforge/
├── app/
│   ├── (marketing)/          # /, /pricing, /launch (internal)
│   ├── (auth)/               # login, register, callback
│   ├── (app)/                # search, dashboard, campaigns, leads, billing, admin
│   └── api/                  # REST + search stream SSE
├── components/
│   ├── marketing/            # LandingDemo, ContactBar, CopyBlock
│   ├── search/               # SiteUrlInput, IntentReview, StreamLeadCard, …
│   ├── leads/, app/, auth/, ui/
├── lib/                        # site-analyzer, channel-search, gemini, db, …
├── supabase/                   # schema.sql + migrations
├── workers/campaign-processor.ts
├── AUDIT.md                    # Full product/code/security audit
└── middleware.ts
```

---

## Key routes

| Route | Page |
|-------|------|
| `/` | Landing + live demo |
| `/pricing` | Credit packs |
| `/launch` | Internal marketing copy kit (manual URL only) |
| `/search` | **Primary** — URL analyze + live lead stream |
| `/dashboard` | Stats |
| `/leads` | Lead CRM + export |
| `/campaigns` | Batch campaigns (legacy) |
| `/billing` | Buy credits |
| `/admin` | Admin panel |

### API (selection)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/search/analyze-site` | Crawl URL + buyer ICP |
| POST | `/api/search/stream` | SSE lead stream |
| GET | `/api/auth/me` | Session + balance |
| GET | `/api/leads/export` | CSV export |
| POST | `/api/billing/webhook` | Stripe fulfillment |
| POST | `/api/admin/credits` | Manual credit grant |

Full API table: [AUDIT.md §6](./AUDIT.md#6-api-reference)

---

## Development

```bash
cd leadforge
npm install
cp .dev.vars.example .env.local   # fill Supabase + API keys

# Apply schema: paste supabase/schema.sql into Supabase SQL Editor
# Also run migrations in supabase/migration-*.sql if needed

npm run dev          # http://localhost:3003
npm run typecheck
npm run lint
npm run build
```

### Required env (local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
SERPER_API_KEY=
APP_URL=http://localhost:3003
ADMIN_EMAIL=
```

Optional: `GROQ_API_KEY`, Stripe, Resend, Apollo, Apify — see `.dev.vars.example`.

### Google OAuth

1. Enable Google in **Supabase → Auth → Providers**
2. **Google Cloud Console** authorized redirect URI:  
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. **Supabase → URL Configuration** redirect URLs:  
   `http://localhost:3003/auth/callback`  
   `https://leadforge-gilt.vercel.app/auth/callback`

---

## Deployment

```bash
npm run vercel:deploy
```

Set all env vars in Vercel. Supabase Site URL: `https://leadforge-gilt.vercel.app`.

**Post-deploy checklist**
- [ ] Schema + migrations applied
- [ ] `GEMINI_API_KEY` + `GROQ_API_KEY` on Vercel
- [ ] Stripe webhook pointing to `/api/billing/webhook`
- [ ] Google OAuth redirect URLs configured

---

## npm scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev -p 3003` |
| `build` | `next build` |
| `typecheck` | `tsc --noEmit` |
| `lint` | `next lint` |
| `vercel:deploy` | `vercel --prod` |

---

## Known limitations

See [AUDIT.md §10–§11](./AUDIT.md#10-technical-debt--known-limitations) for the full list. Highlights:

- No API rate limiting (credit abuse risk at scale)
- SSRF protection partial on site crawl (localhost blocked only)
- No Terms/Privacy pages yet
- No automated tests
- Dual campaign vs search flows (consolidation recommended)
- Cloudflare deploy path legacy/unmaintained

---

## Internal links

| Resource | URL |
|----------|-----|
| Distribution copy kit | https://leadforge-gilt.vercel.app/launch |
| BrandForge | https://brandforge.gg |
| Discord | https://discord.gg/a8Nz2R6M55 |

---

LeadForge lives in the BrandForge monorepo at `TheOne/leadforge/` with its own Vercel project and Supabase backend.
