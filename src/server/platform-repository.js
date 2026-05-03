const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');
const { sendNotificationEmailForRow } = require('./notify-email');
const { createNowpaymentsInvoice, extractInvoiceCheckoutUrl } = require('./nowpayments');
const { createCurrencyService } = require('./currency-service');
const { createRatingService } = require('./rating-service');

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
      isPublic: pickBool('isPublic', existing?.privacy_settings?.isPublic ?? true),
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
    createdAt: row.created_at || null,
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
  const ownerUsernameRaw = row.owner?.username != null ? String(row.owner.username).trim() : '';
  const ownerUsername = ownerUsernameRaw.replace(/^@+/, '') || null;
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
    ownerUsername,
    ownerReputation: row.owner?.reputation != null ? Number(row.owner.reputation) : null,
    sc: hashColor(ownerName),
    price: Number(row.base_price),
    rating: meta.rating || 'New',
    sales: meta.sales || 0,
    coverUrl: typeof coverUrl === 'string' && coverUrl.trim() ? coverUrl.trim() : null,
    deliveryMode: row.delivery_mode,
    deliveryDays: row.delivery_days,
    isRealUser: true,
    createdAt: row.created_at || null,
  };
}

/** Full service row for `/services/:id` and `/bid/service` (adds owner fields the web client expects). */
function mapServiceForDetail(row, ownerRow) {
  const base = mapService({ ...row, owner: ownerRow });
  return {
    ...base,
    ownerUsername: ownerRow?.username || null,
    ownerAvatar: ownerRow?.avatar_url || null,
    topMember: Boolean(ownerRow?.top_member),
    createdAt: row.created_at || null,
    ownerReputation: ownerRow?.reputation != null ? Number(ownerRow.reputation) : null,
    ownerDealWins: null,
    ownerDealLosses: null,
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
    createdAt: row.created_at || null,
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

/** True if latest message is newer than lastReadAt and not from the viewer (snake_case sender_id). */
function latestMessageUnreadForUser(latestMessage, lastReadAtIso, viewerUserId) {
  if (!latestMessage || !viewerUserId) return false;
  const created = latestMessage.created_at;
  if (!created) return false;
  const t = new Date(created).getTime();
  if (!Number.isFinite(t)) return false;
  const lr = lastReadAtIso ? new Date(lastReadAtIso).getTime() : 0;
  if (t <= lr) return false;
  const sid = latestMessage.sender_id;
  if (sid && String(sid) === String(viewerUserId)) return false;
  return true;
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

  const currencyService = client ? createCurrencyService(client) : null;
  const ratingService = client ? createRatingService(client) : null;

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

  function normalizeDealUrl(pathOrUrl) {
    const raw = String(pathOrUrl || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = String(env.publicWebOrigin || '').replace(/\/+$/, '');
    if (!base) return raw;
    return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
  }

  async function postJson(url, payload) {
    const u = String(url || '').trim();
    if (!u) return;
    try {
      const res = await fetch(u, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.warn('[deal-webhook] non-2xx', res.status, body.slice(0, 800));
      }
    } catch (e) {
      console.warn('[deal-webhook]', e.message || e);
    }
  }

  async function postDiscordViaBot(channelId, payload) {
    const token = String(process.env.DISCORD_BOT_TOKEN || '').trim();
    const cid = String(channelId || '').trim();
    if (!token || !cid) return false;
    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(cid)}/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bot ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.warn('[discord-bot-post] non-2xx', res.status, body.slice(0, 800));
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[discord-bot-post]', e.message || e);
      return false;
    }
  }

  function tgEscapeHtml(input) {
    return String(input || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function publishDealChannels(event) {
    const title = String(event?.title || 'Deal update').trim();
    const message = String(event?.message || '').trim();
    const detailUrl = normalizeDealUrl(event?.url || '');
    const kind = String(event?.kind || 'deal').trim();
    const card = event?.card && typeof event.card === 'object' ? event.card : null;
    const actionsRaw = Array.isArray(event?.actions) ? event.actions : [];
    const actions = actionsRaw
      .map((a) => {
        if (!a || typeof a !== 'object') return null;
        const label = String(a.label || '').trim();
        const url = normalizeDealUrl(a.url || '');
        if (!label || !url) return null;
        return { label, url };
      })
      .filter(Boolean);
    const content = [title, message, detailUrl, ...actions.map((a) => `${a.label}: ${a.url}`)].filter(Boolean).join('\n');
    const colorByKind = {
      listing: 0x2563eb,
      request: 0x7c3aed,
      offer: 0x059669,
      bid: 0x0284c7,
      counter: 0xf59e0b,
      accepted: 0x10b981,
      declined: 0xef4444,
      changelog: 0x8b5cf6,
      deal: 0x3b82f6,
    };
    const discordColor = colorByKind[kind] || colorByKind.deal;
    const discordPayload = {
      content: title || 'Update',
      embeds: [
        {
          title,
          description: message || undefined,
          url: detailUrl || undefined,
          color: discordColor,
          fields: card
            ? Object.entries(card)
                .slice(0, 10)
                .map(([k, v]) => ({
                  name: String(k).slice(0, 256),
                  value: String(v ?? '—').slice(0, 1024),
                  inline: true,
                }))
            : undefined,
        },
      ],
      components: actions.length
        ? [
            {
              type: 1,
              components: actions.slice(0, 5).map((a) => ({
                type: 2,
                style: 5,
                label: a.label.slice(0, 80),
                url: a.url,
              })),
            },
          ]
        : undefined,
    };

    const dealsChannel = String(process.env.DISCORD_DEALS_CHANNEL_ID || '').trim();
    const changelogChannel = String(process.env.DISCORD_CHANGELOG_CHANNEL_ID || '').trim();
    const statusChannel = String(process.env.DISCORD_STATUS_CHANNEL_ID || '').trim();
    const botChannelId =
      kind === 'changelog'
        ? (changelogChannel || dealsChannel)
        : kind === 'accepted' || kind === 'declined'
          ? (statusChannel || dealsChannel)
          : dealsChannel;
    const postedViaBot = await postDiscordViaBot(botChannelId, discordPayload);

    const discordWebhook = String(process.env.DISCORD_DEALS_WEBHOOK_URL || '').trim();
    if (!postedViaBot && discordWebhook) {
      await postJson(discordWebhook, discordPayload);
    }

    const telegramToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const telegramChatId = String(process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_DEALS_CHAT_ID || '').trim();
    if (telegramToken && telegramChatId) {
      const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      const fieldLines = card
        ? Object.entries(card)
            .slice(0, 12)
            .map(([k, v]) => `• <b>${tgEscapeHtml(k)}</b>: ${tgEscapeHtml(String(v ?? '—'))}`)
        : [];
      const actionLines = actions.length ? actions.map((a) => `• <a href="${a.url}">${a.label}</a>`) : [];
      const tgLines = [
        `📣 <b>${tgEscapeHtml(title)}</b>`,
        message ? `${tgEscapeHtml(message)}` : '',
        ...fieldLines,
        detailUrl ? `\n<a href="${detailUrl}">Open details</a>` : '',
        ...actionLines,
      ].filter(Boolean);
      await postJson(url, {
        chat_id: telegramChatId,
        text: tgLines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: actions.length
          ? {
              inline_keyboard: [
                actions.slice(0, 3).map((a) => ({
                  text: a.label.slice(0, 64),
                  url: a.url,
                })),
              ],
            }
          : undefined,
      });
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
      const servicesVolumeUsd = rows.reduce((s, r) => s + Number(r.base_price || 0), 0);
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

      const openReqRows = rrows.filter((r) => r.status === 'open');
      let openRequestBudgetSum = 0;
      for (const r of openReqRows) {
        const mn = Number(r.budget_min);
        const mx = Number(r.budget_max);
        if (Number.isFinite(mn) || Number.isFinite(mx)) {
          const a = Number.isFinite(mn) ? mn : mx;
          const b = Number.isFinite(mx) ? mx : mn;
          openRequestBudgetSum += (a + b) / 2;
        }
      }

      let registeredMembers = 0;
      try {
        const { count, error: pcErr } = await client
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        if (!pcErr) registeredMembers = Number(count) || 0;
      } catch (_) {
        /* optional */
      }

      const listingsActive = rows.length + openReqRows.length;
      const volumeUsdEstimate = Math.round(servicesVolumeUsd + openRequestBudgetSum);
      const closedRequestDeals = rrows.filter((r) => {
        const st = String(r.status || '').toLowerCase();
        return st === 'closed' || st === 'awarded';
      }).length;
      const dealsClosed = closedRequestDeals + Math.round(Number(ordersSum) || 0);

      return {
        servicesPublished: rows.length,
        uniqueSellers: owners.size,
        ordersTracked: ordersSum,
        avgServicePrice: avgPrice,
        requestsTotal: rrows.length,
        requestsOpen: openReqRows.length,
        requestsReview: rrows.filter((r) => r.status === 'review').length,
        requestsClosed: rrows.filter((r) => r.status === 'closed').length,
        bidsTotal: bidRes.error ? 0 : bidRes.count || 0,
        avgRequestBudgetMid: avgReqBudget,
        listingsActive,
        volumeUsdEstimate,
        registeredMembers,
        dealsClosed,
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
      userId
        ? client.from('conversation_participants').select('conversation_id, last_read_at').eq('user_id', userId)
        : Promise.resolve({ data: [] }),
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

    const legacyLastReadByConv = new Map(
      (participantResult.data || []).map((r) => [r.conversation_id, r.last_read_at]),
    );
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
      const mappedConversations = (conversations || []).map((row) => {
        const latest = latestByConversation.get(row.id);
        const base = mapConversation(row, latest);
        const lastRead = legacyLastReadByConv.get(row.id);
        return {
          ...base,
          lastMessageAt: latest?.created_at || row.updated_at || row.created_at,
          hasUnread: latestMessageUnreadForUser(latest, lastRead, userId),
        };
      });
      liveHumanChats = mappedConversations.filter((item) => item.type === 'human');
      liveAiChats = mappedConversations.filter((item) => item.type === 'ai');
    }

    // Also fetch unified chats (bid chats) for this user
    if (userId) {
      try {
        const { data: unifiedParticipants } = await client
          .from('unified_chat_participants')
          .select('chat_id, last_read_at')
          .eq('user_id', userId)
          .neq('is_deleted', true);

        const unifiedReadByChat = new Map(
          (unifiedParticipants || []).map((p) => [p.chat_id, p.last_read_at]),
        );
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

          const { data: otherPeers } = await client
            .from('unified_chat_participants')
            .select('chat_id, user_id')
            .in('chat_id', unifiedChatIds)
            .neq('user_id', userId)
            .neq('is_deleted', true);
          const peerUserByChat = new Map();
          for (const pr of otherPeers || []) {
            if (!peerUserByChat.has(pr.chat_id)) peerUserByChat.set(pr.chat_id, pr.user_id);
          }
          const peerIds = [...new Set([...peerUserByChat.values()].filter(Boolean))];
          const { data: peerProfiles } = peerIds.length
            ? await client.from('profiles').select('id, username, avatar_url, full_name').in('id', peerIds)
            : { data: [] };
          const peerProfById = new Map((peerProfiles || []).map((p) => [p.id, p]));

          for (const uc of unifiedChats || []) {
            const latest = latestUnifiedMsg.get(uc.id);
            const peerId = peerUserByChat.get(uc.id);
            const peerP = peerId ? peerProfById.get(peerId) : null;
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
              hasUnread: latestMessageUnreadForUser(latest, unifiedReadByChat.get(uc.id), userId),
              peerAvatarUrl: peerP?.avatar_url || null,
              peerUsername: peerP?.username || null,
            });
          }
        }
      } catch (e) {
        // unified_chats table may not exist yet — ignore
      }
    }

    const marketplaceStats = await fetchMarketplaceStats();

    let leaderboardRows = liveProfiles.map((p) => ({
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
      seasonRating: 0,
      platformPoints: 0,
      dealWins: 0,
      dealLosses: 0,
      chatCount: 0,
      projectConversions: 0,
      conversionRate: 0,
    }));

    if (ratingService) {
      try {
        const { entries } = await ratingService.getLeaderboard('rating', 500);
        const byId = new Map(entries.map((e) => [e.userId, e]));
        leaderboardRows = liveProfiles.map((p) => {
          const e = byId.get(p.id);
          const tierTitle = e?.currentTier
            ? String(e.currentTier).replace(/^\w/, (c) => c.toUpperCase())
            : 'Challenger';
          return {
            id: p.id,
            n: p.n,
            r: p.r,
            c: p.c,
            t: 'Human',
            e: '$0',
            j: p.jobs || 0,
            rt: p.rating || 5,
            tier: tierTitle,
            usdt: 0,
            role: p.role,
            avatarUrl: p.avatarUrl || null,
            username: p.username || null,
            bio: p.bio || '',
            sk: p.sk || [],
            likes: p.likes || 0,
            seasonRating: e?.currentRp ?? 0,
            platformPoints: e?.neonScore ?? 0,
            dealWins: e?.dealWins ?? 0,
            dealLosses: e?.dealLosses ?? 0,
            honorPoints: e?.honor ?? 0,
            conquestPoints: e?.conquest ?? 0,
            winStreak: e?.winStreak ?? 0,
            currentTier: e?.currentTier ?? 'challenger',
            chatCount: 0,
            projectConversions: 0,
            conversionRate: 0,
          };
        });
      } catch (e) {
        console.warn('[bootstrap] leaderboard merge:', e.message);
      }
    }

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
      leaderboard: leaderboardRows,
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
    if (payload.username !== undefined) {
      nextProfile.username = payload.username || null;
      if (String(payload.username || '').trim()) {
        nextProfile.is_public = true;
      }
    }
    if (payload.headline !== undefined) nextProfile.headline = payload.headline || null;
    if (payload.timezone !== undefined) nextProfile.timezone = payload.timezone || null;
    if (payload.company_name !== undefined) nextProfile.company_name = payload.company_name || null;
    if (payload.bio !== undefined) nextProfile.bio = payload.bio || null;
    if (payload.avatar_url !== undefined) nextProfile.avatar_url = payload.avatar_url || null;
    if (payload.onboarding_completed_at !== undefined) {
      nextProfile.onboarding_completed_at = payload.onboarding_completed_at || null;
    }
    if (payload.is_public !== undefined) {
      nextProfile.is_public = Boolean(payload.is_public);
    }
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
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      throw new Error(
        'No profile row to update. Sign out and sign in again so a profile can be created, or check API logs for insert errors.',
      );
    }
    return data;
  }

  function parseSocialHandle(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';
    try {
      if (/^https?:\/\//i.test(raw)) {
        const u = new URL(raw);
        const host = u.hostname.replace(/^www\./i, '').toLowerCase();
        const first = u.pathname.split('/').filter(Boolean)[0] || '';
        if (host.includes('linkedin.com') && first.toLowerCase() === 'in') {
          return (u.pathname.split('/').filter(Boolean)[1] || '').replace(/^@+/, '');
        }
        return first.replace(/^@+/, '');
      }
    } catch {
      // fall through
    }
    return raw.replace(/^@+/, '');
  }

  async function importProfileFromSocial(userId, payload = {}) {
    if (!client) throw new Error('Supabase is not configured');
    const source = String(payload?.source || 'social').trim();
    const linkedin = String(payload?.linkedin || '').trim();
    const x = String(payload?.x || '').trim();
    const github = String(payload?.github || '').trim();
    const website = String(payload?.website || '').trim();
    const instagram = String(payload?.instagram || '').trim();
    const focus = String(payload?.focus || '').trim();
    const socials = [linkedin, x, github, website, instagram].filter(Boolean);
    if (!socials.length) throw new Error('Add at least one social profile URL or handle');

    const handle =
      parseSocialHandle(linkedin) ||
      parseSocialHandle(x) ||
      parseSocialHandle(github) ||
      parseSocialHandle(instagram);
    const cleanHandle = String(handle || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
    const headline = focus || 'Open to new client projects';
    const bio = [
      `Imported profile from ${source}.`,
      cleanHandle ? `Known online as @${cleanHandle}.` : null,
      'This profile was auto-generated from public social links and can be edited anytime.',
    ]
      .filter(Boolean)
      .join(' ');
    const skillSeeds = [focus, 'client communication', 'delivery management', 'strategy']
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .slice(0, 6);

    const patch = {
      updated_at: new Date().toISOString(),
      headline,
      bio,
      skills: skillSeeds,
    };
    if (cleanHandle) patch.username = cleanHandle;
    const { data, error } = await client.from('profiles').update(patch).eq('id', userId).select('*').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  }

  function normalizePublicUsername(raw) {
    return String(raw || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase();
  }

  function isValidPublicUsername(u) {
    return /^[a-z0-9][a-z0-9_-]{0,30}$/.test(u) && u.length >= 2;
  }

  async function checkUsernameAvailable(username, excludeUserId) {
    if (!client) return { available: false, reason: 'invalid' };
    const u = normalizePublicUsername(username);
    if (!isValidPublicUsername(u)) return { available: false, reason: 'invalid' };
    const { data, error } = await client.from('profiles').select('id').eq('username', u).maybeSingle();
    if (error) return { available: false, reason: 'invalid' };
    if (!data) return { available: true };
    if (excludeUserId && String(data.id) === String(excludeUserId)) return { available: true };
    return { available: false, reason: 'taken' };
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

  async function getServiceById(serviceId, viewerUserId) {
    if (!client) return null;
    const id = String(serviceId || '').trim();
    if (!id) return null;
    const { data: row, error } = await client.from('service_packages').select('*').eq('id', id).maybeSingle();
    if (error || !row) return null;
    const published = row.status === 'published';
    const isOwner = viewerUserId && String(row.owner_id) === String(viewerUserId);
    if (!published && !isOwner) return null;
    let r = await client
      .from('profiles')
      .select('id, full_name, username, avatar_url, reputation, top_member, vouches')
      .eq('id', row.owner_id)
      .maybeSingle();
    if (r.error && String(r.error.message || '').includes('top_member')) {
      r = await client
        .from('profiles')
        .select('id, full_name, username, avatar_url, reputation, vouches')
        .eq('id', row.owner_id)
        .maybeSingle();
    }
    const ownerRow = !r.error ? r.data ?? null : null;
    return mapServiceForDetail(row, ownerRow);
  }

  async function getProjectRequestById(requestId, viewerUserId) {
    if (!client) return null;
    const id = String(requestId || '').trim();
    if (!id) return null;
    const { data: row, error } = await client.from('project_requests').select('*').eq('id', id).maybeSingle();
    if (error || !row) return null;
    const { count, error: bidErr } = await client
      .from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('request_id', id);
    const bidCount = bidErr ? 0 : count || 0;
    return mapRequest(row, bidCount, viewerUserId || null);
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
    const { data: ownerProfile } = await client
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .maybeSingle();
    const ownerLabel = ownerProfile?.username || ownerProfile?.full_name || user.email?.split('@')[0] || 'seller';
    await publishDealChannels({
      kind: 'listing',
      title: 'New service listing',
      message: `${ownerLabel} published “${data.title}”.`,
      url: `/services/${data.id}`,
      card: {
        Type: 'Service',
        Title: data.title,
        Category: data.category || 'General',
        Price: `$${Number(data.base_price || 0).toLocaleString()}`,
        Delivery: `${Number(data.delivery_days || 0)} days`,
        By: ownerLabel,
      },
      actions: [
        { label: 'View service', url: `/services/${data.id}` },
        { label: 'Make offer', url: `/bid/service?id=${data.id}` },
      ],
    });
    try {
      if (currencyService) {
        await currencyService.awardHonor(user.id, 50, 'listing_published', 'service_packages', data.id);
      }
      if (ratingService) {
        await ratingService.processActivity(user.id, 'listing_published');
      }
    } catch (e) {
      console.warn('[honor] listing_published hook:', e.message);
    }
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
    const { data: ownerProfile } = await client
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .maybeSingle();
    const ownerLabel = ownerProfile?.username || ownerProfile?.full_name || user.email?.split('@')[0] || 'client';
    const budgetText = budget.min != null || budget.max != null
      ? `$${Number(budget.min || 0).toLocaleString()} - $${Number(budget.max || budget.min || 0).toLocaleString()}`
      : 'Not set';
    await publishDealChannels({
      kind: 'request',
      title: 'New client request',
      message: `${ownerLabel} posted “${data.title}”.`,
      url: `/requests/${data.id}`,
      card: {
        Type: 'Request',
        Title: data.title,
        Category: data.category || 'General',
        Budget: budgetText,
        By: ownerLabel,
      },
      actions: [
        { label: 'View request', url: `/requests/${data.id}` },
        { label: 'Place bid', url: `/bid/request?id=${data.id}` },
      ],
    });
    
    // Award Honor for posting a request
    try {
      if (currencyService) {
        await currencyService.awardHonor(user.id, 50, 'request_posted', 'project_requests', data.id);
      }
      if (ratingService) {
        await ratingService.processActivity(user.id, 'request_posted');
      }
    } catch (e) {
      console.warn('[honor] request_posted hook:', e.message);
    }
    
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
    const { data: bidderProf } = await client
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    const { data: ownerProf } = await client
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', request.owner_id)
      .maybeSingle();
    const preview = proposal.length > 240 ? `${proposal.slice(0, 237)}...` : proposal;
    const chat = await createUnifiedChat(user.id, {
      type: 'human',
      title: `Bid · ${request.title || 'Request'}`,
      subtitle: `$${price.toLocaleString()} · ${ownerProf?.username || 'client'}`,
      metadata: {
        requestId,
        requestTitle: request.title || null,
        chatType: 'request_bid',
        requestOwnerId: String(request.owner_id || ''),
        bidId: data.id,
      },
    });
    const embed = {
      type: 'bid_proposal',
      proposer: profileSnapFromRow(bidderProf),
      counterparty: profileSnapFromRow(ownerProf),
      price,
      deliveryDays: Number.isFinite(deliveryDays) && deliveryDays > 0 ? Math.round(deliveryDays) : null,
      proposalText: proposal,
      proposalPreview: preview,
      requestTitle: request.title || null,
      requestId,
      bidId: data.id,
      conversationId: chat.id,
    };
    await addUnifiedMessage(user.id, chat.id, {
      contentType: 'embed',
      content: preview || 'Request bid',
      embed,
    });
    await publishDealChannels({
      kind: 'bid',
      title: 'New request bid',
      message: `${bidderProf?.username || bidderProf?.full_name || 'A specialist'} sent a request bid on “${request.title || 'a request'}” for $${price.toLocaleString()}.`,
      url: `/chat/${chat.id}`,
      card: {
        Type: 'Request bid',
        Request: request.title || 'Request',
        Price: `$${price.toLocaleString()}`,
        Delivery: Number.isFinite(deliveryDays) && deliveryDays > 0 ? `${Math.round(deliveryDays)} days` : 'Not set',
      },
      actions: [
        { label: 'Open deal chat', url: `/chat/${chat.id}` },
        { label: 'View request', url: `/requests/${request.id}` },
      ],
    });
    try {
      if (currencyService) {
        await currencyService.awardHonor(user.id, 25, 'bid_placed', 'bids', data.id);
      }
      if (ratingService) {
        await ratingService.processActivity(user.id, 'bid_placed');
      }
    } catch (e) {
      console.warn('[honor] bid_placed hook:', e.message);
    }
    return { bid: data, conversationId: chat.id };
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

  /** Map one unified_messages row (camelCase from getUnifiedChat) to web ChatStream message shape. */
  function mapUnifiedMessageRowToStream(msg, viewerId, profileByUserId) {
    const meta = msg.metadata && typeof msg.metadata === 'object' ? msg.metadata : {};
    const embed = meta.embed && typeof meta.embed === 'object' ? meta.embed : null;
    const rawCt = String(msg.contentType || '').toLowerCase();
    let contentType = 'text';
    if (embed || rawCt === 'embed') contentType = 'embed';
    else if (rawCt === 'image') contentType = 'image';
    else if (rawCt === 'file') contentType = 'file';
    else if (rawCt === 'voice') contentType = 'text';
    else if (msg.fileUrl) contentType = mimeIsImage(meta.mime) ? 'image' : 'file';

    let role = 'peer';
    if (msg.senderType === 'user' && String(msg.senderId) === String(viewerId)) role = 'user';
    else if (msg.senderType === 'system') role = 'system';
    else if (msg.senderType === 'ai') role = 'ai';

    const sid = msg.senderId != null ? String(msg.senderId) : '';
    const prof = profileByUserId.get(sid);
    const out = {
      id: msg.id,
      role,
      text: msg.content,
      contentType,
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileSize: msg.fileSize != null ? msg.fileSize : null,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      senderUsername: prof?.username ?? null,
      senderName: prof?.full_name || prof?.username || null,
      senderAvatarUrl: prof?.avatar_url ?? null,
    };
    if (contentType === 'embed' && embed) out.embed = embed;
    return out;
  }

  function buildActiveChatFromUnified(unified, viewerId, pagination = null) {
    const profileByUserId = new Map();
    for (const p of unified.participants || []) {
      const pr = p.profile;
      if (!pr) continue;
      profileByUserId.set(String(p.userId), pr);
    }
    const messages = (unified.messages || []).map((m) =>
      mapUnifiedMessageRowToStream(m, viewerId, profileByUserId),
    );
    const meta = unified.metadata && typeof unified.metadata === 'object' ? unified.metadata : {};
    const contextType = meta.serviceId ? 'service_package' : meta.requestId ? 'request' : null;
    const contextId = meta.serviceId || meta.requestId || null;
    const dealKind = meta.serviceId ? 'service' : meta.requestId ? 'request' : null;
    const dealListingOwnerId = meta.listingOwnerId || meta.serviceOwnerId || meta.requestOwnerId || null;
    return {
      id: unified.id,
      title: unified.title || 'Deal room',
      type: unified.type === 'ai' ? 'ai' : 'human',
      transport: 'unified',
      contextType,
      contextId,
      metadata: meta,
      messages,
      messageWindow: {
        hasMoreOlder: pagination?.hasMoreOlder ?? false,
        oldestId: messages[0]?.id ?? null,
        newestId: messages.length ? messages[messages.length - 1]?.id : null,
        limit: pagination?.limit ?? messages.length,
      },
      dealKind,
      dealListingOwnerId,
      pins: [],
    };
  }

  async function getConversation(currentUserId, conversationId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: participant } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId)
      .maybeSingle();
    if (participant) {
      const [{ data: conversation, error: conversationError }, { data: messages, error: messagesError }] =
        await Promise.all([
          client.from('conversations').select('*').eq('id', conversationId).single(),
          client
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true }),
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

    try {
      const unified = await getUnifiedChat(currentUserId, conversationId);
      return buildActiveChatFromUnified(unified, currentUserId);
    } catch {
      throw new Error('Conversation not found');
    }
  }

  /**
   * Get paginated messages for a chat (legacy or unified)
   * Supports cursor-based pagination with 'before' message id
   */
  async function getChatMessages(currentUserId, chatId, opts = {}) {
    if (!client) throw new Error('Supabase is not configured');
    if (!currentUserId) throw new Error('currentUserId is required');
    if (!chatId) throw new Error('chatId is required');

    const { before = null, limit = 50 } = opts;
    const maxLimit = Math.min(100, Math.max(1, Number(limit) || 50));

    try {
      // Try legacy conversation first
      const { data: participant, error: participantError } = await client
        .from('conversation_participants')
        .select('conversation_id, history_visible_from')
        .eq('conversation_id', chatId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (participantError) {
        console.error('[getChatMessages] participant lookup error:', participantError);
      }

      if (participant) {
        console.log('[getChatMessages] found legacy conversation participant');
        // Legacy chat - fetch from messages table
        let query = client
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: false })
          .limit(maxLimit + 1); // +1 to check if there are more

        if (before) {
          const { data: beforeMsg } = await client
            .from('messages')
            .select('created_at')
            .eq('id', before)
            .single();
          if (beforeMsg?.created_at) {
            query = query.lt('created_at', beforeMsg.created_at);
          }
        }

        // Apply history visibility cutoff for this participant
        if (participant.history_visible_from) {
          query = query.gte('created_at', participant.history_visible_from);
        }

        const { data: messages, error } = await query;
        if (error) {
          console.error('[getChatMessages] messages query error:', error);
          throw error;
        }

        const hasMoreOlder = messages && messages.length > maxLimit;
        const resultMessages = hasMoreOlder ? messages.slice(0, maxLimit) : (messages || []);
        // Reverse to get chronological order
        resultMessages.reverse();

        // Get chat metadata
        const { data: chat, error: chatError } = await client
          .from('conversations')
          .select('id, subject, context_type, context_id, transport, metadata, project_id')
          .eq('id', chatId)
          .single();

        if (chatError) {
          console.error('[getChatMessages] chat metadata error:', chatError);
        }

        return {
          activeChat: {
            id: chat?.id || chatId,
            title: chat?.subject || 'Deal room',
            type: chat?.context_type === 'direct' ? 'human' : 'ai',
            contextType: chat?.context_type || null,
            contextId: chat?.context_id || null,
            transport: chat?.transport || null,
            metadata: chat?.metadata || null,
            projectId: chat?.project_id || null,
            messages: resultMessages.map((m) => mapMessage(m, currentUserId)),
            messageWindow: {
              hasMoreOlder,
              oldestId: resultMessages[0]?.id || null,
              newestId: resultMessages[resultMessages.length - 1]?.id || null,
              limit: maxLimit,
            },
            membership: {
              historyVisibleFrom: participant.history_visible_from,
            },
          },
        };
      }

      console.log('[getChatMessages] no legacy participant, trying unified chat');

      // Try unified chat
      try {
        const unified = await getUnifiedChat(currentUserId, chatId);
        let messages = unified.messages || [];

        // Sort by created_at desc for pagination
        messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (before) {
          const beforeIndex = messages.findIndex((m) => String(m.id) === String(before));
          if (beforeIndex >= 0) {
            messages = messages.slice(beforeIndex + 1);
          }
        }

        const hasMoreOlder = messages.length > maxLimit;
        const resultMessages = hasMoreOlder ? messages.slice(0, maxLimit) : messages;
        // Reverse to get chronological order
        resultMessages.reverse();

        return {
          activeChat: buildActiveChatFromUnified(
            { ...unified, messages: resultMessages },
            currentUserId,
            { hasMoreOlder, limit: maxLimit }
          ),
        };
      } catch (unifiedError) {
        console.error('[getChatMessages] unified chat error:', unifiedError);
        throw new Error('Chat not found or access denied');
      }
    } catch (error) {
      console.error('[getChatMessages] top-level error:', error);
      throw error;
    }
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
    if (!participant) {
      const text = String(payload.text || '').trim();
      const fileUrl = payload.fileUrl || null;
      if (!text && !fileUrl) throw new Error('text or file is required');
      if (fileUrl) throw new Error('Use the attachment control to upload files in this deal room');
      await addUnifiedMessage(user.id, conversationId, { content: text });
      return getConversation(user.id, conversationId);
    }

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
    const legacyAttachType =
      meta.contentType ||
      (fileUrl ? (mimeIsImage(mime) ? 'image' : 'file') : null);
    const body =
      text ||
      (legacyAttachType === 'image' ?
        ''
      : fileName ? `Attachment: ${fileName}`
      : 'Attachment');
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
    await publishDealChannels({
      kind: 'declined',
      title: 'Bid declined',
      message: `A bid was declined on “${request.title || 'a request'}”.`,
      url: `/requests/${request.id}`,
      actions: [{ label: 'Browse request', url: `/requests/${request.id}` }],
    });

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

    try {
      if (prev === 'disputed' && newStatus === 'cancelled' && ratingService) {
        if (project.client_id) await ratingService.processLoss(project.client_id, 'dispute_lost');
        if (project.owner_id) await ratingService.processLoss(project.owner_id, 'dispute_lost');
      }
    } catch (e) {
      console.warn('[rating] dispute_lost hook:', e.message);
    }

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
    if (!/^image\/(jpeg|png|gif|webp)|application\/pdf$/i.test(mime)) {
      throw new Error('Unsupported file type (allowed: JPEG, PNG, GIF, WebP, PDF)');
    }
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
    if (!/^image\/(jpeg|png|gif|webp)|application\/pdf$/i.test(mime)) {
      throw new Error('Unsupported file type (allowed: JPEG, PNG, GIF, WebP, PDF)');
    }
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
      fileName: String(originalName || baseName).slice(0, 240),
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
    const embedObj = payload.embed && typeof payload.embed === 'object' ? payload.embed : null;
    const explicitEmbed =
      payload.contentType === 'embed' ||
      payload.content_type === 'embed' ||
      Boolean(embedObj);
    let contentType = 'text';
    if (explicitEmbed && embedObj) contentType = 'embed';
    else if (payload.contentType === 'image' || payload.content_type === 'image') contentType = 'image';
    else if (payload.contentType === 'file' || payload.content_type === 'file') contentType = 'file';
    else if (fileUrl) contentType = mimeIsImage(mime) ? 'image' : 'file';
    if (!textRaw && !fileUrl && !(contentType === 'embed' && embedObj)) {
      throw new Error('Message text or file is required');
    }
    let displayContent = textRaw
      ? textRaw
      : contentType === 'image' && fileUrl
        ? ''
        : fileName
          ? `Attachment: ${fileName}`
          : fileUrl
            ? 'Attachment'
            : '';
    if (contentType === 'embed' && embedObj && !textRaw) {
      const et = String(embedObj.type || '');
      if (et === 'service_bid') displayContent = 'Buyer offer';
      else if (et === 'bid_proposal') displayContent = 'Bid on request';
      else if (et === 'deal_counter_offer') displayContent = 'Counter offer';
      else if (et === 'deal_phase') displayContent = 'Deal update';
      else if (et === 'contract_card') displayContent = 'Contract';
      else displayContent = 'Deal update';
    }
    const rowMetadata =
      payload.metadata && typeof payload.metadata === 'object' ? { ...payload.metadata } : {};
    if (contentType === 'embed' && embedObj) rowMetadata.embed = embedObj;

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
        metadata: rowMetadata,
      })
      .select('*')
      .single();
    
    if (messageError) {
      console.error('[addUnifiedMessage] insert error:', messageError.message, messageError.details);
      throw new Error(messageError.message);
    }

    try {
      const isUserMsg = (payload.senderType || 'user') === 'user';
      if (currencyService && ratingService && isUserMsg) {
        const { data: contractHit } = await client
          .from('project_contracts')
          .select('id')
          .eq('unified_chat_id', chatId)
          .limit(1)
          .maybeSingle();
        const { data: chatDeal } = await client.from('unified_chats').select('metadata').eq('id', chatId).maybeSingle();
        const dm = chatDeal?.metadata && typeof chatDeal.metadata === 'object' ? chatDeal.metadata : {};
        const isDealRoom = Boolean(contractHit?.id) || dm.chatType === 'deal' || dm.dealRoom === true;
        if (isDealRoom) {
          await currencyService.awardHonor(userId, 10, 'message_sent', 'unified_chats', chatId);
          await ratingService.processActivity(userId, 'message_sent');
        }
      }
    } catch (e) {
      console.warn('[honor] message_sent hook:', e.message);
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
    if ((payload.senderType || 'user') === 'user') {
      const { data: otherParticipants } = await client
        .from('unified_chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', userId)
        .neq('is_deleted', true);

      if (otherParticipants && otherParticipants.length > 0) {
        const snippet = fileUrl
          ? contentType === 'image'
            ? 'Sent an image'
            : fileName
              ? `Sent a file: ${fileName}`
              : 'Sent an attachment'
          : contentType === 'embed'
            ? (() => {
                const et = String(embedObj?.type || '');
                if (et === 'service_bid') return 'Sent a buyer offer';
                if (et === 'bid_proposal') return 'Sent a bid on your request';
                if (et === 'deal_counter_offer') return 'Sent a counter offer';
                if (et === 'contract_card') return 'Sent a contract update';
                if (et === 'deal_phase') return 'Deal status update';
                return 'Sent a deal update';
              })()
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

  async function submitServicePackageBid(user, serviceId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const sid = String(serviceId || '').trim();
    const proposal = String(body?.proposal || '').trim();
    const price = Number(String(body?.price || '').replace(/[^0-9.]/g, ''));
    const deliveryDays = body?.deliveryDays != null ? Number(body.deliveryDays) : null;
    if (!sid) throw new Error('Service id is required');
    if (!proposal) throw new Error('proposal is required');
    if (!Number.isFinite(price) || price <= 0) throw new Error('Valid price is required');

    const { data: row, error } = await client.from('service_packages').select('*').eq('id', sid).maybeSingle();
    if (error) throw error;
    if (!row) throw new Error('Service not found');
    if (row.status !== 'published') throw new Error('Service is not available for bids');
    if (String(row.owner_id) === String(user.id)) throw new Error('You cannot bid on your own service');

    const { data: bidderProf } = await client
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    const { data: ownerProf } = await client
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .eq('id', row.owner_id)
      .maybeSingle();

    const preview = proposal.length > 240 ? `${proposal.slice(0, 237)}...` : proposal;
    const chat = await createUnifiedChat(user.id, {
      type: 'human',
      title: `Offer · ${row.title}`,
      subtitle: `$${price.toLocaleString()} · ${ownerProf?.username || 'seller'}`,
      metadata: {
        serviceId: sid,
        serviceTitle: row.title,
        chatType: 'service_bid',
        listingOwnerId: String(row.owner_id),
      },
    });

    const embed = {
      type: 'service_bid',
      proposer: {
        id: String(user.id),
        username: bidderProf?.username || null,
        fullName: bidderProf?.full_name || null,
        avatarUrl: bidderProf?.avatar_url || null,
      },
      counterparty: {
        id: String(row.owner_id),
        username: ownerProf?.username || null,
        fullName: ownerProf?.full_name || null,
        avatarUrl: ownerProf?.avatar_url || null,
      },
      price,
      deliveryDays: Number.isFinite(deliveryDays) && deliveryDays > 0 ? Math.round(deliveryDays) : null,
      proposalText: proposal,
      proposalPreview: preview,
      serviceTitle: row.title,
      serviceId: sid,
      conversationId: chat.id,
    };

    await addUnifiedMessage(user.id, chat.id, {
      contentType: 'embed',
      content: preview || 'Buyer offer',
      embed,
    });
    await publishDealChannels({
      kind: 'offer',
      title: 'New service offer',
      message: `${bidderProf?.username || bidderProf?.full_name || 'A buyer'} sent an offer on “${row.title || 'a service'}” for $${price.toLocaleString()}.`,
      url: `/chat/${chat.id}`,
      card: {
        Type: 'Service offer',
        Service: row.title || 'Service',
        Price: `$${price.toLocaleString()}`,
        Delivery: Number.isFinite(deliveryDays) && deliveryDays > 0 ? `${Math.round(deliveryDays)} days` : 'Not set',
      },
      actions: [
        { label: 'Open deal chat', url: `/chat/${chat.id}` },
        { label: 'View service', url: `/services/${sid}` },
        { label: 'Make offer', url: `/bid/service?id=${sid}` },
      ],
    });

    return { conversationId: chat.id };
  }

  async function assertUnifiedChatAccess(userId, chatId) {
    if (!client) throw new Error('Supabase is not configured');
    const cid = String(chatId || '').trim();
    if (!cid) throw new Error('conversationId is required');
    const { data: participant } = await client
      .from('unified_chat_participants')
      .select('user_id')
      .eq('chat_id', cid)
      .eq('user_id', userId)
      .neq('is_deleted', true)
      .maybeSingle();
    if (!participant) throw new Error('Chat not found or access denied');
    return cid;
  }

  async function resolveInviteeUserId(payload) {
    const directId = String(payload?.inviteeUserId || '').trim();
    if (directId) {
      const { data: directProfile } = await client
        .from('profiles')
        .select('id')
        .eq('id', directId)
        .maybeSingle();
      if (directProfile?.id) return String(directProfile.id);
    }

    const usernameRaw = String(payload?.username || '').trim().replace(/^@+/, '');
    if (usernameRaw) {
      const { data: byUsername } = await client
        .from('profiles')
        .select('id')
        .eq('username', usernameRaw)
        .maybeSingle();
      if (byUsername?.id) return String(byUsername.id);
    }

    const email = String(payload?.email || '').trim().toLowerCase();
    if (email) {
      try {
        const { data: lookedUp } = await client.rpc('lookup_user_id_by_email', { p_email: email });
        if (lookedUp) return String(lookedUp);
      } catch {
        // Optional migration/RPC in some environments.
      }
    }

    return null;
  }

  async function inviteChatParticipant(currentUserId, chatId, payload = {}) {
    if (!client) throw new Error('Supabase is not configured');
    const cid = String(chatId || '').trim();
    if (!cid) throw new Error('Chat id is required');

    const inviteeUserId = await resolveInviteeUserId(payload);
    if (!inviteeUserId) throw new Error('Invitee not found');
    if (String(inviteeUserId) === String(currentUserId)) {
      throw new Error('You cannot invite yourself');
    }

    const visibilityMode = String(payload?.history || 'since_join') === 'full' ? 'full' : 'since_join';
    const historyVisibleFrom = visibilityMode === 'since_join' ? new Date().toISOString() : null;

    const { data: legacyMember } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('conversation_id', cid)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (legacyMember) {
      await client.from('conversation_participants').upsert(
        {
          conversation_id: cid,
          user_id: inviteeUserId,
          history_visible_from: historyVisibleFrom,
        },
        { onConflict: 'conversation_id,user_id' }
      );

      await notifyInsert({
        user_id: inviteeUserId,
        type: 'message',
        title: 'Added to a conversation',
        message: 'You were invited to join a chat.',
        related_id: cid,
        related_type: 'legacy_chat',
      });

      return { chatId: cid, inviteeUserId, transport: 'legacy', history: visibilityMode };
    }

    await assertUnifiedChatAccess(currentUserId, cid);

    await client.from('unified_chat_participants').upsert(
      {
        chat_id: cid,
        user_id: inviteeUserId,
        role: 'participant',
        is_deleted: false,
        history_visible_from: historyVisibleFrom,
      },
      { onConflict: 'chat_id,user_id' }
    );

    await notifyInsert({
      user_id: inviteeUserId,
      type: 'message',
      title: 'Added to a deal room',
      message: 'You were invited to join a deal room chat.',
      related_id: cid,
      related_type: 'chat',
    });

    return { chatId: cid, inviteeUserId, transport: 'unified', history: visibilityMode };
  }

  function profileSnapFromRow(row) {
    if (!row) return { id: '', username: null, fullName: null, avatarUrl: null };
    return {
      id: String(row.id),
      username: row.username || null,
      fullName: row.full_name || null,
      avatarUrl: row.avatar_url || null,
    };
  }

  /**
   * Lock a service deal: seller accepts buyer's offer, or buyer accepts seller's counter (same thread).
   * counterProposerId = profile id of whoever proposed the terms being accepted (embed proposer).
   * Creates project + draft contract + deal_phase / contract_card embeds. Idempotent per thread + service.
   */
  async function acceptServicePackageDeal(user, serviceId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const sid = String(serviceId || '').trim();
    const chatId = String(body?.conversationId || '').trim();
    const offerProposerId = String(body?.counterProposerId || '').trim();
    const agreedPrice = Number(body?.agreedPrice);
    const deliveryRaw = body?.deliveryDays != null ? Number(body.deliveryDays) : null;
    const deliveryDays = Number.isFinite(deliveryRaw) && deliveryRaw > 0 ? Math.round(deliveryRaw) : null;

    if (!sid) throw new Error('Service id is required');
    if (!chatId) throw new Error('conversationId is required');
    if (!offerProposerId) throw new Error('counterProposerId is required');
    if (!Number.isFinite(agreedPrice) || agreedPrice <= 0) throw new Error('Valid agreedPrice is required');
    if (String(offerProposerId) === String(user.id)) throw new Error('You cannot accept your own offer');

    await assertUnifiedChatAccess(user.id, chatId);

    const { data: svc, error: svcErr } = await client.from('service_packages').select('*').eq('id', sid).maybeSingle();
    if (svcErr) throw svcErr;
    if (!svc) throw new Error('Service not found');

    const sellerId = String(svc.owner_id);
    let clientId;
    let providerId;
    if (String(user.id) === sellerId) {
      clientId = offerProposerId;
      providerId = sellerId;
      if (String(clientId) === String(providerId)) throw new Error('Invalid parties');
    } else if (String(offerProposerId) === sellerId) {
      clientId = String(user.id);
      providerId = sellerId;
    } else {
      throw new Error('Only the buyer or listing owner can accept these terms');
    }

    const { data: partRowsPre } = await client
      .from('unified_chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .neq('is_deleted', true);
    const chatMembers = new Set((partRowsPre || []).map((p) => String(p.user_id)));
    if (!chatMembers.has(String(clientId)) || !chatMembers.has(String(providerId))) {
      throw new Error('Both parties must be members of this deal thread');
    }

    const { data: proposerPart } = await client
      .from('unified_chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', offerProposerId)
      .neq('is_deleted', true)
      .maybeSingle();
    if (!proposerPart) throw new Error('The offer proposer is not in this deal thread');

    const { data: accepterPart } = await client
      .from('unified_chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .neq('is_deleted', true)
      .maybeSingle();
    if (!accepterPart) throw new Error('You are not in this deal thread');

    const { data: chatRow } = await client.from('unified_chats').select('metadata').eq('id', chatId).maybeSingle();
    const cmeta = chatRow?.metadata && typeof chatRow.metadata === 'object' ? chatRow.metadata : {};
    if (String(cmeta.serviceId || '') !== sid) {
      throw new Error('This thread is not linked to this service listing');
    }

    const { data: existingProjects } = await client
      .from('projects')
      .select('id, metadata')
      .eq('client_id', clientId)
      .eq('owner_id', providerId);
    const existing = (existingProjects || []).find((p) => {
      const m = p.metadata && typeof p.metadata === 'object' ? p.metadata : {};
      return String(m.unifiedChatId || '') === chatId && String(m.serviceId || '') === sid;
    });

    if (existing) {
      const { data: contract } = await client
        .from('project_contracts')
        .select('id')
        .eq('project_id', existing.id)
        .eq('unified_chat_id', chatId)
        .maybeSingle();
      return {
        alreadyLinked: true,
        projectId: existing.id,
        contract: contract?.id ? { id: contract.id } : null,
      };
    }

    const projTitle = String(svc.title || 'Service engagement').trim() || 'Service engagement';
    const deliveryMode = 'white_glove';
    const { data: project, error: projectError } = await client
      .from('projects')
      .insert({
        request_id: null,
        accepted_bid_id: null,
        client_id: clientId,
        owner_id: providerId,
        title: projTitle,
        status: 'active',
        delivery_mode: deliveryMode,
        metadata: {
          source: 'service_package',
          serviceId: sid,
          unifiedChatId: chatId,
          acceptedPrice: agreedPrice,
          deliveryDays,
        },
      })
      .select('*')
      .single();
    if (projectError) throw projectError;

    const termsLines = [
      `Engagement for “${projTitle}”.`,
      `Agreed price: $${agreedPrice.toLocaleString()} USD.`,
      deliveryDays ? `Target delivery: ${deliveryDays} days from contract start.` : null,
      '',
      'Review the draft contract below, send for signatures, then fund escrow when ready.',
    ].filter(Boolean);
    const contractBody = termsLines.join('\n');

    const { data: contractRow, error: contractError } = await client
      .from('project_contracts')
      .insert({
        project_id: project.id,
        unified_chat_id: chatId,
        client_id: clientId,
        provider_id: providerId,
        created_by: user.id,
        status: 'draft',
        title: `Engagement · ${projTitle}`,
        body: contractBody,
        amount_usd: agreedPrice,
        metadata: { serviceId: sid, unifiedChatId: chatId },
      })
      .select('id')
      .single();
    if (contractError) throw contractError;

    const [{ data: clientProf }, { data: providerProf }] = await Promise.all([
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', clientId).maybeSingle(),
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', providerId).maybeSingle(),
    ]);

    const dealWinEmbed = {
      type: 'deal_phase',
      phase: 'deal_win',
      tone: 'success',
      title: 'Offer accepted',
      subtitle: 'A contract draft was added to this thread — review and send when ready.',
      contractId: contractRow.id,
    };

    const preview = contractBody.length > 240 ? `${contractBody.slice(0, 237)}...` : contractBody;
    const contractCardEmbed = {
      type: 'contract_card',
      contractId: contractRow.id,
      status: 'draft',
      title: `Engagement · ${projTitle}`,
      bodyPreview: preview,
      amountUsd: agreedPrice,
      clientId,
      providerId,
      client: profileSnapFromRow(clientProf),
      provider: profileSnapFromRow(providerProf),
    };

    await addUnifiedMessage(user.id, chatId, {
      contentType: 'embed',
      content: 'Deal locked — offer accepted.',
      embed: dealWinEmbed,
    });
    await addUnifiedMessage(user.id, chatId, {
      contentType: 'embed',
      content: 'Contract draft',
      embed: contractCardEmbed,
    });

    const notifyUserId = String(user.id) === String(clientId) ? providerId : clientId;
    await notifyInsert({
      user_id: notifyUserId,
      type: 'bid_outcome',
      title: 'Deal terms accepted',
      message: `Terms were accepted on “${projTitle}”. Open the chat for the contract.`,
      related_id: chatId,
      related_type: 'chat',
    });
    await publishDealChannels({
      kind: 'accepted',
      title: 'Deal accepted',
      message: `Terms were accepted on “${projTitle}”. Contract draft is ready for both parties.`,
      url: `/chat/${chatId}`,
      card: {
        Type: 'Accepted deal',
        Project: projTitle,
        Amount: `$${agreedPrice.toLocaleString()}`,
      },
      actions: [{ label: 'Open contract chat', url: `/chat/${chatId}` }],
    });

    await recordWorkflowEvent({
      projectId: project.id,
      eventType: 'bid_accepted',
      actorId: user.id,
      actorType: 'user',
      details: { serviceId: sid, unifiedChatId: chatId, contractId: contractRow.id, agreedPrice },
    });

    return {
      alreadyLinked: false,
      project: mapProject(await attachProjectProfiles(client, project)),
      contract: { id: contractRow.id },
    };
  }

  /**
   * Post a deal_counter_offer embed: service_offer (listing thread) or request_bid (client counters specialist bid).
   */
  async function submitDealCounterOffer(user, body) {
    if (!client) throw new Error('Supabase is not configured');
    const basis = String(body?.basis || '').trim();
    const chatId = String(body?.conversationId || '').trim();
    const proposal = String(body?.proposal || '').trim();
    const price = Number(String(body?.price ?? '').replace(/[^0-9.]/g, ''));
    const deliveryRaw = body?.deliveryDays != null ? Number(body.deliveryDays) : null;
    const deliveryDays = Number.isFinite(deliveryRaw) && deliveryRaw > 0 ? Math.round(deliveryRaw) : null;

    if (!chatId) throw new Error('conversationId is required');
    if (!proposal) throw new Error('proposal is required');
    if (!Number.isFinite(price) || price <= 0) throw new Error('Valid price is required');

    await assertUnifiedChatAccess(user.id, chatId);

    const preview = proposal.length > 240 ? `${proposal.slice(0, 237)}...` : proposal;

    if (basis === 'service_offer') {
      const serviceId = String(body?.serviceId || '').trim();
      const counterTo = String(body?.counterToProposerId || '').trim();
      if (!serviceId) throw new Error('serviceId is required');
      if (!counterTo) throw new Error('counterToProposerId is required');
      if (String(counterTo) === String(user.id)) throw new Error('counterToProposerId must be the other party');

      const { data: svc, error: svcErr } = await client.from('service_packages').select('*').eq('id', serviceId).maybeSingle();
      if (svcErr) throw svcErr;
      if (!svc) throw new Error('Service not found');

      const { data: chatRow } = await client.from('unified_chats').select('metadata').eq('id', chatId).maybeSingle();
      const cmeta = chatRow?.metadata && typeof chatRow.metadata === 'object' ? chatRow.metadata : {};
      if (String(cmeta.serviceId || '') !== serviceId) {
        throw new Error('This thread is not linked to this service listing');
      }

      const { data: partRows } = await client
        .from('unified_chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('is_deleted', true);
      const uidSet = new Set((partRows || []).map((p) => String(p.user_id)));
      if (!uidSet.has(String(user.id)) || !uidSet.has(String(counterTo))) {
        throw new Error('You and the counterparty must both be in this deal thread');
      }

      const [{ data: proposerProf }, { data: counterProf }] = await Promise.all([
        client.from('profiles').select('id, full_name, username, avatar_url').eq('id', user.id).maybeSingle(),
        client.from('profiles').select('id, full_name, username, avatar_url').eq('id', counterTo).maybeSingle(),
      ]);

      const embed = {
        type: 'deal_counter_offer',
        basis: 'service_offer',
        label: 'Counter offer',
        proposer: profileSnapFromRow(proposerProf),
        counterparty: profileSnapFromRow(counterProf),
        price,
        deliveryDays,
        proposalText: proposal,
        proposalPreview: preview,
        serviceTitle: svc.title,
        serviceId,
        conversationId: chatId,
      };

      await addUnifiedMessage(user.id, chatId, {
        contentType: 'embed',
        content: preview || 'Counter offer',
        embed,
      });

      await notifyInsert({
        user_id: counterTo,
        type: 'message',
        title: 'Counter offer',
        message: `New counter terms on “${svc.title || 'a service'}”. Open the chat to respond.`,
        related_id: chatId,
        related_type: 'chat',
      });
      await publishDealChannels({
        kind: 'counter',
        title: 'Service counter offer',
        message: `${proposerProf?.username || proposerProf?.full_name || 'A user'} countered terms on “${svc.title || 'a service'}”.`,
        url: `/chat/${chatId}`,
        card: {
          Type: 'Service counter',
          Service: svc.title || 'Service',
          Price: `$${price.toLocaleString()}`,
          Delivery: deliveryDays ? `${deliveryDays} days` : 'Not set',
        },
        actions: [{ label: 'Respond in chat', url: `/chat/${chatId}` }],
      });

      return { ok: true };
    }

    if (basis === 'request_bid') {
      const bidId = String(body?.counterToBidId || '').trim();
      if (!bidId) throw new Error('counterToBidId is required');

      const { data: bid, error: bidErr } = await client.from('bids').select('*').eq('id', bidId).maybeSingle();
      if (bidErr) throw bidErr;
      if (!bid) throw new Error('Bid not found');

      const { data: request, error: reqErr } = await client
        .from('project_requests')
        .select('*')
        .eq('id', bid.request_id)
        .maybeSingle();
      if (reqErr) throw reqErr;
      if (!request) throw new Error('Request not found');
      if (String(request.owner_id) !== String(user.id)) {
        throw new Error('Only the request owner can send this counter');
      }
      const bidderId = String(bid.bidder_id || '');
      if (!bidderId) throw new Error('Bid has no bidder');

      const { data: partRows } = await client
        .from('unified_chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('is_deleted', true);
      const uidSet = new Set((partRows || []).map((p) => String(p.user_id)));
      if (!uidSet.has(String(user.id)) || !uidSet.has(String(bidderId))) {
        throw new Error('You and the bidder must both be in this deal thread');
      }

      const [{ data: proposerProf }, { data: counterProf }] = await Promise.all([
        client.from('profiles').select('id, full_name, username, avatar_url').eq('id', user.id).maybeSingle(),
        client.from('profiles').select('id, full_name, username, avatar_url').eq('id', bidderId).maybeSingle(),
      ]);

      const embed = {
        type: 'deal_counter_offer',
        basis: 'request_bid',
        label: 'Client counter',
        proposer: profileSnapFromRow(proposerProf),
        counterparty: profileSnapFromRow(counterProf),
        price,
        deliveryDays,
        proposalText: proposal,
        proposalPreview: preview,
        requestTitle: request.title,
        requestId: request.id,
        bidId,
        conversationId: chatId,
      };

      await addUnifiedMessage(user.id, chatId, {
        contentType: 'embed',
        content: preview || 'Counter offer',
        embed,
      });

      await notifyInsert({
        user_id: bidderId,
        type: 'message',
        title: 'Counter on your bid',
        message: `The client sent new terms on “${request.title || 'a request'}”. Open the chat.`,
        related_id: chatId,
        related_type: 'chat',
      });
      await publishDealChannels({
        kind: 'counter',
        title: 'Request counter offer',
        message: `${proposerProf?.username || proposerProf?.full_name || 'A user'} countered terms on “${request.title || 'a request'}”.`,
        url: `/chat/${chatId}`,
        card: {
          Type: 'Request counter',
          Request: request.title || 'Request',
          Price: `$${price.toLocaleString()}`,
          Delivery: deliveryDays ? `${deliveryDays} days` : 'Not set',
        },
        actions: [{ label: 'Respond in chat', url: `/chat/${chatId}` }],
      });

      return { ok: true };
    }

    throw new Error('Unsupported counter basis');
  }

  async function declineServicePackageDeal(user, serviceId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const sid = String(serviceId || '').trim();
    const chatId = String(body?.conversationId || '').trim();
    const offerProposerId = String(body?.counterProposerId || '').trim();
    const reason = String(body?.reason || 'Offer declined').trim();
    if (!sid) throw new Error('Service id is required');
    if (!chatId) throw new Error('conversationId is required');
    if (!offerProposerId) throw new Error('counterProposerId is required');
    if (String(offerProposerId) === String(user.id)) throw new Error('You cannot decline your own offer');
    await assertUnifiedChatAccess(user.id, chatId);

    const { data: svc, error: svcErr } = await client.from('service_packages').select('*').eq('id', sid).maybeSingle();
    if (svcErr) throw svcErr;
    if (!svc) throw new Error('Service not found');
    if (String(svc.owner_id) !== String(user.id)) throw new Error('Only the service owner can decline this offer');

    const [{ data: actorProf }, { data: proposerProf }] = await Promise.all([
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', user.id).maybeSingle(),
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', offerProposerId).maybeSingle(),
    ]);

    const declineEmbed = {
      type: 'deal_phase',
      phase: 'service_negotiation',
      tone: 'warning',
      title: 'Offer declined',
      subtitle: `${actorProf?.username || actorProf?.full_name || 'Seller'} declined this offer.`,
      detail: reason,
      serviceId: sid,
      conversationId: chatId,
      proposer: profileSnapFromRow(proposerProf),
      counterparty: profileSnapFromRow(actorProf),
    };
    await addUnifiedMessage(user.id, chatId, {
      contentType: 'embed',
      content: reason || 'Offer declined',
      embed: declineEmbed,
    });

    await notifyInsert({
      user_id: offerProposerId,
      type: 'message',
      title: 'Offer declined',
      message: `Your offer on “${svc.title || 'a service'}” was declined. Open chat to revise terms.`,
      related_id: chatId,
      related_type: 'chat',
    });
    await publishDealChannels({
      kind: 'declined',
      title: 'Service offer declined',
      message: `${actorProf?.username || actorProf?.full_name || 'Seller'} declined an offer on “${svc.title || 'a service'}”.`,
      url: `/chat/${chatId}`,
      actions: [
        { label: 'Open deal chat', url: `/chat/${chatId}` },
        { label: 'Send new offer', url: `/bid/service?id=${sid}` },
      ],
    });

    return { ok: true };
  }

  async function sendChannelTest(user, payload = {}) {
    const label = String(payload?.label || '').trim();
    const actor = user?.email || user?.id || 'user';
    await publishDealChannels({
      kind: 'changelog',
      title: 'Channel test ping',
      message: `${label ? `${label} · ` : ''}Triggered by ${actor}.`,
      url: '/marketplace',
      card: {
        Type: 'Manual test',
        Actor: actor,
        Time: new Date().toISOString(),
      },
      actions: [{ label: 'Open marketplace', url: '/marketplace' }],
    });
    return { ok: true };
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

  // ——— Project contracts (deal room) ———

  async function assertContractParty(userId, row) {
    if (!row) throw new Error('Contract not found');
    const uid = String(userId);
    if (String(row.client_id) !== uid && String(row.provider_id) !== uid) {
      throw new Error('Not authorized for this contract');
    }
  }

  function mapContractRow(row, clientProf, providerProf) {
    return {
      id: row.id,
      status: row.status,
      title: row.title,
      body: row.body,
      amountUsd: row.amount_usd != null ? Number(row.amount_usd) : null,
      fundReference: row.fund_reference || null,
      clientSignedAt: row.client_signed_at || null,
      providerSignedAt: row.provider_signed_at || null,
      client: profileSnapFromRow(clientProf),
      provider: profileSnapFromRow(providerProf),
      revisionNote: row.revision_note || null,
      payoutAddress: row.payout_address || null,
    };
  }

  async function loadContractRow(contractId) {
    const id = String(contractId || '').trim();
    if (!id) throw new Error('Contract id is required');
    const { data: row, error } = await client.from('project_contracts').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return row;
  }

  async function getContractForUser(userId, contractId) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(userId, row);
    const [{ data: cp }, { data: pp }] = await Promise.all([
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', row.client_id).maybeSingle(),
      client.from('profiles').select('id, full_name, username, avatar_url').eq('id', row.provider_id).maybeSingle(),
    ]);
    return { contract: mapContractRow(row, cp, pp) };
  }

  async function patchContractDraft(user, contractId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(user.id, row);
    const st = String(row.status);
    if (!['draft', 'revision_requested'].includes(st)) {
      throw new Error('Contract cannot be edited in this status');
    }
    const title = body.title != null ? String(body.title).trim() : row.title;
    const txtBody = body.body != null ? String(body.body) : row.body;
    const amountUsd = body.amountUsd != null ? Number(body.amountUsd) : Number(row.amount_usd);
    if (!title) throw new Error('Title is required');
    if (!Number.isFinite(amountUsd) || amountUsd < 0) throw new Error('Valid amountUsd is required');
    const patch = {
      title,
      body: txtBody,
      amount_usd: amountUsd,
      updated_at: new Date().toISOString(),
    };
    if (st === 'revision_requested') {
      patch.status = 'draft';
      patch.revision_note = null;
      patch.revision_requested_by = null;
    }
    const { error: uerr } = await client.from('project_contracts').update(patch).eq('id', row.id);
    if (uerr) throw uerr;
    return getContractForUser(user.id, row.id);
  }

  function contractNotifyChatId(row) {
    return row.unified_chat_id || row.legacy_conversation_id || null;
  }

  async function sendContractForSignatures(user, contractId) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(user.id, row);
    const st = String(row.status);
    if (!['draft', 'revision_requested'].includes(st)) {
      throw new Error('Only a draft can be sent for signatures');
    }
    const { error } = await client
      .from('project_contracts')
      .update({
        status: 'sent',
        client_signed_at: null,
        provider_signed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    if (error) throw error;
    const other = String(row.client_id) === String(user.id) ? row.provider_id : row.client_id;
    const nid = contractNotifyChatId(row);
    if (nid) {
      await notifyInsert({
        user_id: other,
        type: 'message',
        title: 'Contract ready to sign',
        message: 'Review and approve the contract terms in your deal room.',
        related_id: nid,
        related_type: 'chat',
      });
    }
    return getContractForUser(user.id, row.id);
  }

  async function signContract(user, contractId) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(user.id, row);
    if (String(row.status) !== 'sent') {
      throw new Error('Contract is not waiting for your signature');
    }
    const uid = String(user.id);
    const isClient = String(row.client_id) === uid;
    const patch = { updated_at: new Date().toISOString() };
    if (isClient) {
      if (row.client_signed_at) throw new Error('You already signed this contract');
      patch.client_signed_at = new Date().toISOString();
    } else {
      if (row.provider_signed_at) throw new Error('You already signed this contract');
      patch.provider_signed_at = new Date().toISOString();
    }
    const { data: mid, error } = await client
      .from('project_contracts')
      .update(patch)
      .eq('id', row.id)
      .select('*')
      .single();
    if (error) throw error;
    const clientSigned = mid.client_signed_at != null;
    const providerSigned = mid.provider_signed_at != null;
    let nextStatus = 'sent';
    if (clientSigned && providerSigned) {
      nextStatus = 'fully_accepted';
    }
    if (nextStatus !== String(mid.status)) {
      const { error: e2 } = await client
        .from('project_contracts')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', row.id);
      if (e2) throw e2;
    }
    const other = isClient ? row.provider_id : row.client_id;
    const nid = contractNotifyChatId(row);
    if (nid) {
      await notifyInsert({
        user_id: other,
        type: 'message',
        title: nextStatus === 'fully_accepted' ? 'Contract fully signed' : 'Contract signed',
        message:
          nextStatus === 'fully_accepted'
            ? 'Both parties have signed. The client can proceed to payment when ready.'
            : 'The other party signed. Your signature is still needed to complete the contract.',
        related_id: nid,
        related_type: 'chat',
      });
    }
    try {
      if (nextStatus === 'fully_accepted' && String(row.status) !== 'fully_accepted') {
        const dealVal = Number(row.amount_usd) || 0;
        if (currencyService) {
          await currencyService.awardConquest(row.provider_id, 250, 'deal_signed', 'project_contracts', row.id, {
            deal_value: dealVal,
            buyer_id: row.client_id,
          });
          await currencyService.awardConquest(row.client_id, 250, 'deal_signed', 'project_contracts', row.id, {
            deal_value: dealVal,
            seller_id: row.provider_id,
          });
        }
        if (ratingService) {
          await ratingService.processDealWin(row.provider_id, dealVal, null, false);
          await ratingService.processDealWin(row.client_id, dealVal, null, false);
        }
      }
    } catch (e) {
      console.warn('[conquest] deal_signed hook:', e.message);
    }
    return getContractForUser(user.id, row.id);
  }

  async function requestContractRevision(user, contractId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const noteRaw =
      body && typeof body === 'object' && body.note !== undefined ? body.note : body;
    const note = noteRaw != null ? String(noteRaw) : '';
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(user.id, row);
    if (String(row.status) !== 'sent') {
      throw new Error('You can only request edits while the contract is out for signature');
    }
    const { error } = await client
      .from('project_contracts')
      .update({
        status: 'revision_requested',
        revision_note: note.trim() || 'Edits requested',
        revision_requested_by: user.id,
        client_signed_at: null,
        provider_signed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    if (error) throw error;
    const other = String(row.client_id) === String(user.id) ? row.provider_id : row.client_id;
    const nid = contractNotifyChatId(row);
    if (nid) {
      await notifyInsert({
        user_id: other,
        type: 'message',
        title: 'Contract edits requested',
        message: (note.trim() || 'Please update the contract draft.').slice(0, 240),
        related_id: nid,
        related_type: 'chat',
      });
    }
    return getContractForUser(user.id, row.id);
  }

  async function cancelContract(user, contractId) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    await assertContractParty(user.id, row);
    const st = String(row.status);
    if (['funds_held', 'released', 'cancelled', 'awaiting_funds'].includes(st)) {
      throw new Error('Contract cannot be cancelled in this state');
    }
    const { error } = await client
      .from('project_contracts')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (error) throw error;
    try {
      if (ratingService) {
        await ratingService.processLoss(user.id, 'deal_cancelled');
      }
    } catch (e) {
      console.warn('[rating] deal_cancelled hook:', e.message);
    }
    return getContractForUser(user.id, row.id);
  }

  async function createContractCryptoIntent(user, contractId, body) {
    if (!client) throw new Error('Supabase is not configured');
    const row = await loadContractRow(contractId);
    if (!row) throw new Error('Contract not found');
    if (String(row.client_id) !== String(user.id)) {
      throw new Error('Only the client can start checkout');
    }
    if (String(row.status) !== 'fully_accepted') {
      throw new Error('Both parties must sign before payment');
    }
    const payout = String(body?.payoutAddress || '').trim();
    if (!payout) throw new Error('Payout address is required');
    const apiKey = String(env.nowpaymentsApiKey || '').trim();
    if (!apiKey) {
      throw new Error('Crypto checkout is not configured (set NOWPAYMENTS_API_KEY on the server)');
    }
    const amountUsd = Number(row.amount_usd);
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) throw new Error('Invalid contract amount');
    const reference = `CT-${String(row.id).replace(/-/g, '').slice(0, 16)}`;
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const web = env.publicWebOrigin || 'http://localhost:3001';
    const apiOrigin = env.apiPublicOrigin || `http://127.0.0.1:${env.port || 3000}`;
    const chatPath = row.unified_chat_id ? `/chat/${row.unified_chat_id}` : '/chat';
    const successUrl = `${web}${chatPath}?contractPaid=${encodeURIComponent(row.id)}`;
    const cancelUrl = `${web}${chatPath}`;
    let checkoutLink = null;
    let npId = null;
    try {
      const inv = await createNowpaymentsInvoice({
        apiKey,
        sandbox: Boolean(env.nowpaymentsSandbox),
        priceAmount: amountUsd,
        priceCurrency: 'usd',
        ipnCallbackUrl: `${apiOrigin}/api/nowpayments/ipn`,
        orderId: reference,
        orderDescription: row.title || 'Contract escrow',
        successUrl,
        cancelUrl,
      });
      checkoutLink = extractInvoiceCheckoutUrl(inv);
      npId = inv && inv.id != null ? String(inv.id) : null;
    } catch (e) {
      throw new Error(e.message || 'Could not create payment invoice');
    }
    if (!checkoutLink) throw new Error('Payment provider did not return a checkout URL');
    const { error: upErr } = await client
      .from('project_contracts')
      .update({
        payout_address: payout,
        fund_reference: reference,
        status: 'awaiting_funds',
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    if (upErr) throw upErr;
    const { error: insErr } = await client.from('contract_payment_intents').insert({
      contract_id: row.id,
      payer_id: user.id,
      reference,
      amount_usd: amountUsd,
      quote_snapshot: { provider: 'nowpayments' },
      status: 'pending',
      expires_at: expiresAt,
      nowpayments_invoice_id: npId,
    });
    if (insErr) throw insErr;
    const nid = contractNotifyChatId(row);
    if (nid && row.provider_id) {
      await notifyInsert({
        user_id: row.provider_id,
        type: 'message',
        title: 'Client started payment',
        message: `Escrow checkout opened (ref ${reference}).`,
        related_id: nid,
        related_type: 'chat',
      });
    }
    return { checkoutLink, reference };
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
    const { error: upErr } = await client
      .from('profiles')
      .update({
        rating_avg: avg,
        rating_count: cnt,
        top_member: top,
      })
      .eq('id', revieweeId);
    if (upErr && String(upErr.message || '').includes('top_member')) {
      await client
        .from('profiles')
        .update({
          rating_avg: avg,
          rating_count: cnt,
        })
        .eq('id', revieweeId);
    }
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

    try {
      if (currencyService) {
        await currencyService.awardConquest(revieweeId, 100, 'review_received', 'project_reviews', inserted.id, {
          rating: Math.round(rating),
          reviewer_id: userId,
        });
      }
    } catch (e) {
      console.warn('[conquest] review_received hook:', e.message);
    }

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
  const handle = String(username || '').trim().replace(/^@+/, '').toLowerCase();
  if (!handle) throw new Error('Username is required');
    const { data, error } = await client
      .from('profiles')
      .select('*')
    // Usernames are live public profile routes by default.
    .eq('username', handle)
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
        reviewerUsername: p?.username || null,
        reviewerAvatar: p?.avatar_url || null,
      };
    });

    let publicServices = [];
    let openRequests = [];
    let recentContracts = [];
    let currencySnapshot = null;
    let ratingSnapshot = null;
    try {
      const [{ data: svcRows }, { data: reqRows }, { data: ctrRows }, { data: uc }, { data: ur }] =
        await Promise.all([
          client
            .from('service_packages')
            .select('id, title, category, base_price, slug, status')
            .eq('owner_id', data.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(6),
          client
            .from('project_requests')
            .select('id, title, budget_min, budget_max, due_date, status')
            .eq('owner_id', data.id)
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(50),
          client
            .from('project_contracts')
            .select('id, title, status, updated_at, client_signed_at, provider_signed_at')
            .or(`client_id.eq.${data.id},provider_id.eq.${data.id}`)
            .in('status', ['fully_accepted', 'funds_held', 'released', 'awaiting_funds'])
            .order('updated_at', { ascending: false })
            .limit(5),
          client.from('user_currencies').select('*').eq('user_id', data.id).maybeSingle(),
          client.from('user_ratings').select('*').eq('user_id', data.id).maybeSingle(),
        ]);
      publicServices = svcRows || [];
      openRequests = reqRows || [];
      recentContracts = ctrRows || [];
      const reqIds = (openRequests || []).map((r) => r.id).filter(Boolean);
      const bidCountByReq = new Map();
      if (reqIds.length) {
        const { data: bidRows } = await client.from('bids').select('request_id').in('request_id', reqIds);
        for (const b of bidRows || []) {
          const k = b.request_id;
          bidCountByReq.set(k, (bidCountByReq.get(k) || 0) + 1);
        }
      }
      for (const r of openRequests) {
        r.proposalCount = bidCountByReq.get(r.id) || 0;
      }
      if (uc) {
        currencySnapshot = {
          honor_points: Number(uc.honor_points) || 0,
          conquest_points: Number(uc.conquest_points) || 0,
          neonScore: (Number(uc.honor_points) || 0) + (Number(uc.conquest_points) || 0) * 10,
          total_conquest_earned: Number(uc.total_conquest_earned) || 0,
        };
      }
      if (ur) {
        const w = Number(ur.deal_wins) || 0;
        const l = Number(ur.deal_losses) || 0;
        ratingSnapshot = {
          ...ur,
          neonScore: currencySnapshot?.neonScore ?? 0,
          winRate: w + l > 0 ? Math.round((w / (w + l)) * 1000) / 10 : 0,
        };
      }
    } catch (e) {
      console.warn('[public profile] extras:', e.message);
    }

    return {
      ...data,
      portfolios: portfolios || [],
      reviews,
      publicServices,
      openRequests,
      recentContracts,
      currencySnapshot,
      ratingSnapshot,
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

  /** Public dashboard tiles for the home hub (no auth). */
  async function getHomeStats() {
    if (!client) {
      const base = await readPreview();
      const profiles = base.profiles || [];
      const humanChats = base.humanChats || [];
      const projects = base.projects || [];
      const services = base.services || [];
      const requests = base.requests || [];
      return {
        registeredProfiles: profiles.length,
        dealsClosed: projects.length,
        totalGMV: 0,
        aiAgentsCount: 158,
        totals: {
          members: profiles.length,
          chats: humanChats.length,
          deals: projects.length,
          onlineMembers: 0,
          bids: 0,
          servicesListed: services.length,
          openRequests: requests.filter((r) => String(r?.status || '') === 'open').length,
        },
        latest: null,
      };
    }

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    try {
      const marketplaceStats = await fetchMarketplaceStats();
      const [membersRes, convRes, dealsRes, onlineRes, agentsRes] = await Promise.all([
        client.from('profiles').select('id', { count: 'exact', head: true }),
        client.from('conversations').select('id', { count: 'exact', head: true }),
        client
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .in('status', ['active', 'review', 'delivered']),
        client.from('profiles').select('id', { count: 'exact', head: true }).gte('last_activity_at', fifteenMinAgo),
        client.from('agents').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
      ]);

      let unifiedCount = 0;
      const u = await client.from('unified_chats').select('id', { count: 'exact', head: true });
      if (!u.error) unifiedCount = u.count || 0;

      const chats = (convRes.count || 0) + unifiedCount;
      const onlineCount = onlineRes.error ? 0 : onlineRes.count || 0;
      const aiAgentsCount = agentsRes.error ? 158 : (agentsRes.count || 0);

      return {
        registeredProfiles: membersRes.count ?? 0,
        dealsClosed: dealsRes.count ?? 0,
        totalGMV: marketplaceStats?.ordersTracked ? marketplaceStats.ordersTracked * 150 : 0, // Estimate GMV from orders
        aiAgentsCount,
        totals: {
          members: membersRes.count ?? 0,
          chats,
          deals: dealsRes.count ?? 0,
          onlineMembers: onlineCount,
          bids: marketplaceStats?.bidsTotal ?? 0,
          servicesListed: marketplaceStats?.servicesPublished ?? 0,
          openRequests: marketplaceStats?.requestsOpen ?? 0,
        },
        latest: null,
      };
    } catch (e) {
      console.warn('[home/stats]', e.message);
      return {
        registeredProfiles: 0,
        dealsClosed: 0,
        totalGMV: 0,
        aiAgentsCount: 158,
        totals: {
          members: 0,
          chats: 0,
          deals: 0,
          onlineMembers: 0,
        },
        latest: null,
      };
    }
  }

  /** Get count of active chats with messages in last 24h */
  async function getActiveChatsCount() {
    if (!client) return 0;
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      // Count conversations with messages in last 24h
      const { count, error } = await client
        .from('messages')
        .select('conversation_id', { count: 'exact', head: true, distinct: true })
        .gte('created_at', yesterday);
      if (error) {
        console.warn('[stats] active chats count:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e) {
      return 0;
    }
  }

  /** Get deals closed this season (last 90 days) */
  async function getSeasonDealsClosed() {
    if (!client) return 0;
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await client
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', ninetyDaysAgo);
      if (error) {
        console.warn('[stats] season deals:', error.message);
        return 0;
      }
      return count || 0;
    } catch (e) {
      return 0;
    }
  }

  /** Track service view */
  async function trackServiceView(serviceId) {
    if (!client || !serviceId) return;
    try {
      await client.rpc('increment_service_views', { service_id: serviceId });
    } catch (e) {
      // Silently fail - views are not critical
    }
  }

  /** Get service view count */
  async function getServiceViewCount(serviceId) {
    if (!client || !serviceId) return 0;
    try {
      const { data, error } = await client
        .from('service_packages')
        .select('view_count')
        .eq('id', serviceId)
        .single();
      if (error) return 0;
      return data?.view_count || 0;
    } catch (e) {
      return 0;
    }
  }

  /** Get recent deals for activity feed */
  async function getRecentDeals(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('projects')
        .select('id, title, client_id, owner_id, final_price, completed_at, created_at, status')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        id: d.id,
        buyer_username: d.client_id,
        seller_username: d.owner_id,
        amount: d.final_price,
        completed_at: d.completed_at || d.created_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent rank ups for activity feed */
  async function getRecentRankUps(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('user_ratings')
        .select('user_id, rank, updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);
      const userIds = (data || []).map((d) => d.user_id);
      if (userIds.length === 0) return [];
      const { data: profiles } = await client.from('profiles').select('id, username').in('id', userIds);
      const usernameMap = new Map((profiles || []).map((p) => [p.id, p.username]));
      return (data || []).map((d) => ({
        user_id: d.user_id,
        username: usernameMap.get(d.user_id) || 'unknown',
        new_rank: d.rank,
        timestamp: d.updated_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent squad joins */
  async function getRecentSquadJoins(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('squad_members')
        .select('user_id, squad_id, joined_at')
        .order('joined_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        user_id: d.user_id,
        squad_id: d.squad_id,
        timestamp: d.joined_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent reviews */
  async function getRecentReviews(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('project_reviews')
        .select('id, reviewer_id, reviewee_id, rating, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        id: d.id,
        reviewer_id: d.reviewer_id,
        reviewee_id: d.reviewee_id,
        rating: d.rating,
        timestamp: d.created_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent registrations */
  async function getRecentRegistrations(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('profiles')
        .select('id, username, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        user_id: d.id,
        username: d.username,
        timestamp: d.created_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent listings */
  async function getRecentListings(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('service_packages')
        .select('id, title, owner_id, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        id: d.id,
        title: d.title,
        owner_id: d.owner_id,
        timestamp: d.created_at,
      }));
    } catch (e) {
      return [];
    }
  }

  /** Get recent bids */
  async function getRecentBids(limit = 5) {
    if (!client) return [];
    try {
      const { data } = await client
        .from('bids')
        .select('id, bidder_id, request_id, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      return (data || []).map((d) => ({
        id: d.id,
        bidder_id: d.bidder_id,
        request_id: d.request_id,
        amount: d.amount,
        timestamp: d.created_at,
      }));
    } catch (e) {
      return [];
    }
  }

  return {
    currencyService,
    ratingService,
    getBootstrap,
    getMarketplaceStats: fetchMarketplaceStats,
    getHomeStats,
    getActiveChatsCount,
    getSeasonDealsClosed,
    trackServiceView,
    getServiceViewCount,
    getRecentDeals,
    getRecentRankUps,
    getRecentSquadJoins,
    getRecentReviews,
    getRecentRegistrations,
    getRecentListings,
    getRecentBids,
    updateProfile,
    importProfileFromSocial,
    checkUsernameAvailable,
    getServiceById,
    submitServicePackageBid,
    acceptServicePackageDeal,
    declineServicePackageDeal,
    sendChannelTest,
    submitDealCounterOffer,
    getProjectRequestById,
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
    getChatMessages,
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
    inviteChatParticipant,
    uploadUnifiedChatFile,
    uploadLegacyChatFile,
    leaveUnifiedChat,
    setUnifiedTyping,
    leaveConversation,
    clearLegacyChats,
    getContractForUser,
    patchContractDraft,
    sendContractForSignatures,
    signContract,
    requestContractRevision,
    cancelContract,
    createContractCryptoIntent,
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
    // User Agents
    getUserAgents,
    getUserAgentById,
    createUserAgent,
    updateUserAgent,
    deleteUserAgent,
    countUserAgents,
    canCreateAgent,
    // Squads
    getUserSquads,
    getAvailableSquads,
    getSquadById,
    createSquad,
    joinSquad,
    leaveSquad,
    disbandSquad,
    countUserSquads,
    canCreateSquad,
    // Sitemap methods
    getPublicProfilesForSitemap,
    getPublicServicesForSitemap,
    getPublicRequestsForSitemap,
    getPublicSquadsForSitemap,
  };

  // User Agents functions
  async function getUserAgents(userId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('user_agents')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getUserAgentById(agentId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('user_agents')
      .select('*')
      .eq('id', agentId)
      .single();
    if (error) throw error;
    return data;
  }

  async function createUserAgent(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client
      .from('user_agents')
      .insert({
        owner_id: userId,
        name: String(payload.name || '').trim(),
        description: String(payload.description || '').trim(),
        icon: String(payload.icon || 'smart_toy'),
        category: String(payload.category || 'general'),
        capabilities: Array.isArray(payload.capabilities) ? payload.capabilities : [],
        config_json: payload.config || {},
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function updateUserAgent(userId, agentId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (payload.name !== undefined) updates.name = String(payload.name || '').trim();
    if (payload.description !== undefined) updates.description = String(payload.description || '').trim();
    if (payload.icon !== undefined) updates.icon = String(payload.icon || 'smart_toy');
    if (payload.status !== undefined) updates.status = payload.status;
    if (payload.config !== undefined) updates.config_json = payload.config;
    const { data, error } = await client
      .from('user_agents')
      .update(updates)
      .eq('id', agentId)
      .eq('owner_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteUserAgent(userId, agentId) {
    if (!client) throw new Error('Supabase is not configured');
    const { error } = await client
      .from('user_agents')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', agentId)
      .eq('owner_id', userId);
    if (error) throw error;
    return { ok: true };
  }

  async function countUserAgents(userId) {
    if (!client) return 0;
    const { data, error } = await client.rpc('count_user_agents', { user_uuid: userId });
    if (error) {
      // Fallback if RPC not available
      const { count } = await client
        .from('user_agents')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .in('status', ['active', 'idle', 'busy']);
      return count || 0;
    }
    return data || 0;
  }

  async function canCreateAgent(userId) {
    const count = await countUserAgents(userId);
    // Check user's plan tier
    const { data: settings } = await client
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .maybeSingle();
    const planTier = settings?.settings?.plan_tier || 'free';
    const maxAgents = planTier === 'free' ? 1 : 3;
    return count < maxAgents;
  }

  // Squads functions
  async function getUserSquads(userId) {
    if (!client) throw new Error('Supabase is not configured');
    // Get squads where user is a member
    const { data: memberships, error: memError } = await client
      .from('squad_members')
      .select('squad_id')
      .eq('member_id', userId)
      .eq('status', 'active');
    if (memError) throw memError;
    if (!memberships || memberships.length === 0) return [];
    
    const squadIds = memberships.map(m => m.squad_id);
    const { data: squads, error } = await client
      .from('squads')
      .select('*, squad_members(*)')
      .in('id', squadIds)
      .eq('status', 'active');
    if (error) throw error;
    return squads || [];
  }

  async function getAvailableSquads(userId) {
    if (!client) throw new Error('Supabase is not configured');
    // Get active squads user is not a member of
    const { data: myMemberships } = await client
      .from('squad_members')
      .select('squad_id')
      .eq('member_id', userId)
      .eq('status', 'active');
    const excludeIds = (myMemberships || []).map(m => m.squad_id);
    
    // Get all active squads
    let query = client
      .from('squads')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    const { data: squads, error } = await query;
    if (error) throw error;
    
    // Get member counts for each squad
    const squadsWithCounts = await Promise.all(
      (squads || []).map(async (squad) => {
        const { count } = await client
          .from('squad_members')
          .select('*', { count: 'exact', head: true })
          .eq('squad_id', squad.id)
          .eq('status', 'active');
        
        return {
          ...squad,
          member_count: count || 0
        };
      })
    );
    
    return squadsWithCounts;
  }

  async function getSquadById(userId, squadId) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: squad, error } = await client
      .from('squads')
      .select('*, squad_members(*, member:profiles(id, username, avatar_url))')
      .eq('id', squadId)
      .single();
    if (error) throw error;
    
    // Check if user is a member
    const { data: membership } = await client
      .from('squad_members')
      .select('*')
      .eq('squad_id', squadId)
      .eq('member_id', userId)
      .maybeSingle();
    
    return { ...squad, isMember: !!membership, isOwner: squad.owner_id === userId };
  }

  async function createSquad(userId, payload) {
    if (!client) throw new Error('Supabase is not configured');
    const { data: squad, error } = await client
      .from('squads')
      .insert({
        name: String(payload.name || '').trim(),
        description: String(payload.description || '').trim(),
        icon: String(payload.icon || 'groups'),
        owner_id: userId,
        max_members: payload.maxMembers || 5,
      })
      .select('*')
      .single();
    if (error) throw error;
    
    // Add owner as first member
    await client.from('squad_members').insert({
      squad_id: squad.id,
      member_type: 'human',
      member_id: userId,
      role: 'Leader',
      status: 'active',
    });
    
    return squad;
  }

  async function joinSquad(userId, squadId) {
    if (!client) throw new Error('Supabase is not configured');
    // Check if squad exists and is active
    const { data: squad, error: squadError } = await client
      .from('squads')
      .select('*')
      .eq('id', squadId)
      .eq('status', 'active')
      .single();
    if (squadError || !squad) throw new Error('Squad not found or inactive');
    
    // Check member count
    const { count } = await client
      .from('squad_members')
      .select('*', { count: 'exact', head: true })
      .eq('squad_id', squadId)
      .eq('status', 'active');
    if (count >= squad.max_members) throw new Error('Squad is full');
    
    // Check if already a member
    const { data: existing } = await client
      .from('squad_members')
      .select('*')
      .eq('squad_id', squadId)
      .eq('member_id', userId)
      .maybeSingle();
    if (existing) {
      if (existing.status === 'active') throw new Error('Already a member');
      // Reactivate
      const { error } = await client
        .from('squad_members')
        .update({ status: 'active' })
        .eq('id', existing.id);
      if (error) throw error;
      return { success: true };
    }
    
    // Add as new member
    const { error } = await client.from('squad_members').insert({
      squad_id: squadId,
      member_type: 'human',
      member_id: userId,
      role: 'Member',
      status: 'active',
    });
    if (error) throw error;
    return { success: true };
  }

  async function leaveSquad(userId, squadId) {
    if (!client) throw new Error('Supabase is not configured');
    const { error } = await client
      .from('squad_members')
      .update({ status: 'inactive' })
      .eq('squad_id', squadId)
      .eq('member_id', userId);
    if (error) throw error;
    return { success: true };
  }

  async function disbandSquad(userId, squadId) {
    if (!client) throw new Error('Supabase is not configured');
    // Verify ownership
    const { data: squad } = await client
      .from('squads')
      .select('owner_id')
      .eq('id', squadId)
      .single();
    if (!squad || squad.owner_id !== userId) throw new Error('Only owner can disband');
    
    const { error } = await client
      .from('squads')
      .update({ status: 'disbanded' })
      .eq('id', squadId)
      .eq('owner_id', userId);
    if (error) throw error;
    return { success: true };
  }

  async function countUserSquads(userId) {
    if (!client) return 0;
    const { data, error } = await client.rpc('count_user_squads', { user_uuid: userId });
    if (error) {
      // Fallback
      const { data: memberships } = await client
        .from('squad_members')
        .select('squad_id')
        .eq('member_id', userId)
        .eq('status', 'active');
      return memberships?.length || 0;
    }
    return data || 0;
  }

  async function canCreateSquad(userId) {
    if (!client) return false;
    // Check user's plan tier
    const { data: settings } = await client
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .maybeSingle();
    const planTier = settings?.settings?.plan_tier || 'free';
    // Free users cannot create squads
    return planTier !== 'free';
  }

  // Sitemap methods
  async function getPublicProfilesForSitemap() {
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('profiles')
        .select('id, username, updated_at')
        .eq('privacy_settings->>isPublic', 'true')
        .not('username', 'is', null)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[getPublicProfilesForSitemap]', e.message);
      return [];
    }
  }

  async function getPublicServicesForSitemap() {
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('services')
        .select('id, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[getPublicServicesForSitemap]', e.message);
      return [];
    }
  }

  async function getPublicRequestsForSitemap() {
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('project_requests')
        .select('id, updated_at')
        .eq('status', 'open')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[getPublicRequestsForSitemap]', e.message);
      return [];
    }
  }

  async function getPublicSquadsForSitemap() {
    if (!client) return [];
    try {
      const { data, error } = await client
        .from('squads')
        .select('id, updated_at')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('[getPublicSquadsForSitemap]', e.message);
      return [];
    }
  }
}

module.exports = {
  createPlatformRepository,
};
