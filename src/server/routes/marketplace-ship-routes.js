const { parsePathParams } = require('./http-utils');
const { createTrustMetrics } = require('../trust-metrics');

function createMarketplaceShipRoutes(ctx) {
  const { platformRepository, sendJson, requireUser, parseBody, getOptionalUser } = ctx;
  const trust = createTrustMetrics(platformRepository?.client || null);

  async function requireAdmin(user, res) {
    const profile = await platformRepository.client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const role = String(profile?.data?.role || '');
    if (!['admin', 'moderator'].includes(role)) {
      sendJson(res, 403, { error: 'Admin access required' });
      return false;
    }
    return true;
  }

  return async function tryShipRoute(pathname, method, req, res) {
    if (pathname === '/api/platform/events' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const user = await getOptionalUser(req);
        await platformRepository.recordPlatformEvent({
          event: body.event,
          path: body.path,
          userId: user?.id || null,
          sessionId: body.sessionId || body.session_id || null,
          props: body.props || {},
        });
        sendJson(res, 200, { ok: true });
      } catch (e) {
        sendJson(res, 400, { error: e.message || 'Invalid event' });
      }
      return true;
    }

    if (pathname === '/api/marketplace/smart-match' && method === 'POST') {
      const user = await requireUser(req, res);
      if (!user) return true;
      try {
        const body = await parseBody(req);
        const { query, category } = body || {};
        const { listings } = await platformRepository.listMarketplaceListings({
          term: 'starter',
          q: query || '',
          category: category || '',
          sort: 'newest',
        });
        const matches = (listings || []).slice(0, 8).map((l) => ({
          id: l.id,
          title: l.title,
          description: l.tagline || '',
          category: l.category,
          provider: l.ownerUsername ? `@${l.ownerUsername}` : l.ownerName,
          price: l.price,
          serviceUrl: l.serviceUrl,
        }));
        sendJson(res, 200, { matches, query, category });
      } catch (e) {
        sendJson(res, 500, { error: e.message || 'Search failed' });
      }
      return true;
    }

    const orderParams = parsePathParams(pathname, '/api/orders/:id/:action');
    if (orderParams?.id && orderParams?.action && method === 'POST') {
      const user = await requireUser(req, res);
      if (!user) return true;
      try {
        const body = await parseBody(req);
        const { id, action } = orderParams;
        let result;
        if (action === 'start') result = await platformRepository.sellerMarkInProgress(user.id, id);
        else if (action === 'deliver') {
          result = await platformRepository.sellerDeliver(user.id, id, {
            note: body.note,
            url: body.url,
          });
        } else if (action === 'approve') result = await platformRepository.buyerApprove(user.id, id);
        else if (action === 'revision') {
          result = await platformRepository.buyerRequestRevision(user.id, id, body.message);
        } else if (action === 'dispute') {
          result = await platformRepository.openDispute(user.id, id, body.message);
        } else if (action === 'review') {
          result = await platformRepository.submitReview(user.id, id, body);
        } else {
          sendJson(res, 400, { error: 'Unknown action' });
          return true;
        }
        sendJson(res, 200, result);
      } catch (e) {
        sendJson(res, 400, { error: e.message || 'Action failed' });
      }
      return true;
    }

    const trustProfile = parsePathParams(pathname, '/api/profiles/:username/trust');
    if (trustProfile?.username && method === 'GET') {
      try {
        const profile = await platformRepository.getPublicProfile(trustProfile.username);
        const metrics = await trust.getProfileTrust(profile.id);
        const reviews = await platformRepository.listReviewsForProfile(profile.id, 20);
        sendJson(res, 200, { trust: metrics, reviews });
      } catch (e) {
        sendJson(res, 404, { error: e.message || 'Not found' });
      }
      return true;
    }

    const listingTrust = parsePathParams(pathname, '/api/listings/:id/trust');
    if (listingTrust?.id && method === 'GET') {
      try {
        const url = new URL(req.url || '', 'http://localhost');
        const listingType = url.searchParams.get('type') === 'official' ? 'official' : 'db';
        const metrics = await trust.getListingTrust(listingTrust.id, listingType);
        sendJson(res, 200, { trust: metrics });
      } catch (e) {
        sendJson(res, 500, { error: e.message || 'Failed' });
      }
      return true;
    }

    if (pathname === '/api/admin/overview' && method === 'GET') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      try {
        const overview = await platformRepository.getAdminOverview();
        sendJson(res, 200, overview);
      } catch (e) {
        sendJson(res, 500, { error: e.message || 'Failed' });
      }
      return true;
    }

    if (pathname === '/api/admin/whitelist' && method === 'GET') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      const { data } = await platformRepository.client
        .from('seller_whitelist')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      sendJson(res, 200, { rows: data || [] });
      return true;
    }

    if (pathname === '/api/admin/whitelist' && method === 'POST') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      try {
        const body = await parseBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        if (!email) {
          sendJson(res, 400, { error: 'email required' });
          return true;
        }
        const { data, error } = await platformRepository.client
          .from('seller_whitelist')
          .insert({
            email,
            email_normalized: email,
            note: body.note || null,
            added_by: user.id,
          })
          .select('*')
          .single();
        if (error) throw error;
        sendJson(res, 201, { row: data });
      } catch (e) {
        sendJson(res, 400, { error: e.message || 'Failed' });
      }
      return true;
    }

    if (pathname === '/api/admin/orders' && method === 'GET') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      const { data } = await platformRepository.client
        .from('marketplace_orders')
        .select('id, listing_title, amount_usd, status, created_at, paid_at')
        .order('created_at', { ascending: false })
        .limit(100);
      sendJson(res, 200, { orders: data || [] });
      return true;
    }

    if (pathname === '/api/admin/disputes' && method === 'GET') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      const { data } = await platformRepository.client
        .from('marketplace_orders')
        .select('id, listing_title, amount_usd, status, buyer_id, seller_id, created_at')
        .eq('status', 'disputed')
        .order('created_at', { ascending: false })
        .limit(50);
      sendJson(res, 200, { disputes: data || [] });
      return true;
    }

    if (pathname === '/api/admin/users/ban' && method === 'POST') {
      const user = await requireUser(req, res);
      if (!user) return true;
      if (!(await requireAdmin(user, res))) return true;
      try {
        const body = await parseBody(req);
        const username = String(body.username || '').trim().toLowerCase().replace(/^@+/, '');
        if (!username) {
          sendJson(res, 400, { error: 'username required' });
          return true;
        }
        const { data: prof, error } = await platformRepository.client
          .from('profiles')
          .update({ is_public: false })
          .eq('username', username)
          .select('id, username')
          .maybeSingle();
        if (error) throw error;
        if (!prof) {
          sendJson(res, 404, { error: 'User not found' });
          return true;
        }
        sendJson(res, 200, { ok: true, profile: prof });
      } catch (e) {
        sendJson(res, 400, { error: e.message || 'Ban failed' });
      }
      return true;
    }

    return false;
  };
}

module.exports = { createMarketplaceShipRoutes };
