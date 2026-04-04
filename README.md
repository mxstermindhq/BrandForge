# mxstermind

> **The professional OS for the AI era** — human mastery amplified by AI, not replaced by it.

mxstermind collapses Upwork + LinkedIn + Claude + Midjourney + Notion into one surface. Every user gets a single identity, wallet, and reputation that grows with every project. Humans lead. AI accelerates. Outcomes are guaranteed.

---

## Core Concept

**Outcome Squads** — a verified human expert + mx Agent delivering a defined result at a fixed price. Not gig work. Not a chatbot. A co-delivery model no other platform offers.

---

## Quick Start

```powershell
cd c:\Users\user\Desktop\TheOne
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. Override port with `PORT` in `.env`.

---

## Environment

Create `.env` in repo root (never commit):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Public anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — never expose to clients |
| `SUPABASE_STATE_KEY` | Optional key for `platform_state` row |
| `AI_API_KEY` | Legacy: one key for chat if you do not use named keys below |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `TOGETHER_API_KEY`, `XAI_API_KEY`, `GEMINI_API_KEY` (or `GOOGLE_AI_API_KEY`) | Per-provider keys for mx Agent / Deep Research — see `.env.example` |
| `AI_PROVIDER` | `anthropic` \| `openai` \| `groq` \| `openrouter` \| `mistral` \| `together` \| `xai` \| `gemini` — required when multiple keys are set |
| `AI_MODEL` | Optional model id override per provider |
| `AI_OPENAI_BASE_URL` | Optional custom base for OpenAI-compatible `openai` mode (default official API) |
| `OPENROUTER_HTTP_REFERER` | Optional site URL header for OpenRouter |
| `AI_IMAGE_KEY` | OpenAI key for DALL·E 3; else `OPENAI_API_KEY` or non-Anthropic `AI_API_KEY` |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | From line for Resend (e.g. `Name <onboarding@resend.dev>`) |
| `STRIPE_SECRET_KEY` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `PORT` | HTTP port (default `3000`) |

---

## Documentation

- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — Architecture, APIs, database schema, build order
- [docs/ROADMAP.md](docs/ROADMAP.md) — Phase plan to $10B, feature priority, release gates

---

## Repo Layout

| Path | Role |
|------|------|
| `mxstermind.html` | Page shell, layout, modals |
| `production-layer.js` | Client state, rendering, routing (`#page`), API calls |
| `auth-client.js` | Supabase Auth |
| `server.js` | HTTP static + `/api/*` routing |
| `src/server/platform-repository.js` | Supabase data access, notifications, uploads |
| `src/server/auth-service.js` | JWT validation, ensure profile |
| `src/server/notify-email.js` | Optional Resend send after notification insert |
| `src/server/env.js` | Environment loading |
| `src/server/state-repository.js` | Local/platform state file |
| `supabase/schema.sql` | Table definitions |

---

## Platform Layers

```
Layer 1 — Identity & Network    (LinkedIn replacement)
Layer 2 — Marketplace           (Upwork + Toptal replacement)
Layer 3 — AI Intelligence       (Claude + Perplexity replacement)
Layer 4 — AI Creation Suite     (Midjourney + Runway replacement)
Layer 5 — Workspace             (Notion + Slack replacement)
Layer 6 — Economy               (Wallet, USDT, leaderboard rewards)
```

---

## North Star Metric

**GMV** — gross value transacted between humans on platform.
Every feature ships only if it moves GMV or enables a future feature that does.

Revenue target: $10B ARR via 100K clients × $10K avg annual spend × 10% commission + subscriptions + AI credits.

---

## License

Private project (`package.json`).