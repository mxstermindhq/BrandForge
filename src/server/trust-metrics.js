/**
 * Real trust metrics from marketplace_orders, reviews, and listing_views.
 * Never returns fabricated values — null/omitted when insufficient data.
 */

function round1(n) {
  return Math.round(n * 10) / 10;
}

function avg(nums) {
  const v = nums.filter((x) => Number.isFinite(x));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function createTrustMetrics(client) {
  if (!client) {
    return {
      getProfileTrust: async () => null,
      getListingTrust: async () => null,
      getProfileCompletion: async () => null,
    };
  }

  async function getProfileTrust(profileId) {
    const id = String(profileId || '').trim();
    if (!id) return null;

    const { data: profile } = await client
      .from('profiles')
      .select('id, username, created_at, avatar_url, bio, skills, is_verified, social_links')
      .eq('id', id)
      .maybeSingle();
    if (!profile) return null;

    const { data: sellerOrders } = await client
      .from('marketplace_orders')
      .select('id, buyer_id, status, amount_usd, paid_at, completed_at, created_at, delivered_at')
      .eq('seller_id', id);

    const orders = sellerOrders || [];
    const completed = orders.filter((o) => o.status === 'completed');
    const paidLike = orders.filter((o) =>
      ['paid', 'in_progress', 'delivered', 'revision_requested', 'completed'].includes(o.status),
    );

    const buyerIds = [...new Set(paidLike.map((o) => o.buyer_id).filter(Boolean))];
    let repeatBuyers = 0;
    if (buyerIds.length) {
      for (const bid of buyerIds) {
        const count = paidLike.filter((o) => o.buyer_id === bid).length;
        if (count > 1) repeatBuyers += 1;
      }
    }

    const { data: reviews } = await client
      .from('marketplace_order_reviews')
      .select('rating, delivery_score, communication_score, value_score, created_at')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false })
      .limit(200);

    const revs = reviews || [];
    const reviewCount = revs.length;
    const averageRating = reviewCount ? round1(avg(revs.map((r) => Number(r.rating)))) : null;

    const completedOrders = completed.length;
    const totalOrders = paidLike.length;
    const completionRate =
      totalOrders > 0 ? round1((completedOrders / totalOrders) * 100) : null;

    const deliveryHours = completed
      .map((o) => {
        const start = o.paid_at || o.created_at;
        const end = o.completed_at || o.delivered_at;
        if (!start || !end) return null;
        return (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
      })
      .filter((h) => h != null && h >= 0);
    const avgDeliveryHours = deliveryHours.length ? round1(avg(deliveryHours)) : null;

    const totalRevenue = paidLike.reduce((s, o) => s + Number(o.amount_usd || 0), 0);

    const { count: activeListings } = await client
      .from('service_packages')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', id)
      .eq('status', 'published');

    const { count: portfolioCount } = await client
      .from('portfolios')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', id)
      .eq('status', 'published');

    const social = Array.isArray(profile.social_links) ? profile.social_links : [];
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    let completionScore = 0;
    if (profile.avatar_url) completionScore += 15;
    if (profile.bio && String(profile.bio).trim().length >= 40) completionScore += 20;
    if (skills.length >= 3) completionScore += 15;
    if (social.length > 0) completionScore += 10;
    if ((portfolioCount || 0) > 0) completionScore += 20;
    if ((activeListings || 0) > 0) completionScore += 20;

    const out = {
      completedOrders: completedOrders || null,
      totalRevenueUsd: totalRevenue > 0 ? round1(totalRevenue) : null,
      repeatBuyers: repeatBuyers > 0 ? repeatBuyers : null,
      reviewCount: reviewCount > 0 ? reviewCount : null,
      averageRating,
      completionRate,
      avgDeliveryHours,
      activeListings: activeListings || null,
      joinedAt: profile.created_at,
      isVerified: Boolean(profile.is_verified),
      profileCompletionPercent: completionScore,
      responseRate: null,
    };

    return Object.fromEntries(Object.entries(out).filter(([, v]) => v != null));
  }

  async function getListingTrust(listingId, listingType = 'db') {
    const id = String(listingId || '').trim();
    if (!id) return null;

    let views = 0;
    try {
      const { count } = await client
        .from('listing_views')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', id);
      views = Number(count) || 0;
    } catch {
      views = 0;
    }

    let saves = 0;
    try {
      const { count } = await client
        .from('saved_listings')
        .select('listing_id', { count: 'exact', head: true })
        .eq('listing_id', id);
      saves = Number(count) || 0;
    } catch {
      saves = 0;
    }

    const orderQuery = client
      .from('marketplace_orders')
      .select('id, buyer_id, status, amount_usd')
      .in('status', ['paid', 'in_progress', 'delivered', 'revision_requested', 'completed']);

    const { data: orders } =
      listingType === 'official'
        ? await orderQuery.eq('listing_slug', id)
        : await orderQuery.eq('listing_id', id);

    const paid = orders || [];
    const purchases = paid.length;
    const conversionRate = views > 0 && purchases > 0 ? round1((purchases / views) * 100) : null;

    const buyerIds = [...new Set(paid.map((o) => o.buyer_id).filter(Boolean))];
    let repeatBuyerPct = null;
    if (buyerIds.length > 0) {
      const repeat = buyerIds.filter((bid) => paid.filter((o) => o.buyer_id === bid).length > 1).length;
      repeatBuyerPct = round1((repeat / buyerIds.length) * 100);
    }

    let averageRating = null;
    if (listingType === 'db') {
      const { data: revs } = await client
        .from('marketplace_order_reviews')
        .select('rating')
        .eq('listing_id', id);
      if (revs?.length) averageRating = round1(avg(revs.map((r) => Number(r.rating))));
    }

    const out = {
      views: views > 0 ? views : null,
      saves: saves > 0 ? saves : null,
      purchases: purchases > 0 ? purchases : null,
      conversionRate,
      repeatBuyerPct: repeatBuyerPct != null && repeatBuyerPct > 0 ? repeatBuyerPct : null,
      averageRating,
    };
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v != null));
  }

  return {
    getProfileTrust,
    getListingTrust,
  };
}

module.exports = { createTrustMetrics };
