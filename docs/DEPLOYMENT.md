# BrandForge deployment

## Frontend (Cloudflare Pages)

- Connect the GitHub repo and set the **root directory** to `web/`.
- **Build command:** `npm run build`
- **Build output:** `.next` (with `@cloudflare/next-on-pages` if you use the Cloudflare adapter — follow the adapter docs for the exact output mode).
- **Node version:** 20 (set `NODE_VERSION=20` in project environment variables).

Set all production secrets from `.env.example` / `web/.env.example` in the Cloudflare dashboard (Production). In particular:

- `NEXT_PUBLIC_API_URL` — your public Node API origin (e.g. `https://api.brandforge.gg`)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase client config
- `NEXT_PUBLIC_USE_API_PROXY=1` if the browser should call same-origin `/api/*` and you configure rewrites to the API

## Node API (separate host)

The Node server (`server.js` at repo root) **does not run on Cloudflare Pages**. Run it on a Node-capable host:

- **Railway** — connect repo, set start command `npm start` (or your process manager), root `/`
- **Render** — Web service, same layout
- **VPS** — PM2 + reverse proxy (nginx/Caddy)

After deploy:

1. Point `api.brandforge.gg` (or your chosen hostname) at the Node service via DNS (Cloudflare proxy optional).
2. Set `NEXT_PUBLIC_API_URL` on Cloudflare Pages to that HTTPS origin.
3. Configure webhooks to hit the Node host:
   - NOWPayments IPN → `/api/nowpayments/ipn` (or your documented path)
   - Stripe → `/api/stripe/webhook` (if used)

## Security headers

Security headers for static/Next assets are configured in `web/next.config.mjs`. API-specific CORS and auth remain in `server.js`.

## Search verification (optional)

- **Google:** set `verification.google` in `web/src/app/layout.tsx` metadata after Search Console gives you the content string.
- **Bing / Yandex:** Next.js 14’s typed `metadata.verification` only includes `google` in this project’s types. Add vendor meta tags via a small `other` map on `metadata` (e.g. `msvalidate.01` for Bing, `yandex-verification` for Yandex) or a dedicated `<head>` snippet once you have codes — see [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).
