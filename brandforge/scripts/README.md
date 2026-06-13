# BrandForge scripts

Automation for audits, deploy gates, and the internal admin dashboard.

## Quick reference

| Script | npm alias | Purpose |
|--------|-----------|---------|
| `pre-deploy.mjs` | `npm run pre-deploy` | Full gate: build, lint, bundles, images, schema, fast Lighthouse |
| `pre-deploy.mjs --skip-lighthouse` | `npm run pre-deploy:quick` | Deploy gate without Lighthouse (used in `npm run deploy`) |
| `post-deploy.mjs` | `npm run post-deploy` | Verify production: sitemap, robots, llms, admin noindex, home LH |
| `weekly-report.mjs` | `npm run report:weekly` | Full perf audit + markdown report in `audit/weekly/` |
| `audit-perf-all.mjs` | `npm run audit:perf` | Mobile Lighthouse on all sitemap URLs |
| `audit-perf-all.mjs --fast` | `npm run audit:perf:fast` | Home + 5 random pages |
| `track-bundles.mjs` | `npm run audit:bundles` | JS/CSS weight per route → `audit/bundles/` |
| `audit-images.mjs` | `npm run audit:images` | Scan `public/img` for bloat |
| `validate-schema.mjs` | `npm run audit:schema` | JSON-LD checks on `out/` HTML |
| `check-links.mjs` | `npm run audit:links` | Crawl sitemap, find broken links |
| `generate-dashboard-data.mjs` | `npm run dashboard:data` | Build `public/admin/dashboard-data.json` |
| `notify-discord.mjs` | — | Webhook alerts (`DISCORD_WEBHOOK_URL`) |

## Admin dashboard

- **URL:** `/admin/` (robots: noindex)
- **Data:** `/admin/dashboard-data.json` (generated at build)
- **Auth (static export):**
  1. **Recommended:** Cloudflare Access policy on `/admin/*`
  2. **Fallback:** `NEXT_PUBLIC_BF_ADMIN_KEY` at build time (client gate — not secret-grade)
- **GA4 live data:** Set `NEXT_PUBLIC_LOOKER_STUDIO_URL` or populate `audit/ga4-snapshot.json`

## Environment variables

| Variable | Used by |
|----------|---------|
| `NEXT_PUBLIC_BF_ADMIN_KEY` | Admin client gate |
| `NEXT_PUBLIC_LOOKER_STUDIO_URL` | Looker iframe in dashboard |
| `DISCORD_WEBHOOK_URL` | Deploy / fail / weekly notifications |
| `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` | Cache purge on deploy |

## Pre-deploy thresholds

- Home mobile perf ≥ **70** (fast mode or cached `brandforge-perf-all.json`)
- No sample page &lt; **50**
- Content lint pass
- Build pass
- Schema validation pass
- Image audit pass (no files &gt; 200KB)

## Weekly cron (GitHub Actions example)

```yaml
# Monday 09:00 UTC
- run: cd brandforge && npm run report:weekly
```

## GA4 snapshot

Export top pages and conversions from GA4 Explore, save to `audit/ga4-snapshot.json`, rebuild. Future: GA4 Data API in CI with service account.

## A/B tests

Machine-readable registry: `audit/ab-tests.json`. Sync impressions/conversions from GA4 Explore (`ab_test_impression`, `ab_test_conversion`).
