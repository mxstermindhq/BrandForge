# BrandForge (World of BrandForge)

**Professional marketplace + deal OS** — specialists, buyers, AI-assisted workflows, and competitive reputation on **[brandforge.gg](https://brandforge.gg)**.

## Strategy docs (start here)


| Doc                                                                                  | Topics                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| [docs/strategy/01-product-design-ux.md](docs/strategy/01-product-design-ux.md)       | Design system, UX, IA, metrics                 |
| [docs/strategy/02-engineering-platform.md](docs/strategy/02-engineering-platform.md) | Architecture, repo map, tech debt, deploy      |
| [docs/strategy/03-monetization-growth.md](docs/strategy/03-monetization-growth.md)   | Revenue, pricing posture, GTM loops            |
| [docs/strategy/04-market-leadership.md](docs/strategy/04-market-leadership.md)       | Positioning, differentiation, “win” definition |
| [docs/strategy/05-execution-roadmap.md](docs/strategy/05-execution-roadmap.md)       | Pillars, ordered tasks, weekly rhythm          |


## Stack (short)

- **Frontend:** Next.js 15 (`web/`), Tailwind, Cloudflare Workers (OpenNext).
- **API:** Node (`server.js`, `src/server/`), Supabase (Postgres + Auth).
- **Node:** 20 LTS — see `web/.nvmrc`.

## Local dev

```bash
npm install
cd web && npm install && cd ..
cp .env.example .env
cp web/.env.example web/.env.local
npm run dev:all
```

- API: `http://127.0.0.1:3000`  
- Web: `http://localhost:3001`

### Discord bot (optional)

Set these env vars in root `.env`: `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, and `DISCORD_DEALS_CHANNEL_ID` (optionally `DISCORD_GUILD_ID` for guild-scoped slash commands), then run:

```bash
npm run discord:bot
```

Bot commands:
- `/ping` — health check
- `/deploy_notify` — post a deployment embed with action buttons

## Deploy

- **Worker (UI):** `cd web && npm run cf:deploy`
- **API:** redeploy the Node host when `server.js` / `src/server/` changes.

## Contact

- **Site:** [brandforge.gg](https://brandforge.gg)  
- **Email:** [hello@brandforge.gg](mailto:hello@brandforge.gg)

Private repository — all rights reserved © 2026 BrandForge.