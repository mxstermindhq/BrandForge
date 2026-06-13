# Sprint 5 — Performance Polish & AI-Scale Expansion

**Goal:** Home mobile Lighthouse 60 → 85, AI discoverability maxed, edge optimization.

## Run final audit

```bash
cd brandforge
npm run build
npx serve out -l 3002   # optional local preview
node scripts/lighthouse-sprint5.mjs --fresh --local
# Production (post-deploy):
node scripts/lighthouse-sprint5.mjs --fresh
```

Results: `audit/sprint-5/perf-final.json`

## Acceptance checklist

- [ ] Home mobile perf ≥ 85
- [ ] Site-wide average ≥ 85
- [ ] LCP < 2.5s, TBT < 200ms on home
- [ ] AVIF via `<picture>` on portfolio/hero images
- [ ] Critical CSS inlined on home
- [ ] Fonts subset (weights trimmed) + preload
- [ ] `_headers` cache rules live
- [ ] `llms.txt` rich summaries
- [ ] Service / Product / Review / HowTo schema
- [ ] `/partners/`, `/store/`, lead magnet downloads
- [ ] Portfolio before/after + video thumbnails (lazy)

## Deploy

```bash
cd brandforge && npm run deploy
```

Set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` to auto-purge cache on deploy.
