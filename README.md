# BrandForge

**Professional marketplace + deal OS** — specialists, buyers, AI-assisted workflows, and competitive reputation on **[brandforge.gg](https://brandforge.gg)**.

[![Deploy Status](https://img.shields.io/badge/deploy-cloudflare-orange)](https://brandforge.gg)
[![Database](https://img.shields.io/badge/database-supabase-blue)](https://supabase.com)
[![Framework](https://img.shields.io/badge/framework-next.js-black)](https://nextjs.org)

## Quick Links

- **Live Site:** [brandforge.gg](https://brandforge.gg)
- **Docs:** [docs/](./docs/)
- **API:** Node.js server with Supabase backend

## Strategy docs (start here)


| Doc                                                                                  | Topics                                         |
| ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| [docs/strategy/00-landing-audit-roadmap.md](docs/strategy/00-landing-audit-roadmap.md) | Landing audit, conversion, production path     |
| [docs/strategy/06-app-audit.md](docs/strategy/06-app-audit.md) | Authenticated app audit, AI product roadmap    |
| [docs/strategy/01-product-design-ux.md](docs/strategy/01-product-design-ux.md)       | Design system, UX, IA, metrics                 |
| [docs/strategy/02-engineering-platform.md](docs/strategy/02-engineering-platform.md) | Architecture, repo map, tech debt, deploy      |
| [docs/strategy/03-monetization-growth.md](docs/strategy/03-monetization-growth.md)   | Revenue, pricing posture, GTM loops            |
| [docs/strategy/04-market-leadership.md](docs/strategy/04-market-leadership.md)       | Positioning, differentiation, “win” definition |
| [docs/strategy/05-execution-roadmap.md](docs/strategy/05-execution-roadmap.md)       | Pillars, ordered tasks, weekly rhythm          |


## Features

### For Specialists
- **Public Profiles** - Showcase skills, portfolio, and availability
- **AI Career Assistant** - AI-powered career guidance and content generation
- **Portfolio Upload** - Smart link import from GitHub, Figma, Dribbble, etc.
- **Open to Offers** - Toggle availability and set preferences
- **Social Features** - Follow/save other specialists, skill endorsements

### For Buyers
- **Service Marketplace** - Browse and hire top specialists
- **Deal Rooms** - Secure collaboration spaces with contracts
- **AI Brief Generator** - AI-assisted project brief creation
- **Payment Integration** - Secure escrow and payments (NowPayments)

### Platform Features
- **AI Models** - Multi-provider AI (Groq, xAI, OpenRouter, Gemini, Anthropic)
- **Social Login** - Google, LinkedIn, GitHub, Discord, Telegram
- **Notifications** - Real-time notification center
- **Activity Feed** - Platform-wide activity feed
- **Discord Bot** - Automated listings and deployment notifications

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, Tailwind CSS, Cloudflare Workers (OpenNext) |
| **API** | Node.js (`server.js`, `src/server/`) |
| **Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **AI** | Groq, xAI, OpenRouter, Gemini, Anthropic |
| **Storage** | Supabase Storage |
| **Payments** | NowPayments (crypto) |
| **Node** | 20 LTS (see `web/.nvmrc`)

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
- `npm run discord:listings` — post current services/requests snapshot to `DISCORD_DEALS_CHANNEL_ID`

## Deploy

- **Worker (UI):** `cd web && npm run cf:deploy`
- **API:** redeploy the Node host when `server.js` / `src/server/` changes.

## Environment Setup

```bash
# Root .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-key
XAI_API_KEY=your-xai-key
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key

# Web .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) | Complete feature audit and status |
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | Implementation summary and roadmap |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Deployment instructions |
| [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) | Detailed deployment guide |
| [docs/PRODUCT_OVERVIEW.md](./docs/PRODUCT_OVERVIEW.md) | Product features overview |
| [docs/TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md) | Technical architecture |

## License

Private repository — all rights reserved © 2026 BrandForge.

## Contact

- **Site:** [brandforge.gg](https://brandforge.gg)
- **Email:** [hello@brandforge.gg](mailto:hello@brandforge.gg)