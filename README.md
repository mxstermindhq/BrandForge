# ★ BrandForge

**The professional OS for the AI era.**

One identity, marketplace, and workspace — where specialists list services,
buyers post briefs, and deals close in a single thread.

[![Status](https://img.shields.io/badge/status-beta-blue?style=flat-square)](https://brandforge.gg)
[![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase%20%2B%20Cloudflare-black?style=flat-square)](https://brandforge.gg)
[![License](https://img.shields.io/badge/license-private-grey?style=flat-square)](#)

---

## What it is

BrandForge collapses tools like Upwork, LinkedIn, and Notion into one surface.
Specialists list services. Buyers post briefs. Negotiations, contracts,
and payments live in one deal room thread — not scattered across email,
DMs, and ad-hoc invoices.

**North-star metric:** steps and time from "interested" to "money committed under clear terms."

---

## Core features

- **Marketplace** — services and request briefs, weekly rotating board
- **Deal rooms** — one chat thread per deal: offers, counters, contracts, escrow
- **Honor & Conquest** — dual season economy for activity and deal wins
- **Rating & Tiers** — Challenger → Rival → Duelist → Gladiator → Undisputed
- **Leaderboard** — season rankings with 24,500 USDT prize ladder (if funded)
- **Plans** — Free, Starter, Architect, Scale

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Node.js (`server.js`), Supabase |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (magic link + OAuth) |
| Payments | Stripe + NOWPayments (crypto) — configured on API host |
| Hosting | Cloudflare Pages + DNS (web); Node API elsewhere |
| Email | Resend |

---

## Local development

```bash
git clone https://github.com/your-org/brandforge.git
cd brandforge

npm install
cd web && npm install && cd ..

cp .env.example .env
# Fill repo-root `.env` for the Node API.
# Copy `web/.env.example` to `web/.env.local` for Next (Supabase + API URL).

npm run dev:all
# API → http://127.0.0.1:3000 (default)
# Web → http://localhost:3001
```

---

## Environment variables

- **Repo root** `.env.example` — keys read by `src/server/env.js` for `server.js`.
- **`web/.env.example`** — `NEXT_PUBLIC_*` for the Next app.

Never commit `.env` or `web/.env.local`.

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Cloudflare Pages (web) and separate Node API hosting.

---

## Docs

- [docs/BRAND_GUIDE.md](docs/BRAND_GUIDE.md) — colors, type, assets
- [docs/BLUEPRINT.md](docs/BLUEPRINT.md) — product and engineering blueprint
- `.env.example` — API environment variables

---

## License

Private. All rights reserved. © 2026 BrandForge.
