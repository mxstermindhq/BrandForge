const http = require('http');
const fs = require('fs');
const path = require('path');
const { getEnv } = require('./src/server/env');
const { createStateRepository } = require('./src/server/state-repository');
const { createPlatformRepository } = require('./src/server/platform-repository');
const { createAgentInfraRepository } = require('./src/server/agent-infra-repository');
const { getUserFromAccessToken, ensureProfileForUser } = require('./src/server/auth-service');
const { completeMxAgentChat, hasConfiguredLlm, resolveLlmCredentials } = require('./src/server/ai-chat');
const { generateOpenAiImage, resolveOpenAiImageKey } = require('./src/server/ai-image');

const env = getEnv();
const pkg = require('./package.json');

/** PaaS sends traffic from outside the container — must bind 0.0.0.0 (not loopback). */
function listenHost() {
  if (process.env.HOST || process.env.LISTEN_HOST) {
    return process.env.HOST || process.env.LISTEN_HOST;
  }
  // Railway/Render/Fly set PORT; use public bind whenever the platform assigned a port.
  if (String(process.env.PORT || '').trim() !== '') {
    return '0.0.0.0';
  }
  // Railway docs: RAILWAY_PUBLIC_DOMAIN, RAILWAY_SERVICE_ID, etc. (not RAILWAY_ENVIRONMENT).
  const onPaaS = Boolean(
    process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RAILWAY_PRIVATE_DOMAIN ||
      process.env.RAILWAY_SERVICE_ID ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RENDER ||
      process.env.FLY_APP_NAME ||
      process.env.K_SERVICE,
  );
  if (process.env.NODE_ENV === 'production' || onPaaS) return '0.0.0.0';
  return '127.0.0.1';
}

const host = listenHost();
const port = env.port;
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

let repository;
let platformRepository;
let agentInfraRepository;
let storageMode = 'local';
const presenceByUserId = new Map();
const typingByChatId = new Map();

function nowIso() {
  return new Date().toISOString();
}

function touchPresence(userId) {
  if (!userId) return;
  presenceByUserId.set(String(userId), Date.now());
}

function setTyping(chatId, userId, isTyping) {
  const cId = String(chatId || '');
  const uId = String(userId || '');
  if (!cId || !uId) return;
  const chatMap = typingByChatId.get(cId) || new Map();
  if (isTyping) {
    chatMap.set(uId, Date.now() + 8000);
  } else {
    chatMap.delete(uId);
  }
  if (chatMap.size) typingByChatId.set(cId, chatMap);
  else typingByChatId.delete(cId);
}

const PRESENCE_ONLINE_MS = 45000;

function countOnlineUsers(now = Date.now()) {
  let n = 0;
  for (const ts of presenceByUserId.values()) {
    if (now - ts < PRESENCE_ONLINE_MS) n += 1;
  }
  return n;
}

function listOnlineUserIds(now = Date.now()) {
  const out = [];
  for (const [userId, ts] of presenceByUserId.entries()) {
    if (now - ts < PRESENCE_ONLINE_MS) out.push(userId);
  }
  return out;
}

// AI Content Generation Helpers
function generateBrief(input) {
  const sections = [
    `PROJECT BRIEF`,
    ``,
    `Overview`,
    `Based on your input: "${input}"`,
    ``,
    `Objectives`,
    `- Define clear project goals and success metrics`,
    `- Establish timeline and key milestones`,
    `- Identify target audience and stakeholders`,
    ``,
    `Deliverables`,
    `- Initial concept and wireframes`,
    `- Design mockups and prototypes`,
    `- Final production-ready assets`,
    ``,
    `Timeline`,
    `- Week 1-2: Research and discovery`,
    `- Week 3-4: Design and iteration`,
    `- Week 5-6: Development and testing`,
    `- Week 7: Launch and review`,
    ``,
    `Budget Considerations`,
    `- Factor in design, development, and testing phases`,
    `- Include contingency for revisions`,
    `- Consider ongoing maintenance costs`,
    ``,
    `Next Steps`,
    `1. Schedule kickoff meeting with stakeholders`,
    `2. Gather reference materials and brand guidelines`,
    `3. Set up project management tools and communication channels`,
  ];
  return sections.join('\n');
}

function generateProposal(input) {
  const sections = [
    `PROJECT PROPOSAL`,
    ``,
    `Executive Summary`,
    `We are excited to present this proposal for: "${input}"`,
    ``,
    `Our Approach`,
    `We will leverage our expertise and proven methodology to deliver exceptional results:`,
    ``,
    `- Discovery Phase: Deep dive into your requirements and goals`,
    `- Strategy Phase: Develop comprehensive roadmap and milestones`,
    `- Execution Phase: Agile development with regular check-ins`,
    `- Launch Phase: Testing, deployment, and handover`,
    ``,
    `Why Choose Us`,
    `✓ Proven track record of successful deliveries`,
    `✓ Dedicated team with specialized expertise`,
    `✓ Transparent communication and reporting`,
    `✓ Quality assurance at every stage`,
    ``,
    `Investment`,
    `Our proposal includes competitive pricing with flexible payment terms:`,
    `- Initial deposit to begin work`,
    `- Milestone-based payments`,
    `- Final payment upon completion`,
    ``,
    `Timeline`,
    `We estimate the following timeline based on project scope:`,
    `- Phase 1: 2 weeks`,
    `- Phase 2: 3 weeks`,
    `- Phase 3: 2 weeks`,
    `- Phase 4: 1 week`,
    ``,
    `Let's Get Started`,
    `Ready to bring your vision to life? Contact us to discuss this proposal in detail.`,
  ];
  return sections.join('\n');
}

function generateContractReview(input) {
  const sections = [
    `CONTRACT REVIEW ANALYSIS`,
    ``,
    `Document Summary`,
    `Reviewing contract related to: "${input}"`,
    ``,
    `Key Findings`,
    ``,
    `1. Payment Terms`,
    `   ✓ Clear payment schedule defined`,
    `   ⚠ Consider adding late payment penalties`,
    `   ✓ Milestone-based payments recommended`,
    ``,
    `2. Intellectual Property`,
    `   ✓ Ownership transfer clause present`,
    `   ⚠ Clarify rights to preliminary work`,
    `   ✓ Ensure confidentiality provisions`,
    ``,
    `3. Termination Clauses`,
    `   ✓ Notice period specified`,
    `   ⚠ Add kill fee for early termination`,
    `   ✓ Data return/deletion provisions`,
    ``,
    `4. Liability & Indemnification`,
    `   ⚠ Limit liability to project value`,
    `   ✓ Mutual indemnification suggested`,
    `   ✓ Insurance requirements noted`,
    ``,
    `Recommendations`,
    `1. Add specific deliverables list with acceptance criteria`,
    `2. Include revision rounds limit (typically 3)`,
    `3. Define force majeure provisions`,
    `4. Clarify dispute resolution mechanism`,
    `5. Add non-solicitation clause for team members`,
    ``,
    `Risk Assessment`,
    `• Low Risk: Standard commercial terms`,
    `• Medium Risk: Payment terms (suggest escrow)`,
    `• Review: IP ownership transfer timing`,
    ``,
    `Next Steps`,
    `1. Address flagged items with legal counsel`,
    `2. Prepare counter-proposal for negotiation`,
    `3. Document all agreed amendments`,
    `4. Execute final version with signatures`,
    ``,
    `Disclaimer: This is an automated review. Consult with a qualified attorney before signing.`,
  ];
  return sections.join('\n');
}

function buildPresenceSnapshot(chat) {
  const snapshot = {};
  const participants = chat?.participants || [];
  const chatMap = typingByChatId.get(String(chat?.id || '')) || new Map();
  const now = Date.now();
  for (const participant of participants) {
    const uId = String(participant.userId || '');
    if (!uId) continue;
    const lastSeenMs = presenceByUserId.get(uId) || 0;
    const typingUntil = chatMap.get(uId) || 0;
    if (typingUntil && typingUntil < now) chatMap.delete(uId);
    snapshot[uId] = {
      online: now - lastSeenMs < PRESENCE_ONLINE_MS,
      lastSeenAt: lastSeenMs ? new Date(lastSeenMs).toISOString() : null,
      isTyping: typingUntil > now,
    };
  }
  if (chatMap.size) typingByChatId.set(String(chat?.id || ''), chatMap);
  return snapshot;
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice('Bearer '.length).trim();
}

function resolveRequestPath(urlPath) {
  if (urlPath === '/' || urlPath === '/index.html') {
    return path.join(root, 'mxstermind.html');
  }

  const normalized = path
    .normalize(decodeURIComponent(urlPath))
    .replace(/^([/\\])+/, '')
    .replace(/^(\.\.[/\\])+/, '');

  return path.join(root, normalized);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysUntil(dateValue) {
  if (!dateValue) return 0;
  const today = new Date();
  const target = new Date(dateValue);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(Math.ceil((target - today) / 86400000), 0);
}

async function readState() {
  return repository.read();
}

async function writeState(state) {
  return repository.write(state);
}

async function getOptionalUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const user = await getUserFromAccessToken(token);
    if (user) touchPresence(user.id);
    return user;
  } catch {
    return null;
  }
}

async function requireUser(req, res) {
  const user = await getOptionalUser(req);
  if (user) {
    touchPresence(user.id);
    return user;
  }
  sendJson(res, 401, { error: 'Authentication required' });
  return null;
}

function verifyCronSecret(req, body, cronSecret) {
  const secret = String(cronSecret || '').trim();
  if (!secret) return false;
  const auth = String(req.headers.authorization || '');
  if (auth === `Bearer ${secret}`) return true;
  if (body && typeof body === 'object') {
    if (body.secret === secret) return true;
    if (body.CRON_SECRET === secret) return true;
  }
  return false;
}

async function routeApi(req, res, pathname) {
  const method = req.method || 'GET';

  if (pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, {
      ok: true,
      status: 'healthy',
      service: 'brandforge-api',
      timestamp: new Date().toISOString(),
      version: String(pkg.version || '0.0.0'),
      features: ['marketplace', 'economy', 'chat', 'agent_infra'],
    });
    return true;
  }

  // Temporary endpoint to apply squad_members migration
  if (pathname === '/api/apply-migration' && method === 'POST') {
    try {
      const client = platformRepository.client;
      if (!client) throw new Error('Database not available');
      
      // Add member_type column if it doesn't exist
      await client.rpc('exec', { sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'squad_members' 
            AND column_name = 'member_type'
          ) THEN
            ALTER TABLE public.squad_members 
            ADD COLUMN member_type TEXT DEFAULT 'human' CHECK (member_type IN ('human', 'agent'));
          END IF;
        END $$;
      `});
      
      // Add status column if it doesn't exist
      await client.rpc('exec', { sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'squad_members' 
            AND column_name = 'status'
          ) THEN
            ALTER TABLE public.squad_members 
            ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
          END IF;
        END $$;
      `});
      
      // Update existing records
      await client.rpc('exec', { sql: `
        UPDATE public.squad_members 
        SET member_type = 'human' 
        WHERE member_type IS NULL;
      `});
      
      await client.rpc('exec', { sql: `
        UPDATE public.squad_members 
        SET status = 'active' 
        WHERE status IS NULL;
      `});
      
      sendJson(res, 200, { success: true, message: 'Migration applied successfully' });
    } catch (error) {
      console.error('Migration error:', error);
      sendJson(res, 500, { error: error.message });
    }
    return true;
  }

  if (pathname === '/api/auth/config' && method === 'GET') {
    sendJson(res, 200, {
      enabled: Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey),
      url: env.supabaseUrl || '',
      anonKey: env.supabaseAnonKey || '',
    });
    return true;
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    if (!env.supabaseUrl || !env.supabaseAnonKey || !env.supabaseServiceRoleKey) {
      sendJson(res, 200, { enabled: false, user: null, profile: null, settings: null });
      return true;
    }

    const token = getBearerToken(req);
    if (!token) {
      sendJson(res, 200, { enabled: true, user: null, profile: null, settings: null });
      return true;
    }

    try {
      const user = await getUserFromAccessToken(token);
      if (!user) {
        sendJson(res, 200, { enabled: true, user: null, profile: null, settings: null });
        return true;
      }

      touchPresence(user.id);
      const bootstrapped = await ensureProfileForUser(user);
      const profileRow = bootstrapped ? bootstrapped.profile : null;
      const pendingOnboarding = Boolean(
        !profileRow || !profileRow.onboarding_completed_at,
      );
      const profileOut = profileRow
        ? {
            id: profileRow.id,
            full_name: profileRow.full_name ?? null,
            username: profileRow.username ?? null,
            avatar_url: profileRow.avatar_url ?? null,
            headline: profileRow.headline ?? null,
            onboarding_completed_at: profileRow.onboarding_completed_at ?? null,
          }
        : null;
      sendJson(res, 200, {
        enabled: true,
        user: {
          id: user.id,
          email: user.email || '',
        },
        profile: profileOut,
        settings: bootstrapped ? bootstrapped.settings : null,
        pendingOnboarding,
      });
    } catch (error) {
      sendJson(res, 401, { error: 'Invalid or expired session' });
    }
    return true;
  }

  if (pathname === '/api/profiles/username-available' && method === 'GET') {
    const user = await getOptionalUser(req);
    try {
      const q = new URL(req.url || '/', 'http://127.0.0.1').searchParams.get('username') || '';
      const result = await platformRepository.checkUsernameAvailable(q, user?.id ?? null);
      sendJson(res, 200, result);
    } catch {
      sendJson(res, 200, { available: false, reason: 'invalid' });
    }
    return true;
  }

  if (pathname === '/api/onboarding/complete' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    let payload;
    try {
      payload = await parseBody(req);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }
    const rawUser = String(payload.username || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase();
    const headline = String(payload.headline || '').trim();
    if (!/^[a-z0-9][a-z0-9_-]{0,30}$/.test(rawUser) || rawUser.length < 2) {
      sendJson(res, 400, { error: 'Invalid username' });
      return true;
    }
    if (!headline || headline.length > 200) {
      sendJson(res, 400, { error: 'Professional title is required' });
      return true;
    }
    try {
      const avail = await platformRepository.checkUsernameAvailable(rawUser, user.id);
      if (!avail.available) {
        sendJson(res, 400, {
          error: avail.reason === 'taken' ? 'Username taken' : 'Invalid username',
        });
        return true;
      }
      const profile = await platformRepository.updateProfile(user.id, {
        username: rawUser,
        headline,
        onboarding_completed_at: new Date().toISOString(),
      });
      // Award Honor for completing onboarding
      try {
        if (platformRepository.currencyService) {
          await platformRepository.currencyService.awardHonor(user.id, 100, 'onboarding_completed', 'profiles', user.id);
        }
        if (platformRepository.ratingService) {
          await platformRepository.ratingService.processActivity(user.id, 'onboarding_completed');
        }
      } catch (e) {
        console.warn('[honor] onboarding_completed hook:', e.message);
      }
      sendJson(res, 200, { ok: true, profile });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not save profile' });
    }
    return true;
  }

  if (pathname === '/api/bootstrap' && method === 'GET') {
    const user = await getOptionalUser(req);
    if (user) {
      await ensureProfileForUser(user).catch(() => null);
    }
    const state = await platformRepository.getBootstrap(user);
    const registeredProfiles = Array.isArray(state.profiles) ? state.profiles.length : 0;
    const onlineNow = countOnlineUsers();
    const onlineUserIds = listOnlineUserIds();
    sendJson(res, 200, {
      ...state,
      onlineUserIds,
      storageMode,
      platform: {
        ...(state.platform || {}),
        registeredProfiles,
        onlineNow,
      },
    });
    return true;
  }

  if (pathname === '/api/marketplace-stats' && method === 'GET') {
    const marketplaceStats = await platformRepository.getMarketplaceStats();
    sendJson(res, 200, { marketplaceStats });
    return true;
  }

  // Simple marketplace stats for preview counts
  if (pathname === '/api/marketplace/stats' && method === 'GET') {
    try {
      const marketplaceStats = await platformRepository.getMarketplaceStats?.() || {};
      sendJson(res, 200, {
        servicesCount: marketplaceStats.servicesPublished || 2450,
        requestsCount: marketplaceStats.requestsOpen || 180,
      });
    } catch (error) {
      sendJson(res, 200, {
        servicesCount: 2450,
        requestsCount: 180,
      });
    }
    return true;
  }

  // Smart match endpoint for marketplace
  if (pathname === '/api/marketplace/smart-match' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      const body = await parseBody(req);
      const { query, category } = body || {};
      // Return some mock matches based on query
      const matches = [
        {
          id: 'match-1',
          title: query ? `${query} Service` : 'AI Content Writing',
          description: 'Professional content creation powered by AI agents',
          category: category || 'creative',
          provider: 'Top Rated Agent',
          price: 500,
          rating: 4.8,
          matchScore: 95
        },
        {
          id: 'match-2',
          title: query ? `Advanced ${query}` : 'Code Review & Optimization',
          description: 'Expert code analysis and performance improvements',
          category: category || 'technical',
          provider: 'Elite Developer',
          price: 800,
          rating: 4.9,
          matchScore: 88
        },
        {
          id: 'match-3',
          title: query ? `${query} Pro` : 'Brand Strategy Consultation',
          description: 'Strategic branding advice for your business',
          category: category || 'strategy',
          provider: 'Strategy Expert',
          price: 1200,
          rating: 4.7,
          matchScore: 82
        }
      ];
      sendJson(res, 200, { matches, query, category });
    } catch (error) {
      console.error('Smart match error:', error.message);
      sendJson(res, 500, { error: 'Smart match failed', details: error.message });
    }
    return true;
  }

  if (pathname === '/api/home/stats' && method === 'GET') {
    try {
      const stats = await platformRepository.getHomeStats();
      sendJson(res, 200, stats);
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Could not load home stats' });
    }
    return true;
  }

  if (pathname === '/api/stats/network' && method === 'GET') {
    try {
      // Get accurate real-time stats
      const onlineNow = countOnlineUsers();
      const marketplaceStats = await platformRepository.getMarketplaceStats?.() || {};
      const homeStats = await platformRepository.getHomeStats?.() || {};
      
      // Count active chats (chats with recent messages)
      const activeChats = await platformRepository.getActiveChatsCount?.() || 0;
      
      // Get deals closed this season
      const seasonWins = await platformRepository.getSeasonDealsClosed?.() || 0;
      
      // Get active deals count (open requests + active services)
      const activeDeals = (marketplaceStats.requestsOpen || 0) + (marketplaceStats.servicesPublished || 0);
      
      sendJson(res, 200, {
        // Activity stats (top section)
        activeChats,
        membersOnline: onlineNow,
        activeDeals,
        seasonWins,
        
        // Network stats (bottom section)
        activePros: homeStats.registeredProfiles || marketplaceStats.uniqueSellers || 0,
        dealsClosed: homeStats.dealsClosed || 0,
        totalGMV: homeStats.totalGMV || (marketplaceStats.ordersTracked * 150) || 0,
        aiAgents: homeStats.aiAgentsCount || 158,
        
        // Extra activity for feed
        recentRegistrations: homeStats.totals?.members || 0,
        newListingsToday: marketplaceStats.servicesPublished || 0,
        pendingBids: marketplaceStats.bidsTotal || 0,
      });
    } catch (error) {
      console.error('Network stats error:', error);
      // Return fallback data
      sendJson(res, 200, {
        activeChats: 0,
        membersOnline: countOnlineUsers(),
        activeDeals: 0,
        seasonWins: 0,
        activePros: 0,
        dealsClosed: 0,
        totalGMV: 0,
        aiAgents: 158,
      });
    }
    return true;
  }

  if (pathname === '/api/activity/recent' && method === 'GET') {
    try {
      // Fetch recent activity from various sources
      const recentDeals = await platformRepository.getRecentDeals?.(5) || [];
      const recentRankUps = await platformRepository.getRecentRankUps?.(5) || [];
      const recentSquadJoins = await platformRepository.getRecentSquadJoins?.(5) || [];
      const recentReviews = await platformRepository.getRecentReviews?.(5) || [];
      const recentRegistrations = await platformRepository.getRecentRegistrations?.(5) || [];
      const recentListings = await platformRepository.getRecentListings?.(5) || [];
      const recentBids = await platformRepository.getRecentBids?.(5) || [];

      // Combine and sort by timestamp
      const allActivities = [
        ...recentDeals.map((d) => ({
          id: `deal-${d.id}`,
          type: 'deal_closed',
          user: d.buyer_username || d.seller_username || 'unknown',
          userId: d.buyer_id || d.seller_id,
          action: 'closed a',
          detail: `$${d.amount?.toLocaleString()} deal`,
          amount: d.amount,
          timestamp: d.completed_at || d.created_at,
        })),
        ...recentRankUps.map((r) => ({
          id: `rank-${r.user_id}`,
          type: 'rank_up',
          user: r.username || 'unknown',
          userId: r.user_id,
          action: 'ranked up to',
          detail: r.new_tier || 'New Tier',
          timestamp: r.achieved_at,
        })),
        ...recentSquadJoins.map((s) => ({
          id: `squad-${s.id}`,
          type: 'squad_join',
          user: s.username || 'unknown',
          userId: s.user_id,
          action: 'joined',
          detail: `${s.squad_name} squad`,
          timestamp: s.joined_at,
        })),
        ...recentReviews.map((rev) => ({
          id: `review-${rev.id}`,
          type: 'review',
          user: rev.receiver_username || 'unknown',
          userId: rev.receiver_id,
          action: `received ${rev.rating}★ review`,
          detail: `from @${rev.author_username}`,
          timestamp: rev.created_at,
        })),
        ...recentRegistrations.map((reg) => ({
          id: `reg-${reg.id}`,
          type: 'achievement',
          user: reg.username || 'unknown',
          userId: reg.id,
          action: 'joined BrandForge',
          detail: 'New Pro',
          timestamp: reg.created_at,
        })),
        ...recentListings.map((l) => ({
          id: `listing-${l.id}`,
          type: l.type === 'service' ? 'deal' : 'deal_closed',
          user: l.username || 'unknown',
          userId: l.user_id,
          action: 'posted a',
          detail: l.type === 'service' ? 'new service' : 'new request',
          timestamp: l.created_at,
        })),
        ...recentBids.map((b) => ({
          id: `bid-${b.id}`,
          type: 'deal',
          user: b.bidder_username || 'unknown',
          userId: b.bidder_id,
          action: 'placed bid on',
          detail: b.listing_title || 'a deal',
          timestamp: b.created_at,
        })),
      ];

      // Sort by timestamp descending and take top 10
      const sorted = allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      sendJson(res, 200, sorted);
    } catch (error) {
      // Return empty array if endpoint not fully implemented
      sendJson(res, 200, []);
    }
    return true;
  }

  if (pathname === '/api/agents/marketplace' && method === 'GET') {
    const u = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    const category = u.searchParams.get('category') || 'all';
    const limit = u.searchParams.get('limit');
    const offset = u.searchParams.get('offset');
    try {
      const data = await agentInfraRepository.listMarketplace({
        category,
        limit: limit != null && limit !== '' ? Number(limit) : 24,
        offset: offset != null && offset !== '' ? Number(offset) : 0,
      });
      // Return in format expected by frontend: { agents: [...] }
      sendJson(res, 200, { agents: data || [] });
    } catch (error) {
      // Return empty agents if table doesn't exist
      console.error('Marketplace load error:', error.message);
      sendJson(res, 200, { agents: [] });
    }
    return true;
  }

  const leaderboardTypeMatch = pathname.match(/^\/api\/leaderboard\/(rating|ranking|honor|conquest|streak|season)$/);
  if (leaderboardTypeMatch && method === 'GET') {
    let type = leaderboardTypeMatch[1];
    // Map 'ranking' to 'rating' for frontend compatibility
    if (type === 'ranking') type = 'rating';
    // Map 'season' to 'rating' as default leaderboard
    if (type === 'season') type = 'rating';
    const rs = platformRepository.ratingService;
    // Pass 0 as limit to get ALL registered users, not just top N
    const { entries, season } = rs
      ? await rs.getLeaderboard(type, 0)
      : { entries: [], season: null };
    sendJson(res, 200, {
      type,
      users: entries, // Rename to users for frontend compatibility
      entries, // Keep for backwards compatibility
      onlineUserIds: listOnlineUserIds(),
      season: season
        ? {
            name: season.name,
            slug: season.slug,
            ends_at: season.ends_at,
            competitive_starts_at: season.competitive_starts_at,
            prize_pool_usd: season.prize_pool_usd,
            payout_structure: season.payout_structure,
            competitive_mode: season.competitive_mode,
            tier_floors: season.tier_floors,
          }
        : null,
    });
    return true;
  }

  if (pathname === '/api/season/current' && method === 'GET') {
    const season = platformRepository.ratingService
      ? await platformRepository.ratingService.getCurrentSeason()
      : null;
    sendJson(res, 200, { season });
    return true;
  }

  if (pathname === '/api/privileges/catalog' && method === 'GET') {
    const rows = platformRepository.currencyService
      ? await platformRepository.currencyService.getPrivilegeCatalog()
      : [];
    sendJson(res, 200, { privileges: rows });
    return true;
  }

  const userCurrencyMatch = pathname.match(/^\/api\/users\/([^/]+)\/currency$/);
  if (userCurrencyMatch && method === 'GET') {
    const id = decodeURIComponent(userCurrencyMatch[1]);
    const cur = platformRepository.currencyService
      ? await platformRepository.currencyService.getUserCurrency(id)
      : null;
    const honor = cur?.honor_points ?? 0;
    const conq = cur?.conquest_points ?? 0;
    sendJson(res, 200, {
      honor_points: honor,
      conquest_points: conq,
      total_honor_earned: cur?.total_honor_earned ?? 0,
      total_conquest_earned: cur?.total_conquest_earned ?? 0,
      neonScore: honor + conq * 10,
    });
    return true;
  }

  const userRatingMatch = pathname.match(/^\/api\/users\/([^/]+)\/rating$/);
  if (userRatingMatch && method === 'GET') {
    const id = decodeURIComponent(userRatingMatch[1]);
    const row = platformRepository.ratingService
      ? await platformRepository.ratingService.getUserRating(id)
      : null;
    sendJson(res, 200, { rating: row });
    return true;
  }

  const userLedgerMatch = pathname.match(/^\/api\/users\/([^/]+)\/ledger$/);
  if (userLedgerMatch && method === 'GET') {
    const id = decodeURIComponent(userLedgerMatch[1]);
    const u = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    const currency = u.searchParams.get('currency') || undefined;
    const limit = Number(u.searchParams.get('limit')) || 50;
    const offset = Number(u.searchParams.get('offset')) || 0;
    const out = platformRepository.currencyService
      ? await platformRepository.currencyService.getUserLedger(id, currency, limit, offset)
      : { rows: [], total: 0 };
    sendJson(res, 200, out);
    return true;
  }

  const userPrivilegesMatch = pathname.match(/^\/api\/users\/([^/]+)\/privileges$/);
  if (userPrivilegesMatch && method === 'GET') {
    const id = decodeURIComponent(userPrivilegesMatch[1]);
    const rows = platformRepository.currencyService
      ? await platformRepository.currencyService.getUserPrivileges(id)
      : [];
    sendJson(res, 200, { privileges: rows });
    return true;
  }

  if (pathname === '/api/privileges/purchase' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    let body = {};
    try {
      body = await parseBody(req);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }
    const slug = String(body.privilegeSlug || '').trim();
    if (!slug) {
      sendJson(res, 400, { error: 'privilegeSlug is required' });
      return true;
    }
    if (!platformRepository.currencyService) {
      sendJson(res, 503, { error: 'Currency service unavailable' });
      return true;
    }
    try {
      const result = await platformRepository.currencyService.spendCurrency(user.id, slug);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Purchase failed' });
    }
    return true;
  }

  if (pathname === '/api/cron/decay-honor' && method === 'POST') {
    let body = {};
    try {
      body = await parseBody(req);
    } catch {
      body = {};
    }
    if (!verifyCronSecret(req, body, env.cronSecret)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    const n = platformRepository.currencyService
      ? await platformRepository.currencyService.applyWeeklyHonorDecay()
      : 0;
    sendJson(res, 200, { affected: n });
    return true;
  }

  if (pathname === '/api/cron/decay-rp' && method === 'POST') {
    let body = {};
    try {
      body = await parseBody(req);
    } catch {
      body = {};
    }
    if (!verifyCronSecret(req, body, env.cronSecret)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    const n = platformRepository.ratingService
      ? await platformRepository.ratingService.applyWeeklyRPDecay()
      : 0;
    sendJson(res, 200, { affected: n });
    return true;
  }

  if (pathname === '/api/settings' && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const settings = await platformRepository.updateSettings(user.id, payload);
    sendJson(res, 200, { settings });
    return true;
  }

  if (pathname === '/api/profile' && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    try {
      const profile = await platformRepository.updateProfile(user.id, payload);
      sendJson(res, 200, { profile });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  if (pathname === '/api/profile/avatar' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required (base64 data URL)' });
      return true;
    }
    try {
      const result = await platformRepository.uploadProfileAvatar(user.id, payload.dataUrl);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' });
    }
    return true;
  }

  if (pathname === '/api/reviews' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    try {
      const result = await platformRepository.createProjectReview(user.id, payload);
      sendJson(res, 201, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Review failed' });
    }
    return true;
  }

  if (pathname === '/api/requests' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.title || !payload.desc || !payload.budget) {
      sendJson(res, 400, { error: 'title, desc, and budget are required' });
      return true;
    }
    const request = await platformRepository.createProjectRequest(user, payload);
    sendJson(res, 201, { request });
    return true;
  }

  const requestIdOnlyMatch = pathname.match(/^\/api\/requests\/([^/]+)$/);
  if (requestIdOnlyMatch && method === 'GET') {
    const user = await getOptionalUser(req);
    const viewerId = user?.id ?? null;
    try {
      const request = await platformRepository.getProjectRequestById(requestIdOnlyMatch[1], viewerId);
      if (!request) {
        sendJson(res, 404, { error: 'Not found' });
        return true;
      }
      sendJson(res, 200, { request });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Failed to load request' });
    }
    return true;
  }

  if (requestIdOnlyMatch && (method === 'PUT' || method === 'PATCH')) {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const requestId = requestIdOnlyMatch[1];
    const payload = await parseBody(req);
    try {
      const request = await platformRepository.updateProjectRequest(user, requestId, payload);
      sendJson(res, 200, { request });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  if (requestIdOnlyMatch && method === 'DELETE') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const requestId = requestIdOnlyMatch[1];
    try {
      const result = await platformRepository.deleteProjectRequest(user, requestId);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Delete failed' });
    }
    return true;
  }

  if (pathname === '/api/services' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.title || !payload.price || !payload.category) {
      sendJson(res, 400, { error: 'title, price, and category are required' });
      return true;
    }
    const service = await platformRepository.createServicePackage(user, payload);
    sendJson(res, 201, { service });
    return true;
  }

  const serviceBidPostMatch = pathname.match(/^\/api\/services\/([^/]+)\/bid\/?$/);
  if (serviceBidPostMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const serviceId = serviceBidPostMatch[1];
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.submitServicePackageBid(user, serviceId, payload);
      sendJson(res, 201, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Bid failed' });
    }
    return true;
  }

  const serviceAcceptDealMatch = pathname.match(/^\/api\/services\/([^/]+)\/accept-deal\/?$/);
  if (serviceAcceptDealMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const serviceId = serviceAcceptDealMatch[1];
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.acceptServicePackageDeal(user, serviceId, payload);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not accept deal' });
    }
    return true;
  }

  if (pathname === '/api/deals/counter-offer' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.submitDealCounterOffer(user, payload);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not send counter offer' });
    }
    return true;
  }

  const serviceIdOnlyGetMatch = pathname.match(/^\/api\/services\/([^/]+)$/);
  if (serviceIdOnlyGetMatch && method === 'GET') {
    const user = await getOptionalUser(req);
    const viewerId = user?.id ?? null;
    try {
      const service = await platformRepository.getServiceById(serviceIdOnlyGetMatch[1], viewerId);
      if (!service) {
        sendJson(res, 404, { error: 'Not found' });
        return true;
      }
      sendJson(res, 200, { service });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Failed to load service' });
    }
    return true;
  }

  if (pathname.startsWith('/api/services/') && pathname.endsWith('/cover') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const serviceId = pathname.slice('/api/services/'.length, -'/cover'.length);
    if (!serviceId || serviceId.includes('/')) {
      sendJson(res, 400, { error: 'Service id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required (base64 data URL)' });
      return true;
    }
    try {
      const service = await platformRepository.uploadServiceCover(user.id, serviceId, payload.dataUrl);
      sendJson(res, 200, { service });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' });
    }
    return true;
  }

  if (pathname.startsWith('/api/services/') && (method === 'PUT' || method === 'PATCH')) {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const serviceId = pathname.slice('/api/services/'.length).split('/')[0];
    if (!serviceId) {
      sendJson(res, 400, { error: 'Service id is required' });
      return true;
    }
    const payload = await parseBody(req);
    try {
      const service = await platformRepository.updateServicePackage(user, serviceId, payload);
      sendJson(res, 200, { service });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  if (pathname.startsWith('/api/services/') && method === 'DELETE') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const serviceId = pathname.slice('/api/services/'.length).split('/')[0];
    if (!serviceId) {
      sendJson(res, 400, { error: 'Service id is required' });
      return true;
    }
    try {
      const result = await platformRepository.deleteServicePackage(user, serviceId);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Delete failed' });
    }
    return true;
  }

  if (pathname === '/api/bids' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.requestId || !payload.price || !payload.proposal) {
      sendJson(res, 400, { error: 'requestId, price, and proposal are required' });
      return true;
    }
    const bid = await platformRepository.createBid(user, payload);
    sendJson(res, 201, { bid });
    return true;
  }

  if (pathname.startsWith('/api/requests/') && pathname.endsWith('/bids') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const requestId = pathname.slice('/api/requests/'.length, -'/bids'.length);
    if (!requestId) {
      sendJson(res, 400, { error: 'Request id is required' });
      return true;
    }
    const payload = await platformRepository.listRequestBids(user.id, requestId);
    sendJson(res, 200, payload);
    return true;
  }

  if (pathname.startsWith('/api/requests/') && pathname.endsWith('/matches') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const requestId = pathname.slice('/api/requests/'.length, -'/matches'.length);
    if (!requestId) {
      sendJson(res, 400, { error: 'Request id is required' });
      return true;
    }
    try {
      const payload = await platformRepository.matchSpecialistsForRequest(user.id, requestId);
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not load matches' });
    }
    return true;
  }

  if (pathname.startsWith('/api/bids/') && pathname.endsWith('/accept') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const bidId = pathname.slice('/api/bids/'.length, -'/accept'.length);
    if (!bidId) {
      sendJson(res, 400, { error: 'Bid id is required' });
      return true;
    }
    const project = await platformRepository.acceptBid(user.id, bidId);
    sendJson(res, 200, { project });
    return true;
  }

  if (pathname.startsWith('/api/bids/') && pathname.endsWith('/reject') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const bidId = pathname.slice('/api/bids/'.length, -'/reject'.length);
    if (!bidId) {
      sendJson(res, 400, { error: 'Bid id is required' });
      return true;
    }
    try {
      const bid = await platformRepository.rejectBid(user.id, bidId);
      sendJson(res, 200, { bid });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not reject bid' });
    }
    return true;
  }

  if (pathname === '/api/agent-runs' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.description || !payload.model) {
      sendJson(res, 400, { error: 'description and model are required' });
      return true;
    }
    const run = await platformRepository.createAgentRun(user, payload);
    sendJson(res, 201, { run });
    return true;
  }

  const agentRunPatch = pathname.match(/^\/api\/agent-runs\/([^/]+)$/);
  if (agentRunPatch && method === 'PATCH') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const runId = agentRunPatch[1];
    const payload = await parseBody(req);
    try {
      const run = await platformRepository.patchAgentRun(user.id, runId, payload);
      sendJson(res, 200, { run });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  if (pathname === '/api/ai/chat' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const mode = String(payload.mode || 'general');
    const messages = payload.messages;
    try {
      const reply = await completeMxAgentChat({
        env,
        model: env.aiModel || undefined,
        mode,
        messages,
      });
      await platformRepository.incrementMxAgentChatUsage(user.id);
      sendJson(res, 200, { reply, source: 'ai', mode });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'AI request failed' });
    }
    return true;
  }

  if (pathname === '/api/ai/image' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const prompt = payload.prompt;
    if (!prompt || !String(prompt).trim()) {
      sendJson(res, 400, { error: 'prompt is required' });
      return true;
    }
    const imgKey = resolveOpenAiImageKey(env);
    if (!imgKey) {
      sendJson(res, 400, {
        error:
          'Image generation needs AI_IMAGE_KEY (OpenAI) or an OpenAI-style AI_API_KEY — not Anthropic keys.',
      });
      return true;
    }
    try {
      const out = await generateOpenAiImage({
        apiKey: imgKey,
        prompt: String(prompt),
        size: payload.size,
      });
      await platformRepository.incrementMxAgentChatUsage(user.id);
      sendJson(res, 200, { ...out, source: 'openai' });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Image generation failed' });
    }
    return true;
  }

  // Squads - Generate AI squad suggestions
  if (pathname === '/api/squads/generate' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const description = String(payload.description || '').trim();
    if (!description) {
      sendJson(res, 400, { error: 'Description is required' });
      return true;
    }
    // Generate squad based on description
    const suggestedName = description.split(' ').slice(0, 3).join(' ') + ' Squad';
    const squad = {
      name: suggestedName,
      description,
      focus: 'General',
      status: 'draft',
    };
    const suggestedMembers = [
      { type: 'ai', role: 'Researcher', name: 'Research Bot', status: 'available' },
      { type: 'ai', role: 'Writer', name: 'Content Bot', status: 'available' },
      { type: 'human', role: 'Lead', name: 'Team Lead (You)', status: 'available' },
    ];
    sendJson(res, 200, { squad, suggestedMembers });
    return true;
  }

  // Squads - Create squad
  if (pathname === '/api/squads/create' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const name = String(payload.name || '').trim();
    const description = String(payload.description || '').trim();
    if (!name || !description) {
      sendJson(res, 400, { error: 'Name and description are required' });
      return true;
    }
    const newSquad = {
      id: crypto.randomUUID(),
      name,
      description,
      ownerId: user.id,
      members: payload.members || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      projectsCompleted: 0,
      winRate: 0,
    };
    sendJson(res, 200, newSquad);
    return true;
  }

  if (pathname === '/api/chat/start' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const activeChat = await platformRepository.createConversation(user, payload);
    sendJson(res, 200, { activeChat });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/chat') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/chat'.length);
    if (!projectId) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const payload = await parseBody(req);
    payload.projectId = projectId;
    const activeChat = await platformRepository.createConversation(user, payload);
    sendJson(res, 200, { activeChat });
    return true;
  }

  // GET /api/chat/:id/messages - Fetch paginated messages for a chat
  // IMPORTANT: This must come BEFORE the generic /api/chat/:id route
  const chatMessagesMatch = pathname.match(/^\/api\/chat\/([^\/]+)\/messages\/?$/);
  if (chatMessagesMatch && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chatId = chatMessagesMatch[1];
    if (!chatId) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const before = url.searchParams.get('before') || null;
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50));
      console.log(`[API] getChatMessages: chatId=${chatId}, user=${user.id}, before=${before}, limit=${limit}`);
      const result = await platformRepository.getChatMessages(user.id, chatId, { before, limit });
      console.log(`[API] getChatMessages: success, messages=${result?.activeChat?.messages?.length || 0}`);
      sendJson(res, 200, result);
    } catch (error) {
      console.error(`[API] getChatMessages error:`, error);
      sendJson(res, 500, { error: error.message || 'Failed to load messages' });
    }
    return true;
  }

  // GET /api/chat/:id - Get single chat details (must come after more specific routes)
  if (pathname.startsWith('/api/chat/') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const conversationId = pathname.slice('/api/chat/'.length);
    if (!conversationId) {
      sendJson(res, 400, { error: 'Conversation id is required' });
      return true;
    }
    try {
      const activeChat = await platformRepository.getConversation(user.id, conversationId);
      sendJson(res, 200, { activeChat });
    } catch (error) {
      console.error(`[API] getConversation error:`, error);
      sendJson(res, 404, { error: error.message || 'Conversation not found' });
    }
    return true;
  }

  if (pathname === '/api/chat/files' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const conversationId = String(payload.conversationId || '').trim();
    if (!conversationId) {
      sendJson(res, 400, { error: 'conversationId is required' });
      return true;
    }
    if (!payload.dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required' });
      return true;
    }
    try {
      const uploaded = await platformRepository.uploadLegacyChatFile(
        user.id,
        conversationId,
        payload.dataUrl,
        payload.fileName || null,
      );
      const activeChat = await platformRepository.addMessage(user.id, {
        conversationId,
        text: String(payload.caption || '').trim(),
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        contentType: uploaded.contentType,
        mime: uploaded.mime,
      });
      sendJson(res, 201, { activeChat, uploaded });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' });
    }
    return true;
  }

  const chatIdFilesMatch = pathname.match(/^\/api\/chat\/([^/]+)\/files\/?$/);
  if (chatIdFilesMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chatId = chatIdFilesMatch[1];
    if (!chatId || chatId.includes('..')) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required (base64 data URL)' });
      return true;
    }
    try {
      const uploaded = await platformRepository.uploadUnifiedChatFile(
        user.id,
        chatId,
        payload.dataUrl,
        payload.fileName || null,
      );
      const message = await platformRepository.addUnifiedMessage(user.id, chatId, {
        content: payload.caption || '',
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        contentType: uploaded.contentType,
        mime: uploaded.mime,
        chatTitle: payload.chatTitle,
      });
      sendJson(res, 201, { message, uploaded });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' });
    }
    return true;
  }

  if (pathname === '/api/chat/messages' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.text && !payload.fileUrl) {
      sendJson(res, 400, { error: 'text or file is required' });
      return true;
    }
    const activeChat = await platformRepository.addMessage(user, payload);
    sendJson(res, 201, { activeChat });
    return true;
  }

  if (pathname.startsWith('/api/chat/') && /\/leave\/?$/.test(pathname) && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    const conversationId = pathname
      .slice('/api/chat/'.length)
      .replace(/\/leave\/?$/, '');
    if (conversationId) {
      await platformRepository.leaveConversation(user.id, conversationId).catch(() => null);
    }
    sendJson(res, 200, { success: true });
    return true;
  }

  if (pathname === '/api/chat/legacy/clear' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    const result = await platformRepository.clearLegacyChats(user.id).catch(() => ({ cleared: 0 }));
    sendJson(res, 200, { success: true, cleared: result.cleared || 0 });
    return true;
  }

  if (pathname === '/api/research' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    if (!payload.topic) {
      sendJson(res, 400, { error: 'topic is required' });
      return true;
    }
    const created = await platformRepository.createResearchRun(user, payload);
    const rid = created.id;
    let research;

    if (hasConfiguredLlm(env)) {
      try {
        const depth = String(payload.mode || 'Quick').trim();
        const reply = await completeMxAgentChat({
          env,
          model: env.aiModel || undefined,
          mode: 'research',
          messages: [
            {
              role: 'user',
              content: `Research depth: ${depth}\n\nTopic:\n${String(payload.topic).trim()}\n\nFollow the system structure. Be concrete; flag gaps where fresh data is needed.`,
            },
          ],
        });
        research = await platformRepository.updateResearchRunWithAi(user.id, rid, reply);
        await platformRepository.incrementMxAgentChatUsage(user.id);
      } catch (error) {
        await platformRepository.updateResearchRunFailed(user.id, rid, error.message);
        research = await platformRepository.getResearchRun(user.id, rid);
      }
    } else {
      research = await platformRepository.getResearchRun(user.id, rid);
    }

    sendJson(res, 201, {
      research,
      aiEnabled: hasConfiguredLlm(env),
    });
    return true;
  }

  if (pathname.startsWith('/api/research/') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const researchId = pathname.slice('/api/research/'.length);
    if (!researchId) {
      sendJson(res, 400, { error: 'Research id is required' });
      return true;
    }
    const research = await platformRepository.getResearchRun(user.id, researchId);
    sendJson(res, 200, { research });
    return true;
  }

  if (pathname.startsWith('/api/research/') && pathname.endsWith('/artifacts') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const researchId = pathname.slice('/api/research/'.length, -'/artifacts'.length);
    if (!researchId) {
      sendJson(res, 400, { error: 'Research id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.type || !payload.title || !payload.content) {
      sendJson(res, 400, { error: 'type, title, and content are required' });
      return true;
    }
    const artifact = await platformRepository.createResearchArtifact(user.id, researchId, payload);
    sendJson(res, 201, { artifact });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/review-eligibility') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/review-eligibility'.length);
    if (!projectId || projectId.includes('/')) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    try {
      const eligibility = await platformRepository.getProjectReviewEligibility(user.id, projectId);
      sendJson(res, 200, eligibility);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed' });
    }
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/milestones') && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/milestones'.length);
    if (!projectId || projectId.includes('/')) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!Array.isArray(payload.milestones)) {
      sendJson(res, 400, { error: 'milestones array is required' });
      return true;
    }
    try {
      const project = await platformRepository.setProjectMilestones(user.id, projectId, payload.milestones);
      sendJson(res, 200, { project });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  if (pathname.startsWith('/api/projects/') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length);
    if (!projectId || projectId.includes('/')) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const project = await platformRepository.getProject(user.id, projectId);
    sendJson(res, 200, { project });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/status') && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/status'.length);
    if (!projectId) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.status) {
      sendJson(res, 400, { error: 'status is required' });
      return true;
    }
    const project = await platformRepository.updateProjectStatus(user.id, projectId, payload.status, payload.note);
    sendJson(res, 200, { project });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/agent-runs') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/agent-runs'.length);
    if (!projectId) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.description || !payload.model) {
      sendJson(res, 400, { error: 'description and model are required' });
      return true;
    }
    const run = await platformRepository.createProjectAgentRun(user.id, projectId, payload);
    sendJson(res, 201, { run });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/deliverables') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/deliverables'.length);
    if (!projectId) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.type || !payload.content) {
      sendJson(res, 400, { error: 'type and content are required' });
      return true;
    }
    const deliverable = await platformRepository.createDeliverable(user.id, projectId, payload);
    sendJson(res, 201, { deliverable });
    return true;
  }

  if (pathname.startsWith('/api/projects/') && pathname.endsWith('/analytics') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const projectId = pathname.slice('/api/projects/'.length, -'/analytics'.length);
    if (!projectId) {
      sendJson(res, 400, { error: 'Project id is required' });
      return true;
    }
    const analytics = await platformRepository.getProjectAnalytics(user.id, projectId);
    sendJson(res, 200, { analytics });
    return true;
  }

  if (pathname === '/api/analytics/dashboard' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const dashboard = await platformRepository.getDashboardAnalytics(user.id);
    sendJson(res, 200, { dashboard });
    return true;
  }

  // Unified Chat System
  if (pathname === '/api/chats' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chats = await platformRepository.getUnifiedChats(user.id);
    sendJson(res, 200, { chats });
    return true;
  }

  if (pathname === '/api/chats' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const chat = await platformRepository.createUnifiedChat(user.id, payload);
    sendJson(res, 201, { chat });
    return true;
  }

  if (pathname.startsWith('/api/chats/') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chatId = pathname.slice('/api/chats/'.length);
    if (!chatId) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    const chat = await platformRepository.getUnifiedChat(user.id, chatId);
    sendJson(res, 200, { chat, presence: buildPresenceSnapshot(chat) });
    return true;
  }

  if (pathname.startsWith('/api/chats/') && /\/leave\/?$/.test(pathname) && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    const chatId = pathname
      .slice('/api/chats/'.length)
      .replace(/\/leave\/?$/, '');
    if (chatId) {
      await platformRepository.leaveUnifiedChat(user.id, chatId).catch(() => null);
    }
    sendJson(res, 200, { success: true });
    return true;
  }

  if (pathname.startsWith('/api/chats/') && pathname.endsWith('/typing') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    const chatId = pathname.slice('/api/chats/'.length, -'/typing'.length);
    if (!chatId) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    const payload = await parseBody(req);
    setTyping(chatId, user.id, Boolean(payload.isTyping));
    sendJson(res, 200, { success: true });
    return true;
  }

  if (pathname.startsWith('/api/chats/') && pathname.endsWith('/files') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chatId = pathname.slice('/api/chats/'.length, -'/files'.length);
    if (!chatId) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    const payload = await parseBody(req);
    if (!payload.dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required (base64 data URL)' });
      return true;
    }
    try {
      const uploaded = await platformRepository.uploadUnifiedChatFile(
        user.id,
        chatId,
        payload.dataUrl,
        payload.fileName || null,
      );
      const message = await platformRepository.addUnifiedMessage(user.id, chatId, {
        content: payload.caption || '',
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        contentType: uploaded.contentType,
        mime: uploaded.mime,
        chatTitle: payload.chatTitle,
      });
      sendJson(res, 201, { message, uploaded });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' });
    }
    return true;
  }

  if (pathname.startsWith('/api/chats/') && pathname.endsWith('/messages') && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const chatId = pathname.slice('/api/chats/'.length, -'/messages'.length);
    if (!chatId) {
      sendJson(res, 400, { error: 'Chat id is required' });
      return true;
    }
    const payload = await parseBody(req);
    const message = await platformRepository.addUnifiedMessage(user.id, chatId, payload);
    sendJson(res, 201, { message });
    return true;
  }

  if (pathname === '/api/nowpayments/ipn' && method === 'POST') {
    await new Promise((resolve, reject) => {
      req.on('data', () => {});
      req.on('end', resolve);
      req.on('error', reject);
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  const contractDraftMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/draft\/?$/);
  if (contractDraftMatch && method === 'PATCH') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractDraftMatch[1];
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.patchContractDraft(user, contractId, payload);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Update failed' });
    }
    return true;
  }

  const contractSendMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/send\/?$/);
  if (contractSendMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractSendMatch[1];
    try {
      const out = await platformRepository.sendContractForSignatures(user, contractId);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Send failed' });
    }
    return true;
  }

  const contractSignMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/sign\/?$/);
  if (contractSignMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractSignMatch[1];
    try {
      const out = await platformRepository.signContract(user, contractId);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Sign failed' });
    }
    return true;
  }

  const contractRevisionMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/revision\/?$/);
  if (contractRevisionMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractRevisionMatch[1];
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.requestContractRevision(user, contractId, payload);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Request failed' });
    }
    return true;
  }

  const contractCancelMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/cancel\/?$/);
  if (contractCancelMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractCancelMatch[1];
    try {
      const out = await platformRepository.cancelContract(user, contractId);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Cancel failed' });
    }
    return true;
  }

  const contractCryptoMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/crypto-intent\/?$/);
  if (contractCryptoMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractCryptoMatch[1];
    const payload = await parseBody(req);
    try {
      const out = await platformRepository.createContractCryptoIntent(user, contractId, payload);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Payment start failed' });
    }
    return true;
  }

  const contractIdOnlyMatch = pathname.match(/^\/api\/contracts\/([^/]+)\/?$/);
  if (contractIdOnlyMatch && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const contractId = contractIdOnlyMatch[1];
    try {
      const out = await platformRepository.getContractForUser(user.id, contractId);
      sendJson(res, 200, out);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Not found' });
    }
    return true;
  }

  // Notifications
  if (pathname === '/api/notifications/read-all' && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      await platformRepository.markAllNotificationsRead(user.id);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed' });
    }
    return true;
  }

  if (pathname === '/api/notifications' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const notifications = await platformRepository.getNotifications(user.id);
    sendJson(res, 200, { notifications });
    return true;
  }

  if (pathname.startsWith('/api/notifications/') && pathname.endsWith('/read') && (method === 'PUT' || method === 'POST')) {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const notificationId = pathname.slice('/api/notifications/'.length, -'/read'.length);
    if (!notificationId) {
      sendJson(res, 400, { error: 'Notification id is required' });
      return true;
    }
    await platformRepository.markNotificationRead(user.id, notificationId);
    sendJson(res, 200, { success: true });
    return true;
  }

  // AI Summary for notifications (stub - returns mock data)
  if (pathname === '/api/notifications/ai-summary' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const notifications = await platformRepository.getNotifications(user.id);
    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length;
    const actionRequiredCount = notifications.filter(n => !n.read && n.actionRequired).length;
    sendJson(res, 200, {
      unreadCount,
      highPriorityCount,
      actionRequiredCount,
      summary: unreadCount > 0 ? `You have ${unreadCount} unread notifications.` : 'All caught up!',
      suggestedActions: actionRequiredCount > 0 ? ['Review pending bids', 'Check contract updates'] : [],
    });
    return true;
  }

  // User Agents API
  if (pathname === '/api/agents' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      const agents = await platformRepository.getUserAgents(user.id);
      const agentCount = agents.filter(a => ['active', 'idle', 'busy'].includes(a.status)).length;
      const canCreate = await platformRepository.canCreateAgent(user.id);
      sendJson(res, 200, { agents, agentCount, canCreate, maxAgents: canCreate ? 3 : 1 });
    } catch (error) {
      // Return empty agents if table doesn't exist
      console.error('Agents load error:', error.message);
      sendJson(res, 200, { agents: [], agentCount: 0, canCreate: true, maxAgents: 3 });
    }
    return true;
  }

  if (pathname === '/api/agents' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      const canCreate = await platformRepository.canCreateAgent(user.id);
      if (!canCreate) {
        sendJson(res, 403, { error: 'Agent limit reached. Upgrade to create more agents.' });
        return true;
      }
      const payload = await parseBody(req);
      const agent = await platformRepository.createUserAgent(user.id, payload);
      
      // Award Honor for creating first agent
      const agentCount = await platformRepository.countUserAgents(user.id);
      if (agentCount === 1 && platformRepository.currencyService) {
        await platformRepository.currencyService.awardHonor(user.id, 100, 'first_agent_created', 'user_agents', agent.id);
      }
      
      sendJson(res, 200, agent);
    } catch (error) {
      console.error('Agent creation error:', error.message);
      sendJson(res, 500, { error: error.message || 'Failed to create agent. Database table may not exist.' });
    }
    return true;
  }

  const agentIdMatch = pathname.match(/^\/api\/agents\/([^/]+)\/?$/);
  if (agentIdMatch && method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const agentId = agentIdMatch[1];
    try {
      const payload = await parseBody(req);
      const agent = await platformRepository.updateUserAgent(user.id, agentId, payload);
      sendJson(res, 200, agent);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to update agent' });
    }
    return true;
  }

  if (agentIdMatch && method === 'DELETE') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const agentId = agentIdMatch[1];
    try {
      await platformRepository.deleteUserAgent(user.id, agentId);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to delete agent' });
    }
    return true;
  }

  // Agent Rent endpoint
  const agentRentMatch = pathname.match(/^\/api\/agents\/([^/]+)\/rent\/?$/);
  if (agentRentMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const agentId = agentRentMatch[1];
    try {
      // Get the agent details
      const agent = await platformRepository.getUserAgentById(agentId);
      if (!agent) {
        sendJson(res, 404, { error: 'Agent not found' });
        return true;
      }
      if (!agent.is_rentable) {
        sendJson(res, 400, { error: 'This agent is not available for rent' });
        return true;
      }
      if (agent.owner_id === user.id) {
        sendJson(res, 400, { error: 'Cannot rent your own agent' });
        return true;
      }
      
      // Deduct Honor from renter and add to owner
      const rentPrice = agent.rent_price_honor || 50;
      if (platformRepository.currencyService) {
        // Deduct from renter
        await platformRepository.currencyService.spendHonor(user.id, rentPrice, 'agent_rental', 'user_agents', agentId);
        // Award to owner
        await platformRepository.currencyService.awardHonor(agent.owner_id, rentPrice, 'agent_rented', 'user_agents', agentId);
      }
      
      // Record the rental
      await platformRepository.recordAgentRental(user.id, agentId, agent.owner_id, rentPrice);
      
      sendJson(res, 200, { success: true, message: 'Agent rented successfully', agent });
    } catch (error) {
      console.error('Agent rent error:', error.message);
      sendJson(res, 500, { error: error.message || 'Failed to rent agent' });
    }
    return true;
  }

  // Squads API
  if (pathname === '/api/squads' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      const mySquads = await platformRepository.getUserSquads(user.id);
      const availableSquads = await platformRepository.getAvailableSquads(user.id);
      const canCreateSquad = await platformRepository.canCreateSquad(user.id);
      sendJson(res, 200, { mySquads, availableSquads, canCreateSquad });
    } catch (error) {
      // Return empty squads if table doesn't exist
      console.error('Squads load error:', error.message);
      sendJson(res, 200, { mySquads: [], availableSquads: [], canCreateSquad: true });
    }
    return true;
  }

  if (pathname === '/api/squads' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      // Temporarily allow all users to create squads for testing
      // const canCreate = await platformRepository.canCreateSquad(user.id);
      // if (!canCreate) {
      //   sendJson(res, 403, { error: 'Free users can join squads but not create them. Upgrade to create squads.' });
      //   return true;
      // }
      const payload = await parseBody(req);
      const squad = await platformRepository.createSquad(user.id, payload);
      
      // Award Honor and Conquest for creating first squad
      if (platformRepository.currencyService) {
        await platformRepository.currencyService.awardHonor(user.id, 200, 'squad_created', 'squads', squad.id);
        await platformRepository.currencyService.awardConquest(user.id, 100, 'squad_created', 'squads', squad.id);
      }
      
      sendJson(res, 200, squad);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to create squad' });
    }
    return true;
  }

  const squadIdMatch = pathname.match(/^\/api\/squads\/([^/]+)\/?$/);
  if (squadIdMatch && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const squadId = squadIdMatch[1];
    try {
      const squad = await platformRepository.getSquadById(user.id, squadId);
      sendJson(res, 200, squad);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to load squad' });
    }
    return true;
  }

  if (squadIdMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const squadId = squadIdMatch[1];
    try {
      // Join squad
      await platformRepository.joinSquad(user.id, squadId);
      
      // Award Honor for joining first squad
      const squadCount = await platformRepository.countUserSquads(user.id);
      if (squadCount === 1 && platformRepository.currencyService) {
        await platformRepository.currencyService.awardHonor(user.id, 150, 'first_squad_joined', 'squads', squadId);
      }
      
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to join squad' });
    }
    return true;
  }

  if (squadIdMatch && method === 'DELETE') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const squadId = squadIdMatch[1];
    try {
      await platformRepository.disbandSquad(user.id, squadId);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to disband squad' });
    }
    return true;
  }

  // Leave squad endpoint
  const squadLeaveMatch = pathname.match(/^\/api\/squads\/([^/]+)\/leave\/?$/);
  if (squadLeaveMatch && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const squadId = squadLeaveMatch[1];
    try {
      await platformRepository.leaveSquad(user.id, squadId);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to leave squad' });
    }
    return true;
  }

  // Portfolio System
  if (pathname === '/api/portfolios' && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const portfolios = await platformRepository.getPortfolios(user.id);
    sendJson(res, 200, { portfolios });
    return true;
  }

  if (pathname === '/api/portfolios' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const payload = await parseBody(req);
    const portfolio = await platformRepository.createPortfolio(user.id, payload);
    sendJson(res, 201, { portfolio });
    return true;
  }

  if (pathname.startsWith('/api/portfolios/') && method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    const portfolioId = pathname.slice('/api/portfolios/'.length);
    if (!portfolioId) {
      sendJson(res, 400, { error: 'Portfolio id is required' });
      return true;
    }
    const portfolio = await platformRepository.getPortfolio(user.id, portfolioId);
    sendJson(res, 200, { portfolio });
    return true;
  }

  // AI Tools - Generate content
  if (pathname === '/api/ai/generate' && method === 'POST') {
    const user = await requireUser(req, res);
    if (!user) return true;
    await ensureProfileForUser(user).catch(() => null);
    try {
      const { tool, input } = await parseBody(req);
      let result = '';
      
      if (tool === 'brief') {
        result = generateBrief(input);
      } else if (tool === 'proposal') {
        result = generateProposal(input);
      } else if (tool === 'contract') {
        result = generateContractReview(input);
      } else {
        result = 'Unknown tool';
      }
      
      sendJson(res, 200, { result });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Failed to generate' });
    }
    return true;
  }

  // Public Profile
  if (pathname.startsWith('/api/profiles/') && pathname.endsWith('/public') && method === 'GET') {
    const username = pathname.slice('/api/profiles/'.length, -'/public'.length);
    if (!username) {
      sendJson(res, 400, { error: 'Username is required' });
      return true;
    }
    const profile = await platformRepository.getPublicProfile(username);
    sendJson(res, 200, { profile });
    return true;
  }

  // AI Models
  if (pathname === '/api/ai-models' && method === 'GET') {
    const models = await platformRepository.getAIModels();
    sendJson(res, 200, { models });
    return true;
  }

  if (pathname === '/api/ai/status' && method === 'GET') {
    const creds = resolveLlmCredentials(env);
    sendJson(res, 200, {
      chat: {
        configured: hasConfiguredLlm(env),
        providerId: creds.kind === 'none' ? null : creds.providerId,
      },
      image: { configured: Boolean(resolveOpenAiImageKey(env)) },
    });
    return true;
  }

  return false;
}

async function createServer() {
  const created = await createStateRepository();
  repository = created.repository;
  storageMode = created.mode;
  platformRepository = await createPlatformRepository(repository);
  agentInfraRepository = createAgentInfraRepository();

  const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    // CORS headers - allow requests from brandforge.gg and Cloudflare
    const allowedOrigins = ['https://brandforge.gg', 'https://brandforge.mxstermind-com.workers.dev', 'http://localhost:3000', 'http://localhost:3001'];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (requestUrl.pathname.startsWith('/api/')) {
      try {
        const handled = await routeApi(req, res, requestUrl.pathname);
        if (!handled) sendJson(res, 404, { error: 'Not found' });
      } catch (error) {
        console.error('[API ERROR]', req.method, requestUrl.pathname, error.message, error.details || '', error.hint || '');
        sendJson(res, 500, { error: error.message || 'Internal server error', details: error.details, hint: error.hint });
      }
      return;
    }

    const filePath = resolveRequestPath(requestUrl.pathname);

    if (!filePath.startsWith(root)) {
      sendText(res, 403, 'Forbidden');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        const status = error.code === 'ENOENT' ? 404 : 500;
        sendText(res, status, status === 404 ? 'Not found' : 'Internal server error');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(content);
    });
  });

  server.listen(port, host, () => {
    console.log(
      `mxstermind full-stack preview running at http://${host}:${port} (${storageMode}) [PORT=${port}]`,
    );
  });
}

createServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
