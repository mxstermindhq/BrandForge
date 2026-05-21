# Directory operations

## Apply Supabase migrations

Run in Supabase SQL editor or via CLI:

1. `supabase/migrations/20260518_curated_operators.sql`
2. `supabase/migrations/20260518_landing_interest_submissions.sql`
3. `supabase/migrations/20260519_seed_curated_operators.sql`
4. `supabase/migrations/20260519_directory_events.sql`

## Seed operators (alternative to SQL seed)

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role \
node scripts/seed-curated-operators.mjs
```

## Interest notifications

Set `INTEREST_DISCORD_WEBHOOK_URL` on the Cloudflare Worker / Next runtime (not public) to ping Discord when someone submits the homepage form.

## Analytics

Events POST to `/api/events` and store in `directory_events` when the migration is applied. Allowed events: `page_view`, `cta_click`, `search_open`, `search_select`, `interest_submit`.
