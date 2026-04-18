# BrandForge — Web (Next.js)

Product UI: **App Router**, Tailwind, Supabase Auth in the browser. Calls the **Node API** in the parent directory (`../server.js`, `../src/server/`).

---

## Docs

| Doc | Contents |
|-----|----------|
| **[../docs/HANDBOOK.md](../docs/HANDBOOK.md)** | **How we operate** — prod topology, repo map, local dev, deploy summary, pitfalls |
| **[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** | Cloudflare Worker + Railway detail |
| **[../docs/BLUEPRINT.md](../docs/BLUEPRINT.md)** | Product blueprint, roadmap, deep API notes |
| **[../docs/README.md](../docs/README.md)** | Index of all `/docs` |

**Quick start (full stack):** from repo root, `npm run dev:all` — API **:3000**, Next **:3001**. See **[../README.md](../README.md)**.

---

## Environment (`web/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) key |
| `NEXT_PUBLIC_API_URL` | API base (default dev `http://127.0.0.1:3000`) |

Secrets belong in **root** `.env`, not the Next bundle.

---

## Scripts (`web/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on **3001** |
| `npm run build` | Production build |
| `npm start` | Production serve |
| `npm run lint` | ESLint |

---

## Layout (`web/src/`)

| Path | Role |
|------|------|
| `app/` | Routes: `(main)/`, `login/`, `auth/callback/`, legal, etc. |
| `components/` | Shared UI |
| `lib/api.ts` | Authenticated fetch helpers |
| `providers/` | Auth + bootstrap |
