const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');
const { sendNotificationEmailForRow } = require('./notify-email');

function mimeIsImage(mime) {
  return String(mime || '').toLowerCase().startsWith('image/');
}

const categoryIcons = {
  Design: '&#127912;',
  Development: '&#128187;',
  Content: '&#9997;',
  Marketing: '&#128202;',
  'AI-Powered': '&#9889;',
  Video: '&#127909;',
  Audio: '&#127926;',
};

const categoryBackgrounds = {
  Design: 'linear-gradient(135deg,#1a0a10,#2a1510)',
  Development: 'linear-gradient(135deg,#0a150a,#101a10)',
  Content: 'linear-gradient(135deg,#180a28,#200a30)',
  Marketing: 'linear-gradient(135deg,#080a20,#10122a)',
  'AI-Powered': 'linear-gradient(135deg,#0a1020,#101a30)',
  Video: 'linear-gradient(135deg,#1a0a18,#201020)',
  Audio: 'linear-gradient(135deg,#0a1418,#101820)',
};

const roleColors = {
  client: '#b8ff57',
  specialist: '#ff7c57',
  admin: '#57c4ff',
  enterprise: '#c457ff',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function hashColor(value) {
  const colors = ['#b8ff57', '#57c4ff', '#ff7c57', '#c457ff', '#57ffcd', '#ffcd57'];
  let total = 0;
  for (const char of String(value || 'mx')) total += char.charCodeAt(0);
  return colors[total % colors.length];
}

function deriveBudgetLabel(min, max) {
  if (min && max) return `$${Number(min).toLocaleString()}-$${Number(max).toLocaleString()}`;
  if (min) return `$${Number(min).toLocaleString()}+`;
  if (max) return `Up to $${Number(max).toLocaleString()}`;
  return 'Budget on request';
}

function parseBudget(value) {
  const matches = String(value || '').replace(/,/g, '').match(/\d+(\.\d+)?/g) || [];
  if (matches.length === 0) return { min: null, max: null };
  if (matches.length === 1) {
    const amount = Number(matches[0]);
    return { min: amount, max: amount };
  }
  return { min: Number(matches[0]), max: Number(matches[1]) };
}

function daysUntil(dateValue) {
  if (!dateValue) return 0;
  const today = new Date();
  const target = new Date(dateValue);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.max(Math.ceil((target - today) / 86400000), 0);
}

function flattenSettings(row, fallback = {}) {
  if (!row) {
    return { ...fallback, emailNotifications: fallback.emailNotifications !== false };
  }
  const ns = row.notification_settings || {};
  return {
    ...fallback,
    ...(row.ai_settings || {}),
    ...(row.privacy_settings || {}),
    ...(row.billing_settings || {}),
    ...(row.security_settings || {}),
    ...ns,
    emailNotifications: ns.emailNotifications !== false,
  };
}

function structureSettings(flat = {}, existing = null) {
  const pickBool = (key, fallback = false) => (key in flat ? Boolean(flat[key]) : fallback);
  const pickValue = (key, fallback = null) => (key in flat ? flat[key] : fallback);
  return {
    notification_settings: {
      ...(existing?.notification_settings || {}),
      newBids: pickBool('newBids', existing?.notification_settings?.newBids),
      aiUpdates: pickBool('aiUpdates', existing?.notification_settings?.aiUpdates),
      weeklyDigest: pickBool('weeklyDigest', existing?.notification_settings?.weeklyDigest),
      marketingEmails: pickBool('marketingEmails', existing?.notification_settings?.marketingEmails),
      emailNotifications: pickBool(
        'emailNotifications',
        existing?.notification_settings?.emailNotifications !== false,
      ),
    },
    ai_settings: {
      ...(existing?.ai_settings || {}),
      defaultModel: pickValue('defaultModel', existing?.ai_settings?.defaultModel || 'mxAI Turbo'),
      autoRunAgent: pickBool('autoRunAgent', existing?.ai_settings?.autoRunAgent),
      aiInBids: pickBool('aiInBids', existing?.ai_settings?.aiInBids),
    },
    privacy_settings: {
      ...(existing?.privacy_settings || {}),
      isPublic: pickBool('isPublic', existing?.privacy_settings?.isPublic),
      discoverable: pickBool('discoverable', existing?.privacy_settings?.discoverable ?? true),
    },
    billing_settings: {
      ...(existing?.billing_settings || {}),
    },
    security_settings: {
      ...(existing?.security_settings || {}),
      twoFactor: pickBool('twoFactor', existing?.security_settings?.twoFactor),
      loginAlerts: pickBool('loginAlerts', existing?.security_settings?.loginAlerts ?? true),
    },
  };
}

function mergeByKey(primary, secondary, key, maxCount) {
  const seen = new Set();
  const merged = [];
  for (const item of [...primary, ...secondary]) {
    const unique = item?.[key];
    if (!unique || seen.has(unique)) continue;
    seen.add(unique);
    merged.push(item);
    if (maxCount && merged.length >= maxCount) break;
  }
  return merged;
}

function isSpecialistMarketplaceReady(row, portfolioPublishedCount = 0) {
  if (!row || row.role !== 'specialist') return true;
  const bioOk = String(row.bio || '').trim().length >= 100;
  const skills = Array.isArray(row.skills) ? row.skills : [];
  const skillsOk = skills.filter(Boolean).length >= 1;
  const avatarOk = Boolean(String(row.avatar_url || '').trim());
  const portfolioOk = portfolioPublishedCount >= 1;
  return bioOk && skillsOk && avatarOk && portfolioOk;
}

function mapProfile(row) {
  const name = row.full_name || row.username || 'Mxstermind User';
  const skArr = Array.isArray(row.skills) && row.skills.length
    ? row.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 15)
    : (row.bio ? row.bio.split(',').map((token) => token.trim()).filter(Boolean).slice(0, 3) : ['Verified profile']);
  const rt = row.rating_avg != null ? Number(row.rating_avg) : 5;
  return {
    id: row.id,
    n: name,
    username: row.username || null,
    avatarUrl: row.avatar_url || null,
    bio: row.bio || '',
    r: row.headline || '',
    role: row.role,
    availability: row.availability || 'available',
    t: row.role === 'client' ? 'human' : 'hybrid',
    c: roleColors[row.role] || hashColor(name),
    sk: skArr,
    rate: row.role === 'client' ? 0 : 95,
    jobs: row.completed_projects_count != null ? Number(row.completed_projects_count) : 0,
    rating: Number.isFinite(rt) ? Math.round(rt * 10) / 10 : 5,
    ratingCount: row.rating_count != null ? Number(row.rating_count) : 0,
    topMember: Boolean(row.top_member),
    isRealUser: true,
  };
}

function mapService(row) {
  const ownerName = row.owner?.full_name || row.owner?.username || 'Mxstermind User';
  const category = row.category || 'Design';
  const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const coverUrl = meta.coverUrl || meta.cover_image_url || null;
  return {
    id: row.id,
    ownerId: row.owner_id || null,
    e: categoryIcons[category] || '&#10024;',
    bg: categoryBackgrounds[category] || 'linear-gradient(135deg,#101010,#1b1b1b)',
    cat: category,
    title: row.title,
    description: row.description || '',
    sel: ownerName,
    sc: hashColor(ownerName),
    price: Number(row.base_price),
    rating: meta.rating || 'New',
    sales: meta.sales || 0,
    coverUrl: typeof coverUrl === 'string' && coverUrl.trim() ? coverUrl.trim() : null,
    deliveryMode: row.delivery_mode,
    deliveryDays: row.delivery_days,
    isRealUser: true,
  };
}

function mapRequest(row, bidCount, viewerId) {
  const due = row.due_date ? String(row.due_date).slice(0, 10) : '';
  return {
    id: row.id,
    ownerId: row.owner_id || null,
    title: row.title,
    status: row.status,
    desc: row.description,
    tags: row.tags || [],
    budget: deriveBudgetLabel(row.budget_min, row.budget_max),
    budgetMin: row.budget_min != null ? Number(row.budget_min) : null,
    budgetMax: row.budget_max != null ? Number(row.budget_max) : null,
    dueDate: due,
    bids: bidCount || 0,
    days: daysUntil(row.due_date),
    isUserCreated: Boolean(viewerId && String(row.owner_id) === String(viewerId)),
    canBid: Boolean(row.status !== 'closed' && row.status !== 'awarded'),
    isRealUser: true,
  };
}

function formatConversationDate(dateValue) {
  const date = new Date(dateValue);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mapConversation(row, latestMessage) {
  const type = row.context_type === 'direct' ? 'human' : 'ai';
  return {
    id: row.id,
    t: row.subject || (type === 'ai' ? 'mxAI Assistant' : 'Conversation'),
    s: latestMessage?.body || (type === 'ai' ? 'Start a new AI workflow' : 'Start a conversation'),
    d: latestMessage?.created_at ? formatConversationDate(latestMessage.created_at) : 'Now',
    b: type === 'ai' && row.updated_at ? 'Active' : '',
    bc: type === 'ai' ? 'bb' : '',
    type,
    previewOnly: false,
  };
}

function mapMessage(row, currentUserId) {
  let role = 'peer';
  if (row.sender_type === 'user' && String(row.sender_id) === String(currentUserId)) role = 'user';
  else if (row.sender_type === 'system') role = 'system';
  else if (row.sender_type === 'ai') role = 'ai';
  const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const fileUrl = meta.fileUrl || meta.file_url || null;
  const fileName = meta.fileName || meta.file_name || null;
  const fileSize = meta.fileSize != null ? meta.fileSize : meta.file_size != null ? meta.file_size : null;
  const mime = meta.mime || null;
  let contentType = 'text';
  if (meta.contentType === 'image' || meta.content_type === 'image') contentType = 'image';
  else if (meta.contentType === 'file' || meta.content_type === 'file') contentType = 'file';
  else if (fileUrl) contentType = String(mime || '').toLowerCase().startsWith('image/') ? 'image' : 'file';
  return {
    id: row.id,
    role,
    text: row.body,
    contentType: fileUrl ? contentType : 'text',
    fileUrl,
    fileName,
    fileSize,
    createdAt: row.created_at,
  };
}

function mapAgentRun(row) {
  const rawStatus = String(row.status || 'queued');
  const payload = row.payload || {};
  return {
    id: row.id,
    title: payload.title || 'Agent run',
    model: row.model,
    status: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
    startedAt: row.created_at,
    steps: Array.isArray(payload.steps) ? payload.steps : [],
    aiAssistantReply: payload.aiAssistantReply ? String(payload.aiAssistantReply) : '',
    isRealUser: true,
  };
}

function normalizeProjectMilestones(input) {
  const allowed = new Set(['todo', 'progress', 'review', 'done']);
  if (!Array.isArray(input)) return [];
  return input.slice(0, 48).map((m, i) => {
    const col = allowed.has(String(m?.column)) ? String(m.column) : 'todo';
    return {
      id: String(m?.id || `m-${i}-${Date.now()}`),
      title: String(m?.title || 'Milestone').trim().slice(0, 220) || 'Milestone',
      column: col,
      order: Number.isFinite(Number(m?.order)) ? Number(m.order) : i,
    };
  });
}

function mapProject(row) {
  const clientName = row.client?.full_name || row.client?.username || 'Client';
  const ownerName = row.owner?.full_name || row.owner?.username || 'Specialist';
  const status = String(row.status || 'active');
  const deliveryMode = String(row.delivery_mode || 'hybrid');
  const meta = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  return {
    id: row.id,
    title: row.title,
    status,
    deliveryMode,
    clientName,
    ownerName,
    clientId: row.client_id || row.client?.id || null,
    ownerId: row.owner_id || row.owner?.id || null,
    budget: meta.acceptedPrice ? `$${Number(meta.acceptedPrice).toLocaleString()}` : '',
    deliveryDays: meta.deliveryDays || null,
    updatedAt: row.updated_at || row.created_at,
    milestones: normalizeProjectMilestones(meta.milestones),
    metadata: meta,
  };
}

function mapBid(row) {
  const bidderName = row.bidder?.full_name || row.bidder?.username || 'Specialist';
  return {
    id: row.id,
    requestId: row.request_id,
    bidderId: row.bidder_id,
    bidderName,
    price: `$${Number(row.price).toLocaleString()}`,
    deliveryDays: row.delivery_days || null,
    proposal: row.proposal,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function attachProjectProfiles(client, project) {
  const ids = [project.client_id, project.owner_id].filter(Boolean);
  const { data: profiles } = ids.length
    ? await client.from('profiles').select('id, full_name, username').in('id', ids)
    : { data: [] };
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  return {
    ...project,
    client: profileMap.get(project.client_id) || null,
    owner: profileMap.get(project.owner_id) || null,
  };
}

async function createPlatformRepository(previewRepository) {
  const env = getEnv();
  const preview = previewRepository;
  const hasSupabase = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

  const client = hasSupabase
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    : null;

  async function notifyInsert(row) {
    if (!client) return;
    try {
      const { error } = await client.from('notifications').insert(row);
      if (error) {
        console.warn('[notifications]', error.message);
        return;
      }
      sendNotificationEmailForRow(client, row).catch((e) => console.warn('[notify-email]', e.message));
    } catch (e) {
      console.warn('[notifications]', e.message);
    }
  }

  async function readPreview() {
    return preview.read();
  }

  async function fetchMarketplaceStats() {
    if (!client) return null;
    try {
      const [pubSvcRes, reqRes, bidRes] = await Promise.all([
        client.from('service_packages').select('base_price, owner_id, metadata').eq('status', 'published'),
        client.from('project_requests').select('status, budget_min, budget_max'),
        client.from('bids').select('id', { count: 'exact', head: true }),
      ]);
      if (pubSvcRes.error) console.warn('[bootstrap] service stats:', pubSvcRes.error.message);
      if (reqRes.error) console.warn('[bootstrap] request stats:', reqRes.error.message);
      if (bidRes.error) console.warn('[bootstrap] bid count:', bidRes.error.message);
      const rows = pubSvcRes.error ? [] : pubSvcRes.data || [];
      const owners = new Set(rows.map((r) => r.owner_id).filter(Boolean));
      const ordersSum = rows.reduce((s, r) => s + (Number(r.metadata?.sales) || 0), 0);
      const avgPrice = rows.length
        ? Math.round(rows.reduce((s, r) => s + Number(r.base_price || 0), 0) / rows.length)
        : 0;

      const rrows = reqRes.error ? [] : reqRes.data || [];
      const budgetMids = [];
      for (const r of rrows) {
        const mn = Number(r.budget_min);
        const mx = Number(r.budget_max);
        if (Number.isFinite(mn) || Number.isFinite(mx)) {
          const a = Number.isFinite(mn) ? mn : mx;
          const b = Number.isFinite(mx) ? mx : mn;
          budgetMids.push((a + b) / 2);
        }
      }
      const avgReqBudget = budgetMids.length
        ? Math.round(budgetMids.reduce((s, v) => s + v, 0) / budgetMids.length)
        : null;

      return {
        servicesPublished: rows.length,
        uniqueSellers: owners.size,
        ordersTracked: ordersSum,
        avgServicePrice: avgPrice,
        requestsTotal: rrows.length,
        requestsOpen: rrows.filter((r) => r.status === 'open').length,
        requestsReview: rrows.filter((r) => r.status === 'review').length,
        requestsClosed: rrows.filter((r) => r.status === 'closed').length,
        bidsTotal: bidRes.error ? 0 : bidRes.count || 0,
        avgRequestBudgetMid: avgReqBudget,
      };
    } catch (e) {
      console.warn('[bootstrap] marketplace stats:', e.message);
      return null;
    }
  }

  async function getBootstrap(user) {
    const base = await readPreview();
    if (!client) {
      return {
        platform: base.platform || {},
        research: base.research || { mode: 'Quick', topic: '', hasResults: false },
        activeChat: base.activeChat || { type: 'human', title: 'Chat', messages: [] },
        profile: null,
        settings: flattenSettings(null, base.settings || {}),
        profiles: [],
        services: [],
        requests: [],
        humanChats: [],
        aiChats: [],
        agentRuns: [],
        projects: [],
        leaderboard: [],
        marketplaceStats: null,
      };
    }

    const userId = user?.id || null;
    const [
      profileResult,
      settingsResult,
      profilesResult,
      portfolioOwnersResult,
      servicesResult,
      requestsResult,
      bidsResult,
      participantResult,
      agentRunsResult,
      projectsResult,
    ] = await Promise.all([
      userId ? client.from('profiles').select('*').eq('id', userId).maybeSingle() : Promise.resolve({ data: null }),
      userId ? client.from('user_settings').select('*').eq('user_id', userId).maybeSingle() : Promise.resolve({ data: null }),
      client.from('profiles').select('*').order('created_at', { ascending: false }),
      client.from('portfolios').select('owner_id').eq('status', 'published'),
      client.from('service_packages').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(12),
      client.from('project_requests').select('*').order('created_at', { ascending: false }).limit(12),
      client.from('bids').select('request_id'),
      userId ? client.from('conversation_participants').select('conversation_id').eq('user_id', userId) : Promise.resolve({ data: [] }),
      client.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(12),
      userId
        ? client.from('projects').select('*').or(`client_id.eq.${userId},owner_id.eq.${userId}`).order('updated_at', { ascending: false }).limit(12)
        : Promise.resolve({ data: [] }),
    ]);

    const portfolioCountByOwner = new Map();
    for (const pr of portfolioOwnersResult.data || []) {
      if (!pr.owner_id) continue;
      portfolioCountByOwner.set(pr.owner_id, (portfolioCountByOwner.get(pr.owner_id) || 0) + 1);
    }
    const rawProfileRows = profilesResult.data || [];
    const visibleProfileRows = rawProfileRows.filter((p) =>
      isSpecialistMarketplaceReady(p, portfolioCountByOwner.get(p.id) || 0));
    const liveProfiles = visibleProfileRows.map(mapProfile);
    const profileById = new Map(rawProfileRows.map((p) => [p.id, p]));
    const serviceOwnerIds = [...new Set((servicesResult.data || []).map((row) => row.owner_id).filter(Boolean))];
    const { data: serviceOwners } = serviceOwnerIds.length
      ? await client.from('profiles').select('*').in('id', serviceOwnerIds)
      : { data: [] };
    const serviceOwnerById = new Map((serviceOwners || []).map((owner) => [owner.id, owner]));
    const liveServices = (servicesResult.data || [])
      .filter((row) => {
        const ownerRow = serviceOwnerById.get(row.owner_id) || profileById.get(row.owner_id);
        return isSpecialistMarketplaceReady(ownerRow || { role: 'client', bio: 'x', avatar_url: 'x', skills: ['x'] }, portfolioCountByOwner.get(row.owner_id) || 0);
      })
      .map((row) => mapService({
        ...row,
        owner: serviceOwnerById.get(row.owner_id) || null,
      }));
    const bidCountByRequest = new Map();
    for (const bid of bidsResult.data || []) {
      bidCountByRequest.set(bid.request_id, (bidCountByRequest.get(bid.request_id) || 0) + 1);
    }
    const liveRequests = (requestsResult.data || []).map((row) => mapRequest(row, bidCountByRequest.get(row.id), userId));
    const liveAgentRuns = (agentRunsResult.data || []).map(mapAgentRun);
    const projectRows = projectsResult.data || [];
    const projectProfileIds = [...new Set(projectRows.flatMap((project) => [project.client_id, project.owner_id]).filter(Boolean))];
    const { data: projectProfiles } = projectProfileIds.length
      ? await client.from('profiles').select('id, full_name, username').in('id', projectProfileIds)
      : { data: [] };
    const projectProfileMap = new Map((projectProfiles || []).map((profile) => [profile.id, profile]));
    const liveProjects = projectRows.map((project) => mapProject({
      ...project,
      client: projectProfileMap.get(project.client_id) || null,
      owner: projectProfileMap.get(project.owner_id) || null,
    }));

    const conversationIds = [...new Set((participantResult.data || []).map((row) => row.conversation_id))];
    let liveHumanChats = [];
    let liveAiChats = [];
    if (conversationIds.length) {
      const [{ data: conversations }, { data: messages }] = await Promise.all([
        client.from('conversations').select('*').in('id', conversationIds).order('updated_at', { ascending: false }).limit(20),
        client.from('messages').select('*').in('conversation_id', conversationIds).order('created_at', { ascending: false }),
      ]);
      const latestByConversation = new Map();
      for (const message of messages || []) {
        if (!latestByConversation.has(message.conversation_id)) {
          latestByConversation.set(message.conversation_id, message);
        }
      }
      const mappedConversations = (conversations || []).map((row) => mapConversation(row, latestByConversation.get(row.id)));
      liveHumanChats = mappedConversations.filter((item) => item.type === 'human');
      liveAiChats = mappedConversations.filter((item) => item.type === 'ai');
    }

    // Also fetch unified chats (bid chats) for this user
    if (userId) {
      try {
        const { data: unifiedParticipants } = await client
          .from('unified_chat_participants')
          .select('chat_id')
          .eq('user_id', userId)
          .neq('is_deleted', true);

        const unifiedChatIds = (unifiedParticipants || []).map((p) => p.chat_id);
        if (unifiedChatIds.length) {
          const { data: unifiedChats } = await client
            .from('unified_chats')
            .select('*')
            .in('id', unifiedChatIds)
            .order('last_message_at', { ascending: false })
            .limit(20);

          const { data: unifiedMessages } = await client
            .from('unified_messages')
            .select('*')
            .in('chat_id', unifiedChatIds)
            .order('created_at', { ascending: false });

          const latestUnifiedMsg = new Map();
          for (const msg of unifiedMessages || []) {
            if (!latestUnifiedMsg.has(msg.chat_id)) latestUnifiedMsg.set(msg.chat_id, msg);
          }

          for (const uc of unifiedChats || []) {
            const latest = latestUnifiedMsg.get(uc.id);
            liveHumanChats.push({
              id: uc.id,
              t: uc.title,
              s: latest?.content || uc.subtitle || 'Bid negotiation',
              d: latest?.created_at ? new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now',
              lastMessageAt: latest?.created_at || uc.last_message_at || uc.created_at,
              b: '',
              bc: '',
              type: 'human',
              isUnified: true,
              metadata: uc.metadata,
            });
          }
        }
      } catch (e) {
        // unified_chats table may not exist yet — ignore
      }
    }

    const marketplaceStats = await fetchMarketplaceStats();

    // Only return real Supabase data — no seed/preview merging
    return {
      platform: base.platform || {},
      research: base.research || { mode: 'Quick', topic: '', hasResults: false },
      activeChat: base.activeChat || { type: 'human', title: 'Chat', messages: [] },
      profile: profileResult.data || null,
      settings: flattenSettings(settingsResult.data, base.settings),
      profiles: liveProfiles,
      services: liveServices,
      requests: liveRequests,
      humanChats: liveHumanChats,
      aiChats: liveAiChats,
      agentRuns: liveAgentRuns,
      projects: liveProjects,
      marketplaceStats,
      leaderboard: liveProfiles.map((p) => ({
        id: p.id,
        n: p.n,
        r: p.r,
        c: p.c,
        t: 'Human',
        e: '$0',
        j: p.jobs || 0,
        rt: p.rating || 5,
        tier: 'Challenger',
        usdt: 0,
        role: p.role,
        avatarUrl: p.avatarUrl || null,
        username: p.username || null,
        bio: p.bio || '',
        sk: p.sk || [],
        likes: p.likes || 0,
      })),
    };
  }

  async function updateProfile(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: cur } = await client.from('profiles').select('role, bio').eq('id', userId).maybeSingle();
    if (payload.bio != null && cur?.role === 'specialist' && String(payload.bio).trim().length < 100) {
      throw new Error('Specialists need a public bio of at least 100 characters to stay visible in the marketplace.');
    }
    const nextProfile = { updated_at: new Date().toISOString() };
    if (payload.full_name !== undefined) nextProfile.full_name = payload.full_name || null;
    if (payload.username !== undefined) nextProfile.username = payload.username || null;
    if (payload.headline !== undefined) nextProfile.headline = payload.headline || null;
    if (payload.timezone !== undefined) nextProfile.timezone = payload.timezone || null;
    if (payload.company_name !== undefined) nextProfile.company_name = payload.company_name || null;
    if (payload.bio !== undefined) nextProfile.bio = payload.bio || null;
    if (payload.avatar_url !== undefined) nextProfile.avatar_url = payload.avatar_url || null;
    if (payload.availability != null) {
      const a = String(payload.availability);
      if (!['available', 'busy', 'unavailable'].includes(a)) throw new Error('Invalid availability');
      nextProfile.availability = a;
    }
    if (payload.skills != null) {
      const arr = Array.isArray(payload.skills)
        ? payload.skills
        : String(payload.skills).split(/[,|\n]/).map((s) => s.trim()).filter(Boolean);
      nextProfile.skills = arr.slice(0, 15);
    }
    const { data, error } = await client
      .from('profiles')
      .update(nextProfile)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function uploadProfileAvatar(userId, dataUrl) {
    if (!client) throw new Error('Supabase is not configured');
    const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Expected base64 data URL image');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 2_500_000) throw new Error('Image too large (max ~2.5MB)');
    const path = `${userId}/avatar-${Date.now()}.png`;
    const bucket = 'avatars';
    const { error: upErr } = await client.storage.from(bucket).upload(path, buffer, {
      contentType: m[1].split(';')[0] || 'image/png',
      upsert: true,
    });
    if (upErr) throw new Error(upErr.message || 'Upload failed — create a public "avatars" bucket in Supabase Storage');
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error('Could not get public URL for avatar');
    await client.from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', userId);
    return { avatar_url: url };
  }

  async function uploadServiceCover(userId, serviceId, dataUrl) {
    if (!client) throw new Error('Supabase is not configured');
    const id = await assertServiceOwner(client, userId, serviceId);
    const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Expected base64 data URL image');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 2_500_000) throw new Error('Image too large (max ~2.5MB)');
    const subtype = (m[1].split('/')[1] || 'png').split(';')[0] || 'png';
    const path = `${userId}/${id}-cover-${Date.now()}.${subtype}`;
    const bucket = 'service-covers';
    const { error: upErr } = await client.storage.from(bucket).upload(path, buffer, {
      contentType: m[1].split(';')[0] || 'image/png',
      upsert: false,
    });
    if (upErr) {
      throw new Error(
        upErr.message || 'Upload failed — create a public "service-covers" bucket in Supabase Storage',
      );
    }
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error('Could not get public URL for cover image');

    const { data: row } = await client.from('service_packages').select('metadata').eq('id', id).maybeSingle();
    const meta = row?.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    const { data: updated, error } = await client
      .from('service_packages')
      .update({
        metadata: { ...meta, coverUrl: url },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    const { data: ownerRow } = await client
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', updated.owner_id)
      .maybeSingle();
    return mapService({ ...updated, owner: ownerRow || null });
  }

  async function updateSettings(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: current } = await client
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const structured = structureSettings(payload, current);
    const { data, error } = await client
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          ...structured,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('*')
      .single();
    if (error) throw error;
    return flattenSettings(data);
  }

  async function createServicePackage(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const title = String(payload.title || '').trim();
    const category = String(payload.category || 'Design').trim();
    const deliveryDays = Math.max(1, Number(String(payload.delivery || '').trim()) || 3);
    const price = Number(String(payload.price || '').replace(/[^0-9.]/g, ''));
    const description = payload.description != null && String(payload.description).trim()
      ? String(payload.description).trim()
      : `${title} delivered through the mxstermind ${category} workflow.`;
    const deliveryMode = category === 'AI-Powered' ? 'ai_only' : 'hybrid';
    const slugBase = slugify(title) || `service-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;

    const { data, error } = await client
      .from('service_packages')
      .insert({
        owner_id: user.id,
        title,
        slug,
        category,
        description,
        delivery_mode: deliveryMode,
        base_price: price,
        delivery_days: deliveryDays,
        revisions: deliveryMode === 'white_glove' ? 3 : 1,
        status: 'published',
        metadata: {
          rating: 'New',
          sales: 0,
        },
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapService({
      ...data,
      owner: {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mxstermind User',
        username: user.email?.split('@')[0] || null,
      },
    });
  }

  async function assertServiceOwner(client, userId, serviceId) {
    const id = String(serviceId || '').trim();
    if (!id) throw new Error('Service id is required');
    const { data: row, error } = await client.from('service_packages').select('owner_id').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!row) throw new Error('Service not found');
    if (String(row.owner_id) !== String(userId)) throw new Error('You can only change your own service packages');
    return id;
  }

  async function updateServicePackage(user, serviceId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const id = await assertServiceOwner(client, user.id, serviceId);

    const updates = { updated_at: new Date().toISOString() };
    if (payload.title != null) {
      const t = String(payload.title).trim();
      if (!t) throw new Error('Title cannot be empty');
      updates.title = t;
    }
    if (payload.category != null) {
      const category = String(payload.category).trim();
      if (!category) throw new Error('Category cannot be empty');
      updates.category = category;
      updates.delivery_mode = category === 'AI-Powered' ? 'ai_only' : 'hybrid';
      updates.revisions = 1;
    }
    if (payload.description != null) updates.description = String(payload.description).trim();
    if (payload.price != null) {
      const price = Number(String(payload.price).replace(/[^0-9.]/g, ''));
      if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price');
      updates.base_price = price;
    }
    if (payload.delivery != null) {
      updates.delivery_days = Math.max(1, Number(String(payload.delivery).trim()) || 3);
    }

    const keys = Object.keys(updates).filter((k) => k !== 'updated_at');
    if (!keys.length) throw new Error('No changes to save');

    const { data, error } = await client
      .from('service_packages')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    const { data: ownerRow } = await client
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', data.owner_id)
      .maybeSingle();

    return mapService({ ...data, owner: ownerRow || null });
  }

  async function deleteServicePackage(user, serviceId) {
    if (!client) throw new Error('Supabase is not configured');
    const id = await assertServiceOwner(client, user.id, serviceId);

    const { error } = await client
      .from('service_packages')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { ok: true, id };
  }

  async function createProjectRequest(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const budget = parseBudget(payload.budget);
    const tags = Array.isArray(payload.tags) ? payload.tags.slice(0, 5) : [];

    const { data, error } = await client
      .from('project_requests')
      .insert({
        owner_id: user.id,
        title: String(payload.title || '').trim(),
        description: String(payload.desc || '').trim(),
        category: tags[0] || 'General',
        budget_min: budget.min,
        budget_max: budget.max,
        due_date: payload.deadline || null,
        tags,
        status: 'open',
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRequest(data, 0, user.id);
  }

  async function assertRequestOwner(client, userId, requestId) {
    const id = String(requestId || '').trim();
    if (!id) throw new Error('Request id is required');
    const { data: row, error } = await client.from('project_requests').select('owner_id').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!row) throw new Error('Request not found');
    if (String(row.owner_id) !== String(userId)) throw new Error('You can only change your own requests');
    return id;
  }

  async function countBidsOnRequest(requestId) {
    const { count, error } = await client
      .from('bids')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId);
    if (error) {
      console.warn('[requests] bid count:', error.message);
      return 0;
    }
    return count || 0;
  }

  async function updateProjectRequest(user, requestId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const id = await assertRequestOwner(client, user.id, requestId);

    const { data: existing, error: exErr } = await client
      .from('project_requests')
      .select('status')
      .eq('id', id)
      .single();
    if (exErr) throw exErr;
    if (existing.status === 'closed') throw new Error('This request is closed and cannot be edited');
    if (existing.status === 'awarded') throw new Error('This request was awarded and cannot be edited');

    const updates = { updated_at: new Date().toISOString() };
    if (payload.title != null) {
      const t = String(payload.title).trim();
      if (!t) throw new Error('Title cannot be empty');
      updates.title = t;
    }
    if (payload.desc != null) {
      const d = String(payload.desc).trim();
      if (!d) throw new Error('Description cannot be empty');
      updates.description = d;
    }
    if (payload.tags != null) {
      const tags = Array.isArray(payload.tags) ? payload.tags.slice(0, 5) : [];
      updates.tags = tags;
      updates.category = tags[0] || 'General';
    }
    if (payload.budget != null) {
      const budget = parseBudget(payload.budget);
      updates.budget_min = budget.min;
      updates.budget_max = budget.max;
    }
    if (payload.deadline !== undefined) {
      updates.due_date = payload.deadline ? String(payload.deadline).trim() : null;
    }

    const keys = Object.keys(updates).filter((k) => k !== 'updated_at');
    if (!keys.length) throw new Error('No changes to save');

    const { data, error } = await client
      .from('project_requests')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    const bids = await countBidsOnRequest(id);
    return mapRequest(data, bids, user.id);
  }

  async function deleteProjectRequest(user, requestId) {
    if (!client) throw new Error('Supabase is not configured');
    const id = await assertRequestOwner(client, user.id, requestId);

    const { data: existing } = await client.from('project_requests').select('status').eq('id', id).maybeSingle();
    if (existing?.status === 'closed') return { ok: true, id };

    const { error } = await client
      .from('project_requests')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { ok: true, id };
  }

  async function createBid(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const requestId = String(payload.requestId || '').trim();
    const proposal = String(payload.proposal || '').trim();
    const price = Number(String(payload.price || '').replace(/[^0-9.]/g, ''));
    const deliveryDays = payload.deliveryDays ? Number(payload.deliveryDays) : null;

    const { data: request, error: requestError } = await client
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found');

    const { data, error } = await client
      .from('bids')
      .insert({
        request_id: requestId,
        bidder_id: user.id,
        price,
        delivery_days: deliveryDays,
        proposal,
        ai_assisted: true,
      })
      .select('*')
      .single();
    if (error) throw error;
    if (request.owner_id) {
      await notifyInsert({
        user_id: request.owner_id,
        type: 'bid_submitted',
        title: 'New bid on your request',
        message: `Someone bid on “${request.title || 'your request'}”.`,
        related_id: requestId,
        related_type: 'request',
      });
    }
    return data;
  }

  async function createConversation(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const requestedType = payload.projectId
      ? 'human'
      : payload.type === 'human'
        ? 'human'
        : 'ai';
    if (requestedType === 'ai') {
      throw new Error('mxAI chat is turned off for now. This feature unlocks in a later release.');
    }
    const title = String(payload.title || 'Conversation').trim();
    
    let contextType = 'direct';
    let contextId = null;
    
    if (payload.projectId) {
      contextType = 'project';
      contextId = payload.projectId;
    } else {
      contextType = requestedType === 'human' ? 'direct' : 'agent_run';
    }

    const { data: conversation, error: conversationError } = await client
      .from('conversations')
      .insert({
        subject: title,
        context_type: contextType,
        context_id: contextId,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (conversationError) throw conversationError;

    const participants = [{ conversation_id: conversation.id, user_id: user.id }];
    
    if (contextType === 'project') {
      const { data: project } = await client
        .from('projects')
        .select('client_id, owner_id')
        .eq('id', payload.projectId)
        .single();
      if (project) {
        const otherParticipant = String(project.client_id) === String(user.id) ? project.owner_id : project.client_id;
        if (otherParticipant) {
          participants.push({ conversation_id: conversation.id, user_id: otherParticipant });
        }
      }
    } else {
      const { data: targetProfile } = requestedType === 'human'
        ? await client.from('profiles').select('id').or(`full_name.eq.${title},username.eq.${title.replace(/^@+/, '')}`).limit(1).maybeSingle()
        : { data: null };
      if (targetProfile?.id && String(targetProfile.id) !== String(user.id)) {
        participants.push({ conversation_id: conversation.id, user_id: targetProfile.id });
      }
    }
    
    await client.from('conversation_participants').upsert(participants, { onConflict: 'conversation_id,user_id' });

    const intro = contextType === 'project'
      ? `Project workspace for "${title}". Use this thread to coordinate on deliverables and milestones.`
      : `Conversation with "${title.slice(0, 80)}". Send a message to continue.`;

    await client.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: null,
      sender_type: 'system',
      body: intro,
    });

    await client.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id);
    return getConversation(user.id, conversation.id);
  }

  async function getConversation(currentUserId, conversationId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: participant } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .maybeSingle();
    if (!participant) throw new Error('Conversation not found');

    const [{ data: conversation, error: conversationError }, { data: messages, error: messagesError }] = await Promise.all([
      client.from('conversations').select('*').eq('id', conversationId).single(),
      client.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }),
    ]);
    if (conversationError) throw conversationError;
    if (messagesError) throw messagesError;

    return {
      id: conversation.id,
      title: conversation.subject || 'Conversation',
      type: conversation.context_type === 'direct' ? 'human' : 'ai',
      messages: (messages || []).map((message) => mapMessage(message, currentUserId)),
    };
  }

  async function addMessage(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const conversationId = String(payload.conversationId || '').trim();
    if (!conversationId) throw new Error('conversationId is required');

    const { data: participant } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!participant) throw new Error('Conversation not found');

    const text = String(payload.text || '').trim();
    const fileUrl = payload.fileUrl || null;
    const fileName = payload.fileName || null;
    const fileSize = payload.fileSize != null ? Number(payload.fileSize) : null;
    const mime = payload.mime || null;
    let contentType = payload.contentType || null;
    if (!text && !fileUrl) throw new Error('text or file is required');
    const meta =
      fileUrl ?
        {
          fileUrl,
          fileName,
          fileSize: Number.isFinite(fileSize) ? fileSize : null,
          mime,
          contentType:
            contentType || (String(mime || '').toLowerCase().startsWith('image/') ? 'image' : 'file'),
        }
      : {};
    const body =
      text || (fileName ? `Attachment: ${fileName}` : 'Attachment');
    await client.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_type: 'user',
      body,
      metadata: meta,
    });

    await client.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

    const { data: others } = await client
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);
    for (const row of others || []) {
      if (String(row.user_id) === String(user.id)) continue;
      await notifyInsert({
        user_id: row.user_id,
        type: 'message',
        title: 'New message',
        message: 'You have a new message in a conversation.',
        related_id: conversationId,
        related_type: 'legacy_chat',
      });
    }

    return getConversation(user.id, conversationId);
  }

  async function createAgentRun(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const description = String(payload.description || '').trim();
    const model = String(payload.model || 'mxAI Turbo').trim();
    const steps = [
      { t: 'Understanding the brief', d: description.slice(0, 90), active: true },
      { t: 'Planning the workflow', d: `Preparing the execution graph in ${model}`, wait: true },
      { t: 'Collecting references', d: 'Pending kickoff', wait: true },
      { t: 'Delivering final output', d: 'Pending kickoff', wait: true },
    ];

    const { data, error } = await client
      .from('agent_runs')
      .insert({
        initiated_by: user.id,
        model,
        status: 'queued',
        payload: {
          title: description.slice(0, 58),
          description,
          steps,
        },
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapAgentRun(data);
  }

  async function patchAgentRun(userId, runId, patch) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: row, error: loadErr } = await client
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .maybeSingle();
    if (loadErr) throw loadErr;
    if (!row) throw new Error('Agent run not found');
    if (String(row.initiated_by) !== String(userId)) throw new Error('You can only update your own agent runs');

    const payload = row.payload && typeof row.payload === 'object' ? { ...row.payload } : {};
    if (patch.aiAssistantReply != null) {
      const text = String(patch.aiAssistantReply).trim();
      payload.aiAssistantReply = text;
      const steps = Array.isArray(payload.steps) ? [...payload.steps] : [];
      if (steps.length) {
        steps[0] = { ...steps[0], done: true, active: false, d: text.slice(0, 280) || steps[0].d };
        if (steps[1]) steps[1] = { ...steps[1], active: true, wait: false, d: 'Ready for your review' };
      }
      payload.steps = steps;
    }

    const { data, error } = await client
      .from('agent_runs')
      .update({
        status: 'needs_human',
        payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)
      .select('*')
      .single();
    if (error) throw error;
    return mapAgentRun(data);
  }

  async function incrementMxAgentChatUsage(userId) {
    if (!client || !userId) return;
    const { data: row } = await client.from('user_settings').select('ai_settings').eq('user_id', userId).maybeSingle();
    const ai = row?.ai_settings && typeof row.ai_settings === 'object' ? row.ai_settings : {};
    const next = { ...ai, mxAgentChatTotal: Number(ai.mxAgentChatTotal || 0) + 1 };
    await client
      .from('user_settings')
      .update({ ai_settings: next, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  async function matchSpecialistsForRequest(userId, requestId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: request, error: requestError } = await client
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found');
    if (String(request.owner_id) !== String(userId)) {
      throw new Error('Only the request owner can view specialist matches');
    }

    const corpus = `${request.title || ''} ${request.description || ''} ${request.category || ''} ${(request.tags || []).join(' ')}`.toLowerCase();
    const words = new Set(corpus.split(/[^a-z0-9+#]+/i).filter((w) => w.length > 2));

    const [{ data: portfoliosPublished }, { data: allProfiles }, { data: services }] = await Promise.all([
      client.from('portfolios').select('owner_id').eq('status', 'published'),
      client.from('profiles').select('*'),
      client.from('service_packages').select('owner_id, category, title, description').eq('status', 'published'),
    ]);

    const portfolioCountByOwner = new Map();
    for (const pr of portfoliosPublished || []) {
      if (!pr.owner_id) continue;
      portfolioCountByOwner.set(pr.owner_id, (portfolioCountByOwner.get(pr.owner_id) || 0) + 1);
    }

    const servicesByOwner = new Map();
    for (const s of services || []) {
      if (!s.owner_id) continue;
      const arr = servicesByOwner.get(s.owner_id) || [];
      arr.push(s);
      servicesByOwner.set(s.owner_id, arr);
    }

    const specialists = (allProfiles || []).filter(
      (p) => p.role === 'specialist' && isSpecialistMarketplaceReady(p, portfolioCountByOwner.get(p.id) || 0),
    );

    const reqCat = String(request.category || '').trim().toLowerCase();

    const scored = specialists.map((p) => {
      let score = 0;
      const reasons = [];
      const skills = Array.isArray(p.skills) ? p.skills : [];
      for (const sk of skills) {
        const low = String(sk).toLowerCase().trim();
        if (!low) continue;
        if (corpus.includes(low)) {
          score += 3;
          reasons.push(`Strong fit: “${sk}” in your brief`);
        } else {
          for (const w of words) {
            if (w.length < 3) continue;
            if (low.includes(w) || w.includes(low)) {
              score += 2;
              reasons.push(`Skill overlap: ${sk}`);
              break;
            }
          }
        }
      }

      const svcList = servicesByOwner.get(p.id) || [];
      let catHit = false;
      for (const s of svcList) {
        const c = String(s.category || '').trim().toLowerCase();
        if (reqCat && c && c === reqCat) {
          score += 8;
          catHit = true;
          reasons.push(`Active listing in ${s.category}`);
          break;
        }
      }
      if (!catHit && reqCat) {
        for (const s of svcList) {
          const blob = `${s.title || ''} ${s.description || ''}`.toLowerCase();
          if (blob.includes(reqCat)) {
            score += 3;
            reasons.push(`Related service: ${s.title || 'listing'}`);
            break;
          }
        }
      }

      const bio = String(p.bio || '').toLowerCase();
      for (const w of words) {
        if (w.length < 4) continue;
        if (bio.includes(w)) score += 0.6;
      }
      const headline = String(p.headline || p.username || '').toLowerCase();
      for (const w of words) {
        if (w.length < 4) continue;
        if (headline.includes(w)) score += 0.9;
      }

      const avg = p.rating_avg != null ? Number(p.rating_avg) : null;
      if (avg != null && !Number.isNaN(avg)) {
        if (avg >= 4.8) {
          score += 5;
          reasons.push('Highly rated on platform');
        } else if (avg >= 4.2) {
          score += 3;
          reasons.push('Solid rating');
        } else if (avg >= 3.5) {
          score += 1;
        }
      }
      const completed = Number(p.completed_projects_count || 0);
      if (completed >= 5) {
        score += 2;
        reasons.push(`${completed}+ completed projects`);
      }

      const uniqReasons = [...new Set(reasons)];
      return {
        profile: mapProfile(p),
        score: Math.round(score * 10) / 10,
        reasons: uniqReasons.slice(0, 3),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const positive = scored.filter((x) => x.score > 0).slice(0, 3);
    const matches =
      positive.length > 0
        ? positive
        : scored.slice(0, 3).map((x) => ({
            ...x,
            reasons: x.reasons.length ? x.reasons : ['Browse profiles — add more detail to your brief for sharper matches'],
          }));

    return { requestId: request.id, matches };
  }

  async function listRequestBids(userId, requestId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: request, error: requestError } = await client
      .from('project_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found');
    if (String(request.owner_id) !== String(userId)) throw new Error('You can only review bids on your own requests');

    const { data, error } = await client
      .from('bids')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const bidderIds = [...new Set((data || []).map((bid) => bid.bidder_id).filter(Boolean))];
    const { data: bidderProfiles } = bidderIds.length
      ? await client.from('profiles').select('id, full_name, username').in('id', bidderIds)
      : { data: [] };
    const bidderMap = new Map((bidderProfiles || []).map((profile) => [profile.id, profile]));
    return {
      request: mapRequest(request, data?.length || 0, userId),
      bids: (data || []).map((bid) => mapBid({ ...bid, bidder: bidderMap.get(bid.bidder_id) || null })),
    };
  }

  async function acceptBid(userId, bidId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: bid, error: bidError } = await client
      .from('bids')
      .select('*')
      .eq('id', bidId)
      .maybeSingle();
    if (bidError) throw bidError;
    if (!bid) throw new Error('Bid not found');

    const { data: request, error: requestError } = await client
      .from('project_requests')
      .select('*')
      .eq('id', bid.request_id)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found');
    if (String(request.owner_id) !== String(userId)) throw new Error('Only the request owner can accept a bid');
    if (request.status === 'awarded') throw new Error('This request already has an awarded bid');

    const deliveryMode = bid.ai_assisted ? 'hybrid' : 'white_glove';
    const { data: project, error: projectError } = await client
      .from('projects')
      .insert({
        request_id: request.id,
        accepted_bid_id: bid.id,
        client_id: request.owner_id,
        owner_id: bid.bidder_id,
        title: request.title,
        status: 'active',
        delivery_mode: deliveryMode,
        metadata: {
          acceptedPrice: bid.price,
          deliveryDays: bid.delivery_days,
          requestCategory: request.category,
        },
      })
      .select('*')
      .single();
    if (projectError) throw projectError;

    await Promise.all([
      client.from('bids').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', bid.id),
      client.from('bids').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('request_id', request.id).neq('id', bid.id).in('status', ['submitted', 'shortlisted']),
      client.from('project_requests').update({ status: 'awarded', updated_at: new Date().toISOString() }).eq('id', request.id),
    ]);

    await recordWorkflowEvent({
      projectId: project.id,
      eventType: 'bid_accepted',
      actorId: userId,
      actorType: 'user',
      details: { 
        bidId: bid.id, 
        requestId: request.id, 
        acceptedPrice: bid.price,
        deliveryMode
      }
    });

    await recordProjectMetric(project.id, 'cost_efficiency', Number(bid.price), 'currency', { 
      bidId: bid.id,
      deliveryMode 
    });

    const { data: conversation, error: conversationError } = await client
      .from('conversations')
      .insert({
        subject: request.title,
        context_type: 'project',
        context_id: project.id,
        created_by: userId,
      })
      .select('*')
      .single();
    if (!conversationError && conversation) {
      await client.from('conversation_participants').upsert([
        { conversation_id: conversation.id, user_id: request.owner_id },
        { conversation_id: conversation.id, user_id: bid.bidder_id },
      ], { onConflict: 'conversation_id,user_id' });
      await client.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: null,
        sender_type: 'system',
        body: `Project created for "${request.title}". The bid from this specialist has been accepted and work can begin.`,
      });
    }

    await recordWorkflowEvent({
      projectId: project.id,
      eventType: 'project_created',
      actorId: userId,
      actorType: 'system',
      details: { 
        conversationId: conversation?.id,
        projectTitle: request.title
      }
    });

    if (bid.bidder_id) {
      await notifyInsert({
        user_id: bid.bidder_id,
        type: 'bid_outcome',
        title: 'Your bid was accepted',
        message: `You were awarded “${request.title}”. Open your project to begin work.`,
        related_id: project.id,
        related_type: 'project',
      });
    }

    return mapProject(await attachProjectProfiles(client, project));
  }

  async function rejectBid(userId, bidId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: bid, error: bidError } = await client
      .from('bids')
      .select('*')
      .eq('id', bidId)
      .maybeSingle();
    if (bidError) throw bidError;
    if (!bid) throw new Error('Bid not found');

    const { data: request, error: requestError } = await client
      .from('project_requests')
      .select('*')
      .eq('id', bid.request_id)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw new Error('Request not found');
    if (String(request.owner_id) !== String(userId)) throw new Error('Only the request owner can reject a bid');
    if (request.status === 'awarded') throw new Error('This request already has an accepted bid');
    if (!['submitted', 'shortlisted'].includes(String(bid.status))) {
      throw new Error('This bid can no longer be rejected');
    }

    const { error: updErr } = await client
      .from('bids')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', bid.id);
    if (updErr) throw updErr;

    if (bid.bidder_id) {
      await notifyInsert({
        user_id: bid.bidder_id,
        type: 'bid_outcome',
        title: 'Your bid was not selected',
        message: `Your proposal on “${request.title}” was declined. You can still browse other requests.`,
        related_id: request.id,
        related_type: 'request',
      });
    }

    return mapBid({ ...bid, status: 'rejected' });
  }

  async function getProject(userId, projectId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only view projects you participate in');
    }

    const projectWithProfiles = await attachProjectProfiles(client, project);
    
    const [
      { data: conversation },
      { data: agentRuns },
      { data: deliverables }
    ] = await Promise.all([
      client.from('conversations').select('*').eq('context_type', 'project').eq('context_id', projectId).maybeSingle(),
      client.from('agent_runs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      client.from('deliverables').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    ]);

    const profileIds = [...new Set([
      ...((agentRuns || []).map(run => run.initiated_by).filter(Boolean)),
      ...((deliverables || []).map(del => del.created_by).filter(Boolean))
    ])];
    
    const { data: creatorProfiles } = profileIds.length
      ? await client.from('profiles').select('id, full_name, username').in('id', profileIds)
      : { data: [] };
    const creatorMap = new Map((creatorProfiles || []).map(profile => [profile.id, profile]));

    return {
      ...mapProject(projectWithProfiles),
      conversation: conversation || null,
      agentRuns: (agentRuns || []).map(run => mapAgentRun({ ...run, creator: creatorMap.get(run.initiated_by) || null })),
      deliverables: (deliverables || []).map(del => ({
        id: del.id,
        type: del.type,
        title: del.title,
        status: del.status,
        content: del.content,
        metadata: del.metadata,
        createdBy: creatorMap.get(del.created_by) || null,
        createdAt: del.created_at,
        updatedAt: del.updated_at
      }))
    };
  }

  async function updateProjectStatus(userId, projectId, newStatus, note = null) {
    if (!client) throw new Error('Supabase is not configured');
    const validStatuses = ['active', 'review', 'delivered', 'completed', 'cancelled', 'disputed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only update projects you participate in');
    }

    const isClient = String(project.client_id) === String(userId);
    const isSpecialist = String(project.owner_id) === String(userId);
    const prev = project.status;
    const allowed = (() => {
      if (newStatus === prev) return true;
      if (newStatus === 'disputed' && (isClient || isSpecialist)) {
        return !['completed', 'cancelled', 'disputed'].includes(prev);
      }
      if (prev === 'disputed' && newStatus === 'active' && (isClient || isSpecialist)) return true;
      if (prev === 'disputed' && newStatus === 'cancelled' && (isClient || isSpecialist)) return true;
      if (newStatus === 'cancelled') return isClient;
      if (prev === 'active' && newStatus === 'review') return isSpecialist;
      if (prev === 'review' && newStatus === 'delivered') return isClient;
      if (prev === 'review' && newStatus === 'active') return isClient;
      if (prev === 'delivered' && newStatus === 'completed') return isClient;
      if (prev === 'delivered' && newStatus === 'review') return isClient;
      return false;
    })();
    if (!allowed) {
      throw new Error('This status change is not allowed for your role or the current project state');
    }

    const nextMeta = {
      ...(project.metadata && typeof project.metadata === 'object' ? project.metadata : {}),
      statusHistory: [
        ...((project.metadata?.statusHistory) || []),
        {
          from: project.status,
          to: newStatus,
          updatedBy: userId,
          note,
          timestamp: new Date().toISOString()
        }
      ]
    };
    if (newStatus === 'completed' && prev !== 'completed') {
      nextMeta.completed_at = new Date().toISOString();
    }
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      metadata: nextMeta,
    };

    const { data: updatedProject, error: updateError } = await client
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select('*')
      .single();
    if (updateError) throw updateError;

    if (newStatus === 'completed' && prev !== 'completed' && project.owner_id) {
      const { data: sp } = await client.from('profiles').select('completed_projects_count').eq('id', project.owner_id).maybeSingle();
      const nextC = Number(sp?.completed_projects_count || 0) + 1;
      await client.from('profiles').update({ completed_projects_count: nextC }).eq('id', project.owner_id);
    }

    const peerId = String(project.client_id) === String(userId) ? project.owner_id : project.client_id;
    if (peerId && newStatus !== prev) {
      await notifyInsert({
        user_id: peerId,
        type: 'project_update',
        title: 'Project status updated',
        message: `“${project.title}” is now ${newStatus}.`,
        related_id: projectId,
        related_type: 'project',
      });
    }
    if (newStatus === 'completed' && prev !== 'completed') {
      for (const uid of [project.client_id, project.owner_id].filter(Boolean)) {
        await notifyInsert({
          user_id: uid,
          type: 'system',
          title: 'Leave a review',
          message: `Project “${project.title}” is complete. Review your partner within 7 days.`,
          related_id: projectId,
          related_type: 'project_review',
        });
      }
    }

    const statusMessages = {
      active: 'Project marked active again.',
      review: 'Project is ready for client review.',
      delivered: 'Delivery approved by client.',
      completed: 'Project has been completed.',
      cancelled: 'Project has been cancelled.',
      disputed: 'A dispute was opened on this project. Our team may follow up.',
    };
    if (statusMessages[newStatus]) {
      const { data: projectConv } = await client
        .from('conversations')
        .select('id')
        .eq('context_type', 'project')
        .eq('context_id', projectId)
        .maybeSingle();
      if (projectConv?.id) {
        try {
          await client.from('messages').insert({
            conversation_id: projectConv.id,
            sender_id: null,
            sender_type: 'system',
            body: statusMessages[newStatus] + (note ? ` Note: ${note}` : ''),
          });
        } catch (e) {
          console.warn('[updateProjectStatus] system message:', e.message);
        }
      }
    }

    return mapProject(await attachProjectProfiles(client, updatedProject));
  }

  async function setProjectMilestones(userId, projectId, milestonesInput) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only update projects you participate in');
    }
    const normalized = normalizeProjectMilestones(milestonesInput);
    const meta = project.metadata && typeof project.metadata === 'object' ? project.metadata : {};
    const { error: updateError } = await client
      .from('projects')
      .update({
        metadata: { ...meta, milestones: normalized },
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);
    if (updateError) throw updateError;
    return getProject(userId, projectId);
  }

  async function createProjectAgentRun(userId, projectId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only create agent runs for projects you participate in');
    }

    const description = String(payload.description || '').trim();
    const model = String(payload.model || 'mxAI Turbo').trim();
    const steps = [
      { t: 'Understanding project context', d: description.slice(0, 90), active: true },
      { t: 'Planning workflow steps', d: `Preparing execution in ${model}`, wait: true },
      { t: 'Generating deliverables', d: 'Creating project assets', wait: true },
      { t: 'Quality review', d: 'Final validation', wait: true },
    ];

    const { data, error } = await client
      .from('agent_runs')
      .insert({
        project_id: projectId,
        initiated_by: userId,
        model,
        status: 'queued',
        payload: {
          title: description.slice(0, 58),
          description,
          steps,
        },
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapAgentRun(data);
  }

  async function createDeliverable(userId, projectId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only create deliverables for projects you participate in');
    }

    const { data, error } = await client
      .from('deliverables')
      .insert({
        project_id: projectId,
        created_by: userId,
        type: payload.type,
        title: String(payload.title || '').trim(),
        content: payload.content,
        status: 'draft',
        metadata: payload.metadata || {}
      })
      .select('*')
      .single();
    if (error) throw error;

    const { data: creator } = await client
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', userId)
      .single();

    return {
      id: data.id,
      type: data.type,
      title: data.title,
      status: data.status,
      content: data.content,
      metadata: data.metadata,
      createdBy: creator || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async function createResearchRun(user, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const topic = String(payload.topic || '').trim();
    const mode = String(payload.mode || 'Quick').trim();

    const { data, error } = await client
      .from('research_runs')
      .insert({
        initiated_by: user.id,
        topic,
        mode,
        status: 'queued',
        query: payload.query || {},
        results: {},
        artifacts: [],
        metadata: {
          title: topic.slice(0, 58),
          description: `Research analysis for: ${topic}`,
        }
      })
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      topic: data.topic,
      mode: data.mode,
      status: data.status,
      query: data.query,
      results: data.results,
      artifacts: data.artifacts,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async function updateResearchRunWithAi(userId, researchId, bodyText) {
    if (!client) throw new Error('Supabase is not configured');
    const text = String(bodyText || '').trim();
    const { data: row, error: loadErr } = await client
      .from('research_runs')
      .select('id, initiated_by')
      .eq('id', researchId)
      .maybeSingle();
    if (loadErr) throw loadErr;
    if (!row) throw new Error('Research run not found');
    if (String(row.initiated_by) !== String(userId)) throw new Error('You can only update your own research runs');

    const results = {
      body: text,
      source: 'mx_agent',
      generatedAt: new Date().toISOString(),
    };
    const { error: upErr } = await client
      .from('research_runs')
      .update({
        status: 'completed',
        results,
        updated_at: new Date().toISOString(),
      })
      .eq('id', researchId);
    if (upErr) throw upErr;
    return getResearchRun(userId, researchId);
  }

  async function updateResearchRunFailed(userId, researchId, errorMessage) {
    if (!client) return;
    const msg = String(errorMessage || 'Research failed').slice(0, 2000);
    await client
      .from('research_runs')
      .update({
        status: 'failed',
        results: { error: msg, source: 'mx_agent', failedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      })
      .eq('id', researchId)
      .eq('initiated_by', userId);
  }

  async function getResearchRun(userId, researchId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: research, error: researchError } = await client
      .from('research_runs')
      .select('*')
      .eq('id', researchId)
      .maybeSingle();
    if (researchError) throw researchError;
    if (!research) throw new Error('Research run not found');
    if (String(research.initiated_by) !== String(userId)) {
      throw new Error('You can only view your own research runs');
    }

    const { data: artifacts } = await client
      .from('research_artifacts')
      .select('*')
      .eq('research_run_id', researchId)
      .order('created_at', { ascending: false });

    return {
      id: research.id,
      topic: research.topic,
      mode: research.mode,
      status: research.status,
      query: research.query,
      results: research.results,
      artifacts: research.artifacts,
      metadata: research.metadata,
      createdAt: research.created_at,
      updatedAt: research.updated_at,
      detailedArtifacts: (artifacts || []).map(artifact => ({
        id: artifact.id,
        type: artifact.type,
        title: artifact.title,
        content: artifact.content,
        metadata: artifact.metadata,
        createdAt: artifact.created_at
      }))
    };
  }

  async function createResearchArtifact(userId, researchId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    
    const { data: research, error: researchError } = await client
      .from('research_runs')
      .select('*')
      .eq('id', researchId)
      .maybeSingle();
    if (researchError) throw researchError;
    if (!research) throw new Error('Research run not found');
    if (String(research.initiated_by) !== String(userId)) {
      throw new Error('You can only create artifacts for your own research runs');
    }

    const { data, error } = await client
      .from('research_artifacts')
      .insert({
        research_run_id: researchId,
        type: payload.type,
        title: String(payload.title || '').trim(),
        content: payload.content,
        metadata: payload.metadata || {}
      })
      .select('*')
      .single();
    if (error) throw error;

    const updatedArtifacts = [...(research.artifacts || []), {
      id: data.id,
      type: data.type,
      title: data.title,
      createdAt: data.created_at
    }];

    await client
      .from('research_runs')
      .update({ 
        artifacts: updatedArtifacts,
        updated_at: new Date().toISOString()
      })
      .eq('id', researchId);

    return {
      id: data.id,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      createdAt: data.created_at
    };
  }

  async function recordWorkflowEvent(details) {
    if (!client) return;
    try {
      await client.from('workflow_events').insert({
        project_id: details.projectId || null,
        agent_run_id: details.agentRunId || null,
        research_run_id: details.researchRunId || null,
        event_type: details.eventType,
        actor_id: details.actorId || null,
        actor_type: details.actorType || 'system',
        details: details.details || {},
        timestamp: details.timestamp || new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to record workflow event:', error);
    }
  }

  async function recordProjectMetric(projectId, metricType, value, unit = 'numeric', metadata = {}) {
    if (!client) return;
    try {
      await client.from('project_metrics').insert({
        project_id: projectId,
        metric_type: metricType,
        value,
        unit,
        metadata,
        recorded_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to record project metric:', error);
    }
  }

  async function getProjectAnalytics(userId, projectId) {
    if (!client) throw new Error('Supabase is not configured');
    
    const { data: project, error: projectError } = await client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error('Project not found');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You can only view analytics for projects you participate in');
    }

    const [
      { data: metrics },
      { data: events },
      { data: agentRuns },
      { data: deliverables }
    ] = await Promise.all([
      client.from('project_metrics').select('*').eq('project_id', projectId).order('recorded_at', { ascending: false }),
      client.from('workflow_events').select('*').eq('project_id', projectId).order('timestamp', { ascending: false }).limit(50),
      client.from('agent_runs').select('*').eq('project_id', projectId),
      client.from('deliverables').select('*').eq('project_id', projectId)
    ]);

    const turnaroundTime = project.created_at && project.updated_at 
      ? Math.ceil((new Date(project.updated_at) - new Date(project.created_at)) / (1000 * 60 * 60 * 24))
      : null;

    const completionRate = agentRuns?.length > 0 
      ? (agentRuns.filter(run => run.status === 'completed').length / agentRuns.length) * 100
      : 0;

    const avgRevisionCount = deliverables?.length > 0
      ? deliverables.filter(del => del.status === 'rejected').length / deliverables.length
      : 0;

    return {
      projectId,
      turnaroundTime,
      completionRate,
      avgRevisionCount,
      totalAgentRuns: agentRuns?.length || 0,
      totalDeliverables: deliverables?.length || 0,
      metrics: metrics || [],
      recentEvents: events || [],
      kpis: {
        gsv: project.metadata?.acceptedPrice || 0,
        takeRate: 0.15,
        agentCompletionRate: completionRate,
        humanHandoffRate: agentRuns?.filter(run => run.status === 'needs_human').length || 0,
        timeToFirstDeliverable: turnaroundTime,
        workflowGrossMargin: 0.65
      }
    };
  }

  async function getDashboardAnalytics(userId) {
    if (!client) throw new Error('Supabase is not configured');

    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isClient = profile?.role === 'client';
    const isSpecialist = profile?.role === 'specialist';

    let projectQuery = client.from('projects').select('*');
    if (isClient) {
      projectQuery = projectQuery.eq('client_id', userId);
    } else if (isSpecialist) {
      projectQuery = projectQuery.eq('owner_id', userId);
    } else {
      projectQuery = projectQuery.or(`client_id.eq.${userId},owner_id.eq.${userId}`);
    }

    const [
      { data: projects },
      { data: metrics },
      { data: events }
    ] = await Promise.all([
      projectQuery.order('updated_at', { ascending: false }).limit(10),
      client.from('project_metrics').select('*').in('project_id', (projects || []).map(p => p.id)),
      client.from('workflow_events').select('*').in('project_id', (projects || []).map(p => p.id)).order('timestamp', { ascending: false }).limit(20)
    ]);

    const totalGsv = (projects || []).reduce((sum, project) => sum + (project.metadata?.acceptedPrice || 0), 0);
    const activeProjects = (projects || []).filter(p => p.status === 'active' || p.status === 'review').length;
    const completedProjects = (projects || []).filter(p => p.status === 'completed').length;

    const avgTurnaroundTime = (projects || [])
      .filter(p => p.created_at && p.updated_at && p.status === 'completed')
      .reduce((sum, project) => {
        const days = Math.ceil((new Date(project.updated_at) - new Date(project.created_at)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / (completedProjects || 1);

    return {
      overview: {
        totalProjects: projects?.length || 0,
        activeProjects,
        completedProjects,
        totalGsv,
        avgTurnaroundTime: Math.round(avgTurnaroundTime * 10) / 10
      },
      recentProjects: (projects || []).slice(0, 5).map(mapProject),
      metrics: metrics || [],
      recentEvents: events || []
    };
  }

  // Unified Chat System
  async function getUnifiedChats(userId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('unified_chat_participants')
      .select(`
        chat_id,
        role,
        last_read_at,
        is_deleted,
        unified_chats (
          id,
          type,
          title,
          subtitle,
          avatar_url,
          metadata,
          last_message_at,
          created_at
        )
      `)
      .eq('user_id', userId)
      .neq('is_deleted', true)
      .order('unified_chats.last_message_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(participant => ({
      id: participant.unified_chats.id,
      type: participant.unified_chats.type,
      title: participant.unified_chats.title,
      subtitle: participant.unified_chats.subtitle,
      avatarUrl: participant.unified_chats.avatar_url,
      metadata: participant.unified_chats.metadata,
      lastMessageAt: participant.unified_chats.last_message_at,
      createdAt: participant.unified_chats.created_at,
      userRole: participant.role,
      lastReadAt: participant.last_read_at
    }));
  }

  async function createUnifiedChat(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');

    const meta = payload.metadata || {};
    const requestedType = payload.type || 'human';

    // Resolve listing owner so both parties are guaranteed in one shared chat.
    let otherUserId = null;
    if (meta.serviceId) {
      const { data: svc } = await client
        .from('service_packages')
        .select('owner_id')
        .eq('id', meta.serviceId)
        .maybeSingle();
      if (svc?.owner_id && String(svc.owner_id) !== String(userId)) {
        otherUserId = svc.owner_id;
      }
    } else if (meta.requestId) {
      const { data: req } = await client
        .from('project_requests')
        .select('owner_id')
        .eq('id', meta.requestId)
        .maybeSingle();
      if (req?.owner_id && String(req.owner_id) !== String(userId)) {
        otherUserId = req.owner_id;
      }
    }

    // Deduplicate by listing: reuse existing chat for this user+listing.
    const { data: myParticipants } = await client
      .from('unified_chat_participants')
      .select('chat_id')
      .eq('user_id', userId)
      .neq('is_deleted', true);
    const myChatIds = (myParticipants || []).map((p) => p.chat_id).filter(Boolean);
    if (myChatIds.length) {
      const { data: myChats } = await client
        .from('unified_chats')
        .select('id, type, title, subtitle, metadata, created_at')
        .in('id', myChatIds)
        .eq('type', requestedType);
      const existing = (myChats || []).find((chat) => {
        const chatMeta = chat.metadata || {};
        if (meta.serviceId) return String(chatMeta.serviceId || '') === String(meta.serviceId);
        if (meta.requestId) return String(chatMeta.requestId || '') === String(meta.requestId);
        return false;
      });
      if (existing) {
        const prevMeta = existing.metadata || {};
        const mergedMeta = { ...prevMeta, ...meta };
        const metaChanged = JSON.stringify(mergedMeta) !== JSON.stringify(prevMeta);
        if (metaChanged) {
          await client.from('unified_chats').update({ metadata: mergedMeta }).eq('id', existing.id);
        }
        await client.from('unified_chat_participants').upsert(
          { chat_id: existing.id, user_id: userId, role: 'owner', is_deleted: false },
          { onConflict: 'chat_id,user_id' }
        );
        if (otherUserId) {
          await client.from('unified_chat_participants').upsert(
            { chat_id: existing.id, user_id: otherUserId, role: 'participant', is_deleted: false },
            { onConflict: 'chat_id,user_id' }
          );
        }
        return {
          id: existing.id,
          type: existing.type,
          title: existing.title,
          subtitle: existing.subtitle,
          metadata: metaChanged ? mergedMeta : prevMeta,
          messages: [],
          participants: [],
          createdAt: existing.created_at,
        };
      }
    }

    // Step 1: Insert the chat row
    const { data: chat, error: chatError } = await client
      .from('unified_chats')
      .insert({
        type: requestedType,
        title: payload.title || 'Chat',
        subtitle: payload.subtitle || null,
        avatar_url: payload.avatarUrl || null,
        metadata: meta,
      })
      .select('*')
      .single();

    if (chatError) {
      console.error('[createUnifiedChat] insert chat error:', chatError.message, chatError.details, chatError.hint);
      throw new Error(chatError.message);
    }

    // Step 2: Add the bidder (creator) as owner — upsert to handle duplicates
    await client.from('unified_chat_participants').upsert({
      chat_id: chat.id,
      user_id: userId,
      role: 'owner',
      is_deleted: false,
    }, { onConflict: 'chat_id,user_id' }).then(({ error }) => {
      if (error) console.error('[createUnifiedChat] owner participant error:', error.message);
    });

    // Step 3: Add the other party (service owner or request owner)
    if (otherUserId) {
      await client.from('unified_chat_participants').upsert({
        chat_id: chat.id,
        user_id: otherUserId,
        role: 'participant',
        is_deleted: false,
      }, { onConflict: 'chat_id,user_id' }).then(({ error }) => {
        if (error) console.error('[createUnifiedChat] other participant error:', error.message);
      });

      // Step 4: Notify the other party that someone bid on their service/request
      const contextLabel = meta.serviceTitle || meta.requestTitle || 'your listing';
      const chatType = meta.chatType || 'bid';
      await notifyInsert({
        user_id: otherUserId,
        type: 'service_inquiry',
        title: chatType === 'service_bid' ? 'New bid on your service' : 'New bid on your request',
        message: `Someone placed a bid on "${contextLabel}". Open the chat to respond.`,
        related_id: chat.id,
        related_type: 'chat',
      });
    }

    // Step 5: Return lightweight chat object
    return {
      id: chat.id,
      type: chat.type,
      title: chat.title,
      subtitle: chat.subtitle,
      metadata: chat.metadata,
      messages: [],
      participants: [],
      createdAt: chat.created_at,
    };
  }

  async function getUnifiedChat(userId, chatId) {
    if (!client) throw new Error('Supabase is not configured');

    // Check participant row (is_deleted may be null for new rows)
    const { data: participant } = await client
      .from('unified_chat_participants')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true)
      .maybeSingle();

    if (!participant) {
      // Not found as participant — check if they are the service/request owner (race condition on insert)
      const { data: chatCheck } = await client
        .from('unified_chats').select('id, metadata').eq('id', chatId).maybeSingle();
      if (!chatCheck) throw new Error('Chat not found or access denied');
      const meta = chatCheck.metadata || {};
      let isOwner = false;
      if (meta.serviceId) {
        const { data: svc } = await client.from('service_packages').select('owner_id').eq('id', meta.serviceId).maybeSingle();
        if (String(svc?.owner_id) === String(userId)) isOwner = true;
      }
      if (meta.requestId) {
        const { data: req } = await client.from('project_requests').select('owner_id').eq('id', meta.requestId).maybeSingle();
        if (String(req?.owner_id) === String(userId)) isOwner = true;
      }
      if (!isOwner) throw new Error('Chat not found or access denied');
      // Auto-add as participant
      await client.from('unified_chat_participants').upsert(
        { chat_id: chatId, user_id: userId, role: 'participant', is_deleted: false },
        { onConflict: 'chat_id,user_id' }
      );
    }

    // Mark this chat as read for the viewer.
    await client
      .from('unified_chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true);

    // Get chat details
    const { data: chat, error: chatError } = await client
      .from('unified_chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatError) throw chatError;

    // Get messages
    const { data: messages, error: messagesError } = await client
      .from('unified_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;

    // Get participants
    const { data: participants, error: participantsError } = await client
      .from('unified_chat_participants')
      .select(`
        user_id,
        ai_model,
        role,
        last_read_at,
        profiles (id, full_name, username, avatar_url)
      `)
      .eq('chat_id', chatId)
      .neq('is_deleted', true);
    
    if (participantsError) throw participantsError;

    return {
      ...chat,
      messages: (messages || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        aiModel: msg.ai_model,
        senderType: msg.sender_type,
        content: msg.content,
        contentType: msg.content_type,
        fileUrl: msg.file_url,
        fileName: msg.file_name,
        fileSize: msg.file_size,
        voiceDuration: msg.voice_duration,
        metadata: msg.metadata,
        createdAt: msg.created_at
      })),
      participants: (participants || []).map(p => ({
        userId: p.user_id,
        aiModel: p.ai_model,
        role: p.role,
        lastReadAt: p.last_read_at,
        profile: p.profiles
      }))
    };
  }

  async function uploadLegacyChatFile(userId, conversationId, dataUrl, originalName) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: participant, error: participantError } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();
    if (participantError) throw participantError;
    if (!participant) throw new Error('Conversation not found');

    const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Expected base64 data URL file');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 4_800_000) throw new Error('File too large (max ~4.8MB)');
    const mime = (m[1].split(';')[0] || 'application/octet-stream').trim();
    const contentType = mime.startsWith('image/') ? 'image' : 'file';
    const rawName = String(originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
    const baseName = rawName.replace(/\.[^/.]+$/, '') || 'file';
    const extFromMime = mime.includes('/') ? mime.split('/')[1].split('+')[0].slice(0, 12) : 'bin';
    const path = `${userId}/legacy/${conversationId}/${Date.now()}-${baseName}.${extFromMime}`.replace(/\.\./g, '');
    const bucket = 'chat-files';
    const { error: upErr } = await client.storage.from(bucket).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (upErr) {
      throw new Error(
        upErr.message || 'Upload failed — create a public "chat-files" bucket in Supabase Storage',
      );
    }
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error('Could not get public URL for file');
    return {
      fileUrl: url,
      fileName: String(originalName || baseName).slice(0, 240),
      fileSize: buffer.length,
      contentType,
      mime,
    };
  }

  async function uploadUnifiedChatFile(userId, chatId, dataUrl, originalName) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: participant, error: participantError } = await client
      .from('unified_chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true)
      .maybeSingle();
    if (participantError) throw participantError;
    if (!participant) throw new Error('Chat not found or access denied');

    const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
    if (!m) throw new Error('Expected base64 data URL file');
    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > 4_800_000) throw new Error('File too large (max ~4.8MB)');
    const mime = (m[1].split(';')[0] || 'application/octet-stream').trim();
    const contentType = mime.startsWith('image/') ? 'image' : 'file';
    const rawName = String(originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
    const baseName = rawName.replace(/\.[^/.]+$/, '') || 'file';
    const extFromMime = mime.includes('/') ? mime.split('/')[1].split('+')[0].slice(0, 12) : 'bin';
    const path = `${userId}/${chatId}/${Date.now()}-${baseName}.${extFromMime}`.replace(/\.\./g, '');
    const bucket = 'chat-files';
    const { error: upErr } = await client.storage.from(bucket).upload(path, buffer, {
      contentType: mime,
      upsert: false,
    });
    if (upErr) {
      throw new Error(
        upErr.message || 'Upload failed — create a public "chat-files" bucket in Supabase Storage',
      );
    }
    const { data: pub } = client.storage.from(bucket).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error('Could not get public URL for file');
    return {
      fileUrl: url,
      fileName: String(originalName || safe).slice(0, 240),
      fileSize: buffer.length,
      contentType,
      mime,
    };
  }

  async function addUnifiedMessage(userId, chatId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    
    // Verify user is participant (is_deleted may be null for new rows — treat null as not deleted)
    const { data: participant, error: participantError } = await client
      .from('unified_chat_participants')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true)
      .maybeSingle();
    
    if (participantError) throw participantError;
    if (!participant) throw new Error('Chat not found or access denied');

    const textRaw = String(payload.content || payload.text || '').trim();
    const fileUrl = payload.fileUrl || payload.file_url || null;
    const fileName = payload.fileName || payload.file_name || null;
    const fileSize = payload.fileSize != null ? Number(payload.fileSize) : payload.file_size != null ? Number(payload.file_size) : null;
    const mime = payload.mime || null;
    let contentType = 'text';
    if (payload.contentType === 'image' || payload.content_type === 'image') contentType = 'image';
    else if (payload.contentType === 'file' || payload.content_type === 'file') contentType = 'file';
    else if (fileUrl) contentType = mimeIsImage(mime) ? 'image' : 'file';
    if (!textRaw && !fileUrl) throw new Error('Message text or file is required');
    const displayContent = textRaw || (fileName ? `Attachment: ${fileName}` : 'Attachment');

    const { data: message, error: messageError } = await client
      .from('unified_messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        sender_type: payload.senderType || 'user',
        content: displayContent,
        content_type: contentType,
        file_url: fileUrl,
        file_name: fileName,
        file_size: Number.isFinite(fileSize) ? fileSize : null,
        metadata: payload.metadata || {},
      })
      .select('*')
      .single();
    
    if (messageError) {
      console.error('[addUnifiedMessage] insert error:', messageError.message, messageError.details);
      throw new Error(messageError.message);
    }

    // Sender has read up to this message.
    await client
      .from('unified_chat_participants')
      .update({ last_read_at: message.created_at })
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true);

    // Update chat's last message time
    await client
      .from('unified_chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);

    // Create notifications for other participants
    if (payload.senderType === 'user') {
      const { data: otherParticipants } = await client
        .from('unified_chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', userId)
        .neq('is_deleted', true);

      if (otherParticipants && otherParticipants.length > 0) {
        const snippet = fileUrl
          ? (fileName ? `Sent a file: ${fileName}` : 'Sent an attachment')
          : String(displayContent || '').slice(0, 160);
        const notifications = otherParticipants.map((p) => ({
          user_id: p.user_id,
          type: 'message',
          title: 'New message',
          message: `${snippet}${payload.chatTitle ? ` · ${payload.chatTitle}` : ''}`,
          related_id: chatId,
          related_type: 'chat',
        }));
        for (const row of notifications) {
          await notifyInsert(row);
        }
      }
    }

    return {
      id: message.id,
      senderId: message.sender_id,
      aiModel: message.ai_model,
      senderType: message.sender_type,
      content: message.content,
      contentType: message.content_type,
      fileUrl: message.file_url,
      fileName: message.file_name,
      fileSize: message.file_size,
      voiceDuration: message.voice_duration,
      metadata: message.metadata,
      createdAt: message.created_at
    };
  }

  async function leaveUnifiedChat(userId, chatId) {
    if (!client) return;
    await client
      .from('unified_chat_participants')
      .update({ is_deleted: true })
      .eq('chat_id', chatId)
      .eq('user_id', userId);
  }

  async function setUnifiedTyping(userId, chatId, isTyping) {
    if (!client) return;
    const patch = isTyping
      ? { typing_at: new Date().toISOString() }
      : { typing_at: null };
    await client
      .from('unified_chat_participants')
      .update(patch)
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .neq('is_deleted', true);
  }

  async function leaveConversation(userId, conversationId) {
    if (!client) return;
    await client
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  }

  async function clearLegacyChats(userId) {
    if (!client) return { cleared: 0 };
    const { data: participantRows } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);
    const ids = [...new Set((participantRows || []).map((row) => row.conversation_id).filter(Boolean))];
    if (!ids.length) return { cleared: 0 };

    await client
      .from('conversation_participants')
      .delete()
      .eq('user_id', userId)
      .in('conversation_id', ids);

    return { cleared: ids.length };
  }

  // Notifications
  async function getNotifications(userId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  }

  async function markNotificationRead(userId, notificationId) {
    if (!client) throw new Error('Supabase is not configured');
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }

  async function markAllNotificationsRead(userId) {
    if (!client) throw new Error('Supabase is not configured');
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  }

  async function recalculateRatingForReviewee(revieweeId) {
    if (!client) return;
    const { data: revs, error } = await client.from('project_reviews').select('rating').eq('reviewee_id', revieweeId);
    if (error) return;
    const list = revs || [];
    const cnt = list.length;
    const avg = cnt
      ? Math.round((list.reduce((s, r) => s + Number(r.rating), 0) / cnt) * 10) / 10
      : null;
    const { data: prof } = await client.from('profiles').select('completed_projects_count').eq('id', revieweeId).maybeSingle();
    const completed = Number(prof?.completed_projects_count || 0);
    const top = avg != null && avg >= 4.8 && completed >= 3;
    await client.from('profiles').update({
      rating_avg: avg,
      rating_count: cnt,
      top_member: top,
    }).eq('id', revieweeId);
  }

  async function createProjectReview(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const projectId = String(payload.projectId || '').trim();
    const revieweeId = String(payload.revieweeId || '').trim();
    const rating = Number(payload.rating);
    const body = String(payload.body || '').trim();
    if (!projectId || !revieweeId) throw new Error('projectId and revieweeId are required');
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new Error('rating must be 1–5');
    if (body.length < 20) throw new Error('Review text must be at least 20 characters');

    const { data: project, error: pe } = await client.from('projects').select('*').eq('id', projectId).maybeSingle();
    if (pe) throw pe;
    if (!project) throw new Error('Project not found');
    if (project.status !== 'completed') throw new Error('You can only review after the project is completed');
    if (String(project.client_id) !== String(userId) && String(project.owner_id) !== String(userId)) {
      throw new Error('You are not a participant on this project');
    }
    const expectedPeer = String(project.client_id) === String(userId) ? String(project.owner_id) : String(project.client_id);
    if (String(revieweeId) !== expectedPeer) throw new Error('You can only review your project partner');

    const meta = project.metadata && typeof project.metadata === 'object' ? project.metadata : {};
    const completedAt = meta.completed_at ? new Date(meta.completed_at) : new Date(project.updated_at);
    const deadline = new Date(completedAt);
    deadline.setDate(deadline.getDate() + 7);
    if (new Date() > deadline) throw new Error('The review window (7 days after completion) has expired');

    const { data: dup } = await client.from('project_reviews').select('id').eq('project_id', projectId).eq('reviewer_id', userId).maybeSingle();
    if (dup) throw new Error('You already submitted a review for this project');

    const { data: inserted, error: insErr } = await client
      .from('project_reviews')
      .insert({
        project_id: projectId,
        reviewer_id: userId,
        reviewee_id: revieweeId,
        rating: Math.round(rating),
        body,
      })
      .select('id')
      .single();
    if (insErr) throw insErr;

    await recalculateRatingForReviewee(revieweeId);
    await notifyInsert({
      user_id: revieweeId,
      type: 'review_received',
      title: 'You received a review',
      message: `New ${Math.round(rating)}★ feedback from a completed project.`,
      related_id: inserted.id,
      related_type: 'review',
    });

    return { id: inserted.id };
  }

  async function getProjectReviewEligibility(userId, projectId) {
    if (!client) throw new Error('Supabase is not configured');
    const proj = await getProject(userId, projectId);
    if (proj.status !== 'completed') {
      return { canSubmit: false, reason: 'not_completed' };
    }
    const meta = proj.metadata && typeof proj.metadata === 'object' ? proj.metadata : {};
    const completedAt = meta.completed_at ? new Date(meta.completed_at) : new Date(proj.updatedAt || Date.now());
    const deadline = new Date(completedAt);
    deadline.setDate(deadline.getDate() + 7);
    if (new Date() > deadline) {
      return { canSubmit: false, reason: 'expired' };
    }
    const revieweeId = String(proj.clientId) === String(userId) ? String(proj.ownerId) : String(proj.clientId);
    const { data: dup } = await client.from('project_reviews').select('id').eq('project_id', projectId).eq('reviewer_id', userId).maybeSingle();
    if (dup) {
      return { canSubmit: false, reason: 'already_submitted', revieweeId };
    }
    return { canSubmit: true, revieweeId, projectTitle: proj.title, deadline: deadline.toISOString() };
  }

  async function listPublicReviewsForProfile(username) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: profile } = await client.from('profiles').select('id').eq('username', username).eq('is_public', true).maybeSingle();
    if (!profile) throw new Error('Profile not found');
    const { data: revs } = await client
      .from('project_reviews')
      .select('*')
      .eq('reviewee_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);
    const ids = [...new Set((revs || []).map((r) => r.reviewer_id))];
    const { data: rprofs } = ids.length ? await client.from('profiles').select('id, full_name, username, avatar_url').in('id', ids) : { data: [] };
    const nm = new Map((rprofs || []).map((p) => [p.id, p]));
    return (revs || []).map((r) => {
      const p = nm.get(r.reviewer_id);
      return {
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.created_at,
        reviewerName: p?.full_name || p?.username || 'Member',
        reviewerAvatar: p?.avatar_url || null,
      };
    });
  }

  // Portfolio System
  async function getPortfolios(userId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('portfolios')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async function createPortfolio(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('portfolios')
      .insert({
        owner_id: userId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        tags: payload.tags || [],
        images: payload.images || [],
        project_url: payload.projectUrl || null,
        client_name: payload.clientName || null,
        completion_date: payload.completionDate || null,
        featured: payload.featured || false,
        metadata: payload.metadata || {}
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  async function getPortfolio(userId, portfolioId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Portfolio not found');
    return data;
  }

  // Public Profile
  async function getPublicProfile(username) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('is_public', true)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    
    // Get user's portfolios
    const { data: portfolios } = await client
      .from('portfolios')
      .select('*')
      .eq('owner_id', data.id)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: revs } = await client
      .from('project_reviews')
      .select('*')
      .eq('reviewee_id', data.id)
      .order('created_at', { ascending: false })
      .limit(40);
    const reviewerIds = [...new Set((revs || []).map((r) => r.reviewer_id))];
    const { data: rprofs } = reviewerIds.length
      ? await client.from('profiles').select('id, full_name, username, avatar_url').in('id', reviewerIds)
      : { data: [] };
    const nm = new Map((rprofs || []).map((p) => [p.id, p]));
    const reviews = (revs || []).map((r) => {
      const p = nm.get(r.reviewer_id);
      return {
        id: r.id,
        rating: r.rating,
        body: r.body,
        createdAt: r.created_at,
        reviewerName: p?.full_name || p?.username || 'Member',
        reviewerAvatar: p?.avatar_url || null,
      };
    });

    return {
      ...data,
      portfolios: portfolios || [],
      reviews,
    };
  }

  // AI Models (graceful fallback when table is missing or empty — avoids 500 on settings/agents)
  const DEFAULT_AI_MODELS = [
    { id: 'mx-turbo', model_key: 'mxAI Turbo', display_name: 'mxAI Turbo', is_active: true, sort_order: 1 },
    { id: 'mx-pro', model_key: 'mxAI Pro', display_name: 'mxAI Pro', is_active: true, sort_order: 2 },
    { id: 'hybrid', model_key: 'Hybrid', display_name: 'Hybrid', is_active: true, sort_order: 3 },
  ];

  async function getAIModels() {
    if (!client) return DEFAULT_AI_MODELS;
    const { data, error } = await client
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('[ai_models] using defaults:', error.message);
      return DEFAULT_AI_MODELS;
    }
    if (data && data.length) return data;
    return DEFAULT_AI_MODELS;
  }

  return {
    getBootstrap,
    getMarketplaceStats: fetchMarketplaceStats,
    updateProfile,
    updateSettings,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage,
    createProjectRequest,
    updateProjectRequest,
    deleteProjectRequest,
    createBid,
    createConversation,
    getConversation,
    addMessage,
    createAgentRun,
    patchAgentRun,
    incrementMxAgentChatUsage,
    matchSpecialistsForRequest,
    listRequestBids,
    acceptBid,
    rejectBid,
    getProject,
    updateProjectStatus,
    setProjectMilestones,
    createProjectAgentRun,
    createDeliverable,
    createResearchRun,
    updateResearchRunWithAi,
    updateResearchRunFailed,
    getResearchRun,
    createResearchArtifact,
    getProjectAnalytics,
    getDashboardAnalytics,
    recordWorkflowEvent,
    recordProjectMetric,
    // New Unified Chat System
    getUnifiedChats,
    createUnifiedChat,
    getUnifiedChat,
    addUnifiedMessage,
    uploadUnifiedChatFile,
    uploadLegacyChatFile,
    leaveUnifiedChat,
    setUnifiedTyping,
    leaveConversation,
    clearLegacyChats,
    // Notifications
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    uploadProfileAvatar,
    uploadServiceCover,
    createProjectReview,
    getProjectReviewEligibility,
    listPublicReviewsForProfile,
    // Portfolio System
    getPortfolios,
    createPortfolio,
    getPortfolio,
    // Public Profile
    getPublicProfile,
    // AI Models
    getAIModels,
  };
}

module.exports = {
  createPlatformRepository,
};
