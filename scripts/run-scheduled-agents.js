/**
 * Lists due agent_infra_deployments (next_run_at <= now). Wire LLM/domain handlers next.
 * Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/run-scheduled-agents.js
 * GitHub Actions: set repository secrets SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[agent-infra] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('agent_infra_deployments')
    .select('id, template_id, agency_id, client_id, next_run_at, status, monthly_price')
    .lte('next_run_at', now)
    .eq('status', 'active')
    .limit(100);

  if (error) {
    console.error('[agent-infra]', error.message);
    process.exit(1);
  }
  const rows = data || [];
  console.log(`[agent-infra] due deployments: ${rows.length}`);
  for (const d of rows) {
    console.log(`  - ${d.id} agency=${d.agency_id} next_run_at=${d.next_run_at}`);
  }
  if (process.env.AGENT_INFRA_DRY_RUN === '1') {
    console.log('[agent-infra] AGENT_INFRA_DRY_RUN=1 — skipping execution');
    return;
  }
  // TODO: invoke category handlers (SEO/content/ads) + insert agent_infra_execution_runs
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
