/**
 * Real trust metrics — thresholds enforced server-side. No synthetic scores.
 */

const MIN_COMPLETED_ORDERS = 3;
const MIN_REVIEWS_FOR_RATING = 3;
const MIN_LISTING_PURCHASES = 3;
const MIN_REPEAT_BUYERS = 2;

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
    };
  }

  async function getProfileTrust(profileId) {
    const id = String(profileId || '').trim();
    if (!id) return null;

    const { data: profile } = await client
      .from('profiles')
      .select('id, created_at, is_verified')
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
      ['paid', 'in_progress', 'delivered', 'revision_requested', 'completed', 'disputed'].includes(
        o.status,
      ),
    );

    const buyerIds = [...new Set(paidLike.map((o) => o.buyer_id).filter(Boolean))];
    let repeatBuyers = 0;
    for (const bid of buyerIds) {
      if (paidLike.filter((o) => o.buyer_id === bid).length > 1) repeatBuyers += 1;
    }

    const { data: reviews } = await client
      .from('marketplace_order_reviews')
      .select('rating, created_at')
      .eq('reviewee_id', id)
      .order('created_at', { ascending: false })
      .limit(200);

    const revs = reviews || [];
    const reviewCount = revs.length;
    const averageRating =
      reviewCount >= MIN_REVIEWS_FOR_RATING ? round1(avg(revs.map((r) => Number(r.rating)))) : null;

    const completedOrders = completed.length;
    const totalRevenue = paidLike.reduce((s, o) => s + Number(o.amount_usd || 0), 0);

    const deliveryHours = completed
      .map((o) => {
        const start = o.paid_at || o.created_at;
        const end = o.completed_at || o.delivered_at;
        if (!start || !end) return null;
        return (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
      })
      .filter((h) => h != null && h >= 0);
    const avgDeliveryHours =
      completedOrders >= MIN_COMPLETED_ORDERS && deliveryHours.length
        ? round1(avg(deliveryHours))
        : null;

    const { count: activeListings } = await client
      .from('service_packages')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', id)
      .eq('status', 'published');

    const out = {};

    if (profile.created_at) out.joinedAt = profile.created_at;
    if (totalRevenue > 0) out.totalRevenueUsd = round1(totalRevenue);
    if (activeListings > 0) out.activeListings = activeListings;
    if (completedOrders >= MIN_COMPLETED_ORDERS) out.completedOrders = completedOrders;
    if (reviewCount >= MIN_REVIEWS_FOR_RATING) out.reviewCount = reviewCount;
    if (averageRating != null) out.averageRating = averageRating;
    if (repeatBuyers >= MIN_REPEAT_BUYERS) out.repeatBuyers = repeatBuyers;
    if (avgDeliveryHours != null) out.avgDeliveryHours = avgDeliveryHours;
    if (
      profile.is_verified &&
      (completedOrders >= MIN_COMPLETED_ORDERS || reviewCount >= MIN_REVIEWS_FOR_RATING)
    ) {
      out.isVerified = true;
    }

    return Object.keys(out).length ? out : null;
  }

  async function getListingTrust(listingId, listingType = 'db') {
    const id = String(listingId || '').trim();
    if (!id) return null;

    const orderQuery = client
      .from('marketplace_orders')
      .select('id, buyer_id, status, paid_at, completed_at, delivered_at, created_at')
      .in('status', ['paid', 'in_progress', 'delivered', 'revision_requested', 'completed']);

    const { data: orders } =
      listingType === 'official'
        ? await orderQuery.eq('listing_slug', id)
        : await orderQuery.eq('listing_id', id);

    const paid = orders || [];
    const purchases = paid.length;
    if (purchases < MIN_LISTING_PURCHASES) return null;

    const buyerIds = [...new Set(paid.map((o) => o.buyer_id).filter(Boolean))];
    let repeatBuyerPct = null;
    if (buyerIds.length >= MIN_REPEAT_BUYERS) {
      const repeat = buyerIds.filter((bid) => paid.filter((o) => o.buyer_id === bid).length > 1).length;
      if (repeat >= MIN_REPEAT_BUYERS) {
        repeatBuyerPct = round1((repeat / buyerIds.length) * 100);
      }
    }

    let averageRating = null;
    if (listingType === 'db') {
      const { data: revs } = await client
        .from('marketplace_order_reviews')
        .select('rating')
        .eq('listing_id', id);
      if (revs && revs.length >= MIN_REVIEWS_FOR_RATING) {
        averageRating = round1(avg(revs.map((r) => Number(r.rating))));
      }
    }

    const completed = paid.filter((o) => o.status === 'completed');
    const deliveryHours = completed
      .map((o) => {
        const start = o.paid_at || o.created_at;
        const end = o.completed_at || o.delivered_at;
        if (!start || !end) return null;
        return (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
      })
      .filter((h) => h != null && h >= 0);
    const deliveryReliabilityHours = deliveryHours.length ? round1(avg(deliveryHours)) : null;

    const out = { purchases };
    if (repeatBuyerPct != null) out.repeatBuyerPct = repeatBuyerPct;
    if (averageRating != null) out.averageRating = averageRating;
    if (deliveryReliabilityHours != null) out.deliveryReliabilityHours = deliveryReliabilityHours;

    return out;
  }

  return {
    getProfileTrust,
    getListingTrust,
  };
}

module.exports = { createTrustMetrics };
