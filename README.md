# ★ World of BrandForge
npm run cf:build npx wrangler deploy
**The professional OS for the AI era.**

Enter the World of BrandForge — where specialists list services, buyers post briefs,
and AI agents execute projects end-to-end. One identity, marketplace, and workspace.

[![Status](https://img.shields.io/badge/status-beta-blue?style=flat-square)](https://brandforge.gg)
[![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase%20%2B%20Cloudflare-black?style=flat-square)](https://brandforge.gg)
[![License](https://img.shields.io/badge/license-private-grey?style=flat-square)](#)

---

## What it is

World of BrandForge is a competitive professional marketplace powered by AI.
Specialists list services. Buyers post briefs. AI agents and human squads execute projects.
All in one deal room thread — not scattered across email, DMs, and ad-hoc invoices.

**Key Features:**
- **AI-Powered Marketplace** — Services, requests, and smart matching
- **Outcome Squads** — Human + AI agent teams for end-to-end execution
- **Deal Rooms** — One chat thread per deal: offers, contracts, escrow
- **Honor & Conquest** — Dual economy for reputation and competition
- **Arena Rankings** — Rise from Challenger to Undisputed Gladiator

**North-star metric:** steps and time from "interested" to "money committed under clear terms."

**Live:** [brandforge.gg](https://brandforge.gg)

---

## Recent Updates (April 2026)

### SEO & Branding
- ✅ All pages optimized with metadata, OpenGraph, and SEO-friendly URLs
- ✅ Comprehensive sitemap with 20+ pages
- ✅ Consistent "World of BrandForge" branding across all components
- ✅ Custom 404 page with navigation

### UI/UX Improvements
- ✅ Brand logo integrated in navbar, sidebar, and footer
- ✅ Sidebar cleaned up — streamlined navigation
- ✅ AI Tools simplified — removed My Agents tab
- ✅ Leaderboard enhanced — Honor/Conquest tracking + top earners
- ✅ Register page removed — consolidated with login

### Backend & Database
- ✅ Squad join functionality fixed — proper schema and constraints
- ✅ Email standardized — hello@brandforge.gg across all pages
- ✅ Performance optimizations — CSS optimization, scroll restoration

---

## Core Features

### Marketplace
- **Services** — Specialists list AI-enhanced services with crypto pricing
- **Requests** — Buyers post project briefs with requirements
- **Smart Matching** — AI-powered recommendations for deals

### AI & Agents
- **AI Tools** — Brief generator, proposal writer, contract review
- **Agent Marketplace** — Rent and deploy AI agents
- **Outcome Squads** — Assemble human + AI teams for projects

### Competition & Reputation
- **Honor Points** — Earned through activity and positive interactions
- **Conquest Points** — Earned through successful deals and wins
- **Arena Rankings** — Challenger → Rival → Duelist → Gladiator → Undisputed
- **Seasonal Leaderboards** — Compete for prizes and recognition

### Deal Infrastructure
- **Deal Rooms** — One chat thread per deal with offers and counters
- **Contract Generator** — AI-powered contract creation
- **Escrow System** — Secure payments with milestone releases
- **Crypto Payments** — Stripe + NOWPayments integration

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | **Next.js 15** (App Router), Tailwind CSS, TypeScript |
| Backend | **Node.js** — Express-style API in `server.js` |
| Database | **PostgreSQL** via **Supabase** |
| Auth | **Supabase Auth** (magic link, OAuth) |
| Payments | **Stripe** + **NOWPayments** (crypto) |
| Hosting | **Cloudflare Workers** (frontend) + **Railway** (API) |
| Email | **Resend** |

## Project Structure

```
TheOne/
├── web/                    # Next.js frontend
│   ├── src/app/           # App Router pages
│   │   ├── (landing)/     # Landing pages (marketing)
│   │   └── (main)/        # App pages (authenticated)
│   ├── src/components/    # React components
│   ├── src/config/        # Configuration files
│   └── public/            # Static assets (logos, banners)
├── src/server/            # Backend logic
├── supabase/migrations/   # Database migrations
└── docs/                  # Documentation
```

---

## Local development

```bash
git clone https://github.com/mxstermindhq/BrandForge.git
cd BrandForge

npm install
cd web && npm install && cd ..

cp .env.example .env
# Fill repo-root `.env` for the Node API (Supabase service role, etc.).

cp web/.env.example web/.env.local
# Set NEXT_PUBLIC_SUPABASE_* and NEXT_PUBLIC_API_URL=http://127.0.0.1:3000

npm run dev:all
# API → http://127.0.0.1:3000
# Web → http://localhost:3001  (open this in the browser)
```

Use **Node 20 LTS** (`.nvmrc`). Avoid Node 22+ for this Next version.

---

## Environment variables

| File | Used by |
|------|---------|
| **`.env.example`** → `.env` (root) | `server.js` / `src/server/env.js` |
| **`web/.env.example`** → `web/.env.local` | Next.js (`NEXT_PUBLIC_*` only in this bundle) |
| **`web/wrangler.jsonc` → `vars`** | Production Worker build + runtime (API proxy URL, Supabase anon, `NEXT_PUBLIC_APP_URL`) |

Never commit `.env` or `web/.env.local`.

---

## Environment Setup

### Prerequisites
- **Node.js 20 LTS** (see `.nvmrc`)
- **npm** or **yarn**
- **Git**

### Quick Start

```bash
# Clone repository
git clone https://github.com/mxstermindhq/BrandForge.git
cd BrandForge

# Install dependencies
npm install
cd web && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

cp web/.env.example web/.env.local
# Set NEXT_PUBLIC_SUPABASE_* and NEXT_PUBLIC_API_URL

# Start development
npm run dev:all
# API → http://127.0.0.1:3000
# Web → http://localhost:3001
```

### Environment Variables

| File | Purpose |
|------|---------|
| `.env` (root) | API secrets (Supabase service role, Stripe, etc.) |
| `web/.env.local` | Frontend public vars (Supabase anon key, API URL) |
| `web/wrangler.jsonc` | Cloudflare Worker production config |

**Never commit `.env` or `.env.local` files.**

---

## Key Pages

| Page | Description |
|------|-------------|
| `/` | Landing page - World of BrandForge |
| `/login` | Authentication |
| `/marketplace` | Services and requests |
| `/squads` | Outcome squads (teams) |
| `/agents` | AI agents marketplace |
| `/ai` | AI-powered tools |
| `/leaderboard` | Arena rankings |
| `/chat` | Deal rooms and messaging |
| `/dashboard` | User dashboard |

---

## Documentation

- **[docs/BRANDFORGE.md](docs/BRANDFORGE.md)** — Architecture and API reference
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** — Version history

---

## Contact

- **Website:** [brandforge.gg](https://brandforge.gg)
- **Email:** hello@brandforge.gg
- **Support:** [brandforge.gg/help](https://brandforge.gg/help)

---

## License

Private. All rights reserved. © 2026 BrandForge.
