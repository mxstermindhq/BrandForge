# Sprint 6 — Analytics Dashboard & Automated Reporting

**Goal:** Internal dashboard with real-time trends, zero manual audit work, automated weekly reports.

## Admin dashboard

- **URL:** https://brandforge.gg/admin/
- **Auth:** Cloudflare Access (recommended) or `NEXT_PUBLIC_BF_ADMIN_KEY`
- **Data source:** `public/admin/dashboard-data.json` (regenerated every build)

## Run audits

```bash
cd brandforge
npm run pre-deploy          # full gate
npm run post-deploy         # verify production
npm run report:weekly       # Monday report → audit/weekly/YYYY-MM-DD.md
npm run audit:perf:fast     # quick Lighthouse sample
```

## Acceptance checklist

- [ ] `/admin/` loads with Lighthouse trends, content inventory, A/B tests
- [ ] GA4 via Looker iframe or `audit/ga4-snapshot.json`
- [ ] `npm run pre-deploy` blocks bad builds
- [ ] `npm run post-deploy` verifies production
- [ ] Weekly report in `audit/weekly/`
- [ ] Bundle + image audits on every build
- [ ] Discord webhook optional (`DISCORD_WEBHOOK_URL`)

See `brandforge/scripts/README.md` for full script reference.
