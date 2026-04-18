# World of BrandForge — Complete Documentation

**The Professional OS for the AI Era**

A competitive marketplace where specialists list services, buyers post briefs, and AI agents + human squads execute projects end-to-end. All in one deal room thread.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Recent Changes (April 2026)](#recent-changes-april-2026)
3. [Project Overview](#project-overview)
4. [Architecture](#architecture)
5. [Technology Stack](#technology-stack)
6. [Repository Structure](#repository-structure)
7. [Features Status](#features-status)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)
12. [Environment Variables](#environment-variables)
13. [Roadmap](#roadmap)
14. [Known Issues](#known-issues)

---

## Recent Changes (April 2026)

### Major Updates
- **SEO Optimization** — All pages now have metadata, OpenGraph, and structured data
- **Branding** — Consistent "World of BrandForge" messaging across all components
- **Logo Integration** — Brand logo in navbar, sidebar, and footer
- **Sitemap** — Comprehensive SEO sitemap with 20+ pages
- **404 Page** — Custom 404 with navigation links

### UI/UX Improvements
- **Sidebar** — Cleaned up, removed Settings/Logout buttons, streamlined navigation
- **AI Tools** — Simplified interface, removed My Agents tab
- **Leaderboard** — Enhanced with Honor/Conquest tracking and top earners display
- **Authentication** — Consolidated login/register into single flow

### Backend & Database
- **Squads** — Fixed join functionality with proper schema constraints
- **Emails** — Standardized to hello@brandforge.gg
- **Performance** — CSS optimization, scroll restoration enabled

---

## Quick Start

```bash
# Setup
npm install                    # Root dependencies
npm install --prefix web       # Frontend dependencies

cp .env.example .env           # Configure root env
cp web/.env.example web/.env.local  # Configure frontend env

# Development
npm run dev:all                # Runs API (:3000) + Web (:3001)
```

**URLs:**
- Web: http://localhost:3001
- API: http://127.0.0.1:3000
- Health: http://127.0.0.1:3000/api/health

**Requirements:** Node 20.x (see `.nvmrc`). Node 22+ breaks Next 15.5 builds.

---

## Project Overview

BrandForge is a **marketplace + deal operating system** that unifies:
- **Marketplace**: Services and requests with AI-powered matching
- **Deal Rooms**: Chat-based negotiation with AI assistant
- **Contracts**: One-click contract generation with voice/text input
- **Ranking**: WoW-style competitive system (Honor, Conquest, RP)
- **AI Tools**: Brief generator, proposal writer, AGI agents, outcome squads
- **Economy**: Virtual currency (Honor/Conquest), privilege store

### Key Value Propositions
1. **End-to-end deals**: From discovery to payment in one thread
2. **AI acceleration**: Voice-to-contract, smart matching, AI assistants
3. **Competitive reputation**: Skill-based ranking, not just reviews
4. **Human + AI squads**: Assemble teams for complex projects

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Workers (Edge)                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js 15 + OpenNext                              │  │
│  │  - SSR/SSG at edge                                  │  │
│  │  - /api/* → proxy to Railway                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                      ↑↓                                     │
│              Proxy via middleware.ts                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Railway (Node.js)                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  server.js + src/server/*                           │  │
│  │  - Business logic                                   │  │
│  │  - Supabase service role access                     │  │
│  │  - Webhooks (Stripe, NOWPayments)                   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Supabase (Managed)                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  - PostgreSQL (profiles, projects, contracts...)     │  │
│  │  - Auth (JWT, OAuth providers)                      │  │
│  │  - Storage (avatars, files)                         │  │
│  │  - Realtime (optional)                              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.15 | React framework (App Router) |
| React | 18 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4.1 | Styling |
| Lucide React | 1.7.0 | Icons |
| React Flow | 11.11.4 | Agent Studio diagrams |
| @supabase/supabase-js | 2.102.1 | Auth & data |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Supabase JS | 2.101.1 | Database client |
| HTTP (native) | - | API server |

### Infrastructure
| Service | Role |
|---------|------|
| Cloudflare Workers | Edge hosting (frontend) |
| Railway | Node.js API hosting |
| Supabase | Auth, DB, storage |
| GitHub Actions | CI/CD (agent runner) |

---

## Repository Structure

```
TheOne/
├── server.js                    # API entry point
├── src/
│   ├── server/                  # API business logic
│   │   ├── platform-repository.js   # Core marketplace, chats, deals
│   │   ├── agent-infra-repository.js # AI agent infra
│   │   ├── currency-service.js      # Honor/Conquest economy
│   │   ├── rating-service.js      # RP/tier calculations
│   │   ├── ai-chat.js             # LLM integrations
│   │   └── auth-service.js        # JWT validation
│   ├── agents/                  # Agent logic
│   ├── core/                    # Core utilities
│   ├── marketplace/             # Marketplace logic
│   └── verticals/               # Vertical implementations
├── supabase/
│   ├── schema.sql               # Full DDL reference
│   └── migrations/              # Incremental SQL changes
├── web/                         # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (landing)/       # Landing page (unauthenticated)
│   │   │   ├── (main)/         # Authenticated app shell
│   │   │   │   ├── marketplace/
│   │   │   │   ├── chat/
│   │   │   │   ├── services/
│   │   │   │   ├── requests/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── agents/
│   │   │   │   ├── squads/
│   │   │   │   ├── ai/
│   │   │   │   └── inbox/
│   │   │   └── api/             # Proxy routes
│   │   ├── components/          # Shared UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities (api.ts, cn.ts)
│   │   └── providers/           # Auth, data providers
│   ├── public/                  # Static assets
│   └── wrangler.jsonc           # Cloudflare Worker config
├── docs/                        # Documentation (this file)
├── scripts/                     # Automation scripts
└── .github/workflows/           # CI/CD
```

---

## Features Status

### ✅ Implemented (Frontend + Backend)

| Feature | Status | Files |
|---------|--------|-------|
| Landing Page | ✅ | `(landing)/page.tsx` + 5 components |
| Authentication | ✅ | Google OAuth, Email magic link, Supabase |
| Marketplace (Unified) | ✅ | `marketplace/page.tsx`, Smart Match Engine |
| Deal Rooms | ✅ | `/chat`, AI Assistant Panel, Contract Generator |
| Service Listings | ✅ | CRUD + detail pages |
| Request Briefs | ✅ | CRUD + bidding flow |
| Leaderboard (Arena) | ✅ | 7-tier RP system, Honor, Conquest |
| Economy/Store | ✅ | Privilege catalog, Honor/Conquest currency |
| AGI Agents | ✅ | Marketplace, templates, deployments |
| Outcome Squads | ✅ | Squad creation, AI generation |
| AI Brief Generator | ✅ | Voice/text to structured brief |
| AI Proposal Writer | ✅ | Voice/text to proposal |
| User Inbox | ✅ | Notifications, AI summaries |
| Profile Pages | ✅ | Public `/p/[username]` with stats |
| Onboarding | ✅ | Welcome flow + guided tour |

### 🟡 Partially Implemented

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| AI Chat Assistant | ✅ | ⚠️ | Uses completeMxAgentChat stub |
| Smart Match | ✅ | ⚠️ | Client-side filtering only |
| Contracts | ✅ | ⚠️ | Generation stub, signing works |
| Notifications | ✅ | ✅ | AI summary endpoint added, mark read works |
| Agent Runner | ✅ | ⚠️ | GitHub Actions scaffolded, execution stub |
| Squads | ✅ | ✅ | Generate and create endpoints added |
| Payments | ⚠️ | ⚠️ | NOWPayments/Stripe stubs |
| Escrow | ⚠️ | ⚠️ | Contract-level planned |

### ❌ Missing / Planned

| Feature | Priority | Notes |
|---------|----------|-------|
| Real-time notifications | High | WebSockets or Supabase Realtime |
| Full AI provider integration | High | Groq/OpenAI wired to endpoints |
| Mobile responsiveness | High | Needs testing pass |
| File uploads | Medium | Contracts, avatars, attachments |
| Dispute resolution | Medium | Escalation workflows |
| KYC/Verification | Medium | Identity verification |
| Mobile app | Low | React Native or PWA |

---

## API Reference

### Health & Auth
```
GET  /api/health              → { ok, status, service, timestamp, version }
GET  /api/auth/config         → { enabled, url, anonKey }
GET  /api/auth/me             → { user, profile, settings, pendingOnboarding }
POST /api/onboarding/complete  → { ok, profile }
```

### Bootstrap & Stats
```
GET /api/bootstrap            → Full app bootstrap (services, requests, chats, economy)
GET /api/home/stats           → Members, online count, deals
GET /api/marketplace-stats    → Active listings, open requests
```

### Marketplace
```
GET  /api/agents/marketplace?category=&limit=&offset=  → Agent templates
GET  /api/leaderboard/:type (rating|honor|conquest|streak) → Leaderboards
GET  /api/season/current      → Active season config
GET  /api/privileges/catalog  → Store items
POST /api/privileges/purchase → Buy with Honor/Conquest
```

### Economy (Cron)
```
POST /api/cron/decay-honor    → Weekly Honor decay (CRON_SECRET)
POST /api/cron/decay-rp       → RP decay in competitive mode
```

### Content (Authenticated)
```
POST /api/requests            → Create request brief
POST /api/services            → Create service listing
POST /api/bids                → Submit bid
POST /api/deals/counter-offer → Counter on deal
POST /api/reviews             → Post project review
```

### Chat (Authenticated)
```
GET  /api/chats               → List user's chats
POST /api/chats               → Create chat
POST /api/chat/start          → Start deal room
POST /api/chat/messages       → Send message
POST /api/chat/files          → Upload attachment
```

### Notifications (Authenticated)
```
GET  /api/notifications              → List user notifications
GET  /api/notifications/ai-summary   → AI summary of notifications
PUT  /api/notifications/read-all     → Mark all as read
POST /api/notifications/:id/read     → Mark single notification read (also accepts PUT)
```

### AI (Authenticated)
```
POST /api/ai/chat             → AI assistant response
POST /api/ai/image            → Generate image
POST /api/agent-runs          → Run agent
POST /api/research            → Research query
```

### Squads
```
POST /api/squads/generate     → Generate AI squad suggestions
POST /api/squads/create       → Create new squad
```

### Settings
```
PUT  /api/profile             → Update profile
PUT  /api/settings            → Update settings
POST /api/profile/avatar      → Upload avatar
GET  /api/profiles/username-available?username= → Check availability
```

---

## Database Schema

### Core Tables
```
profiles              → User identity, reputation, stats
user_settings         → Notification, AI, privacy prefs
service_packages      → Seller listings
project_requests      → Buyer briefs
bids                  → Offers on requests
projects              → Active deals
project_contracts     → Contract terms & status
messages/unified_messages → Chat history
unified_chats         → Chat threads
```

### Economy Tables
```
user_currencies       → Honor & Conquest balances
currency_ledger       → Immutable transaction log
user_privileges       → Purchased perks
privilege_catalog     → Store items
user_ratings          → RP, tier, streaks
rating_history        → Audit trail
seasons               → Season config
```

### AI Agent Tables
```
agent_infra_templates      → Agent templates
agent_infra_deployments    → Deployed instances
agent_infra_execution_runs → Execution logs
agent_infra_roi            → ROI tracking
agent_infra_workflows      → Workflow definitions
```

Full DDL: `supabase/schema.sql`

---

## Development Guide

### Daily Commands
```bash
# Full stack
npm run dev:all              # API + Web concurrently

# Frontend only
npm run dev --prefix web     # :3001 only

# Clean build
npm run clean --prefix web

# Deploy
npm run cf:deploy            # Frontend to Cloudflare
railway redeploy             # Backend to Railway
```

### Adding Features
1. **Frontend**: Work in `web/src/app/(main)/`
2. **API**: Add route in `server.js`, logic in `src/server/`
3. **DB**: Create migration in `supabase/migrations/`
4. **Auth**: Use `requireUser()` for protected routes

### Code Patterns
```typescript
// Frontend API call
import { apiGetJson, apiMutateJson } from '@/lib/api';
const data = await apiGetJson('/api/bootstrap', accessToken);

// Auth check
const { session, accessToken } = useAuth();
if (!session) router.push('/login');

// Backend route
if (pathname === '/api/my-feature' && method === 'POST') {
  const user = await requireUser(req, res);
  if (!user) return true;
  // ... logic
  sendJson(res, 200, { ok: true });
  return true;
}
```

---

## Deployment

### Production Topology
| Service | Host | URL |
|---------|------|-----|
| Frontend | Cloudflare Workers | `https://brandforge.gg` |
| API | Railway | `https://*.up.railway.app` |
| Database | Supabase | `https://*.supabase.co` |

### Deploy Steps
1. **Push to main** → Triggers both CF Worker + Railway
2. **Frontend only**: `npm run cf:deploy`
3. **Backend only**: Railway dashboard → Redeploy

### Critical Env Vars
| Var | Location | Purpose |
|-----|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | CF build + wrangler.jsonc | Auth |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | CF build + wrangler.jsonc | Auth |
| API_PROXY_DESTINATION | CF build + wrangler.jsonc | API proxy |
| SUPABASE_SERVICE_ROLE_KEY | Railway only | DB admin |
| PUBLIC_WEB_ORIGIN | Railway | Redirects |
| CRON_SECRET | Railway | Cron protection |

Full guide: See DEPLOYMENT.md (legacy) or this document's Architecture section.

---

## Environment Variables

### Root .env (API)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_WEB_ORIGIN=https://brandforge.gg
API_PUBLIC_ORIGIN=
CRON_SECRET=
# AI providers
GROQ_API_KEY=
OPENAI_API_KEY=
# Payments
NOWPAYMENTS_API_KEY=
```

### web/.env.local (Frontend)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Roadmap

### Phase 1 — Foundation (Complete)
- ✅ Landing page with auth
- ✅ Marketplace (services + requests)
- ✅ Deal rooms with chat
- ✅ Contract generation (stub)
- ✅ Economy system (Honor/Conquest/RP)
- ✅ Leaderboard + store

### Phase 2 — AI Tools (In Progress)
- ✅ Brief generator UI
- ✅ Proposal writer UI
- ✅ AGI agents marketplace
- ✅ Outcome squads
- 🟡 Agent runner execution
- 🟡 AI provider integration

### Phase 3 — Execution (Planned)
- Real-time notifications
- Payment processing (escrow)
- Mobile responsive pass
- Dispute resolution
- KYC/verification

### Phase 4 — Scale (Future)
- Template resale marketplace
- Enterprise tier
- i18n
- Mobile app

---

## Known Issues

| Issue | Workaround |
|-------|------------|
| Node 22+ breaks build | Use Node 20 LTS |
| Auth not configured in prod | Set NEXT_PUBLIC_* at build time |
| /favicon.ico conflict | Keep only `src/app/favicon.ico` |
| Cached static chunks | `npm run clean --prefix web` |

---

## Naming & Legacy

- **Customer-facing**: BrandForge (`brandforge.gg`)
- **Codebase**: May contain `mxstermind`, `TheOne` — gradually aligning
- **Repo**: `mxstermindhq/BrandForge`

---

*Last updated: 2026-04-16*
*Document consolidates: README.md, HANDBOOK.md, DEPLOYMENT.md, BLUEPRINT.md, BRAND_GUIDE.md, ROADMAP_AI_AGENTS.md, WORLD_OF_BRANDFORGE_IMPLEMENTATION.md*
