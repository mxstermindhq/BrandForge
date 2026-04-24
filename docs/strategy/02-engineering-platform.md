# Engineering & platform strategy

**Purpose:** Ship **fast, safe, and observable**—edge UI, authoritative API, Supabase truth.

## Architecture (current)

| Layer | Responsibility |
|-------|----------------|
| **Cloudflare Workers + OpenNext** | Next.js 15 app; static/edge delivery; API requests proxied to origin. |
| **Node `server.js` + `src/server/`** | Auth-gated JSON API, Supabase service role, webhooks, cron. |
| **Supabase** | Postgres, Auth (JWT), Storage, optional Realtime later. |

**Contract:** browser uses **anon key + user JWT**; server uses **service role** for writes and privileged reads.

## Repo map (where work lands)

| Area | Path |
|------|------|
| App shell, routes | `web/src/app/(main)/`, `(landing)/` |
| Shared UI | `web/src/components/` |
| API client | `web/src/lib/api.ts` |
| Server routes | `server.js` (wire), `src/server/platform-repository.js` (core data), other `src/server/*.js` |
| Schema | `supabase/migrations/`, `supabase/schema.sql` |

## Engineering principles

1. **Thin routes, fat repository** — keep `server.js` readable; push logic into `platform-repository` (or dedicated modules).
2. **Node 20 LTS** — Next 15.5 + OpenNext break on Node 22+ for production build; enforce in CI and Volta.
3. **No secrets in the Next bundle** — only `NEXT_PUBLIC_*` in `web`; service keys stay on API host + root `.env`.
4. **Profile rules enforced server-side** — e.g. `is_public` not client-toggleable; username save can flip public visibility policy in one place.

## Technical debt (from audit)

| Item | Severity | Direction |
|------|----------|-----------|
| Partial AI integrations | High | Centralize LLM adapter; feature-flag provider per env. |
| Smart match mostly client-side | Medium | Move scoring/ranking to API with caching. |
| Realtime | High | Supabase Realtime or websocket for chat + notifications. |
| Payments / escrow | High | Stripe paths hardened; escrow state machine documented. |
| ESLint `next lint` deprecation | Low | Migrate to ESLint CLI when scheduled. |

## Delivery checklist (every PR)

- Tokens only in product UI (`web/src`)—no ad-hoc hex (align with PR template).
- A11y: focus rings, labels for icon-only controls.
- If touching auth or profile: verify `/api/auth/me`, `/api/bootstrap`, welcome flow.

## Near-term engineering roadmap (30–45 days)

| Week | Focus |
|------|--------|
| **1–2** | Notifications end-to-end (read state, dedupe); chat message reliability. |
| **3** | Marketplace API performance (pagination, indexes); leaderboard query budgets. |
| **4** | AI: one vertical slice (e.g. brief → structured JSON) fully wired to provider. |
| **5+** | Realtime MVP for chat; load tests on bootstrap payload size. |

## Ops & deploy

- **Web:** `npm run cf:deploy` from `web/` (OpenNext + Wrangler).
- **API:** redeploy Node host (e.g. Railway) when `server.js` / `src/server` changes—**Worker deploy alone does not update API behavior.**

---

*Consolidates architecture, dev guide, and known issues from legacy `docs/BRANDFORGE.md`.*
