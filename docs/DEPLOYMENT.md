git remote set-url origin https://github.com/mxstermindhq/BrandForge.git
git push origin main


web
    npm run cf:build 



# BrandForge deployment

## Frontend (Cloudflare Workers + Git — OpenNext)

The Next.js app is in **`web/`**. The Node API is **`server.js` at the repository root** (see below) and is **not** deployed with the Worker.

Use **Workers** (not Pages) and connect your **GitHub or GitLab** repo in the dashboard. Follow these steps for a **new** Worker after you have deleted an old one.

### 1. Create the Worker and connect Git

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker** (or **Import Git repository** if that is the entry point you see).
2. Choose **Connect Git** and authorize the Git provider.
3. Select this repository and the branch you deploy from (e.g. `main`).

### 2. Build settings (Workers → your Worker → **Settings** → **Build**)

Use **Node 20 LTS** for any `next build` / OpenNext build. Run **`node -v`** and expect **`v20.x.x`**. This repo ships **`.nvmrc`** and **`.node-version`** (`20`) at the root and in **`web/`**; **Volta** pins **`20.18.3`** in **`package.json`**. **Node 22+** breaks Next **15.5** production builds (`WebpackError is not a constructor`). In Cloudflare, set **`NODE_VERSION=20`**. On Windows with multiple installs, pick Node 20 in the installer or use **nvm-windows** / **fnm**: `nvm install 20.18.3` then `nvm use 20`.

Under **Build variables and secrets** (or your product’s equivalent), add:

| Variable | Value |
|----------|--------|
| `NODE_VERSION` | `20` |

**Recommended layout (simplest): point Cloudflare at `web/`**

| Field | Value |
|--------|--------|
| **Path / root directory** | `web` (not `/` — `/` is the monorepo root and skips the Next app) |
| **Build command** | `npm run cf:build` |
| **Deploy command** | `npx wrangler deploy` |

Workers Builds already runs **`npm ci`** before your build command, so you normally **do not** need a second `npm ci` in that field. The **`cf:build`** script runs OpenNext via **`node ./node_modules/@opennextjs/cloudflare/dist/cli/index.js build`** (not `npx opennextjs-cloudflare`), because **`npx`** on Linux/npm 10 can fail with *“could not determine executable to run”* for this CLI.

**If your dashboard does not auto-install deps:** use `npm ci && npm run cf:build`.

**Monorepo root path:** leave **Path** empty and use **Build:** `npm ci --prefix web && npm run cf:build --prefix web` and **Deploy:** `npx wrangler deploy --config web/wrangler.jsonc`.

### 3. Match the Worker name in the repo

In `web/wrangler.jsonc`, **`name`** and **`services[0].service`** must match the Worker **script name** Cloudflare uses (this repo defaults to `brandforge` for a project branded “BrandForge”). If the dashboard shows a different technical name, change both fields to match it exactly.

### 4. API URL (avoid `127.0.0.1` in the browser)

If the live site calls `http://127.0.0.1:3000/api/...`, every visitor’s browser tries **their own** machine — you get `ERR_CONNECTION_REFUSED`. Fix it with your **deployed Node API** URL.

Under **Build** variables (and, for server-side metadata fetches, **Worker** environment as well), set:

| Variable | Purpose |
|----------|---------|
| `API_PROXY_DESTINATION` | `https://your-node-api.example.com` — enables `/api/*` rewrites to that origin (same-origin in the browser, no CORS). |
| `NEXT_PUBLIC_API_URL` | Same HTTPS origin — inlined for OAuth (`getApiOrigin()`) and any direct client use. |
| `NEXT_PUBLIC_USE_API_PROXY` | Optional `1` — redundant if `API_PROXY_DESTINATION` or a remote `NEXT_PUBLIC_API_URL` already enables the proxy. |

**Cloudflare “Secret” vs build / 404 on `/api/*`:** External **`rewrites()` in `next.config.mjs` are not reliable on OpenNext Workers**. This repo uses **`web/src/middleware.ts`** to **`fetch`** each `/api/*` request to **`API_PROXY_DESTINATION` or `NEXT_PUBLIC_API_URL`**. Those must be set in **`web/wrangler.jsonc` → `vars`** (and match your Git build env) so both the middleware bundle and the Worker runtime see the Railway origin. Plaintext **`NEXT_PUBLIC_API_URL`** at build time is still required for client-inlined values. Avoid relying on Secrets-only for the proxy URL unless your pipeline injects them into the Worker **`vars`** equivalent.

Also set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` as needed. See `web/.env.example`.

### 5. Common mistake (wrong install size)

If the build log shows only **~38 npm packages** installed, Cloudflare is building from the **repository root** without using **`web/`** as the root directory (or without the root `cf:build` script). Then Wrangler has no Next app and may error with **“Could not detect a directory containing static files”**. Fix the **Root directory** and **Build command** as in step 2.

### 6. Local deploy: `.open-next/worker.js` not found

Deleting Workers/Pages in Cloudflare does **not** require a special GitHub change — CI still only needs a correct **build** (step 2) on the branch you connect.

If you run **`npx wrangler deploy`** from `web/` **without** running OpenNext first, Wrangler looks for **`web/.open-next/worker.js`**, which does not exist until a build runs. That produces:

`The entry-point file at ".open-next/worker.js" was not found`

**Fix (Node 20.x):** from `web/` either:

```bash
npm run cf:deploy
```

(which runs **`opennextjs-cloudflare build`** then **`opennextjs-cloudflare deploy`**), **or**:

```bash
npm run cf:build
npx wrangler deploy
```

Do **not** rely on `npx wrangler deploy` alone after a clean clone or `npm run clean` — there is no worker bundle yet.

After you create a **new** Worker in Cloudflare, set **`name`** and **`services[0].service`** in `web/wrangler.jsonc` to match the **new** worker’s script name in the dashboard, commit, and push so Git-based deploys stay in sync.

### Local checks (repo root)

- `npm run cf:build` — installs `web/` deps and runs OpenNext (same idea as root layout).
- `npm run cf:deploy` — build then `wrangler deploy` using `web/wrangler.jsonc`.

**Wrangler CLI vs dashboard vars:** A deploy from your laptop (`npm run cf:deploy` / `wrangler deploy`) uploads **`web/wrangler.jsonc`** and **overwrites** Worker variables you set only in the Cloudflare UI. Wrangler may warn that local config “differs from the remote configuration”. Keep **`vars`** in `wrangler.jsonc` aligned with production (see that file), or re-add dashboard vars after each CLI deploy. Prefer **Git-connected builds** for production if you want a single source of truth in the dashboard.

### Optional: Cloudflare Pages + `@cloudflare/next-on-pages`

This project is set up for **Workers + OpenNext**. If you switch to Pages, follow the [Cloudflare Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/) and do **not** point Pages at raw `.next` without an adapter.

## Node API (separate host)

The Node server (`server.js` at repo root) **does not run on Cloudflare Workers/Pages**. Deploy the **repository root** (not `web/`) on a Node host.

**Listen address:** In production, the server binds to **`0.0.0.0`** when `NODE_ENV=production` (or set **`HOST=0.0.0.0`** / **`LISTEN_HOST=0.0.0.0`**). Locally it still defaults to **`127.0.0.1`**.

**Install:** From the repo root, `npm ci` (root `package.json` + `package-lock.json` include the API’s runtime deps such as `@supabase/supabase-js`). **Start:** `npm start` → `node server.js`.

### Railway (Node API)

The repo includes **`railway.toml`** at the **root**: build runs **`npm ci`**, start runs **`npm start`**, and deploy health checks use **`GET /api/health`**. **Do not** set the service root to **`web/`** — that directory is only for Cloudflare.

1. [Railway dashboard](https://railway.app) → **New project** → **Deploy from GitHub** → **`mxstermindhq/BrandForge`** (or your fork).
2. Open the new service → **Settings**:
   - **Root directory:** leave **empty** (repository root). If Railway created the service with a subdirectory, clear it so `server.js` and `package.json` are at the root of what Railway builds.
   - **Build / Start:** should match `railway.toml` (`npm ci` / `npm start`). Override only if you know you need something else.
3. **Variables** (service → **Variables**): use the same names as **repo-root** `.env` (see **`.env.example`**). You can paste from a local `.env` with **Raw Editor** (never commit secrets). Full reference: **§ Railway variables** below.

   Minimum for a working app with auth + data:

   | Variable | Notes |
   |----------|--------|
   | `SUPABASE_URL` | |
   | `SUPABASE_ANON_KEY` | |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never put in `web/.env.local` |
   | `PUBLIC_WEB_ORIGIN` | Live Next URL (no trailing slash), e.g. `https://brandforge.mxstermind-com.workers.dev` |
   | `API_PUBLIC_ORIGIN` | This API’s public `https://…` base (see below) |

   After the first deploy, **Networking** → public domain → set **`API_PUBLIC_ORIGIN`** to that exact origin (e.g. `https://your-service.up.railway.app`, no trailing slash). Used for webhooks / absolute API URLs in responses.

4. Railway injects **`PORT`** and typically **`NODE_ENV=production`** — the API listens on **`0.0.0.0`** in production (see `server.js`). **Do not** set `PORT` yourself unless you know Railway’s layout.

#### Railway variables (reference)

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes* | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes* | Anon key (server uses it with service role flows) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Server-only DB/admin access |
| `SUPABASE_STATE_KEY` | No | Partition key for platform state (default `default`) |
| `PUBLIC_WEB_ORIGIN` | Yes* | Where the Next app is served (checkout redirects, links) |
| `API_PUBLIC_ORIGIN` | Yes* | Public base URL of **this** API (`https://…railway.app` or custom domain) |
| `NEXT_PUBLIC_APP_URL` | No | Alternative to `PUBLIC_WEB_ORIGIN` if you already use that name |

\*Required for full functionality; some routes degrade without Supabase.

| Variable | When to set |
|----------|-------------|
| `HOST` / `LISTEN_HOST` | Rarely; production already binds `0.0.0.0` when `NODE_ENV=production` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email |
| `NOWPAYMENTS_API_KEY` / `NOWPAYMENTS_SANDBOX` | Crypto invoices (`1` or `true` for sandbox) |
| `CRON_SECRET` | Protects `POST /api/cron/decay-*` |
| `AI_API_KEY`, `AI_PROVIDER`, `AI_MODEL` | Legacy single-provider AI |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_HTTP_REFERER`, `MISTRAL_API_KEY`, `TOGETHER_API_KEY`, `XAI_API_KEY`, `GEMINI_API_KEY` / `GOOGLE_AI_API_KEY` | AI features |
| `AI_OPENAI_BASE_URL`, `AI_IMAGE_KEY` | OpenAI-compatible base / image generation |
| `WEB_APP_ORIGIN` | Social OAuth callback base (else falls back to `PUBLIC_WEB_ORIGIN` / app URL) |
| `SOCIAL_OAUTH_STATE_SECRET` | OAuth state signing (else falls back to service role key — set a dedicated secret in prod) |
| `SOCIAL_LINKEDIN_CLIENT_ID` / `SOCIAL_LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth |
| `SOCIAL_X_CLIENT_ID` / `SOCIAL_X_CLIENT_SECRET` | X (Twitter) OAuth |

**Provided by Railway (normally leave unset):** `PORT`, `NODE_ENV`, and Railway’s own `RAILWAY_*` metadata.

**502 / “connection refused” from Railway:** the process must listen on **`0.0.0.0`**, not **`127.0.0.1`**. The server uses **`PORT`** when set (Railway injects it) and recognizes Railway via **`RAILWAY_PUBLIC_DOMAIN`**, **`RAILWAY_SERVICE_ID`**, etc. **Do not** set **`PORT=3000`** in Railway unless you also expose that port; prefer letting Railway assign **`PORT`** automatically. If logs still show `127.0.0.1`, redeploy after pulling the latest `server.js`. For other 502 causes, check deploy logs for a crash before `listen`.

**Cloudflare (not Railway):** `NEXT_PUBLIC_*`, `API_PROXY_DESTINATION`, and Worker build vars belong on the **frontend** Worker, not on this Node service.

5. **Cloudflare Worker:** set **`API_PROXY_DESTINATION`** and **`NEXT_PUBLIC_API_URL`** to the **same Railway HTTPS origin** as **`API_PUBLIC_ORIGIN`**, then redeploy the Worker (see **§ API URL** under frontend settings).

### Render / Fly.io / VPS

Same idea: **root directory = repo root**, **start = `npm start`**, env vars as above. On a VPS use **PM2** (or systemd) + **nginx/Caddy** TLS.

### After deploy

1. Point **`api.yourdomain.com`** (optional) at the Node service via DNS.
2. Set **`NEXT_PUBLIC_API_URL`** (and any proxy settings) on the **Cloudflare** frontend to that HTTPS API origin.
3. Webhooks must target this host, e.g. NOWPayments IPN → **`/api/nowpayments/ipn`**, Stripe → **`/api/stripe/webhook`** if used.

## Security headers

Security headers for static/Next assets are configured in `web/next.config.mjs`. API-specific CORS and auth remain in `server.js`.

## Search verification (optional)

- **Google:** set `verification.google` in `web/src/app/layout.tsx` metadata after Search Console gives you the content string.
- **Bing / Yandex:** Next.js typed `metadata.verification` only includes `google` in this project’s types. Add vendor meta tags via a small `other` map on `metadata` (e.g. `msvalidate.01` for Bing, `yandex-verification` for Yandex) or a dedicated `<head>` snippet once you have codes — see [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
