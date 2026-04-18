const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');

/**
 * Agency AI agent marketplace (tables agent_infra_*).
 * Does not touch public.agent_runs (project / Studio runs).
 */
function createAgentInfraRepository() {
  const env = getEnv();
  const hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
  const client = hasSupabase
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  async function listMarketplace({ category = 'all', limit = 24, offset = 0 } = {}) {
    if (!client) return [];
    const lim = Math.min(Math.max(Number(limit) || 24, 1), 100);
    const off = Math.max(Number(offset) || 0, 0);
    let q = client
      .from('agent_infra_templates')
      .select(
        'id, name, description, category, icon, price_monthly, sales_count, avg_roi_generated, rating, agency_id, is_platform_template, created_at',
      )
      .eq('is_public', true)
      .order('sales_count', { ascending: false })
      .range(off, off + lim - 1);
    if (category && category !== 'all') {
      q = q.eq('category', String(category));
    }
    const { data: rows, error } = await q;
    if (error) {
      console.warn('[agent-infra marketplace]', error.message);
      return [];
    }
    const list = rows || [];
    const agencyIds = [...new Set(list.map((r) => r.agency_id).filter(Boolean))];
    let profileById = new Map();
    let tierByUserId = new Map();
    if (agencyIds.length) {
      const { data: profs } = await client
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', agencyIds);
      (profs || []).forEach((p) => profileById.set(p.id, p));
      const ratRes = await client
        .from('user_ratings')
        .select('user_id, current_tier')
        .in('user_id', agencyIds);
      if (!ratRes.error) {
        (ratRes.data || []).forEach((r) => tierByUserId.set(r.user_id, r.current_tier));
      }
    }
    return list.map((t) => {
      const pid = t.agency_id;
      const prof = pid ? profileById.get(pid) : null;
      const displayName = prof?.full_name?.trim() || prof?.username || 'BrandForge';
      const username = prof?.username || null;
      const avatarUrl = prof?.avatar_url || null;
      const tier = t.is_platform_template
        ? 'undisputed'
        : pid
          ? String(tierByUserId.get(pid) || 'challenger').toLowerCase()
          : 'challenger';
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        icon: t.icon || 'smart_toy',
        price_monthly: Number(t.price_monthly) || 0,
        sales_count: Number(t.sales_count) || 0,
        avg_roi_generated: Number(t.avg_roi_generated) || 0,
        rating: t.rating != null ? Number(t.rating) : 5,
        agency: {
          username: username || 'brandforge',
          display_name: t.is_platform_template ? 'BrandForge' : displayName,
          avatar_url: avatarUrl,
          current_tier: tier,
        },
      };
    });
  }

  return { client, listMarketplace };
}

module.exports = { createAgentInfraRepository };
