/**
 * Marketplace orders, crypto checkout (NOWPayments), dashboards, seller whitelist.
 */

const {
  verifyNowpaymentsIpnSignature,
  createNowpaymentsInvoice,
  extractInvoiceCheckoutUrl,
} = require('./nowpayments');
const { normalizeIntelligence, officialIntelligenceFromItem } = require('./listing-intelligence');

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function paymentRefForOrder(orderId) {
  return `MO-${String(orderId).replace(/-/g, '').slice(0, 16)}`;
}

function isPaidIpnStatus(status) {
  const s = String(status || '').toLowerCase();
  return s === 'finished' || s === 'confirmed' || s === 'paid';
}

function createMarketplaceCommerce({ client, env }) {
  if (!client) {
    return {
      isSellerWhitelisted: async () => false,
      canUserCreateListings: async () => false,
      createMarketplaceCheckout: async () => {
        throw new Error('Supabase is not configured');
      },
      handleNowpaymentsIpn: async () => ({ ok: false, error: 'not_configured' }),
      getBuyerDashboard: async () => ({ orders: [], payments: [], saved: [], activity: [] }),
      getSellerDashboard: async () => ({ listings: [], earningsUsd: 0, views: [] }),
      getOrderForUser: async () => null,
      recordListingView: async () => {},
      toggleSavedListing: async () => ({ saved: false }),
      resolveListingForCheckout: async () => null,
    };
  }

  async function isSellerWhitelisted(email) {
    const norm = normalizeEmail(email);
    if (!norm) return false;
    try {
      const { data } = await client
        .from('seller_whitelist')
        .select('id')
        .eq('email_normalized', norm)
        .maybeSingle();
      return Boolean(data);
    } catch {
      return false;
    }
  }

  async function loadProfile(userId) {
    const { data } = await client
      .from('profiles')
      .select('id, role, username, full_name, email')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }

  async function canUserCreateListings(user, profileRow) {
    const profile = profileRow || (await loadProfile(user.id));
    const role = String(profile?.role || 'member');
    if (['admin', 'moderator'].includes(role)) return true;
    return isSellerWhitelisted(user.email);
  }

  async function resolveBrandforgeSellerId() {
    const { data } = await client
      .from('profiles')
      .select('id')
      .eq('username', 'brandforge')
      .maybeSingle();
    return data?.id || null;
  }

  async function resolveListingForCheckout(listingId) {
    const id = String(listingId || '').trim();
    if (!id) return null;

    try {
      const { getOfficialListingById } = require('./brandforge-official-catalog');
      const official = getOfficialListingById(id);
      if (official) {
        const sellerId = await resolveBrandforgeSellerId();
        const intel = officialIntelligenceFromItem(official.item);
        return {
          type: 'official',
          listingId: id,
          listingSlug: id,
          title: official.item.title,
          amountUsd: Number(official.item.price) || 0,
          sellerId,
          intelligence: intel,
        };
      }
    } catch {
      /* not official */
    }

    const { data: row, error } = await client
      .from('service_packages')
      .select('*, owner_id')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle();
    if (error || !row) return null;

    const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    const intelRaw = row.intelligence && typeof row.intelligence === 'object' ? row.intelligence : meta.intelligence;
    const whitelisted = row.owner_id
      ? await isSellerWhitelisted(
          (
            await client.from('profiles').select('email').eq('id', row.owner_id).maybeSingle()
          ).data?.email,
        )
      : false;

    return {
      type: 'db',
      listingId: row.id,
      listingSlug: row.slug || row.id,
      title: row.title,
      amountUsd: Number(row.base_price) || 0,
      sellerId: row.owner_id,
      intelligence: normalizeIntelligence(intelRaw, {
        category: row.category,
        price: row.base_price,
        deliveryDays: row.delivery_days,
        listingType: row.listing_type,
        whitelistedSeller: whitelisted,
      }),
    };
  }

  async function createMarketplaceCheckout(user, listingId) {
    const listing = await resolveListingForCheckout(listingId);
    if (!listing) throw new Error('Listing not found');
    if (!listing.sellerId) throw new Error('Seller is not configured for this listing');
    if (!Number.isFinite(listing.amountUsd) || listing.amountUsd <= 0) {
      throw new Error('Invalid listing price');
    }
    if (String(listing.sellerId) === String(user.id)) {
      throw new Error('You cannot purchase your own listing');
    }

    const apiKey = String(env.nowpaymentsApiKey || '').trim();
    if (!apiKey) {
      throw new Error('Crypto checkout is not configured (set NOWPAYMENTS_API_KEY on the server)');
    }

    const { data: order, error: orderErr } = await client
      .from('marketplace_orders')
      .insert({
        buyer_id: user.id,
        seller_id: listing.sellerId,
        listing_id: listing.type === 'db' ? listing.listingId : null,
        listing_slug: listing.listingSlug,
        listing_title: listing.title,
        amount_usd: listing.amountUsd,
        status: 'pending',
        metadata: {
          listing_type: listing.type,
          intelligence: listing.intelligence,
        },
      })
      .select('*')
      .single();
    if (orderErr) throw orderErr;

    const reference = paymentRefForOrder(order.id);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const web = env.publicWebOrigin || 'http://localhost:3001';
    const apiOrigin = env.apiPublicOrigin || `http://127.0.0.1:${env.port || 3000}`;
    const successUrl = `${web}/checkout/success?order=${encodeURIComponent(order.id)}`;
    const cancelUrl = `${web}/listing/${encodeURIComponent(listingId)}?checkout=cancelled`;

    let checkoutLink = null;
    let npId = null;
    const inv = await createNowpaymentsInvoice({
      apiKey,
      sandbox: Boolean(env.nowpaymentsSandbox),
      priceAmount: listing.amountUsd,
      priceCurrency: 'usd',
      ipnCallbackUrl: `${apiOrigin}/api/nowpayments/ipn`,
      orderId: reference,
      orderDescription: listing.title,
      successUrl,
      cancelUrl,
    });
    checkoutLink = extractInvoiceCheckoutUrl(inv);
    npId = inv && inv.id != null ? String(inv.id) : null;
    if (!checkoutLink) throw new Error('Payment provider did not return a checkout URL');

    const { error: intentErr } = await client.from('marketplace_payment_intents').insert({
      order_id: order.id,
      payer_id: user.id,
      reference,
      amount_usd: listing.amountUsd,
      status: 'pending',
      expires_at: expiresAt,
      nowpayments_invoice_id: npId,
      checkout_url: checkoutLink,
      provider_payload: { provider: 'nowpayments' },
    });
    if (intentErr) throw intentErr;

    await client
      .from('marketplace_orders')
      .update({
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return {
      orderId: order.id,
      reference,
      checkoutUrl: checkoutLink,
      amountUsd: listing.amountUsd,
      expiresAt,
    };
  }

  async function markMarketplaceOrderPaid(reference, ipnPayload) {
    const { data: intent } = await client
      .from('marketplace_payment_intents')
      .select('*, marketplace_orders(*)')
      .eq('reference', reference)
      .maybeSingle();
    if (!intent) return { handled: false, reason: 'intent_not_found' };
    if (intent.status === 'paid') return { handled: true, duplicate: true };

    const paidAt = new Date().toISOString();
    await client
      .from('marketplace_payment_intents')
      .update({
        status: 'paid',
        paid_at: paidAt,
        provider_payload: ipnPayload,
      })
      .eq('id', intent.id);

    await client
      .from('marketplace_orders')
      .update({
        status: 'paid',
        paid_at: paidAt,
        updated_at: paidAt,
      })
      .eq('id', intent.order_id);

    const { data: orderRow } = await client
      .from('marketplace_orders')
      .select('listing_id')
      .eq('id', intent.order_id)
      .maybeSingle();
    if (orderRow?.listing_id) {
      const { data: pkg } = await client
        .from('service_packages')
        .select('metadata')
        .eq('id', orderRow.listing_id)
        .maybeSingle();
      const meta = pkg?.metadata && typeof pkg.metadata === 'object' ? { ...pkg.metadata } : {};
      meta.sales = Number(meta.sales || 0) + 1;
      await client.from('service_packages').update({ metadata: meta }).eq('id', orderRow.listing_id);
    }

    return { handled: true, orderId: intent.order_id };
  }

  async function markContractPaid(reference, ipnPayload) {
    const { data: intent } = await client
      .from('contract_payment_intents')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();
    if (!intent) return { handled: false, reason: 'contract_intent_not_found' };
    if (intent.status === 'paid') return { handled: true, duplicate: true };

    const paidAt = new Date().toISOString();
    await client
      .from('contract_payment_intents')
      .update({ status: 'paid', paid_at: paidAt, provider_payload: ipnPayload })
      .eq('id', intent.id);

    await client
      .from('project_contracts')
      .update({ status: 'funds_held', updated_at: paidAt })
      .eq('id', intent.contract_id);

    return { handled: true, contractId: intent.contract_id };
  }

  async function handleNowpaymentsIpn(rawBodyUtf8, sigHeader) {
    const secret = String(process.env.NOWPAYMENTS_IPN_SECRET || '').trim();
    if (!secret) return { ok: false, error: 'ipn_secret_missing' };
    if (!verifyNowpaymentsIpnSignature(rawBodyUtf8, sigHeader, secret)) {
      return { ok: false, error: 'invalid_signature' };
    }

    let payload;
    try {
      payload = JSON.parse(rawBodyUtf8);
    } catch {
      return { ok: false, error: 'invalid_json' };
    }

    const reference = String(payload.order_id || payload.orderId || '').trim();
    if (!reference) return { ok: false, error: 'missing_order_id' };

    if (!isPaidIpnStatus(payload.payment_status)) {
      return { ok: true, ignored: true, status: payload.payment_status };
    }

    if (reference.startsWith('MO-')) {
      const result = await markMarketplaceOrderPaid(reference, payload);
      return { ok: true, ...result };
    }
    if (reference.startsWith('CT-')) {
      const result = await markContractPaid(reference, payload);
      return { ok: true, ...result };
    }

    return { ok: true, ignored: true, reason: 'unknown_reference_prefix' };
  }

  async function getOrderForUser(userId, orderId) {
    const { data, error } = await client
      .from('marketplace_orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (error || !data) return null;
    if (String(data.buyer_id) !== String(userId) && String(data.seller_id) !== String(userId)) {
      return null;
    }
    const { data: intents } = await client
      .from('marketplace_payment_intents')
      .select('reference, status, amount_usd, checkout_url, paid_at, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    return { order: data, payments: intents || [] };
  }

  async function getBuyerDashboard(userId) {
    const { data: orders } = await client
      .from('marketplace_orders')
      .select('id, listing_title, listing_slug, amount_usd, status, paid_at, created_at')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const orderIds = (orders || []).map((o) => o.id);
    let payments = [];
    if (orderIds.length) {
      const { data: payRows } = await client
        .from('marketplace_payment_intents')
        .select('order_id, reference, status, amount_usd, paid_at, checkout_url')
        .in('order_id', orderIds);
      payments = payRows || [];
    }

    let saved = [];
    try {
      const { data: savedRows } = await client
        .from('saved_listings')
        .select('listing_id, listing_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      saved = savedRows || [];
    } catch {
      saved = [];
    }

    const activity = (orders || []).slice(0, 20).map((o) => ({
      type: 'order',
      id: o.id,
      title: o.listing_title,
      status: o.status,
      at: o.paid_at || o.created_at,
    }));

    return {
      orders: orders || [],
      payments,
      saved,
      activity,
      stats: {
        totalOrders: (orders || []).length,
        paidOrders: (orders || []).filter((o) => o.status === 'paid' || o.status === 'in_progress' || o.status === 'delivered' || o.status === 'completed').length,
      },
    };
  }

  async function getSellerDashboard(userId) {
    const { data: listings } = await client
      .from('service_packages')
      .select('id, title, slug, base_price, status, metadata, created_at')
      .eq('owner_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    const listingIds = (listings || []).map((l) => l.id);
    const slugIds = (listings || []).map((l) => l.slug).filter(Boolean);

    let viewCounts = new Map();
    try {
      if (listingIds.length) {
        const { data: views } = await client
          .from('listing_views')
          .select('listing_id')
          .in('listing_id', listingIds);
        for (const v of views || []) {
          viewCounts.set(v.listing_id, (viewCounts.get(v.listing_id) || 0) + 1);
        }
      }
    } catch {
      /* table may not exist yet */
    }

    const { data: paidOrders } = await client
      .from('marketplace_orders')
      .select('listing_id, listing_slug, amount_usd, status')
      .eq('seller_id', userId)
      .in('status', ['paid', 'in_progress', 'delivered', 'completed']);

    const earningsUsd = (paidOrders || [])
      .filter((o) => ['paid', 'in_progress', 'delivered', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.amount_usd || 0), 0);

    const ordersByListing = new Map();
    for (const o of paidOrders || []) {
      const key = o.listing_id || o.listing_slug;
      if (!key) continue;
      ordersByListing.set(key, (ordersByListing.get(key) || 0) + 1);
    }

    const performance = (listings || []).map((row) => {
      const views = viewCounts.get(row.id) || 0;
      const sales = ordersByListing.get(row.id) || Number(row.metadata?.sales || 0);
      const conversionRate = views > 0 ? Math.round((sales / views) * 1000) / 10 : 0;
      return {
        id: row.id,
        title: row.title,
        price: Number(row.base_price) || 0,
        status: row.status,
        views,
        sales,
        conversionRate,
      };
    });

    return {
      listings: performance,
      earningsUsd,
      stats: {
        activeListings: (listings || []).filter((l) => l.status === 'published').length,
        totalSales: (paidOrders || []).length,
      },
    };
  }

  async function recordListingView(listingId, listingType, viewerId) {
    const id = String(listingId || '').trim();
    if (!id) return;
    try {
      await client.from('listing_views').insert({
        listing_id: id,
        listing_type: listingType === 'official' ? 'official' : 'db',
        viewer_id: viewerId || null,
      });
    } catch {
      /* ignore if migration not applied */
    }
  }

  async function toggleSavedListing(userId, listingId, listingType) {
    const lid = String(listingId || '').trim();
    const lt = listingType === 'official' ? 'official' : 'db';
    const { data: existing } = await client
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId)
      .eq('listing_id', lid)
      .eq('listing_type', lt)
      .maybeSingle();

    if (existing) {
      await client
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', lid)
        .eq('listing_type', lt);
      return { saved: false };
    }

    await client.from('saved_listings').insert({
      user_id: userId,
      listing_id: lid,
      listing_type: lt,
    });
    return { saved: true };
  }

  return {
    isSellerWhitelisted,
    canUserCreateListings,
    createMarketplaceCheckout,
    handleNowpaymentsIpn,
    getOrderForUser,
    getBuyerDashboard,
    getSellerDashboard,
    recordListingView,
    toggleSavedListing,
    resolveListingForCheckout,
  };
}

module.exports = { createMarketplaceCommerce, paymentRefForOrder };
