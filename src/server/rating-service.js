/**
 * Competitive RP, tiers, leaderboard assembly (service-role Supabase client).
 */

async function enforceUndisputedCap(client) {
  try {
    const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { count, error: cErr } = await client
      .from('user_ratings')
      .select('user_id', { count: 'exact', head: true })
      .gte('last_deal_at', thirtyAgo);
    if (cErr) return;
    const au = Math.max(Number(count) || 0, 1);
    const maxU = Math.max(1, Math.floor(au * 0.01));
    const { data: undisputed, error } = await client
      .from('user_ratings')
      .select('user_id, current_rp')
      .eq('current_tier', 'undisputed')
      .order('current_rp', { ascending: true });
    if (error) return;
    const list = undisputed || [];
    if (list.length <= maxU) return;
    const toDemote = list.slice(0, list.length - maxU);
    const now = new Date().toISOString();
    for (const u of toDemote) {
      await client
        .from('user_ratings')
        .update({ current_tier: 'gladiator', updated_at: now })
        .eq('user_id', u.user_id);
    }
  } catch (e) {
    console.warn('[rating] enforceUndisputedCap:', e.message);
  }
}

function createRatingService(client) {
  if (!client) return null;

  async function processDealWin(userId, dealValue, reviewScore, deliveredEarly) {
    try {
      const uid = String(userId || '').trim();
      if (!uid) return;
      const dv = Number(dealValue);
      const rs = reviewScore != null && Number.isFinite(Number(reviewScore)) ? Number(reviewScore) : null;
      const base = Math.min((Number.isFinite(dv) ? dv * 0.01 : 0) + 50, 300);
      const quality = rs != null ? (rs / 5) * 2 : 1.0;
      const { data: row } = await client.from('user_ratings').select('*').eq('user_id', uid).maybeSingle();
      const streak = row?.win_streak != null ? Number(row.win_streak) : 0;
      const streakMult = Math.min(1.0 + streak * 0.15, 2.5);
      const speed = deliveredEarly ? 1.2 : 1.0;
      const rpAdd = Math.floor(base * quality * streakMult * speed);
      const prevRp = row?.current_rp != null ? Number(row.current_rp) : 0;
      const nextRp = Math.max(0, prevRp + rpAdd);
      const nextStreak = streak + 1;
      const bestStreak = Math.max(nextStreak, Number(row?.best_win_streak) || 0);
      const weeklyDeals = (Number(row?.weekly_deals_closed) || 0) + 1;
      const peak = Math.max(nextRp, Number(row?.peak_rp_season) || 0);
      const dealWins = (Number(row?.deal_wins) || 0) + 1;
      const now = new Date().toISOString();

      await client.from('user_ratings').upsert(
        {
          user_id: uid,
          current_rp: nextRp,
          peak_rp_season: peak,
          win_streak: nextStreak,
          best_win_streak: bestStreak,
          weekly_deals_closed: weeklyDeals,
          last_deal_at: now,
          deal_wins: dealWins,
          current_tier: row?.current_tier || 'challenger',
          tier_achieved_at: row?.tier_achieved_at || null,
          deal_losses: Number(row?.deal_losses) || 0,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      );

      const { error: te } = await client.rpc('update_user_tier', { p_user_id: uid });
      if (te) console.warn('[rating] update_user_tier:', te.message);
      await enforceUndisputedCap(client);
    } catch (e) {
      console.warn('[rating] processDealWin:', e.message);
    }
  }

  async function processActivity(userId, activityType) {
    try {
      const uid = String(userId || '').trim();
      if (!uid) return;
      let delta = 0;
      if (activityType === 'bid_placed') delta = 25;
      else if (activityType === 'listing_published') delta = 50;
      else if (activityType === 'message_sent') delta = 5;
      else return;

      const { data: row } = await client.from('user_ratings').select('*').eq('user_id', uid).maybeSingle();
      const today = new Date().toISOString().slice(0, 10);
      let msgToday = Number(row?.message_rp_today) || 0;
      let msgDay = row?.message_rp_day || null;

      if (activityType === 'message_sent') {
        if (msgDay !== today) {
          msgToday = 0;
          msgDay = today;
        }
        const room = 50 - msgToday;
        if (room <= 0) return;
        delta = Math.min(delta, room);
        msgToday += delta;
      }

      const prevRp = row?.current_rp != null ? Number(row.current_rp) : 0;
      const nextRp = Math.max(0, prevRp + delta);
      const now = new Date().toISOString();

      const patch = {
        user_id: uid,
        current_rp: nextRp,
        peak_rp_season: Math.max(nextRp, Number(row?.peak_rp_season) || 0),
        win_streak: Number(row?.win_streak) || 0,
        best_win_streak: Number(row?.best_win_streak) || 0,
        weekly_deals_closed: Number(row?.weekly_deals_closed) || 0,
        last_deal_at: row?.last_deal_at || null,
        deal_wins: Number(row?.deal_wins) || 0,
        deal_losses: Number(row?.deal_losses) || 0,
        current_tier: row?.current_tier || 'challenger',
        tier_achieved_at: row?.tier_achieved_at || null,
        decay_shield_until: row?.decay_shield_until || null,
        rp_decay_week: row?.rp_decay_week || null,
        updated_at: now,
      };
      if (activityType === 'message_sent') {
        patch.message_rp_day = msgDay;
        patch.message_rp_today = msgToday;
      }

      await client.from('user_ratings').upsert(patch, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('[rating] processActivity:', e.message);
    }
  }

  async function processLoss(userId, lossType) {
    try {
      const uid = String(userId || '').trim();
      if (!uid) return;
      const penal = lossType === 'dispute_lost' ? 100 : lossType === 'deal_cancelled' ? 50 : 0;
      if (!penal) return;
      const { data: row } = await client.from('user_ratings').select('*').eq('user_id', uid).maybeSingle();
      const tier = row?.current_tier || 'challenger';
      const { data: floorVal, error: fe } = await client.rpc('tier_floor_rp', { p_tier: String(tier) });
      if (fe) console.warn('[rating] tier_floor_rp:', fe.message);
      const floor = Number(floorVal) || 0;
      const prevRp = Number(row?.current_rp) || 0;
      const nextRp = Math.max(floor, prevRp - penal);
      const now = new Date().toISOString();
      await client.from('user_ratings').upsert(
        {
          user_id: uid,
          current_rp: nextRp,
          peak_rp_season: Math.max(nextRp, Number(row?.peak_rp_season) || 0),
          win_streak: 0,
          deal_losses: (Number(row?.deal_losses) || 0) + 1,
          deal_wins: Number(row?.deal_wins) || 0,
          weekly_deals_closed: Number(row?.weekly_deals_closed) || 0,
          last_deal_at: row?.last_deal_at || null,
          current_tier: row?.current_tier || 'challenger',
          tier_achieved_at: row?.tier_achieved_at || null,
          best_win_streak: Number(row?.best_win_streak) || 0,
          decay_shield_until: row?.decay_shield_until || null,
          rp_decay_week: row?.rp_decay_week || null,
          message_rp_day: row?.message_rp_day || null,
          message_rp_today: Number(row?.message_rp_today) || 0,
          updated_at: now,
        },
        { onConflict: 'user_id' },
      );
      const { error: te } = await client.rpc('update_user_tier', { p_user_id: uid });
      if (te) console.warn('[rating] update_user_tier:', te.message);
    } catch (e) {
      console.warn('[rating] processLoss:', e.message);
    }
  }

  async function applyWeeklyRPDecay() {
    try {
      const { data, error } = await client.rpc('apply_rp_decay');
      if (error) {
        console.warn('[rating] applyWeeklyRPDecay:', error.message);
        return 0;
      }
      return Number(data) || 0;
    } catch (e) {
      console.warn('[rating] applyWeeklyRPDecay:', e.message);
      return 0;
    }
  }

  async function getCurrentSeason() {
    const { data, error } = await client
      .from('seasons')
      .select('*')
      .eq('status', 'active')
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn('[rating] getCurrentSeason:', error.message);
      return null;
    }
    return data;
  }

  async function getLeaderboard(type, limit) {
    const season = await getCurrentSeason();

    function chunkIds(arr, size) {
      const out = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    }

    async function fetchAllProfiles() {
      const pageSize = 1000;
      let from = 0;
      const all = [];
      const selectFull = 'id, username, full_name, avatar_url, is_verified, top_member';
      const selectNoTop = 'id, username, full_name, avatar_url, is_verified';
      let useTopMember = true;
      for (;;) {
        const sel = useTopMember ? selectFull : selectNoTop;
        const { data, error } = await client
          .from('profiles')
          .select(sel)
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) {
          if (useTopMember && String(error.message || '').includes('top_member')) {
            useTopMember = false;
            from = 0;
            all.length = 0;
            continue;
          }
          console.warn('[rating] getLeaderboard profiles:', error.message);
          return [];
        }
        if (!data?.length) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    }

    try {
      const profRows = await fetchAllProfiles();
      if (!profRows.length) return { entries: [], season };

      const ids = profRows.map((p) => p.id).filter(Boolean);
      const ucM = new Map();
      const urM = new Map();
      for (const chunk of chunkIds(ids, 500)) {
        const [{ data: ucRows }, { data: urRows }] = await Promise.all([
          client.from('user_currencies').select('*').in('user_id', chunk),
          client.from('user_ratings').select('*').in('user_id', chunk),
        ]);
        (ucRows || []).forEach((r) => {
          if (r.user_id) ucM.set(r.user_id, r);
        });
        (urRows || []).forEach((r) => {
          if (r.user_id) urM.set(r.user_id, r);
        });
      }

      const scored = profRows.map((p) => {
        const id = p.id;
        const uc = ucM.get(id) || {};
        const ur = urM.get(id) || {};
        const honor = Number(uc.honor_points) || 0;
        const conq = Number(uc.conquest_points) || 0;
        const neon = honor + conq * 10;
        const streak = Number(ur.win_streak) || 0;
        let sortKey = neon;
        if (type === 'honor') sortKey = honor;
        else if (type === 'conquest') sortKey = conq;
        else if (type === 'streak') sortKey = streak;
        return { p, uc, ur, honor, conq, neon, streak, sortKey };
      });

      scored.sort((a, b) => {
        if (b.sortKey !== a.sortKey) return b.sortKey - a.sortKey;
        return String(a.p.id).localeCompare(String(b.p.id));
      });

      const n = Number(limit);
      const maxCap = 500000;
      const sliced =
        !Number.isFinite(n) || n <= 0 ? scored : scored.slice(0, Math.min(maxCap, Math.max(1, n)));

      const entries = sliced.map((row, idx) => {
        const { p, ur, honor, conq } = row;
        const id = p.id;
        const w = Number(ur.deal_wins) || 0;
        const l = Number(ur.deal_losses) || 0;
        const winRate = w + l > 0 ? Math.round((w / (w + l)) * 1000) / 10 : 0;
        return {
          rank: idx + 1,
          userId: id,
          username: p.username || null,
          displayName: p.full_name || p.username || 'Member',
          avatarUrl: p.avatar_url || null,
          isVerified: Boolean(p.is_verified),
          topMember: Boolean(p.top_member ?? false),
          currentRp: Number(ur.current_rp) || 0,
          peakRp: Number(ur.peak_rp_season) || 0,
          currentTier: ur.current_tier || 'challenger',
          winStreak: Number(ur.win_streak) || 0,
          honor,
          conquest: conq,
          neonScore: honor + conq * 10,
          weeklyDeals: Number(ur.weekly_deals_closed) || 0,
          winRate,
          dealWins: w,
          dealLosses: l,
        };
      });

      return { entries, season };
    } catch (e) {
      console.warn('[rating] getLeaderboard:', e.message);
      return { entries: [], season };
    }
  }

  async function updateUserTier(userId) {
    const uid = String(userId || '').trim();
    if (!uid) return;
    const { error } = await client.rpc('update_user_tier', { p_user_id: uid });
    if (error) throw new Error(error.message);
    await enforceUndisputedCap(client);
  }

  async function getUserRating(userId) {
    const uid = String(userId || '').trim();
    if (!uid) return null;
    const [{ data: ur }, { data: uc }] = await Promise.all([
      client.from('user_ratings').select('*').eq('user_id', uid).maybeSingle(),
      client.from('user_currencies').select('*').eq('user_id', uid).maybeSingle(),
    ]);
    const honor = Number(uc?.honor_points) || 0;
    const conq = Number(uc?.conquest_points) || 0;
    const w = Number(ur?.deal_wins) || 0;
    const l = Number(ur?.deal_losses) || 0;
    return {
      ...(ur || {}),
      neonScore: honor + conq * 10,
      honor,
      conquest: conq,
      winRate: w + l > 0 ? Math.round((w / (w + l)) * 1000) / 10 : 0,
    };
  }

  return {
    processDealWin,
    processActivity,
    processLoss,
    applyWeeklyRPDecay,
    getLeaderboard,
    updateUserTier,
    getUserRating,
    getCurrentSeason,
  };
}

module.exports = { createRatingService };
