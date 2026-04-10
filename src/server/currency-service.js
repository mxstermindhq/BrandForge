/**
 * Honor / Conquest balances and privilege purchases (service-role Supabase client).
 * Awards never throw; spend throws so the API can return errors.
 */

function createCurrencyService(client) {
  if (!client) {
    return null;
  }

  async function awardHonor(userId, amount, actionType, referenceType, referenceId, metadata = {}) {
    try {
      const uid = String(userId || '').trim();
      const n = Math.floor(Number(amount));
      if (!uid || !Number.isFinite(n) || n <= 0) return;
      const { error } = await client.rpc('increment_currency', {
        p_user_id: uid,
        p_currency_type: 'honor',
        p_amount: n,
        p_action_type: actionType,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
        p_metadata: metadata && typeof metadata === 'object' ? metadata : {},
      });
      if (error) console.warn('[currency] awardHonor:', error.message);
    } catch (e) {
      console.warn('[currency] awardHonor:', e.message);
    }
  }

  async function awardConquest(userId, amount, actionType, referenceType, referenceId, metadata = {}) {
    try {
      const uid = String(userId || '').trim();
      const n = Math.floor(Number(amount));
      if (!uid || !Number.isFinite(n) || n <= 0) return;
      const { error } = await client.rpc('increment_currency', {
        p_user_id: uid,
        p_currency_type: 'conquest',
        p_amount: n,
        p_action_type: actionType,
        p_reference_type: referenceType || null,
        p_reference_id: referenceId || null,
        p_metadata: metadata && typeof metadata === 'object' ? metadata : {},
      });
      if (error) console.warn('[currency] awardConquest:', error.message);
    } catch (e) {
      console.warn('[currency] awardConquest:', e.message);
    }
  }

  /**
   * Atomic purchase via RPC (ledger + user_privileges).
   */
  async function spendCurrency(userId, privilegeSlug) {
    const uid = String(userId || '').trim();
    const slug = String(privilegeSlug || '').trim();
    if (!uid) throw new Error('User id is required');
    if (!slug) throw new Error('Privilege slug is required');
    const { data, error } = await client.rpc('purchase_privilege', {
      p_user_id: uid,
      p_slug: slug,
    });
    if (error) {
      const msg = error.message || '';
      if (msg.includes('insufficient_honor')) throw new Error('Not enough Honor.');
      if (msg.includes('insufficient_conquest')) throw new Error('Not enough Conquest.');
      if (msg.includes('privilege_not_found')) throw new Error('Privilege not found.');
      throw new Error(msg || 'Purchase failed');
    }
    const cur = await getUserCurrency(uid);
    return { ok: true, balances: cur, rpc: data };
  }

  async function applyWeeklyHonorDecay() {
    try {
      const { data, error } = await client.rpc('apply_honor_decay', { p_decay_rate: 0.05 });
      if (error) {
        console.warn('[currency] applyWeeklyHonorDecay:', error.message);
        return 0;
      }
      return Number(data) || 0;
    } catch (e) {
      console.warn('[currency] applyWeeklyHonorDecay:', e.message);
      return 0;
    }
  }

  async function getUserCurrency(userId) {
    const uid = String(userId || '').trim();
    if (!uid) return null;
    const { data, error } = await client.from('user_currencies').select('*').eq('user_id', uid).maybeSingle();
    if (error) {
      console.warn('[currency] getUserCurrency:', error.message);
      return null;
    }
    if (!data) {
      return {
        honor_points: 0,
        conquest_points: 0,
        total_honor_earned: 0,
        total_conquest_earned: 0,
      };
    }
    return {
      honor_points: Number(data.honor_points) || 0,
      conquest_points: Number(data.conquest_points) || 0,
      total_honor_earned: Number(data.total_honor_earned) || 0,
      total_conquest_earned: Number(data.total_conquest_earned) || 0,
    };
  }

  async function getUserLedger(userId, currencyType, limit = 50, offset = 0) {
    const uid = String(userId || '').trim();
    if (!uid) return { rows: [], total: 0 };
    let q = client.from('currency_ledger').select('*', { count: 'exact' }).eq('user_id', uid);
    if (currencyType === 'honor' || currencyType === 'conquest') {
      q = q.eq('currency_type', currencyType);
    }
    const lim = Math.min(200, Math.max(1, Number(limit) || 50));
    const off = Math.max(0, Number(offset) || 0);
    const { data, error, count } = await q.order('created_at', { ascending: false }).range(off, off + lim - 1);
    if (error) {
      console.warn('[currency] getUserLedger:', error.message);
      return { rows: [], total: 0 };
    }
    return { rows: data || [], total: count ?? 0 };
  }

  async function getPrivilegeCatalog() {
    const { data, error } = await client
      .from('privilege_catalog')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      console.warn('[currency] getPrivilegeCatalog:', error.message);
      return [];
    }
    return data || [];
  }

  async function getUserPrivileges(userId) {
    const uid = String(userId || '').trim();
    if (!uid) return [];
    const { data, error } = await client
      .from('user_privileges')
      .select('*')
      .eq('user_id', uid)
      .order('granted_at', { ascending: false });
    if (error) {
      console.warn('[currency] getUserPrivileges:', error.message);
      return [];
    }
    const now = Date.now();
    return (data || []).filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now);
  }

  return {
    awardHonor,
    awardConquest,
    spendCurrency,
    applyWeeklyHonorDecay,
    getUserCurrency,
    getUserLedger,
    getPrivilegeCatalog,
    getUserPrivileges,
  };
}

module.exports = { createCurrencyService };
