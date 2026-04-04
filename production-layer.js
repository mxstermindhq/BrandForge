(function () {
  const pageTitles = {
    home: 'Home',
    profiles: 'Profiles',
    services: 'Services',
    requests: 'Requests',
    projects: 'Projects',
    leaderboard: 'Leaderboard',
    research: 'AI Deep Research',
    agent: 'mx Agent',
    hchat: 'Human Chat History',
    aichat: 'AI Chat History',
    settings: 'Profile Settings',
    chat: 'Chat',
    'public-profile': 'Profile',
    'service-detail': 'Service',
    'request-detail': 'Request',
    'project-detail': 'Project',
  };

  const validPages = new Set(Object.keys(pageTitles));
  const MX_AI_LOCKED =
    'AI chat threads in the sidebar are still a stub. Use Home mx Agent, Post Request, or Deep Research — or start a human chat.';

  const state = {
    page: 'home',
    filters: {
      profilesSearch: '',
      profilesBusinessRole: 'all',
      servicesSearch: '',
      servicesTab: 'all',
      requestsSearch: '',
      requestsTab: 'open',
      hchatSearch: '',
      aichatSearch: '',
      researchMode: 'Quick',
      leaderboardBusinessRole: 'all',
      leaderboardSort: 'credits',
      leaderboardWindow: 'season',
    },
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    storageMode: 'local',
    marketplaceStats: null,
    homeAiSuggestion: '',
    platform: {},
    profile: null,
    profiles: [],
    services: [],
    requests: [],
    projects: [],
    leaderboard: [],
    humanChats: [],
    aiChats: [],
    agentRuns: [],
    settings: {},
    activeChat: { id: '', title: 'Chat', type: 'human', messages: [] },
    research: { topic: '', hasResults: false, mode: 'Quick' },
    notifications: [],
    projectDetail: null,
    live: {
      pollTimer: null,
      typingTimer: null,
      typingStoppedTimer: null,
      lastTypingPingAt: 0,
      legacyPollTimer: null,
      legacyRealtimeUnsub: null,
      unifiedRealtimeChannel: null,
      unifiedRealtimeChatId: null,
    },
  };

  function hiddenChatsKey() {
    const userId = window.mxAuthState?.user?.id || 'guest';
    return `mx_hidden_chats_${userId}`;
  }

  function getHiddenChatIds() {
    try {
      const raw = localStorage.getItem(hiddenChatsKey());
      const list = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(list) ? list.map((v) => String(v)) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveHiddenChatIds(idsSet) {
    try {
      localStorage.setItem(hiddenChatsKey(), JSON.stringify([...idsSet]));
    } catch (_) {}
  }

  function getCurrentUserId() {
    return String(window.mxAuthState?.user?.id || '');
  }

  function getCurrentUsername() {
    return window.mxAuthState?.profile?.username
      || window.mxAuthState?.profile?.full_name
      || window.mxAuthState?.user?.email?.split('@')[0]
      || 'you';
  }

  function shortClock(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  function avatarImageMarkup(url, alt = 'avatar') {
    if (!url) return '';
    return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" class="avatar-img"/>`;
  }

  function applyAvatarElement(el, name, avatarUrl) {
    if (!el) return;
    if (avatarUrl) {
      el.innerHTML = avatarImageMarkup(avatarUrl, name || 'avatar');
      return;
    }
    el.innerHTML = 'Mx';
  }

  function deliveryStateForMessage(message) {
    if (message.role !== 'user') return '';
    if (message.status === 'sending') return 'Sending...';
    const participants = state.activeChat?.participants || [];
    const me = getCurrentUserId();
    const others = participants.filter((p) => String(p.userId || '') !== me);
    const seen = others.some((p) => p.lastReadAt && message.createdAt && new Date(p.lastReadAt) >= new Date(message.createdAt));
    return seen ? 'Seen' : 'Sent';
  }

  function mapUnifiedMessage(message) {
    const me = getCurrentUserId();
    const sid = message.senderId || message.sender_id || '';
    return {
      id: message.id,
      senderId: String(sid),
      role: String(sid) === me ? 'user' : 'human',
      text: message.content || message.text || '',
      contentType: message.contentType || message.content_type || 'text',
      fileUrl: message.fileUrl || message.file_url || null,
      fileName: message.fileName || message.file_name || null,
      fileSize: message.fileSize != null ? message.fileSize : message.file_size != null ? message.file_size : null,
      createdAt: message.createdAt || message.created_at || null,
      status: 'sent',
    };
  }

  function getCounterpartyInfo(chat) {
    const fallbackName = (chat?.t || chat?.title || 'Conversation').replace(/^(Service|Request):\s*/i, '').trim();
    const participants = state.activeChat?.participants || [];
    const me = getCurrentUserId();
    const other = participants.find((p) => String(p.userId || '') !== me);
    const name = other?.profile?.username || other?.profile?.full_name || chat?.otherName || fallbackName || 'user';
    const avatar = String(name || '?')[0].toUpperCase();
    const presence = state.activeChat?.presence || {};
    const otherPresence = other ? presence[String(other.userId)] : null;
    return {
      name,
      avatar,
      isOnline: Boolean(otherPresence?.online),
      isTyping: Boolean(otherPresence?.isTyping),
      lastSeenAt: otherPresence?.lastSeenAt || null,
    };
  }

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]));
  }

  function truncate(value, max) {
    const text = String(value || '');
    return text.length > max ? `${text.slice(0, max - 1)}...` : text;
  }

  function matchesSearch(values, query) {
    const normalized = String(query || '').trim().toLowerCase();
    if (!normalized) return true;
    const terms = normalized.split(/\s+/);
    return values.some((value) => {
      const valueStr = String(value || '').toLowerCase();
      // Exact match (highest priority)
      if (valueStr === normalized) return true;
      // All terms must match (AND search)
      return terms.every((term) => valueStr.includes(term));
    });
  }

  function calculateSearchRelevance(values, query) {
    const normalized = String(query || '').trim().toLowerCase();
    if (!normalized) return 0;
    const valueStr = String(values[0] || '').toLowerCase();
    // Exact match
    if (valueStr === normalized) return 100;
    // Starts with query
    if (valueStr.startsWith(normalized)) return 90;
    // Contains query
    if (valueStr.includes(normalized)) return 50;
    // All terms match
    const terms = normalized.split(/\s+/);
    if (terms.every((term) => values.some((v) => String(v || '').toLowerCase().includes(term)))) {
      return 30;
    }
    return 0;
  }

  function parseTags(value) {
    return [...new Set(String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5))];
  }

  function formatBudget(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  }

  function timeAgo(dateValue) {
    const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(dateValue).getTime()) / 60000));
    if (diffMinutes < 60) return `Started ${diffMinutes} min ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Started ${diffHours}h ago`;
    return `Started ${Math.round(diffHours / 24)}d ago`;
  }

  async function api(path, options = {}) {
    const authHeaders = { 'Content-Type': 'application/json' };
    const token = window.mxAuthState?.session?.access_token;
    if (token) authHeaders.Authorization = `Bearer ${token}`;
    const response = await fetch(path, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return payload;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }

  function isMobile() {
    return window.matchMedia('(max-width: 960px)').matches;
  }

  function syncSidebar() {
    const sidebar = $('sidebar');
    const overlay = $('app-overlay');
    if (isMobile()) {
      sidebar.classList.remove('collapsed');
      sidebar.classList.toggle('mobile-open', state.sidebarMobileOpen);
      overlay.classList.toggle('show', state.sidebarMobileOpen);
    } else {
      sidebar.classList.remove('mobile-open');
      sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
      overlay.classList.remove('show');
    }
  }

  function updateTitle(page) {
    $('ptitle').textContent = page === 'chat'
      ? truncate((state.activeChat && state.activeChat.title) || 'Chat', 35)
      : (pageTitles[page] || page);
  }

  function renderEmpty(title, description) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div>`;
  }

  function renderHomeFocus() {
    if ($('home-hero-title')) $('home-hero-title').innerHTML = 'mxster<em>mind</em>';
    if ($('home-hero-copy')) $('home-hero-copy').innerHTML = 'A full-stack preview of the first wedge: <strong>SaaS branding</strong> where AI explores fast, humans refine taste, and a maker-checker loop blocks generic output before clients ever see it.';
    if ($('home-promo-title')) $('home-promo-title').textContent = 'Phase 1 Preview: SaaS Branding';
    if ($('home-promo-copy')) $('home-promo-copy').textContent = 'Connected to a real API: strategy sync, maker swarm, checker gate, human refinement, artifact-led delivery.';
  }

  let _profileBackPage = 'profiles';

  function mergeLeaderboardRow(profile) {
    const rows = state.leaderboard || [];
    const match = rows.find(
      (u) => (profile.username && u.username === profile.username)
        || (profile.id && u.id === profile.id)
        || (u.n && profile.n && u.n === profile.n),
    );
    if (!match) return { ...profile };
    return {
      ...profile,
      jobs: match.j != null ? match.j : profile.jobs,
      rating: match.rt != null ? match.rt : profile.rating,
      usdt: match.usdt != null ? match.usdt : profile.usdt,
      tier: match.tier || profile.tier,
      likes: match.likes != null ? match.likes : profile.likes,
    };
  }

  function formatMemberSince(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `Member since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  function skillsFromBio(bio) {
    return String(bio || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 14);
  }

  function publicApiToMergedProfile(pub) {
    const sk = Array.isArray(pub.skills) && pub.skills.length
      ? pub.skills.map((t) => String(t).trim()).filter(Boolean)
      : (Array.isArray(pub.sk) && pub.sk.length ? pub.sk : skillsFromBio(pub.bio));
    const ravg = pub.rating_avg != null ? Math.round(Number(pub.rating_avg) * 10) / 10 : null;
    return {
      id: pub.id,
      n: pub.full_name || pub.username || 'Member',
      username: pub.username || null,
      avatarUrl: pub.avatar_url || null,
      bio: pub.bio || '',
      r: pub.headline || '',
      headline: pub.headline || '',
      role: pub.role,
      is_verified: Boolean(pub.is_verified),
      top_member: Boolean(pub.top_member),
      staff_team: Boolean(pub.staff_team),
      years_of_service: pub.years_of_service || 0,
      reputation: pub.reputation,
      vouches: pub.vouches,
      credits: pub.credits,
      likes: pub.likes,
      timezone: pub.timezone || null,
      company_name: pub.company_name || null,
      created_at: pub.created_at,
      portfolios: Array.isArray(pub.portfolios) ? pub.portfolios : [],
      pubReviews: Array.isArray(pub.reviews) ? pub.reviews : [],
      sk,
      t: pub.role === 'client' ? 'human' : 'hybrid',
      c: roleColorsSafe(pub.role) || hashColor(pub.full_name || pub.username || 'x'),
      rate: pub.role === 'client' ? 0 : 95,
      jobs: pub.completed_projects_count != null ? Number(pub.completed_projects_count) : (Number(pub.reputation) || 0),
      rating: ravg != null && Number.isFinite(ravg) ? ravg : 5,
      ratingCount: pub.rating_count != null ? Number(pub.rating_count) : 0,
      successRate: 99,
    };
  }

  function roleColorsSafe(role) {
    const roleColors = {
      client: '#57c4ff',
      specialist: '#b8ff57',
      affiliate: '#a78bfa',
      admin: '#f472b6',
      enterprise: '#fbbf24',
    };
    return roleColors[role] || '#94a3b8';
  }

  function hashColor(name) {
    let h = 0;
    const s = String(name || 'x');
    for (let i = 0; i < s.length; i += 1) h = s.charCodeAt(i) + ((h << 5) - h);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue}, 65%, 58%)`;
  }

  function renderPublicPortfolioGrid(portfolios) {
    const el = $('public-profile-portfolios');
    if (!el) return;
    if (!portfolios || !portfolios.length) {
      el.innerHTML = renderEmpty(
        'Show your best work here',
        'Add portfolio pieces under Portfolio Management — 1+ published item helps specialists appear in the marketplace.',
      );
      return;
    }
    el.innerHTML = portfolios.map((p) => {
      const title = escapeHtml(p.title || 'Project');
      const desc = escapeHtml((p.description || '').slice(0, 160));
      const cat = escapeHtml(p.category || '');
      const feat = p.featured ? '<span class="portfolio-featured">Featured</span>' : '';
      const imgs = (p.images || []).slice(0, 3).map((url) => `<img class="portfolio-thumb" src="${escapeAttr(url)}" alt=""/>`).join('');
      const tags = (p.tags || []).slice(0, 5).map((t) => `<span class="portfolio-tag">${escapeHtml(t)}</span>`).join('');
      const client = p.client_name ? `<div class="portfolio-client">Client: ${escapeHtml(p.client_name)}</div>` : '';
      const link = p.project_url
        ? `<div class="portfolio-link"><a href="${escapeAttr(p.project_url)}" target="_blank" rel="noopener">View project →</a></div>`
        : '';
      return `
      <div class="portfolio-item">
        <div class="portfolio-header">
          <h3 class="portfolio-title">${title}</h3>
          <div class="portfolio-meta">
            <span class="portfolio-category">${cat}</span>
            ${feat}
          </div>
        </div>
        <div class="portfolio-description">${desc}${(p.description || '').length > 160 ? '…' : ''}</div>
        ${imgs ? `<div class="portfolio-images">${imgs}</div>` : ''}
        ${tags ? `<div class="portfolio-tags">${tags}</div>` : ''}
        ${client}
        ${link}
      </div>`;
    }).join('');
  }

  function applyPublicProfilePage(profile) {
    const merged = mergeLeaderboardRow(profile);
    window._viewedProfile = merged;

    const backBtn = $('profile-back-btn');
    if (backBtn) backBtn.onclick = () => nav(_profileBackPage);

    const avatar = $('public-profile-avatar');
    if (avatar) {
      avatar.className = 'pp-avatar profile-avatar';
      applyAvatarElement(avatar, merged.n, merged.avatarUrl);
      const c1 = merged.c || roleColorsSafe(merged.role) || '#ec4899';
      const c2 = merged.c2 || '#8b5cf6';
      avatar.style.background = merged.avatarUrl ? 'transparent' : `linear-gradient(135deg,${c1},${c2})`;
      avatar.style.color = merged.avatarUrl ? '' : '#000';
    }

    if ($('public-profile-name')) $('public-profile-name').textContent = merged.n || '';

    const shaped = shapeProfileForInference(merged);
    const pubBr = inferBusinessRole(shaped);
    const pubIntent = profileCardIntent({ ...merged, r: shaped.r, sk: shaped.sk });
    if ($('public-profile-track')) $('public-profile-track').innerHTML = formatBusinessRolePill(pubBr);

    if ($('public-profile-username')) {
      $('public-profile-username').textContent = merged.username ? `@${merged.username}` : '';
    }

    const trackTitle = $('pp-track-title');
    if (trackTitle) {
      trackTitle.textContent = shaped.r || BUSINESS_ROLE_LABELS[pubBr] || 'Professional';
    }

    if ($('public-profile-headline')) {
      const sub = shaped.r ? BUSINESS_ROLE_LABELS[pubBr] : '';
      $('public-profile-headline').textContent = sub || '';
      $('public-profile-headline').style.display = sub ? 'block' : 'none';
    }

    if ($('public-profile-intent')) {
      $('public-profile-intent').innerHTML = `<span class="pcard-intent-label">${escapeHtml(pubIntent.label)}</span> ${escapeHtml(pubIntent.text)}`;
    }

    if ($('public-profile-bio')) {
      const me = getCurrentUserId();
      const isOwn = Boolean(me && merged.id && String(merged.id) === me);
      const bioTrim = String(merged.bio || '').trim();
      if (bioTrim.length) {
        $('public-profile-bio').textContent = merged.bio;
      } else {
        const line =
          'A short bio is fine, but 100+ characters helps buyers understand how you work and what you deliver.';
        $('public-profile-bio').innerHTML = isOwn
          ? `<span style="color:var(--muted)">${escapeHtml(line)}</span> <button type="button" class="auth-link" onclick="nav('settings')">Open Settings</button>`
          : `<span style="color:var(--muted)">${escapeHtml('No bio on this profile yet.')}</span>`;
      }
    }

    const verify = $('pp-verify-badge');
    if (verify) verify.style.display = merged.is_verified ? 'inline-flex' : 'none';

    const topPill = $('pp-top-rated-pill');
    if (topPill) {
      const showTop = merged.top_member || Number(merged.rating) >= 4.8;
      topPill.style.display = showTop ? 'inline-flex' : 'none';
    }

    const tierPill = $('pp-title-tier-pill');
    if (tierPill) {
      const tier = merged.tier || 'Challenger';
      tierPill.textContent = `Ladder: ${tier}`;
      tierPill.style.display = 'inline-flex';
    }

    const rt = Number(merged.rating);
    const rc = merged.ratingCount != null ? Number(merged.ratingCount) : 0;
    if ($('pp-stat-rating')) {
      $('pp-stat-rating').textContent = Number.isFinite(rt) ? `${rt.toFixed(1)}${rc ? ` · ${rc} reviews` : ''}` : '—';
    }
    if ($('pp-stat-jobs')) $('pp-stat-jobs').textContent = String(merged.jobs != null ? merged.jobs : 0);
    const succ = merged.successRate != null ? merged.successRate : (Number(merged.rating) >= 4.5 ? 99 : '—');
    if ($('pp-stat-success')) $('pp-stat-success').textContent = typeof succ === 'number' ? `${succ}%` : succ;
    const usdt = Number(merged.usdt);
    if ($('pp-stat-usdt')) {
      $('pp-stat-usdt').textContent = Number.isFinite(usdt) ? usdt.toLocaleString('en-US') : '0';
    }

    const meta = $('pp-meta-line');
    if (meta) {
      const locParts = [];
      if (merged.company_name) locParts.push(merged.company_name);
      if (merged.timezone) locParts.push(merged.timezone.replace(/_/g, ' '));
      const loc = locParts.join(' · ');
      const since = formatMemberSince(merged.created_at);
      const pin = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      meta.innerHTML = [
        loc ? `<span>${pin}${escapeHtml(loc)}</span>` : '',
        since ? `<span>${escapeHtml(since)}</span>` : '',
      ].filter(Boolean).join('') || '<span>Profile details</span>';
    }

    const skillsEl = $('public-profile-skills');
    if (skillsEl) {
      const me = getCurrentUserId();
      const isOwn = Boolean(me && merged.id && String(merged.id) === me);
      const sk = merged.sk && merged.sk.length ? merged.sk : skillsFromBio(merged.bio);
      skillsEl.innerHTML = sk.length
        ? sk.map((s) => `<span class="sk" style="font-size:12px;padding:6px 12px">${escapeHtml(s)}</span>`).join('')
        : (isOwn
          ? `<span style="color:var(--muted);font-size:13px">List skills in Settings (comma-separated in your bio works too).</span> <button type="button" class="auth-link" onclick="nav('settings')">Settings</button>`
          : '<span style="color:var(--muted);font-size:13px">No skills listed on this profile.</span>');
    }

    const rateEl = $('pp-aside-rate');
    if (rateEl) {
      if (merged.role === 'client') {
        rateEl.innerHTML = `Buyer account<span class="pp-rate-sub">posts requests</span>`;
      } else if (merged.role === 'affiliate') {
        rateEl.innerHTML = `Network<span class="pp-rate-sub">partners & intros</span>`;
      } else {
        const r = merged.rate != null ? merged.rate : 95;
        rateEl.innerHTML = `$${escapeHtml(String(r))}<span>/hour</span>`;
      }
    }

    const hireBtn = $('pp-hire-btn');
    if (hireBtn) {
      if (merged.role === 'client') {
        hireBtn.textContent = 'Browse specialists';
        hireBtn.onclick = () => nav('profiles');
      } else if (merged.role === 'affiliate') {
        hireBtn.textContent = 'Connect';
        hireBtn.onclick = () => openProfileChat();
      } else {
        hireBtn.textContent = 'Hire now';
        hireBtn.onclick = () => publicProfileHire();
      }
    }

    const bidBtn = $('profile-bid-btn');
    if (bidBtn) bidBtn.style.display = merged.role === 'specialist' ? 'flex' : 'none';

    const langs = $('pp-languages-list');
    if (langs) {
      const items = [];
      if (merged.timezone) items.push(`${merged.timezone.replace(/_/g, ' ')} (timezone)`);
      if (!items.length) items.push('Languages not listed — message to ask.');
      langs.innerHTML = items.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
    }

    const certs = $('pp-certs-list');
    if (certs) {
      const items = [];
      if (merged.is_verified) items.push('Platform verified profile');
      if (merged.top_member) items.push('Top rated member');
      if (merged.staff_team) items.push('Staff & operations');
      const y = Number(merged.years_of_service);
      if (y > 0) items.push(`${y}+ years on platform`);
      if (!items.length) items.push('Badges appear as you complete projects');
      certs.innerHTML = items.map((x) => `<li>${escapeHtml(x)}</li>`).join('');
    }

    const revBox = $('public-profile-reviews');
    if (revBox) {
      const revs = merged.pubReviews || [];
      revBox.innerHTML = revs.length
        ? `<div class="detail-section" style="margin-top:8px"><h3 style="font-family:'Syne',sans-serif;font-size:15px;color:#fff;margin-bottom:12px">Reviews</h3><div class="stack" style="gap:12px">${revs.map((r) => `
        <div class="note-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">
            <strong style="color:#fff;font-size:13px">${escapeHtml(r.reviewerName || 'Member')}</strong>
            <span style="color:#facc15;font-size:13px">${escapeHtml(String(r.rating || ''))}★</span>
          </div>
          <p style="font-size:13px;color:#ccc;line-height:1.55;margin:0">${escapeHtml(r.body || '')}</p>
          <div style="font-size:10px;color:var(--muted);margin-top:8px">${escapeHtml(shortClock(r.createdAt))}</div>
        </div>`).join('')}</div></div>`
        : '';
    }

    renderPublicPortfolioGrid(merged.portfolios);
  }

  function publicProfileHire() {
    const wrap = $('pp-portfolio-wrap');
    if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function viewProfile(profile, backPage) {
    _profileBackPage = backPage || 'profiles';
    applyPublicProfilePage(profile || {});
    nav('public-profile');

    const un = profile && profile.username;
    if (!un) return;
    api(`/api/profiles/${encodeURIComponent(un)}/public`)
      .then((pub) => {
        if (!pub || typeof pub !== 'object') return;
        const fromApi = publicApiToMergedProfile(pub);
        applyPublicProfilePage({ ...profile, ...fromApi });
      })
      .catch(() => {});
  }

  function openProfileChat() {
    const p = window._viewedProfile;
    if (!p) return;
    openChat(p.n, 'human');
  }

  function openProfileBid() {
    toast('Place Bid on this freelancer coming soon.');
  }

  // Business-role buckets (roughly senior / strategic → execution → commercial → support → ecosystem)
  const BUSINESS_ROLE_PRIORITY = ['executive', 'product', 'engineering', 'creative', 'revenue', 'operations', 'ecosystem'];
  const BUSINESS_ROLE_LABELS = {
    executive: 'Executive & Board',
    product: 'Product & Strategy',
    engineering: 'Engineering & Platform',
    creative: 'Creative & Media',
    revenue: 'Revenue & Growth',
    operations: 'Operations & Finance',
    ecosystem: 'Partnerships & Network',
  };

  function formatBusinessRolePill(roleKey) {
    const key = BUSINESS_ROLE_LABELS[roleKey] ? roleKey : 'engineering';
    return `<span class="br-pill br-${key}">${escapeHtml(BUSINESS_ROLE_LABELS[key])}</span>`;
  }

  function shapeProfileForInference(p) {
    if (!p) return { r: '', bio: '', sk: [], role: '' };
    const bio = p.bio || '';
    const sk = Array.isArray(p.sk) && p.sk.length
      ? p.sk
      : bio.split(',').map((t) => t.trim()).filter(Boolean);
    return { r: p.headline || p.r || '', bio, sk, role: p.role };
  }

  function profileCardIntent(profile) {
    const headline = String(profile.r || '').trim();
    const sk = (profile.sk || []).filter(Boolean);
    const bioLine = String(profile.bio || '').split(/[.;\n]/)[0].trim();
    const clip = (s, n) => {
      const t = String(s || '').trim();
      if (!t) return '';
      return t.length > n ? `${t.slice(0, n - 1)}…` : t;
    };
    if (profile.role === 'client') {
      const text = clip(headline || bioLine || 'Specialists for upcoming briefs and builds', 120);
      return { label: 'Looking for', text };
    }
    if (profile.role === 'affiliate') {
      const text = clip(headline || bioLine || 'Partners, talent, and client introductions', 120);
      return { label: 'Connects', text };
    }
    const text = clip(
      headline || (sk.length ? sk.join(' · ') : '') || bioLine || 'Project work aligned with your stack',
      120,
    );
    return { label: 'Offers', text };
  }
  const BUSINESS_ROLE_KEYWORDS = {
    executive:
      'founder co-founder ceo cfo coo cmo cto chief president chair board director vp vice investor partner principal owner managing executive leadership entrepreneur head studio',
    product:
      'product manager pm cpo roadmap strategy program agile scrum owner discovery research okr chief product',
    engineering:
      'engineer developer dev software code fullstack backend frontend react node python typescript golang rust java staff architect sre devops cloud aws azure gcp kubernetes docker infrastructure data scientist machine learning ml ai analyst sql bi security cybersecurity pentest infosec mobile ios android swift kotlin flutter blockchain web3 solidity',
    creative:
      'design designer ux ui graphic illustrator brand creative motion video editor premiere after effects 3d animation photography copywriter writer content editorial journalism',
    revenue:
      'marketing growth sales account sdr bdr bizdev business development revenue demand seo ads paid social gtm go-to-market customer success',
    operations:
      'operations finance accounting cfo controller bookkeeping tax legal counsel hr people ops recruiting recruiter office admin virtual assistant logistics procurement supply',
    ecosystem:
      'affiliate ambassador community network referral connector scout ecosystem evangelist',
  };

  function inferBusinessRole(entity) {
    const hay = [entity.r, entity.bio, ...(entity.sk || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const scoreBucket = (text, blob) => {
      let score = 0;
      for (const term of String(blob).split(/\s+/)) {
        if (term.length < 3) continue;
        if (text.includes(term)) score += term.length > 5 ? 2 : 1;
      }
      return score;
    };
    let best = 'engineering';
    let bestScore = 0;
    for (const key of BUSINESS_ROLE_PRIORITY) {
      const s = scoreBucket(hay, BUSINESS_ROLE_KEYWORDS[key]);
      if (s > bestScore) {
        bestScore = s;
        best = key;
      } else if (s === bestScore && s > 0) {
        const prev = BUSINESS_ROLE_PRIORITY.indexOf(best);
        const next = BUSINESS_ROLE_PRIORITY.indexOf(key);
        if (next < prev) best = key;
      }
    }
    if (bestScore === 0) {
      if (entity.role === 'affiliate') return 'ecosystem';
      if (entity.role === 'client') return 'executive';
      return 'engineering';
    }
    return best;
  }

  function renderProfiles() {
    const businessFilter = state.filters.profilesBusinessRole;

    // Humans only — filter out AI/hybrid
    const humanProfiles = state.profiles.filter((p) => p.t !== 'ai');

    const items = humanProfiles.filter((profile) => {
      const searchFields = [profile.n, profile.r, profile.role, ...(profile.sk || [])];
      const roleMatch = businessFilter === 'all' || inferBusinessRole(profile) === businessFilter;
      return roleMatch && matchesSearch(searchFields, state.filters.profilesSearch);
    });

    window._profilesList = items;

    const activeTalents = items.length;
    const avgRating = items.length
      ? (items.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / items.length).toFixed(1)
      : '0.0';

    const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;
    let humanWords = 0;
    let aiWords = 0;
    for (const c of state.humanChats || []) humanWords += countWords(c.s);
    for (const c of state.aiChats || []) aiWords += countWords(c.s);
    const msgs = state.activeChat?.messages || [];
    for (const m of msgs) {
      const w = countWords(m.text);
      if (m.role === 'ai') aiWords += w;
      else if (m.role === 'user' || m.role === 'human') humanWords += w;
    }
    aiWords += countWords(state.research?.topic);
    for (const run of state.agentRuns || []) {
      aiWords += countWords(run.title);
      for (const step of run.steps || []) {
        aiWords += countWords(step.t) + countWords(step.d);
      }
    }

    if ($('profiles-stats')) {
      $('profiles-stats').innerHTML = `
        <div class="stc"><div class="stv">${escapeHtml(activeTalents.toLocaleString())}</div><div class="stl">In this view</div><div class="stch">After search &amp; filters</div></div>
        <div class="stc"><div class="stv">${escapeHtml(String(avgRating))}</div><div class="stl">Avg rating</div><div class="stch">Filtered set</div></div>
        <div class="stc"><div class="stv g">${escapeHtml(String(humanWords.toLocaleString()))}</div><div class="stl">Human words</div><div class="stch">Chat previews &amp; your lines in view</div></div>
        <div class="stc"><div class="stv">${escapeHtml(String(aiWords.toLocaleString()))}</div><div class="stl">AI words</div><div class="stch">AI threads, agent &amp; research text</div></div>
      `;
    }

    $('pg-profiles').innerHTML = items.length
      ? items.map((profile, idx) => {
        const brKey = inferBusinessRole(profile);
        const intent = profileCardIntent(profile);
        return `
      <div class="pcard talent-card" style="--glow-color:${escapeHtml(profile.c || '#a3e635')}" onclick="viewProfile(window._profilesList[${idx}])">
        <div class="pct2">
          <div class="pav" style="background:linear-gradient(135deg,${profile.c || '#ec4899'},${profile.c2 || '#8b5cf6'})">${profile.avatarUrl ? avatarImageMarkup(profile.avatarUrl, profile.n) : (profile.n ? profile.n[0] : 'M')}</div>
          <div class="pcm">
            <div class="pcname">${escapeHtml(profile.n)}</div>
            ${profile.username ? `<div class="pcard-handle">@${escapeHtml(profile.username)}</div>` : ''}
            <div class="pcard-br">${formatBusinessRolePill(brKey)}</div>
            <div class="pcard-intent"><span class="pcard-intent-label">${escapeHtml(intent.label)}</span> ${escapeHtml(intent.text)}</div>
          </div>
        </div>
        <div class="pstats">
          <div><div class="psv">${profile.rating || '—'}</div><div class="psl">Rating</div></div>
          <div><div class="psv" style="color:var(--accent)">${profile.successRate || 99}%</div><div class="psl">Success</div></div>
          <div><div class="psv">${profile.jobs || 0}</div><div class="psl">Jobs</div></div>
        </div>
        <div class="skl">${(profile.sk || []).slice(0, 5).map((s) => `<span class="sk">${escapeHtml(s)}</span>`).join('')}</div>
        <div class="pcft">
          <div>
            <div class="pcr">${profile.role === 'client' ? '<span class="pcard-foot-muted">Buyer</span>' : `<span>$${profile.rate || 0}</span><span class="pcard-foot-muted">/hr</span>`}</div>
            <div class="pcard-foot-muted" style="margin-top:2px">${profile.role === 'client' ? 'Posts briefs & reviews bids' : 'Available for scoped work'}</div>
          </div>
          <button class="msgbtn" onclick="event.stopPropagation();openChat('${escapeHtml(profile.n)}','human')">Contact</button>
        </div>
      </div>`;
      }).join('')
      : renderEmpty('No people matched this filter', 'Try a broader search or another business track.');
  }

  function normalizeServiceCategory(category) {
    const value = String(category || '').toLowerCase();
    if (value.includes('design')) return 'design';
    if (value.includes('dev') || value.includes('engineer') || value.includes('code') || value.includes('software')) return 'development';
    if (value.includes('content') || value.includes('copy') || value.includes('write')) return 'content';
    if (value.includes('market') || value.includes('seo') || value.includes('growth') || value.includes('ads')) return 'marketing';
    if (value.includes('ai') || value.includes('llm') || value.includes('model') || value.includes('automation')) return 'ai-powered';
    if (value.includes('video') || value.includes('reel') || value.includes('motion')) return 'video';
    if (value.includes('audio') || value.includes('voice') || value.includes('music') || value.includes('podcast') || value.includes('sound')) return 'audio';
    return value;
  }

  function formatStatInt(n) {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return Number(n).toLocaleString('en-US');
  }

  function formatStatUsd(n) {
    if (n == null || Number.isNaN(Number(n))) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n));
  }

  function statTile(value, label, hint) {
    const h = hint != null && String(hint).trim() !== '' ? String(hint) : '\u00a0';
    return `<div class="stc"><div class="stv">${escapeHtml(String(value))}</div><div class="stl">${escapeHtml(label)}</div><div class="stch">${escapeHtml(h)}</div></div>`;
  }

  function deriveServicesStatsFromLists(svcs) {
    const list = svcs || [];
    const published = list.length;
    const orders = list.reduce((s, x) => s + (Number(x.sales) || 0), 0);
    const sellers = new Set(
      list.map((x) => String(x.ownerId || x.sel || '').trim()).filter(Boolean),
    ).size;
    const prices = list.map((x) => Number(x.price)).filter((p) => Number.isFinite(p));
    const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    return { published, orders, sellers, avgPrice };
  }

  function deriveRequestsStatsFromLists(reqs) {
    const list = reqs || [];
    const open = list.filter((r) => r.status === 'open').length;
    const review = list.filter((r) => r.status === 'review').length;
    const bids = list.reduce((s, r) => s + (Number(r.bids) || 0), 0);
    const mids = [];
    for (const r of list) {
      const a = r.budgetMin;
      const b = r.budgetMax;
      let mid = null;
      if (Number.isFinite(Number(a)) && Number.isFinite(Number(b))) mid = (Number(a) + Number(b)) / 2;
      else if (Number.isFinite(Number(a))) mid = Number(a);
      else if (Number.isFinite(Number(b))) mid = Number(b);
      if (mid != null) mids.push(mid);
    }
    const avgBudget = mids.length ? mids.reduce((x, y) => x + y, 0) / mids.length : null;
    return { open, review, bids, avgBudget };
  }

  function renderServicesStats() {
    const el = $('services-stats');
    if (!el) return;
    const m = state.marketplaceStats;
    let published;
    let orders;
    let sellers;
    let avgPrice;
    let hint;
    if (m) {
      published = m.servicesPublished;
      orders = m.ordersTracked;
      sellers = m.uniqueSellers;
      avgPrice = m.avgServicePrice;
      hint = 'All published listings';
    } else {
      const d = deriveServicesStatsFromLists(state.services);
      published = d.published;
      orders = d.orders;
      sellers = d.sellers;
      avgPrice = d.avgPrice;
      hint = state.storageMode === 'local'
        ? 'From loaded listings'
        : 'Snapshot from listings loaded this session';
    }
    const listedCount = m ? m.servicesPublished : (state.services || []).length;
    const avgStr = !listedCount
      ? '—'
      : avgPrice != null && Number.isFinite(Number(avgPrice))
        ? formatStatUsd(avgPrice)
        : '—';
    el.innerHTML = [
      statTile(formatStatInt(published), 'Listed services', hint),
      statTile(formatStatInt(orders), 'Orders (in metadata)', hint),
      statTile(formatStatInt(sellers), 'Unique sellers', hint),
      statTile(avgStr, 'Avg list price', hint),
    ].join('');
  }

  function renderRequestsStats() {
    const el = $('requests-stats');
    if (!el) return;
    const m = state.marketplaceStats;
    let open;
    let avgBudget;
    let bids;
    let review;
    let hint;
    if (m) {
      open = m.requestsOpen;
      avgBudget = m.avgRequestBudgetMid;
      bids = m.bidsTotal;
      review = m.requestsReview;
      hint = 'All project requests';
    } else {
      const d = deriveRequestsStatsFromLists(state.requests);
      open = d.open;
      avgBudget = d.avgBudget;
      bids = d.bids;
      review = d.review;
      hint = state.storageMode === 'local'
        ? 'From loaded requests'
        : 'Snapshot from requests loaded this session';
    }
    const reqTotal = m ? m.requestsTotal : (state.requests || []).length;
    const avgVal = reqTotal > 0 && avgBudget != null && Number.isFinite(Number(avgBudget))
      ? formatStatUsd(avgBudget)
      : '—';
    el.innerHTML = [
      statTile(formatStatInt(open), 'Open requests', hint),
      statTile(avgVal, 'Avg budget (mid)', hint),
      statTile(formatStatInt(bids), 'Total bids', hint),
      statTile(formatStatInt(review), 'In review', hint),
    ].join('');
  }

  function isServiceOwner(service) {
    const me = getCurrentUserId();
    return Boolean(me && service && String(service.ownerId || '') === me);
  }

  function isRequestOwner(request) {
    const me = getCurrentUserId();
    if (!me || !request) return false;
    if (request.isUserCreated) return true;
    return String(request.ownerId || '') === me;
  }

  function formatRequestBudgetForInput(request) {
    const a = request.budgetMin;
    const b = request.budgetMax;
    if (a == null && b == null) return '';
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb) && na === nb) return String(na);
    if (Number.isFinite(na) && Number.isFinite(nb)) return `${na} - ${nb}`;
    if (Number.isFinite(na)) return String(na);
    if (Number.isFinite(nb)) return String(nb);
    return '';
  }

  function renderServices() {
    const items = state.services.filter((service) => {
      const tabMatch = state.filters.servicesTab === 'all' || normalizeServiceCategory(service.cat) === state.filters.servicesTab;
      return tabMatch && matchesSearch([service.title, service.cat, service.sel], state.filters.servicesSearch);
    });

    const me = getCurrentUserId();
    $('pg-services').innerHTML = items.length
      ? items.map((service) => {
        const mine = me && String(service.ownerId || '') === me;
        const sellerInitial = typeof service.sel === 'string' && service.sel.length ? service.sel[0] : '?';
        const cover = service.coverUrl
          ? `<img src="${escapeAttr(service.coverUrl)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"/>`
          : service.e;
        return `
      <div class="scard service-card" style="--glow-color:${escapeHtml(service.sc || '#57c4ff')}" data-service-id="${escapeHtml(service.id)}" onclick="viewService('${escapeHtml(service.id)}')">
        <div class="sci" style="background:${service.bg}">${cover}</div>
        <div class="scb">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div class="scc" style="margin-bottom:0">${escapeHtml(service.cat)}</div>
            ${service.isNew !== false ? '<span style="padding:2px 8px;background:linear-gradient(135deg,var(--accent),#a3e635);color:#000;font-size:10px;font-weight:700;border-radius:20px;display:inline-flex;align-items:center;gap:3px">⚡ New</span>' : ''}
            ${mine ? '<span style="padding:2px 8px;background:rgba(87,196,255,.15);color:var(--accent2);font-size:10px;font-weight:700;border-radius:20px;border:1px solid rgba(87,196,255,.25)">Your listing</span>' : ''}
          </div>
          <div class="sct">${escapeHtml(service.title)}</div>
          <div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(service.description || service.title)}</div>
          <div class="scs">
            <div class="sav">${escapeHtml(sellerInitial)}</div>
            <span style="font-size:13px;color:rgba(255,255,255,.6)">${escapeHtml(service.sel)}</span>
            <span style="font-size:12px;color:#facc15">★ ${escapeHtml(service.rating)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px;color:rgba(255,255,255,.4)">
            <span>📦 ${escapeHtml(service.sales)} orders</span>
          </div>
          ${mine ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px" onclick="event.stopPropagation()">
            <button type="button" class="bts" style="padding:7px 14px;font-size:12px" onclick="openEditService('${escapeHtml(service.id)}')">Edit</button>
            <button type="button" class="bts" style="padding:7px 14px;font-size:12px;border-color:rgba(252,165,165,.35);color:#fecaca" onclick="deleteMyService('${escapeHtml(service.id)}')">Delete</button>
          </div>` : ''}
          <div class="scft">
            <div class="scp">$${escapeHtml(service.price)}<span> starting</span></div>
            ${mine
        ? '<span style="font-size:12px;color:var(--muted)">Open card to edit</span>'
        : `<button type="button" class="bidbtn" onclick="event.stopPropagation();placeBidOnService('${escapeHtml(service.id)}','${escapeHtml(service.title)}','${escapeHtml(service.price)}','${escapeHtml(service.sel)}')">Place Bid</button>`}
          </div>
        </div>
      </div>`;
      }).join('')
      : renderEmpty('No services found', 'Adjust your search or create the first service in this category.');
  }

  async function placeBidOnService(serviceId, serviceTitle, servicePrice, sellerName) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Placing a bid on a service')) return;
    try {
      const token = window.mxAuthState?.session?.access_token;
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: 'human',
          title: `Service: ${serviceTitle}`,
          subtitle: `Bid negotiation with ${sellerName}`,
          metadata: { serviceId, serviceTitle, servicePrice, chatType: 'service_bid' },
        }),
      });
      if (!response.ok) throw new Error('Failed to create chat');
      const { chat } = await response.json();
      window.openUnifiedChat(chat.id, `Service: ${serviceTitle}`, {
        type: 'service',
        id: serviceId,
        title: serviceTitle,
        subtitle: `Listed at $${servicePrice} · ${sellerName}`,
        icon: '🧩',
        price: servicePrice,
        seller: sellerName,
        status: 'pending',
      });
      toast('💬 Bid chat opened! Negotiate your price and terms.');
    } catch (err) {
      toast(`Could not open bid chat: ${err.message}`);
    }
  }

  function renderRequests() {
    const items = state.requests.filter((request) => {
      const searchMatch = matchesSearch([request.title, request.desc, ...(request.tags || [])], state.filters.requestsSearch);
      if (!searchMatch) return false;
      if (state.filters.requestsTab === 'my') return Boolean(request.isUserCreated);
      if (state.filters.requestsTab === 'bidding') return request.status !== 'closed' && request.bids > 0;
      if (state.filters.requestsTab === 'review') return request.status === 'review';
      if (state.filters.requestsTab === 'closed') return request.status === 'closed';
      return request.status === 'open';
    });

    $('pg-requests').innerHTML = items.length
      ? items.map((request) => {
        const mine = isRequestOwner(request);
        return `
      <div class="rcard" data-request-id="${escapeHtml(request.id)}" onclick="viewRequest('${escapeHtml(request.id)}')">
        <div class="rch">
          <div class="rct">${escapeHtml(request.title)}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            ${mine ? '<span style="padding:2px 8px;background:rgba(87,196,255,.15);color:var(--accent2);font-size:10px;font-weight:700;border-radius:20px;border:1px solid rgba(87,196,255,.25)">Yours</span>' : ''}
            <div class="rcs ${request.status === 'open' ? 'so' : request.status === 'review' || request.status === 'awarded' ? 'sv' : 'sc'}">${request.status === 'open' ? 'Open' : request.status === 'review' ? 'In Review' : request.status === 'awarded' ? 'Awarded' : 'Closed'}</div>
          </div>
        </div>
        <div class="rcd">${escapeHtml(request.desc)}</div>
        <div class="skl" style="margin-bottom:10px">${(request.tags || []).map((tag) => `<span class="sk">${escapeHtml(tag)}</span>`).join('')}</div>
        ${mine && request.status !== 'closed' ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px" onclick="event.stopPropagation()">
          ${request.status !== 'awarded' ? `<button type="button" class="bts" style="padding:7px 14px;font-size:12px" onclick="openEditRequest('${escapeHtml(request.id)}')">Edit</button>` : ''}
          <button type="button" class="bts" style="padding:7px 14px;font-size:12px;border-color:rgba(252,165,165,.35);color:#fecaca" onclick="deleteMyRequest('${escapeHtml(request.id)}')">Close</button>
        </div>` : ''}
        <div class="rcft">
          <div class="rcb">${escapeHtml(request.budget)}</div>
          <div class="rcm"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>${request.bids} bids</div>
          ${request.days > 0 ? `<div class="rcm"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>${request.days}d left</div>` : ''}
          ${
            mine && request.bids > 0
              ? `<button type="button" class="bidbtn" onclick="event.stopPropagation();openRequestBids('${escapeHtml(request.id)}','${escapeHtml(request.title)}')">Review Bids</button>`
              : !mine && request.canBid
              ? `<button type="button" class="bidbtn" onclick="event.stopPropagation();openBidModal('${escapeHtml(request.id)}','${escapeHtml(request.title)}')">Place Bid</button>`
              : !mine && request.status !== 'closed'
              ? `<button type="button" class="bidbtn" onclick="event.stopPropagation();viewRequest('${escapeHtml(request.id)}')">View</button>`
              : mine
              ? '<span style="font-size:12px;color:var(--muted)">Open card to edit</span>'
              : ''
          }
        </div>
      </div>`;
      }).join('')
      : renderEmpty('No requests matched', 'Try another filter or post a new project request.');
  }

  function renderProjects() {
    $('pg-projects').innerHTML = state.projects.length
      ? state.projects.map((project) => {
        const pid = escapeHtml(project.id);
        return `
      <div class="pcard" onclick="viewProject('${pid}')">
        <div class="pct2">
          <div class="pav" style="background:rgba(184,255,87,.14);color:var(--accent)">P</div>
          <div class="pcm"><div class="pcname">${escapeHtml(project.title)}</div><div class="pcrole">${escapeHtml(project.clientName)} → ${escapeHtml(project.ownerName)}</div></div>
          <div class="pctype ${project.deliveryMode === 'ai_only' ? 'ta' : project.deliveryMode === 'hybrid' ? 'thb' : 'th'}">${escapeHtml(project.deliveryMode.replace(/_/g, ' '))}</div>
        </div>
        <div class="skl">
          <span class="sk">${escapeHtml(project.status)}</span>
          ${project.budget ? `<span class="sk">${escapeHtml(project.budget)}</span>` : ''}
          ${project.deliveryDays ? `<span class="sk">${escapeHtml(`${project.deliveryDays}d delivery`)}</span>` : ''}
        </div>
        <div class="pcft">
          <div class="psl">Updated ${escapeHtml(timeAgo(project.updatedAt).replace('Started ', ''))}</div>
          <button class="msgbtn" onclick="event.stopPropagation();viewProject('${pid}')">Open workspace</button>
        </div>
      </div>`;
      }).join('')
      : renderEmpty('No active projects yet', 'Accept a bid on one of your requests to create the first live project.');
  }

  function renderLeaderboard() {
    const tierIcons = { Challenger: '⚔️', Rival: '🗡️', Duelist: '⚡', Gladiator: '🛡️', Undisputed: '👑' };
    const ranks = ['r1', 'r2', 'r3'];
    const windowLabelMap = { season: 'This season', month: 'This month', week: 'This week', all: 'All time' };
    const windowLabel = windowLabelMap[state.filters.leaderboardWindow] || 'This season';

    // Show all registered users in leaderboard
    let lb = [...state.leaderboard];

    const businessFilter = state.filters.leaderboardBusinessRole;
    if (businessFilter !== 'all') {
      lb = lb.filter((u) => inferBusinessRole(u) === businessFilter);
    }

    // Sort (credits = season standing for the selected window in product copy)
    if (state.filters.leaderboardSort === 'jobs') lb = [...lb].sort((a, b) => (b.j || 0) - (a.j || 0));
    else if (state.filters.leaderboardSort === 'likes') lb = [...lb].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (state.filters.leaderboardSort === 'rating') lb = [...lb].sort((a, b) => (Number(b.rt) || 0) - (Number(a.rt) || 0));
    else lb = [...lb].sort((a, b) => (b.usdt || 0) - (a.usdt || 0));

    const totalCredits = lb.reduce((sum, user) => sum + (Number(user.usdt) || 0), 0);
    const totalJobs = lb.reduce((sum, user) => sum + (Number(user.j) || 0), 0);
    const avgRating = lb.length
      ? (lb.reduce((sum, user) => sum + (Number(user.rt) || 0), 0) / lb.length)
      : 0;
    const topPerformer = lb[0]?.n || '-';
    const tierLadder = 'Challenger → Rival → Duelist → Gladiator → Undisputed';
    $('lb-stats').innerHTML = `
      <div class="stc"><div class="stv g">${escapeHtml(totalCredits.toLocaleString())} Ⓤ</div><div class="stl">Season credits</div><div class="stch">${escapeHtml(windowLabel)} · redeem toward seasonal USDT rewards</div></div>
      <div class="stc"><div class="stv">${escapeHtml(totalJobs.toLocaleString())}</div><div class="stl">Jobs completed</div><div class="stch">${escapeHtml(windowLabel)}</div></div>
      <div class="stc"><div class="stv g">${avgRating.toFixed(2)}</div><div class="stl">Average rating</div><div class="stch">Quality benchmark</div></div>
      <div class="stc"><div class="stv">${escapeHtml(topPerformer)}</div><div class="stl">Current #1</div><div class="stch">Titles: ${escapeHtml(tierLadder)}</div></div>`;

    // Store for viewLeaderboardProfile
    window._lbList = lb;

    if (!lb.length) {
      $('lb-rows').innerHTML = `<div style="padding:26px">${renderEmpty('No leaderboard entries yet', 'Invite members and complete projects to populate rankings.')}</div>`;
      return;
    }

    $('lb-rows').innerHTML = lb.map((user, index) => {
      const tierIcon = tierIcons[user.tier] || '🎯';
      const lbBr = inferBusinessRole(user);
      const roleText = BUSINESS_ROLE_LABELS[lbBr] || 'Member';
      const rankLabel = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
      const sub = [roleText, user.r].filter(Boolean).join(' · ');
      return `
      <div class="lbr" onclick="viewLeaderboardProfile(${index})">
        <div class="lbrank ${ranks[index] || ''}">${rankLabel}</div>
        <div class="lbu">
          <div class="pav" style="width:32px;height:32px;font-size:12px;background:${user.c}22;color:${user.c}">${user.avatarUrl ? avatarImageMarkup(user.avatarUrl, user.n) : 'Mx'}</div>
          <div>
            <div class="lbn">${escapeHtml(user.n)}</div>
            <div class="lbrl">${escapeHtml(sub)}</div>
          </div>
        </div>
        <div class="lbv g">${escapeHtml(user.e)}</div>
        <div class="lbv">${escapeHtml(String(user.j || 0))}</div>
        <div class="lbv">${escapeHtml(String((Number(user.rt) || 0).toFixed(1)))}</div>
        <div style="text-align:center"><span style="font-size:11px;padding:3px 8px;border-radius:16px;background:rgba(255,255,255,.06);color:var(--text)">${tierIcon} ${user.tier || 'Challenger'}</span></div>
        <div style="text-align:center;font-weight:700;color:var(--accent)">${escapeHtml(String(user.usdt || 0))} Ⓤ</div>
      </div>`;
    }).join('');
  }

  function chatContextLabel(title) {
    if (!title) return '';
    if (title.startsWith('Request: ')) return `📋 ${title.slice(9)}`;
    if (title.startsWith('Service: ')) return `🧩 ${title.slice(9)}`;
    return title;
  }

  function renderHistories() {
    const human = state.humanChats.filter((c) => matchesSearch([c.t, c.s], state.filters.hchatSearch));
    const ai = state.aiChats.filter((c) => matchesSearch([c.t, c.s], state.filters.aichatSearch));
    const myName = window.mxAuthState?.profile?.username
      || window.mxAuthState?.user?.email?.split('@')[0]
      || 'you';

    $('hchat-list').innerHTML = human.length
      ? human.map((chat) => {
          const other = chat.otherName
            || chat.t.replace(/^(Service|Request):\s*/i, '').split(' ')[0]
            || 'user';
          const clickHandler = chat.id
            ? `openConversation('${escapeHtml(chat.id)}')`
            : `openChat('${escapeHtml(chat.t)}','human')`;
          const contextLabel = chatContextLabel(chat.t);
          const when = chat.lastMessageAt ? shortClock(chat.lastMessageAt) : chat.d;
          return `
      <div class="chi" style="position:relative" onclick="${clickHandler}">
        <div class="mav hm" style="width:38px;height:38px;font-size:13px;flex-shrink:0;position:relative">${escapeHtml((other||'?')[0].toUpperCase())}${chat.online ? '<span style="position:absolute;right:-2px;bottom:-2px;width:9px;height:9px;border-radius:50%;background:#5DFF8A;border:1px solid #1a122a"></span>' : ''}</div>
        <div class="chp">
          <div class="cht">@${escapeHtml(myName)} × @${escapeHtml(other)}</div>
          <div class="chs" style="color:var(--accent2);font-size:11px">${escapeHtml(contextLabel)}</div>
          <div class="chs">${chat.typing ? 'typing...' : escapeHtml(chat.s||'')}</div>
        </div>
        ${chat.b ? `<span class="chb ${chat.bc}">${escapeHtml(chat.b)}</span>` : ''}
        <div class="chd">${escapeHtml(when)}</div>
        ${chat.id ? `<button onclick="event.stopPropagation();deleteChat('${escapeHtml(chat.id)}','human')" title="Delete chat" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:6px;flex-shrink:0;font-size:16px;line-height:1;opacity:0.6" onmouseenter="this.style.opacity=1;this.style.color='var(--accent3)'" onmouseleave="this.style.opacity=0.6;this.style.color='var(--muted)'">⋯</button>` : ''}
      </div>`;
        }).join('')
      : renderEmpty('No human chats yet', 'Place a bid on a service or request to start a conversation.');

    $('aichat-list').innerHTML = ai.length
      ? ai.map((chat) => {
          const clickHandler = 'toastMxAiLocked()';
          return `
      <div class="chi" style="position:relative;opacity:0.75" onclick="${clickHandler}">
        <div class="mav ai" style="width:38px;height:38px;font-size:11px;flex-shrink:0">AI</div>
        <div class="chp">
          <div class="cht">${escapeHtml(chat.t)}</div>
          <div class="chs">${escapeHtml(chat.s)}</div>
        </div>
        ${chat.b ? `<span class="chb ${chat.bc}">${escapeHtml(chat.b)}</span>` : ''}
        <div class="chd">${escapeHtml(chat.d)}</div>
        ${chat.id ? `<button onclick="event.stopPropagation();deleteChat('${escapeHtml(chat.id)}','ai')" title="Delete chat" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:6px;flex-shrink:0;font-size:16px;line-height:1;opacity:0.6" onmouseenter="this.style.opacity=1;this.style.color='var(--accent3)'" onmouseleave="this.style.opacity=0.6;this.style.color='var(--muted)'">⋯</button>` : ''}
      </div>`;
        }).join('')
      : renderEmpty('No AI chats', 'mxAI threads are disabled until this feature ships.');

    // Update sidebar live chat list
    renderSidebarChats(human.slice(0, 5), ai.slice(0, 3));
  }

  function renderSidebarChats(humanChats, aiChats) {
    const myName = getCurrentUsername();

    const hList = $('hchat-sidebar-list');
    if (hList) {
      if (humanChats.length) {
        hList.innerHTML = humanChats.map((chat) => {
          const other = chat.otherName
            || chat.t.replace(/^(Service|Request):\s*/i, '').split(' ')[0]
            || 'user';
          const clickHandler = chat.id
            ? `openConversation('${escapeHtml(chat.id)}')`
            : `openChat('${escapeHtml(chat.t)}','human')`;
          const when = chat.lastMessageAt ? shortClock(chat.lastMessageAt) : (chat.d || '');
          return `
          <div class="hi" onclick="${clickHandler}">
            <div style="position:relative;width:26px;height:26px;border-radius:50%;background:rgba(255,124,87,.2);color:var(--accent3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${(other||'?')[0].toUpperCase()}${chat.online ? '<span style="position:absolute;right:-1px;bottom:-1px;width:8px;height:8px;border-radius:50%;background:#5DFF8A;border:1px solid #1a122a"></span>' : ''}</div>
            <div style="flex:1;min-width:0;display:grid;gap:1px">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
                <div class="ht s-hide" style="font-size:11px;color:#f2eef8;font-weight:700">@${escapeHtml(other)}</div>
                <div class="ht s-hide" style="font-size:9px;color:var(--muted)">${escapeHtml(when)}</div>
              </div>
              <div class="ht s-hide" style="font-size:10px;color:var(--muted)">${chat.typing ? 'typing...' : escapeHtml(chat.s || chatContextLabel(chat.t) || `@${myName} × @${other}`)}</div>
            </div>
            ${chat.b || chat.unread ? `<div class="ndot"></div>` : ''}
          </div>`;
        }).join('');
      } else {
        hList.innerHTML = '';
      }
    }

    const aList = $('aichat-sidebar-list');
    if (aList) {
      if (aiChats.length) {
        aList.innerHTML = aiChats.map((chat) => {
          const clickHandler = 'toastMxAiLocked()';
          const when = chat.lastMessageAt ? shortClock(chat.lastMessageAt) : (chat.d || '');
          return `
        <div class="hi" onclick="${clickHandler}" style="opacity:0.8" title="mxAI coming later">
          <div style="width:22px;height:22px;border-radius:50%;background:rgba(184,255,87,.15);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">AI</div>
          <div style="flex:1;min-width:0;display:grid;gap:1px">
            <div class="ht s-hide" style="font-size:11px;color:#f2eef8;font-weight:700">${escapeHtml(chat.t)}</div>
            <div class="ht s-hide" style="font-size:10px">${escapeHtml(chat.s || '')}</div>
          </div>
          <div class="ht s-hide" style="font-size:9px;color:var(--muted)">${escapeHtml(when)}</div>
          ${chat.b ? `<div class="ndot"></div>` : ''}
        </div>`;
        }).join('');
      } else {
        aList.innerHTML = '';
      }
    }
  }

  function renderRuns() {
    $('agent-runs').innerHTML = state.agentRuns.map((run) => `
      <div class="alog">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:#fff">${escapeHtml(run.title)}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">${escapeHtml(timeAgo(run.startedAt))} · ${escapeHtml(run.model)}</div>
          </div>
          <span class="nbadge ${run.status === 'Queued' ? 'bn' : 'bb'}">${escapeHtml(run.status)}</span>
        </div>
        ${run.aiAssistantReply ? `
        <div class="note-card" style="margin-bottom:14px;text-align:left">
          <div style="font-size:11px;color:var(--accent);margin-bottom:6px">AI suggestion — milestone draft</div>
          <div style="font-size:13px;color:#ddd;line-height:1.65;white-space:pre-wrap">${escapeHtml(run.aiAssistantReply)}</div>
        </div>` : ''}
        ${run.steps.map((step) => `
          <div class="aStep">
            <div class="sdot ${step.done ? 'ddone' : step.active ? 'dact' : 'dwait'}"></div>
            <div class="stb">
              <div class="stt" style="color:${step.done ? '#ddd' : step.active ? 'var(--accent2)' : 'var(--muted)'}">${escapeHtml(step.t)}</div>
              <div class="std">${escapeHtml(step.d)}</div>
            </div>
            ${step.done ? `<svg style="color:var(--accent);flex-shrink:0;margin-left:auto" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
          </div>`).join('')}
      </div>`).join('');
  }

  function renderResearch() {
    const topic = String(state.research.topic || $('r-ta')?.value || '').trim();
    const results = state.research.results && typeof state.research.results === 'object' ? state.research.results : {};
    const body = results.body ? String(results.body) : '';
    const err = results.error ? String(results.error) : '';
    const status = String(state.research.status || '');
    const showPanel =
      state.research.hasResults || Boolean(body || err || (state.research.id && (status === 'queued' || status === 'completed' || status === 'failed')));

    const rEl = $('r-results');
    if (!rEl) return;
    if (!topic || !showPanel) {
      rEl.style.display = 'none';
      if ($('research-insights')) $('research-insights').innerHTML = '';
      return;
    }

    rEl.style.display = 'block';
    const badge = $('r-results-badge');
    const titleEl = $('r-results-title');
    if (badge) {
      if (body) {
        badge.textContent = 'AI memo';
        badge.className = 'nbadge bg';
      } else if (err || status === 'failed') {
        badge.textContent = 'Needs attention';
        badge.className = 'nbadge bn';
      } else {
        badge.textContent = status === 'queued' ? 'Queued' : '—';
        badge.className = 'nbadge bn';
      }
    }
    if (titleEl) titleEl.textContent = body ? 'Research summary' : 'Research status';

    const src = $('r-src');
    if (src) {
      const hint = body
        ? 'mx Agent synthesis — no live web crawl in this build. Verify facts before sharing with clients.'
        : err
          ? 'Generation failed. Check server logs and API key quota.'
          : 'Add LLM keys to the server .env (see .env.example) to generate a full memo from your topic.';
      src.innerHTML = `<div class="note-card" style="margin-bottom:0"><p style="font-size:12px;color:var(--muted);margin:0;line-height:1.55">${escapeHtml(hint)}</p></div>`;
    }

    const sum = $('r-sum');
    if (sum) {
      if (body) {
        sum.innerHTML = `<div style="white-space:pre-wrap">${escapeHtml(body)}</div>`;
      } else {
        sum.innerHTML = err
          ? `<div style="color:#fecaca;font-size:13px">${escapeHtml(err)}</div>`
          : '<div style="font-size:13px;color:var(--muted)">Run <strong>Start Research</strong> after configuring LLM keys in <code>.env</code>, or retry if the run stayed queued.</div>';
      }
    }

    const ins = $('research-insights');
    if (ins) {
      ins.innerHTML = body
        ? `<div class="note-card">
            <h3 style="margin-top:0">Next steps</h3>
            <p style="font-size:13px;color:var(--muted);margin:0;line-height:1.6">Copy into a <strong>Post Request</strong>, link in project chat, or refine with Home mx Agent. This is a draft until you validate assumptions.</p>
          </div>`
        : '';
    }

    const copyBtn = $('r-copy-summary');
    if (copyBtn) copyBtn.style.display = body ? 'inline-block' : 'none';
  }

  function copyResearchSummary() {
    const body = state.research?.results?.body;
    if (!body) {
      toast('No summary yet — run research with LLM keys configured in .env.');
      return;
    }
    const t = String(body);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(t).then(() => toast('Summary copied.')).catch(() => toast('Copy failed.'));
    } else {
      toast('Clipboard not available.');
    }
  }

  async function submitMxImage() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Generating an image')) {
      return;
    }
    const field = $('agent-image-prompt');
    const prompt = field && field.value ? field.value.trim() : '';
    if (!prompt) {
      toast('Enter an image prompt.');
      return;
    }
    const out = $('agent-image-result');
    if (out) out.innerHTML = '<div style="font-size:12px;color:var(--muted)">Generating…</div>';
    try {
      const payload = await api('/api/ai/image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      if (out && payload.url) {
        const note = payload.revisedPrompt
          ? `<div style="font-size:11px;color:var(--muted);margin-bottom:8px;line-height:1.45">${escapeHtml(String(payload.revisedPrompt).slice(0, 400))}${String(payload.revisedPrompt).length > 400 ? '…' : ''}</div>`
          : '';
        out.innerHTML = `${note}<img src="${escapeAttr(payload.url)}" alt="" style="max-width:100%;border-radius:12px;border:1px solid var(--border)"/>`;
      } else if (out) {
        out.innerHTML = '';
      }
      toast('Image ready.');
    } catch (error) {
      if (out) out.innerHTML = '';
      toast(error.message || 'Image generation failed.');
    }
  }

  function renderAgentInsights() {
    if (!$('agent-insights')) return;
    $('agent-insights').innerHTML = `
      <div class="mini-grid">
        <div class="mini-card"><div class="k">Handoff Logic</div><div class="v">Ambiguity > 0.40</div><div class="d">Trigger a 15-minute human strategy sync before the creative swarm starts.</div></div>
        <div class="mini-card"><div class="k">Quality Gate</div><div class="v">0.95 / 0.70</div><div class="d">Auto-approve only above 0.95 confidence. Below 0.70 goes to a human specialist.</div></div>
        <div class="mini-card"><div class="k">Communication Protocol</div><div class="v">One thread</div><div class="d">AI handles status, scope summaries, and artifact packaging so humans stay out of PM work.</div></div>
      </div>
      <div class="note-card">
        <h3>Maker-Checker Logic for the Branding Wedge</h3>
        <p>The maker swarm generates broad concept territory, but the checker is intentionally harsh. It filters out generic aesthetics, weak category fit, accessibility misses, and low-distinctiveness routes before a human designer spends time refining.</p>
      </div>
      <div class="note-card">
        <h3>Reviewable Artifacts</h3>
        <div class="artifact-list">
          <div class="artifact"><strong>1,042 raw iterations</strong><span>Initial maker swarm outputs across naming, visual systems, and moodboard territory.</span></div>
          <div class="artifact"><strong>187 checker notes</strong><span>Explicit reasons for rejection: generic style drift, low contrast, weak differentiation, poor B2B trust signals.</span></div>
          <div class="artifact"><strong>3 finalist routes</strong><span>The client sees the final polished options plus the artifact trail that explains why these survived.</span></div>
        </div>
      </div>`;
  }

  function renderChat() {
    // Sticky context header
    const header = $('chat-context-header');
    const projectBar = $('chat-start-project-bar');
    const ctx = state.activeChat && state.activeChat.context;
    if (header) {
      if (!ctx) {
        header.style.display = 'none';
        if (projectBar) projectBar.style.display = 'none';
      } else {
        header.style.display = 'flex';
        const safeId = escapeHtml(ctx.id || '');
        const clickAction = ctx.type === 'service'
          ? `window.viewService('${safeId}')`
          : ctx.type === 'request'
          ? `window.viewRequest('${safeId}')`
          : ctx.type === 'project'
          ? `window.viewProject('${safeId}')`
          : '';
        header.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer" onclick="${clickAction}">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${ctx.icon || '💼'}</div>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Syne',sans-serif;font-weight:600;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(ctx.title || '')}</div>
              <div style="font-size:11px;color:var(--muted)">${escapeHtml(ctx.subtitle || '')} · <span style="color:var(--accent)">Click to view →</span></div>
            </div>
          </div>`;
        if (projectBar) {
          projectBar.style.display = 'flex';
          const me = getCurrentUserId();
          const req = ctx.type === 'request' && ctx.id
            ? state.requests.find((r) => String(r.id) === String(ctx.id))
            : null;
          const isClient = req && String(req.ownerId) === String(me);
          const hasBid = Boolean(ctx.bidId);
          let hint = 'Agreed on terms? ';
          let btn = '<button type="button" class="btp" style="font-size:12px;padding:6px 14px" onclick="startProjectFromChat()">Start Project →</button>';
          if (ctx.type === 'service') {
            hint = 'Service listing: negotiate in chat. Formal projects use a request + accepted bid.';
            btn = '<button type="button" class="bts" style="font-size:12px;padding:6px 14px" onclick="toast(\'Post a request or continue negotiating — project records open when a client accepts your bid on a request.\')">How projects start</button>';
          } else if (ctx.type === 'request') {
            if (isClient && hasBid) {
              hint = 'Client: accept this bid to create a live project and workspace.';
              btn = '<button type="button" class="btp" style="font-size:12px;padding:6px 14px" onclick="startProjectFromChat()">Accept bid &amp; start project →</button>';
            } else if (isClient && !hasBid) {
              hint = 'Use Review Bids on your request, or ask the specialist to tap Place Bid so we can link their offer.';
              const rid = escapeHtml(String(ctx.id));
              btn = `<button type="button" class="bts" style="font-size:12px;padding:6px 14px" onclick="viewRequest('${rid}')">Open request →</button>`;
            } else {
              hint = 'Specialist: wait for the client to accept your bid (they use Review Bids or the button above when linked).';
              btn = '';
            }
          }
          projectBar.innerHTML = `<span style="font-size:13px;color:#bbb;line-height:1.45">${hint}</span>${btn ? `<span style="flex-shrink:0;margin-left:12px">${btn}</span>` : ''}`;
        }
      }
    }

    const counterparty = getCounterpartyInfo(state.activeChat);
    const isLockedLegacyAi = state.activeChat.type === 'ai' && !state.activeChat.isUnified;
    const typingRow = !isLockedLegacyAi && counterparty.isTyping
      ? `<div class="msg human"><div class="mav hm">${escapeHtml(counterparty.avatar)}</div><div class="mbbl"><span style="opacity:.85">${escapeHtml(counterparty.name)} is typing...</span></div></div>`
      : '';
    const lockBanner = isLockedLegacyAi
      ? `<div class="msg system" style="justify-content:center;margin-bottom:12px"><div class="mbbl" style="text-align:center;font-size:13px;color:var(--subtle);max-width:440px;margin:0 auto;padding:16px 18px;background:rgba(255,255,255,.05);border-radius:14px;border:1px solid var(--border)"><div style="font-weight:700;color:#fff;margin-bottom:6px">mxAI is locked</div><div>${escapeHtml(MX_AI_LOCKED)}</div></div></div>`
      : '';
    const messagesSource = isLockedLegacyAi ? [] : (state.activeChat.messages || []);
    $('chat-msgs').innerHTML = `
      ${lockBanner}
      ${messagesSource.map((message) => {
        if (message.role === 'system') {
          return `
      <div class="msg system" style="justify-content:center">
        <div class="mbbl" style="text-align:center;font-size:12px;color:var(--muted);max-width:420px;margin:4px auto;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid var(--border)">${escapeHtml(message.text).replace(/\n/g, '<br/>')}</div>
      </div>`;
        }
        const isAi = message.role === 'ai';
        const isMine = message.role === 'user';
        const label = isAi ? 'AI' : isMine ? 'You' : counterparty.name;
        const avatar = isAi ? 'AI' : isMine ? 'M' : counterparty.avatar;
        const stamp = shortClock(message.createdAt);
        const delivery = deliveryStateForMessage(message);
        const attachmentBlock = (() => {
          if (!message.fileUrl) return '';
          const isImg = message.contentType === 'image';
          if (isImg) {
            return `<div style="margin-top:8px;border-radius:12px;overflow:hidden;max-width:min(280px,92vw);border:1px solid var(--border)"><a href="${escapeAttr(message.fileUrl)}" target="_blank" rel="noopener noreferrer"><img src="${escapeAttr(message.fileUrl)}" alt="" loading="lazy" style="width:100%;display:block;max-height:260px;object-fit:cover"/></a></div>`;
          }
          const label = message.fileName || 'Download file';
          const kb = message.fileSize != null && Number.isFinite(Number(message.fileSize))
            ? `<span style="font-size:11px;color:var(--muted);margin-left:8px">${Math.max(1, Math.round(Number(message.fileSize) / 1024))} KB</span>`
            : '';
          return `<div style="margin-top:8px"><a href="${escapeAttr(message.fileUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-size:13px;font-weight:600">${escapeHtml(label)}</a>${kb}</div>`;
        })();
        return `
      <div class="msg ${isAi ? 'ai' : 'human'}">
        <div class="mav ${isAi ? 'ai' : 'hm'}">${escapeHtml(avatar)}</div>
        <div class="mbbl">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px">
            <span style="font-size:11px;color:${isMine ? 'rgba(184,255,87,.95)' : '#d9cfff'};font-weight:600">${escapeHtml(label)}</span>
            <span style="font-size:10px;color:var(--muted)">${escapeHtml(stamp)}${delivery ? ` · ${escapeHtml(delivery)}` : ''}</span>
          </div>
          <div>${escapeHtml(message.text).replace(/\n/g, '<br/>')}</div>
          ${attachmentBlock}
        </div>
      </div>`;
      }).join('')}
      ${typingRow}
    `;
    const ta = $('chat-ta');
    const sendBtn = ta && ta.nextElementSibling;
    if (ta) {
      if (isLockedLegacyAi) {
        ta.disabled = true;
        ta.value = '';
        ta.placeholder = 'mxAI unavailable — coming later';
      } else {
        ta.disabled = false;
        ta.placeholder = 'Message…';
      }
    }
    if (sendBtn && sendBtn.tagName === 'BUTTON') {
      sendBtn.disabled = Boolean(isLockedLegacyAi);
      sendBtn.style.opacity = isLockedLegacyAi ? '0.45' : '';
    }
    const attachWrap = $('chat-attach-wrap');
    if (attachWrap) {
      const allowAttach =
        Boolean(state.activeChat?.id) &&
        !isLockedLegacyAi &&
        (state.activeChat.isUnified || state.activeChat.type === 'human');
      attachWrap.style.display = allowAttach ? 'inline-flex' : 'none';
    }
    $('chat-msgs').scrollTop = $('chat-msgs').scrollHeight;
  }

  function updateProfileCompletionMeter() {
    const el = $('profile-completion-meter');
    if (!el) return;
    const p = state.profile;
    if (!p) {
      el.innerHTML = '';
      return;
    }
    if (p.role !== 'specialist') {
      el.innerHTML = '<p style="font-size:12px;color:var(--muted);margin:0">Marketplace visibility rules apply to specialists. Clients and other roles are always listed.</p>';
      return;
    }
    let score = 0;
    const lines = [];
    if (String(p.bio || '').trim().length >= 100) score++;
    else lines.push('Bio (100+ chars)');
    const sk = Array.isArray(p.skills) ? p.skills : [];
    if (sk.filter(Boolean).length >= 1) score++;
    else lines.push('At least one skill tag');
    if (p.avatar_url || p.avatarUrl) score++;
    else lines.push('Avatar or photo');
    if (String(p.headline || '').trim().length >= 2) score++;
    else lines.push('Short headline');
    const pct = Math.round((score / 4) * 100);
    el.innerHTML = `
      <div style="margin-bottom:8px;font-size:12px;color:var(--muted)">Discovery readiness: <strong style="color:#fff">${pct}%</strong></div>
      <div style="height:8px;background:var(--border);border-radius:6px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),#a3e635);transition:width .3s"></div>
      </div>
      ${lines.length
        ? `<div style="font-size:11px;color:var(--muted);margin-top:8px">Still needed: ${lines.map((x) => escapeHtml(x)).join(' · ')}</div>`
        : '<div style="font-size:11px;color:var(--accent);margin-top:8px">You meet the basics for marketplace listings. Add portfolio pieces in Portfolio Management.</div>'}`;
  }

  function syncControls() {
    [
      ['profiles-search', state.filters.profilesSearch],
      ['services-search', state.filters.servicesSearch],
      ['requests-search', state.filters.requestsSearch],
      ['hchat-search', state.filters.hchatSearch],
      ['aichat-search', state.filters.aichatSearch],
      ['r-ta', state.research.topic],
      ['leaderboard-window', state.filters.leaderboardWindow],
    ].forEach(([id, value]) => {
      const field = $(id);
      if (field && field.value !== value) field.value = value;
    });

    document.querySelectorAll('[data-filter-group]').forEach((tab) => {
      tab.classList.toggle('active', state.filters[tab.dataset.filterGroup] === tab.dataset.filterValue);
    });
    document.querySelectorAll('.do').forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === state.filters.researchMode);
    });
    document.querySelectorAll('.toggle[data-setting]').forEach((toggle) => {
      const key = toggle.dataset.setting;
      const enabled =
        key === 'emailNotifications' ? state.settings.emailNotifications !== false : Boolean(state.settings[key]);
      toggle.classList.toggle('on', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
    });

    if ($('default-model')) $('default-model').value = state.settings.defaultModel || 'mxAI Turbo';
    if ($('home-model-select') && [...$('home-model-select').options].some((option) => option.value === (state.settings.defaultModel || 'mxAI Turbo'))) {
      $('home-model-select').value = state.settings.defaultModel || 'mxAI Turbo';
    }
    if ($('settings-profile-title')) $('settings-profile-title').textContent = state.profile?.full_name || window.mxAuthState?.user?.email || 'Mxstermind User';
    if ($('settings-profile-meta')) $('settings-profile-meta').textContent = state.profile?.headline || 'Marketplace account';
    applyAvatarElement($('settings-profile-avatar'), state.profile?.full_name || state.profile?.username || 'Mx', state.profile?.avatar_url || state.profile?.avatarUrl);
    if ($('settings-full-name')) $('settings-full-name').value = state.profile?.full_name || '';
    if ($('settings-username')) $('settings-username').value = state.profile?.username || '';
    if ($('settings-email')) $('settings-email').value = window.mxAuthState?.user?.email || '';
    if ($('settings-timezone')) $('settings-timezone').value = state.profile?.timezone || '';
    if ($('settings-headline')) $('settings-headline').value = state.profile?.headline || '';
    if ($('settings-company')) $('settings-company').value = state.profile?.company_name || '';
    if ($('settings-bio')) $('settings-bio').value = state.profile?.bio || '';
    if ($('settings-avatar-url')) $('settings-avatar-url').value = state.profile?.avatar_url || state.profile?.avatarUrl || '';
    const skArr = state.profile?.skills;
    if ($('settings-skills')) {
      $('settings-skills').value = Array.isArray(skArr) && skArr.length ? skArr.join(', ') : '';
    }
    if ($('settings-availability')) {
      const sel = $('settings-availability');
      const av = state.profile?.availability || 'available';
      if ([...sel.options].some((o) => o.value === av)) sel.value = av;
    }
    updateProfileCompletionMeter();

    const badge = $('current-role-badge');
    if (badge && state.profile) {
      const brKey = inferBusinessRole(shapeProfileForInference(state.profile));
      badge.className = `br-pill br-${brKey}`;
      badge.textContent = BUSINESS_ROLE_LABELS[brKey] || 'Member';
    }
  }

  function renderAll() {
    renderHomeFocus();
    renderProfiles();
    renderServices();
    renderServicesStats();
    renderRequests();
    renderRequestsStats();
    renderProjects();
    renderLeaderboard();
    renderHistories();
    renderRuns();
    renderResearch();
    renderAgentInsights();
    renderChat();
    syncControls();
    syncSidebar();
    updateTopbarBadges();
  }

  function toast(message) {
    const el = $('toast-el');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__mxToastTimer);
    window.__mxToastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function updateTopbarBadges() {
    const unreadNotifications = (state.notifications || []).filter((n) => !n.is_read).length;
    const notifDot = $('topbar-notif-dot');
    if (notifDot) notifDot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    const notifCount = $('topbar-notif-count');
    if (notifCount) notifCount.textContent = unreadNotifications > 9 ? '9+' : String(unreadNotifications);

    const unreadChats = (state.humanChats || []).filter((c) => Boolean(c.b || c.unread)).length;
    const chatDot = $('topbar-chat-dot');
    if (chatDot) chatDot.style.display = unreadChats > 0 ? 'block' : 'none';
    const agentBtn = $('topbar-agent-btn');
    if (agentBtn) {
      agentBtn.title =
        unreadChats > 0
          ? `mx Agent — ${unreadChats} unread human chat(s) (see Human Chats in the sidebar)`
          : 'mx Agent';
    }
  }

  async function refreshNotifications() {
    if (!window.mxAuthState?.user) {
      state.notifications = [];
      updateTopbarBadges();
      return;
    }
    try {
      const payload = await api('/api/notifications');
      state.notifications = payload.notifications || [];
      updateTopbarBadges();
    } catch (_) {
      // ignore transient notification fetch issues
    }
  }

  async function refreshMarketplaceStatsOnly() {
    if (state.storageMode === 'local') {
      renderServicesStats();
      renderRequestsStats();
      return;
    }
    try {
      const payload = await api('/api/marketplace-stats');
      if (payload.marketplaceStats != null) {
        state.marketplaceStats = payload.marketplaceStats;
        renderServicesStats();
        renderRequestsStats();
      }
    } catch (_) {}
  }

  let mxNotifRealtimeChannel = null;

  function bindNotificationsRealtime() {
    const sb = window.mxAuthState?.client;
    const uid = window.mxAuthState?.user?.id;
    if (mxNotifRealtimeChannel && sb) {
      try {
        sb.removeChannel(mxNotifRealtimeChannel);
      } catch (_) {}
      mxNotifRealtimeChannel = null;
    }
    if (!sb || !uid) return;
    mxNotifRealtimeChannel = sb
      .channel(`mx-notifications:${uid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${uid}`,
        },
        () => {
          refreshNotifications();
        },
      )
      .subscribe();
  }

  window.mxOnAuthSessionReady = bindNotificationsRealtime;

  async function markNotificationRead(notificationId) {
    try {
      await api(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PUT' });
      const hit = (state.notifications || []).find((n) => n.id === notificationId);
      if (hit) hit.is_read = true;
      updateTopbarBadges();
    } catch (_) {}
  }

  async function markAllNotificationsReadAction() {
    try {
      await api('/api/notifications/read-all', { method: 'PUT' });
      (state.notifications || []).forEach((n) => { n.is_read = true; });
      updateTopbarBadges();
      await openNotifications();
    } catch (_) {}
  }

  async function handleNotificationOpen(id) {
    const item = (state.notifications || []).find((n) => String(n.id) === String(id));
    if (!item) return;
    if (!item.is_read) await markNotificationRead(item.id);
    closeMd('notifications');
    const rt = item.related_type;
    const rid = item.related_id;
    if ((rt === 'project' || rt === 'project_review' || rt === 'bid_outcome') && rid) {
      viewProject(String(rid));
      return;
    }
    if (rt === 'request' && rid) {
      viewRequest(String(rid));
      return;
    }
    if ((rt === 'chat' || rt === 'legacy_chat' || rt === 'message' || rt === 'service_inquiry') && rid) {
      openConversation(String(rid));
      return;
    }
    if (rt === 'bid_submitted' && rid) {
      viewRequest(String(rid));
      return;
    }
    nav('hchat');
  }

  async function openNotifications() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Opening notifications')) return;
    await refreshNotifications();
    const list = $('notifications-list');
    if (!list) return;
    const items = state.notifications || [];
    list.innerHTML = items.length
      ? items.map((item) => `
        <button type="button" style="width:100%;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;display:grid;gap:4px;cursor:pointer" onclick="handleNotificationOpen('${escapeAttr(item.id || '')}')">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
            <div style="font-size:13px;font-weight:600;color:#fff">${escapeHtml(item.title || 'Notification')}</div>
            ${item.is_read ? '' : '<span style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></span>'}
          </div>
          <div style="font-size:12px;color:var(--subtle)">${escapeHtml(item.message || '')}</div>
          <div style="font-size:10px;color:var(--muted)">${shortClock(item.created_at)}</div>
        </button>
      `).join('')
      : `<div style="padding:10px">${renderEmpty('No notifications', 'You are all caught up.')}</div>`;
    openMd('notifications');
  }

  async function refresh() {
    const payload = await api('/api/bootstrap');
    const hidden = getHiddenChatIds();
    state.storageMode = payload.storageMode || 'local';
    state.marketplaceStats = payload.marketplaceStats != null ? payload.marketplaceStats : null;
    state.platform = payload.platform || {};
    state.profile = payload.profile || window.mxAuthState?.profile || null;
    state.profiles = payload.profiles || [];
    state.services = payload.services || [];
    state.requests = payload.requests || [];
    state.projects = payload.projects || [];
    state.leaderboard = payload.leaderboard || [];
    state.humanChats = (payload.humanChats || []).filter((c) => !hidden.has(String(c.id || '')));
    state.aiChats = (payload.aiChats || []).filter((c) => !hidden.has(String(c.id || '')));
    state.agentRuns = payload.agentRuns || [];
    state.settings = payload.settings || {};
    const incomingActive = payload.activeChat || null;
    const currentHasThread = Boolean(state.activeChat?.id);
    const incomingHasThread = Boolean(incomingActive?.id);
    // Keep the currently open thread during auth/data refreshes.
    if (!currentHasThread || incomingHasThread) {
      state.activeChat = incomingActive || state.activeChat;
    }
    state.research = payload.research || state.research;
    renderAll();
    await refreshNotifications();
  }

  window.refreshAppData = async function () {
    await refresh();
    // One-shot cleanup: remove legacy chat participation rows so old mock/history chats disappear.
    const userId = window.mxAuthState?.user?.id;
    const clearKey = userId ? `mx_legacy_chat_cleared_${userId}` : null;
    if (userId && clearKey && !localStorage.getItem(clearKey)) {
      try {
        await api('/api/chat/legacy/clear', { method: 'POST' });
        localStorage.setItem(clearKey, '1');
        await refresh();
      } catch (_) {
        // Ignore cleanup failures; normal chat flow should still work.
      }
    }
    maybeShowTutorial();
    // Update sidebar profile row
    const user = window.mxAuthState?.user;
    const profile = window.mxAuthState?.profile;
    if (user) {
      const name = profile?.full_name || profile?.username || user.email || 'You';
      const brKey = inferBusinessRole(shapeProfileForInference(profile));
      const roleLabel = BUSINESS_ROLE_LABELS[brKey] || 'Member';
      if ($('sidebar-name')) $('sidebar-name').textContent = name;
      if ($('sidebar-role')) $('sidebar-role').textContent = roleLabel;
      applyAvatarElement($('sidebar-avatar'), name, profile?.avatar_url || profile?.avatarUrl);
    }
  };

  function nav(page, options = {}) {
    if (state.page === 'chat' && page !== 'chat') {
      sendTypingSignal(false);
      stopLiveChatPolling();
      stopLegacyChatSync();
    }
    const nextPage = validPages.has(page) ? page : 'home';
    state.page = nextPage;
    document.querySelectorAll('.page').forEach((section) => section.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    const pageEl = $(`page-${nextPage}`);
    if (pageEl) pageEl.classList.add('active');
    const navItem = document.querySelector(`.nav-item[data-p="${nextPage}"]`);
    if (navItem) navItem.classList.add('active');
    if (isMobile()) state.sidebarMobileOpen = false;
    updateTitle(nextPage);
    if (options.updateHash !== false) history.replaceState(null, '', `#${nextPage}`);
    syncSidebar();
    if (nextPage === 'chat') {
      renderChat();
      startLiveChatPolling();
      startLegacyChatSync();
    }
    if (nextPage === 'project-detail' && state.projectDetail) {
      renderProjectDetailIntoDom(state.projectDetail);
    }
    if (nextPage === 'home' || nextPage === 'services' || nextPage === 'requests') {
      refreshMarketplaceStatsOnly();
    }
  }

  async function openChat(title, type) {
    if (type === 'ai') {
      toast(MX_AI_LOCKED);
      return;
    }
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth(`Messaging ${title}`)) {
      return;
    }
    try {
      const payload = await api('/api/chat/start', {
        method: 'POST',
        body: JSON.stringify({ title, type }),
      });
      state.activeChat = payload.activeChat;
      nav('chat');
    } catch (error) {
      toast(error.message);
    }
  }

  async function startNewChat() {
    nav('agent');
  }

  // Opens a chat by ID and optionally attaches a sticky context (service/request card).
  async function openUnifiedChat(conversationId, title, context) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Opening a conversation')) {
      return;
    }
    // Set context immediately so the chat header renders right away
    state.activeChat = {
      id: conversationId,
      title: title || 'Chat',
      type: 'human',
      isUnified: true,
      context: context || null,
      participants: [],
      presence: {},
      messages: [],
    };
    nav('chat');
    // Then try to load existing messages in the background
    try {
      const payload = await api(`/api/chats/${conversationId}`);
      const chatPayload = payload.chat || payload.activeChat || null;
      if (chatPayload) {
        const loadedMessages = (chatPayload.messages || payload.messages || []).map(mapUnifiedMessage);
        const meta = chatPayload.metadata || {};
        const mergedCtx = context && context.type === 'request'
          ? {
            ...context,
            bidId: context.bidId || meta.bidId || undefined,
          }
          : context;
        state.activeChat = {
          ...state.activeChat,
          ...chatPayload,
          title: title || chatPayload.title || state.activeChat.title,
          isUnified: true,
          context: mergedCtx || null,
          participants: chatPayload.participants || [],
          presence: payload.presence || {},
          messages: loadedMessages,
        };
      }
      syncActiveChatMetaToHistory();
      startLiveChatPolling();
      renderChat();
    } catch (_) {
      // New chat with no messages yet — that's fine
    }
  }

  async function openConversation(conversationId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Opening a conversation')) {
      return;
    }

    // Find the chat in humanChats to get metadata (title, context) immediately
    const knownChat = state.humanChats.find((c) => c.id === conversationId)
      || state.aiChats.find((c) => c.id === conversationId);

    if (knownChat?.type === 'ai') {
      toast(MX_AI_LOCKED);
      return;
    }

    // Set active chat immediately so the UI opens without waiting
    state.activeChat = {
      id: conversationId,
      title: knownChat?.t || 'Chat',
      type: knownChat?.type || 'human',
      isUnified: knownChat?.isUnified || false,
      context: null,
      participants: [],
      presence: {},
      messages: [],
    };

    // Restore sticky context from metadata if available
    if (knownChat?.metadata) {
      const m = knownChat.metadata;
      if (m.serviceId || m.chatType === 'service_bid') {
        state.activeChat.context = {
          type: 'service',
          id: m.serviceId,
          title: m.serviceTitle || knownChat.t,
          subtitle: `Listed at $${m.servicePrice || '?'} · ${m.sellerName || ''}`,
          icon: '🧩',
        };
      } else if (m.requestId || m.chatType === 'request') {
        state.activeChat.context = {
          type: 'request',
          id: m.requestId,
          title: m.requestTitle || knownChat.t,
          subtitle: 'Request negotiation',
          icon: '📋',
          bidId: m.bidId || undefined,
        };
      }
    }

    nav('chat');

    // Then load messages in background
    try {
      if (knownChat?.isUnified) {
        const payload = await api(`/api/chats/${conversationId}`);
        const loadedChat = payload.chat || null;
        const loadedMessages = loadedChat?.messages || payload.messages || [];
        if (loadedMessages.length) {
          state.activeChat.messages = loadedMessages.map(mapUnifiedMessage);
        }
        state.activeChat.participants = loadedChat?.participants || [];
        state.activeChat.presence = payload.presence || {};
        syncActiveChatMetaToHistory();
        startLiveChatPolling();
        renderChat();
      } else {
        const payload = await api(`/api/chat/${conversationId}`);
        if (payload.activeChat) {
          state.activeChat = {
            ...state.activeChat,
            ...payload.activeChat,
            context: state.activeChat.context, // keep context
          };
          renderChat();
        }
        stopLiveChatPolling();
      }
    } catch (_) {
      // Messages not loaded — chat still usable for new messages
    }
  }

  function stopLegacyChatSync() {
    if (state.live.legacyPollTimer) {
      clearInterval(state.live.legacyPollTimer);
      state.live.legacyPollTimer = null;
    }
    if (typeof state.live.legacyRealtimeUnsub === 'function') {
      try {
        state.live.legacyRealtimeUnsub();
      } catch (_) {}
      state.live.legacyRealtimeUnsub = null;
    }
  }

  function stopUnifiedChatRealtime() {
    if (state.live.unifiedRealtimeChannel && window.mxAuthState?.client) {
      try {
        window.mxAuthState.client.removeChannel(state.live.unifiedRealtimeChannel);
      } catch (_) {}
    }
    state.live.unifiedRealtimeChannel = null;
    state.live.unifiedRealtimeChatId = null;
  }

  function bindUnifiedChatRealtime(chatId) {
    stopUnifiedChatRealtime();
    const sb = window.mxAuthState?.client;
    if (!sb || !chatId || state.page !== 'chat') return;
    state.live.unifiedRealtimeChatId = chatId;
    state.live.unifiedRealtimeChannel = sb
      .channel(`mx-unified-msg:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unified_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          if (state.activeChat?.id === chatId && state.activeChat?.isUnified) {
            pollActiveChat();
          }
        },
      )
      .subscribe();
  }

  function stopLiveChatPolling() {
    if (state.live.pollTimer) {
      clearInterval(state.live.pollTimer);
      state.live.pollTimer = null;
    }
    stopUnifiedChatRealtime();
  }

  function mapLegacyMessageRow(row) {
    const me = getCurrentUserId();
    let role = 'peer';
    if (row.sender_type === 'user' && String(row.sender_id) === String(me)) role = 'user';
    else if (row.sender_type === 'system') role = 'system';
    else if (row.sender_type === 'ai') role = 'ai';
    return {
      id: row.id,
      role,
      text: row.body,
      createdAt: row.created_at,
    };
  }

  async function pollLegacyChatMessages() {
    const id = state.activeChat?.id;
    if (state.page !== 'chat' || !id || state.activeChat?.isUnified) return;
    try {
      const payload = await api(`/api/chat/${encodeURIComponent(id)}`);
      if (!payload.activeChat || state.activeChat?.id !== id) return;
      const fresh = payload.activeChat.messages || [];
      const oldLen = (state.activeChat.messages || []).length;
      state.activeChat = {
        ...state.activeChat,
        ...payload.activeChat,
        context: state.activeChat.context,
      };
      if (fresh.length !== oldLen) renderChat();
    } catch (_) {
      // keep UI usable
    }
  }

  function startLegacyChatSync() {
    stopLegacyChatSync();
    const id = state.activeChat?.id;
    if (!id || state.activeChat?.isUnified) return;

    state.live.legacyPollTimer = setInterval(pollLegacyChatMessages, 4000);
    pollLegacyChatMessages();

    const client = window.mxAuthState?.client;
    if (!client || typeof client.channel !== 'function') return;
    try {
      const channel = client
        .channel(`legacy-messages:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${id}`,
          },
          () => {
            pollLegacyChatMessages();
          },
        )
        .subscribe();
      state.live.legacyRealtimeUnsub = () => {
        client.removeChannel(channel);
      };
    } catch (_) {
      // Realtime may be disabled or RLS may block; polling still runs.
    }
  }

  function syncActiveChatMetaToHistory() {
    if (!state.activeChat?.id || !state.activeChat?.isUnified) return;
    const me = getCurrentUserId();
    const other = (state.activeChat.participants || []).find((p) => String(p.userId || '') !== me);
    const otherName = other?.profile?.username || other?.profile?.full_name || '';
    const otherPresence = state.activeChat.presence?.[String(other?.userId || '')] || {};
    const latest = [...(state.activeChat.messages || [])].pop();
    const idx = state.humanChats.findIndex((chat) => chat.id === state.activeChat.id);
    if (idx >= 0) {
      state.humanChats[idx] = {
        ...state.humanChats[idx],
        otherName: otherName || state.humanChats[idx].otherName,
        online: Boolean(otherPresence.online),
        typing: Boolean(otherPresence.isTyping),
        s: latest?.text || state.humanChats[idx].s,
        lastMessageAt: latest?.createdAt || state.humanChats[idx].lastMessageAt,
        d: latest?.createdAt ? shortClock(latest.createdAt) : state.humanChats[idx].d,
      };
      renderHistories();
    }
  }

  async function pollActiveChat() {
    if (state.page !== 'chat' || !state.activeChat?.id || !state.activeChat?.isUnified) return;
    try {
      const payload = await api(`/api/chats/${state.activeChat.id}`);
      const loadedChat = payload.chat || null;
      if (!loadedChat) return;
      const freshMessages = (loadedChat.messages || []).map(mapUnifiedMessage);
      const oldCount = (state.activeChat.messages || []).length;
      state.activeChat.messages = freshMessages;
      state.activeChat.participants = loadedChat.participants || [];
      state.activeChat.presence = payload.presence || {};
      syncActiveChatMetaToHistory();
      if (freshMessages.length !== oldCount || getCounterpartyInfo(state.activeChat).isTyping) {
        renderChat();
      }
    } catch (_) {
      // keep UI usable on transient polling errors
    }
  }

  function startLiveChatPolling() {
    if (!state.activeChat?.isUnified || !state.activeChat?.id) return;
    stopLiveChatPolling();
    state.live.pollTimer = setInterval(pollActiveChat, 2500);
    bindUnifiedChatRealtime(state.activeChat.id);
  }

  async function sendTypingSignal(isTyping) {
    if (!state.activeChat?.isUnified || !state.activeChat?.id) return;
    try {
      await api(`/api/chats/${state.activeChat.id}/typing`, {
        method: 'POST',
        body: JSON.stringify({ isTyping }),
      });
    } catch (_) {
      // ignore typing signal failures
    }
  }

  function openChatFilePicker() {
    const el = $('chat-file-input');
    if (el) el.click();
  }

  async function handleChatFileSelected(ev) {
    const input = ev?.target || $('chat-file-input');
    const file = input?.files?.[0];
    if (!file) return;
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Sending a file')) {
      input.value = '';
      return;
    }
    if (!state.activeChat?.id) {
      toast('Open a chat first.');
      input.value = '';
      return;
    }
    if (file.size > 4_500_000) {
      toast('File too large (max ~4.5MB).');
      input.value = '';
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (state.activeChat.isUnified) {
        await api(`/api/chats/${state.activeChat.id}/files`, {
          method: 'POST',
          body: JSON.stringify({
            dataUrl,
            fileName: file.name,
            caption: '',
            chatTitle: state.activeChat.title || 'Chat',
          }),
        });
        input.value = '';
        await pollActiveChat();
      } else {
        const payload = await api('/api/chat/files', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: state.activeChat.id,
            dataUrl,
            fileName: file.name,
            caption: '',
          }),
        });
        input.value = '';
        if (payload.activeChat) {
          state.activeChat = { ...state.activeChat, ...payload.activeChat, context: state.activeChat.context };
        }
        await pollLegacyChatMessages();
      }
      renderHistories();
      renderChat();
      toast('File sent.');
    } catch (err) {
      input.value = '';
      toast(err.message || 'Upload failed');
    }
  }

  function mpick(el, page) {
    document.querySelectorAll('.mp').forEach((pill) => pill.classList.remove('active'));
    el.classList.add('active');
    if (page !== 'home') nav(page);
  }

  function toggleSB() {
    if (isMobile()) state.sidebarMobileOpen = !state.sidebarMobileOpen;
    else state.sidebarCollapsed = !state.sidebarCollapsed;
    syncSidebar();
  }

  function closeMobileSidebar() {
    state.sidebarMobileOpen = false;
    syncSidebar();
  }

  function openMd(id) { $(`md-${id}`).classList.add('open'); }
  function closeMd(id) { $(`md-${id}`).classList.remove('open'); }

  async function homeSubmit() {
    const text = $('hta').value.trim();
    if (!text) {
      toast('Add a short description first.');
      return;
    }
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('mx Agent')) {
      return;
    }
    const modeEl = $('home-ai-mode');
    const mode = modeEl ? modeEl.value : 'general';
    const panel = $('home-ai-panel');
    const bodyEl = $('home-ai-body');
    try {
      const payload = await api('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          mode,
          messages: [{ role: 'user', content: text }],
        }),
      });
      const reply = payload.reply != null ? String(payload.reply) : '';
      state.homeAiSuggestion = reply;
      if (bodyEl) bodyEl.textContent = reply;
      if (panel) panel.style.display = reply ? 'block' : 'none';
      toast(reply ? 'AI suggestion ready — not sent anywhere until you choose.' : 'No reply from model.');
    } catch (error) {
      if (panel) panel.style.display = 'none';
      state.homeAiSuggestion = '';
      toast(error.message || 'mx Agent unavailable — set LLM keys in server .env (see .env.example).');
    }
  }

  function copyHomeAiSuggestion() {
    const t = state.homeAiSuggestion || '';
    if (!t) {
      toast('Nothing to copy yet.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(() => toast('Copied.')).catch(() => toast('Copy failed.'));
      return;
    }
    toast('Clipboard not available in this browser.');
  }

  function useHomeAiAsRequest() {
    const t = state.homeAiSuggestion || '';
    if (!t) {
      toast('Run mx Agent from the home box first.');
      return;
    }
    const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let title = lines[0] || 'Project from AI brief';
    if (title.length > 80) title = `${title.slice(0, 77)}…`;
    const titleEl = $('post-request-title');
    const descEl = $('post-request-description');
    if (titleEl) titleEl.value = title;
    if (descEl) descEl.value = t;
    openMd('post-request');
  }

  function viewMatchProfile(username) {
    const u = String(username || '').trim();
    if (!u) return;
    const p = state.profiles.find((x) => String(x.username || '') === u);
    if (p) {
      viewProfile(p, 'request-detail');
      return;
    }
    viewProfile({ username: u, n: u }, 'request-detail');
  }

  async function hydrateRequestMatches(requestId) {
    const slot = $('request-matches-slot');
    if (!slot) return;
    slot.innerHTML = '<div style="font-size:12px;color:var(--muted)">Loading suggested specialists…</div>';
    try {
      const data = await api(`/api/requests/${encodeURIComponent(requestId)}/matches`);
      const rows = data.matches || [];
      if (!rows.length) {
        slot.innerHTML = '';
        return;
      }
      slot.innerHTML = `
      <div class="detail-section" style="margin-top:4px">
        <h3>Suggested specialists <span style="font-size:11px;color:var(--muted);font-weight:500">(match signals)</span></h3>
        <p style="font-size:13px;color:var(--muted);margin:0 0 12px">From skills, listings, and ratings — you choose who to contact.</p>
        ${rows
          .map((m) => {
            const p = m.profile || {};
            const un = String(p.username || '').trim();
            const reasons = (m.reasons || []).map((r) => `<li>${escapeHtml(r)}</li>`).join('');
            const label = escapeHtml(p.n || un || 'Specialist');
            return `
          <div class="note-card" style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
              <div>
                <div style="font-weight:700">${label}</div>
                <div style="font-size:12px;color:var(--muted)">Score · ${escapeHtml(String(m.score))}</div>
              </div>
              ${un ? `<button type="button" class="btp" onclick="viewMatchProfile('${escapeAttr(un)}')">View profile</button>` : ''}
            </div>
            <ul style="margin:8px 0 0 18px;font-size:12px;color:var(--subtle);line-height:1.5">${reasons}</ul>
          </div>`;
          })
          .join('')}
      </div>`;
    } catch (_) {
      slot.innerHTML = '';
    }
  }

  async function sendMsg() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Sending a message')) {
      return;
    }
    if (state.activeChat.type === 'ai' && !state.activeChat.isUnified) {
      toast(MX_AI_LOCKED);
      return;
    }
    const textarea = $('chat-ta');
    const value = textarea.value.trim();
    if (!value) return;
    try {
      if (!state.activeChat.id) {
        toast('Start a conversation first.');
        return;
      }

      // Optimistically show the message immediately
      const myName = window.mxAuthState?.profile?.username
        || window.mxAuthState?.user?.email?.split('@')[0]
        || 'You';
      const tempId = `tmp-${Date.now()}`;
      state.activeChat.messages = [
        ...(state.activeChat.messages || []),
        { id: tempId, role: 'user', text: value, senderId: getCurrentUserId(), createdAt: new Date().toISOString(), status: 'sending' },
      ];
      textarea.value = '';
      textarea.style.height = 'auto';
      sendTypingSignal(false);
      renderChat();

      // Use unified endpoint for chats that have a UUID id (bid chats)
      // Use legacy endpoint for AI chats (type === 'ai')
      const isUnifiedChat = state.activeChat.isUnified === true;

      if (isUnifiedChat) {
        const payload = await api(`/api/chats/${state.activeChat.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: value }),
        });
        const saved = payload.message ? mapUnifiedMessage(payload.message) : null;
        if (saved) {
          state.activeChat.messages = (state.activeChat.messages || []).map((m) => (m.id === tempId ? saved : m));
        } else {
          state.activeChat.messages = (state.activeChat.messages || []).map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m));
        }
        const idx = state.humanChats.findIndex((chat) => chat.id === state.activeChat.id);
        if (idx >= 0) {
          state.humanChats[idx] = {
            ...state.humanChats[idx],
            s: value,
            d: shortClock(new Date().toISOString()),
            lastMessageAt: new Date().toISOString(),
          };
        }
        pollActiveChat();
        renderHistories();
        renderChat();
      } else {
        const payload = await api('/api/chat/messages', {
          method: 'POST',
          body: JSON.stringify({
            conversationId: state.activeChat.id,
            text: value,
          }),
        });
        state.activeChat = payload.activeChat;
        renderChat();
      }
    } catch (error) {
      if (state.activeChat?.messages?.length) {
        const lastIdx = state.activeChat.messages.length - 1;
        if (state.activeChat.messages[lastIdx]?.status === 'sending') {
          state.activeChat.messages[lastIdx] = { ...state.activeChat.messages[lastIdx], status: 'failed' };
          renderChat();
        }
      }
      toast(error.message);
    }
  }

  function chatKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMsg();
      return;
    }
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  function dopt(el) {
    state.filters.researchMode = el.dataset.mode || 'Quick';
    syncControls();
  }

  async function runResearch() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Running Deep Research')) {
      return;
    }
    const topic = $('r-ta').value.trim();
    if (!topic) {
      toast('Enter a research topic first.');
      return;
    }
    try {
      toast('Running research…');
      const payload = await api('/api/research', {
        method: 'POST',
        body: JSON.stringify({ topic, mode: state.filters.researchMode }),
      });
      const r = payload.research || {};
      state.research = {
        ...state.research,
        ...r,
        topic: r.topic || topic,
        hasResults: Boolean(r.id),
        mode: r.mode || state.filters.researchMode,
      };
      if (!payload.aiEnabled) {
        toast('Run saved. Configure LLM keys on the server for an AI-generated memo.');
      } else if (r.status === 'failed') {
        toast(r.results?.error || 'Research generation failed.');
      } else if (r.results?.body) {
        toast('Research memo ready.');
      } else {
        toast('Research run updated.');
      }
      renderResearch();
      syncControls();
    } catch (error) {
      toast(error.message);
    }
  }

  function ftab(el) {
    if (el.dataset.filterGroup) {
      state.filters[el.dataset.filterGroup] = el.dataset.filterValue;
      renderAll();
      return;
    }
    const parent = el.closest('.ftabs');
    if (parent) {
      parent.querySelectorAll('.ft').forEach((tab) => tab.classList.remove('active'));
      el.classList.add('active');
    }
  }

  function setLeaderboardWindow(value) {
    state.filters.leaderboardWindow = String(value || 'season');
    renderLeaderboard();
  }

  async function toggleSetting(settingName) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Updating profile settings')) {
      return;
    }
    try {
      const current =
        settingName === 'emailNotifications'
          ? state.settings.emailNotifications !== false
          : Boolean(state.settings[settingName]);
      const payload = await api('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ [settingName]: !current }),
      });
      state.settings = payload.settings;
      syncControls();
    } catch (error) {
      toast(error.message);
    }
  }

  async function saveProfileSettings() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Saving profile settings')) {
      return;
    }
    try {
      const [profilePayload, settingsPayload] = await Promise.all([
        api('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({
            full_name: $('settings-full-name').value.trim(),
            username: $('settings-username').value.trim().replace(/^@+/, ''),
            timezone: $('settings-timezone').value.trim(),
            headline: $('settings-headline').value.trim(),
            company_name: $('settings-company').value.trim(),
            bio: $('settings-bio').value.trim(),
            avatar_url: $('settings-avatar-url')?.value.trim() || null,
            skills: String($('settings-skills')?.value || '').trim(),
            availability: $('settings-availability')?.value || 'available',
          }),
        }),
        api('/api/settings', {
          method: 'PUT',
          body: JSON.stringify({
            newBids: Boolean(state.settings.newBids),
            aiUpdates: Boolean(state.settings.aiUpdates),
            weeklyDigest: Boolean(state.settings.weeklyDigest),
            marketingEmails: Boolean(state.settings.marketingEmails),
            emailNotifications: state.settings.emailNotifications !== false,
            defaultModel: $('default-model').value,
            autoRunAgent: Boolean(state.settings.autoRunAgent),
            aiInBids: Boolean(state.settings.aiInBids),
            twoFactor: Boolean(state.settings.twoFactor),
            loginAlerts: Boolean(state.settings.loginAlerts),
          }),
        }),
      ]);
      state.profile = profilePayload.profile || state.profile;
      state.settings = settingsPayload.settings;
      if (window.mxAuthState) {
        window.mxAuthState.profile = state.profile;
        window.mxAuthState.settings = state.settings;
      }
      syncControls();
      if ($('sidebar-name')) $('sidebar-name').textContent = state.profile?.full_name || state.profile?.username || window.mxAuthState?.user?.email || 'You';
      if ($('sidebar-role') && state.profile) {
        const brKey = inferBusinessRole(shapeProfileForInference(state.profile));
        $('sidebar-role').textContent = BUSINESS_ROLE_LABELS[brKey] || 'Member';
      }
      applyAvatarElement($('sidebar-avatar'), state.profile?.full_name || state.profile?.username || 'Mx', state.profile?.avatar_url || state.profile?.avatarUrl);
      await refresh();
      toast('Profile and settings saved.');
    } catch (error) {
      toast(error.message);
    }
  }

  async function uploadSettingsAvatar() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Uploading avatar')) return;
    const inp = $('settings-avatar-file');
    if (!inp?.files?.[0]) {
      toast('Choose an image first.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        const res = await api('/api/profile/avatar', { method: 'POST', body: JSON.stringify({ dataUrl }) });
        if ($('settings-avatar-url')) $('settings-avatar-url').value = res.avatar_url || '';
        await refresh();
        if (window.mxAuthState && state.profile) window.mxAuthState.profile = state.profile;
        syncControls();
        toast('Avatar uploaded to storage.');
        inp.value = '';
      } catch (err) {
        toast(err.message || 'Upload failed');
      }
    };
    reader.readAsDataURL(inp.files[0]);
  }

  function openBidModal(requestId, title) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Placing a bid')) {
      return;
    }
    $('bid-request-id').value = requestId;
    const rawEl = $('bid-request-title-raw');
    if (rawEl) rawEl.value = title || '';
    $('bid-request-title').textContent = `Send a proposal for "${title}".`;
    $('bid-price').value = '';
    $('bid-delivery-days').value = '';
    $('bid-proposal').value = '';
    openMd('bid');
  }

  async function createRequestNegotiationChat(requestId, requestTitle, extraMeta = {}) {
    const banner = $('requests-focus-banner');
    if (banner) {
      banner.innerHTML = `<strong>💬 ${escapeHtml(requestTitle)}</strong><span>Negotiate scope and timeline with the client in this thread.</span>`;
      banner.style.background = 'linear-gradient(135deg,rgba(184,255,87,.12),rgba(87,196,255,.08))';
      banner.style.borderColor = 'rgba(184,255,87,.35)';
    }
    const payload = await api('/api/chats', {
      method: 'POST',
      body: JSON.stringify({
        type: 'human',
        title: `Request: ${requestTitle}`,
        subtitle: 'Bid discussion and project details',
        metadata: {
          requestId,
          requestTitle,
          chatType: 'request',
          ...extraMeta,
        },
      }),
    });
    return payload.chat;
  }

  async function startRequestChat(requestId, requestTitle) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Starting a chat about this request')) {
      return;
    }
    try {
      const chat = await createRequestNegotiationChat(requestId, requestTitle);
      await refresh();
      openUnifiedChat(chat.id, `Request: ${requestTitle}`, {
        type: 'request',
        id: requestId,
        title: requestTitle,
        subtitle: 'Request negotiation',
        icon: '📋',
      });
      toast('Chat opened — you can discuss the project with the client.');
    } catch (error) {
      toast(error.message || 'Could not open chat.');
    }
  }

  async function openRequestBids(requestId, title) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Reviewing bids')) {
      return;
    }
    try {
      const payload = await api(`/api/requests/${requestId}/bids`);
      $('request-bids-title').textContent = `Review bids for "${title}".`;
      $('request-bids-list').innerHTML = payload.bids.length
        ? payload.bids.map((bid) => {
          const canAct = bid.status === 'submitted' || bid.status === 'shortlisted';
          const actions = canAct
            ? `<div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="bts" onclick="rejectBid('${escapeHtml(bid.id)}','${escapeHtml(requestId)}','${escapeHtml(title)}')">Decline</button>
                <button class="btp" onclick="acceptBid('${escapeHtml(bid.id)}')">Accept Bid</button>
              </div>`
            : `<span style="font-size:12px;color:var(--muted)">${escapeHtml(bid.status)}</span>`;
          return `
        <div class="note-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px">
            <div>
              <div style="font-family:'Syne',sans-serif;font-size:15px;color:#fff">${escapeHtml(bid.bidderName)}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:3px">${escapeHtml(bid.price)}${bid.deliveryDays ? ` · ${escapeHtml(`${bid.deliveryDays}d`)}` : ''} · ${escapeHtml(bid.status)}</div>
            </div>
            ${actions}
          </div>
          <div style="font-size:13px;color:#c9c9c9;line-height:1.65">${escapeHtml(bid.proposal)}</div>
        </div>`;
        }).join('')
        : renderEmpty('No bids yet', 'This request has not received any bids yet.');
      openMd('request-bids');
    } catch (error) {
      toast(error.message);
    }
  }

  async function acceptBid(bidId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Accepting a bid')) {
      return;
    }
    try {
      const { project } = await api(`/api/bids/${encodeURIComponent(bidId)}/accept`, { method: 'POST' });
      closeMd('request-bids');
      await refresh();
      toast('Bid accepted — opening project workspace.');
      if (project?.id) viewProject(project.id);
      else nav('projects');
    } catch (error) {
      toast(error.message);
    }
  }

  async function rejectBid(bidId, requestId, title) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Declining a bid')) {
      return;
    }
    if (!window.confirm('Decline this bid? The specialist will be notified.')) return;
    try {
      await api(`/api/bids/${encodeURIComponent(bidId)}/reject`, { method: 'POST' });
      toast('Bid declined.');
      await openRequestBids(requestId, title);
      await refresh();
    } catch (error) {
      toast(error.message);
    }
  }

  async function submitBid() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Submitting a bid')) {
      return;
    }
    const requestId = $('bid-request-id').value;
    const rawEl = $('bid-request-title-raw');
    let requestTitle = (rawEl && rawEl.value.trim()) || '';
    if (!requestTitle) {
      const row = state.requests.find((r) => String(r.id) === String(requestId));
      requestTitle = row?.title || 'Request';
    }
    const price = $('bid-price').value.trim();
    const deliveryDays = $('bid-delivery-days').value.trim();
    const proposal = $('bid-proposal').value.trim();
    if (!requestId || !price || !proposal) {
      toast('Add a price and proposal before submitting.');
      return;
    }
    try {
      const bidPayload = await api('/api/bids', {
        method: 'POST',
        body: JSON.stringify({ requestId, price, deliveryDays, proposal }),
      });
      const bidId = bidPayload.bid?.id || null;
      closeMd('bid');
      const chat = await createRequestNegotiationChat(requestId, requestTitle, bidId ? { bidId } : {});
      const bidNote = [
        '— Bid submitted —',
        `Price: $${price}${deliveryDays ? ` · Delivery: ${deliveryDays} days` : ''}`,
        '',
        proposal,
      ].join('\n');
      try {
        await api(`/api/chats/${chat.id}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text: bidNote }),
        });
      } catch (_) {
        // Chat is still usable if the seed message fails
      }
      await refresh();
      openUnifiedChat(chat.id, `Request: ${requestTitle}`, {
        type: 'request',
        id: requestId,
        title: requestTitle,
        subtitle: 'Request negotiation',
        icon: '📋',
        bidId: bidId || undefined,
      });
      toast('Bid sent — opening chat with the client.');
    } catch (error) {
      toast(error.message);
    }
  }

  function clearFields(ids) {
    ids.forEach((id) => {
      const field = $(id);
      if (!field) return;
      if (field.tagName === 'SELECT') field.selectedIndex = 0;
      else field.value = '';
    });
  }

  async function submitRequest() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Posting a project request')) {
      return;
    }
    const title = $('post-request-title').value.trim();
    const desc = $('post-request-description').value.trim();
    const tags = parseTags($('post-request-tags').value);
    const budget = formatBudget($('post-request-budget').value);
    const deadline = $('post-request-deadline').value;
    if (!title || !desc || !budget) {
      toast('Please add a title, description, and budget.');
      return;
    }
    try {
      const payload = await api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ title, desc, tags, budget, deadline }),
      });
      closeMd('post-request');
      clearFields(['post-request-title', 'post-request-description', 'post-request-tags', 'post-request-budget', 'post-request-deadline']);
      await refresh();
      nav('requests');
      toast('Request posted to the marketplace.');
    } catch (error) {
      toast(error.message);
    }
  }

  function openEditRequest(requestId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Editing your request')) return;
    const r = state.requests.find((x) => String(x.id) === String(requestId));
    if (!r) {
      toast('Request not found.');
      return;
    }
    if (!isRequestOwner(r)) {
      toast('You can only edit requests you posted.');
      return;
    }
    if (r.status === 'closed') {
      toast('This request is closed and cannot be edited.');
      return;
    }
    if (r.status === 'awarded') {
      toast('This request was awarded and cannot be edited.');
      return;
    }
    $('edit-request-id').value = r.id;
    $('edit-request-title').value = r.title || '';
    $('edit-request-description').value = r.desc || '';
    $('edit-request-tags').value = (r.tags || []).join(', ');
    $('edit-request-budget').value = formatRequestBudgetForInput(r);
    $('edit-request-deadline').value = r.dueDate || '';
    openMd('edit-request');
  }

  async function submitEditRequest() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Saving your request')) return;
    const id = $('edit-request-id').value.trim();
    const title = $('edit-request-title').value.trim();
    const desc = $('edit-request-description').value.trim();
    const tags = parseTags($('edit-request-tags').value);
    const budget = formatBudget($('edit-request-budget').value);
    const deadline = $('edit-request-deadline').value;
    if (!id || !title || !desc || !budget) {
      toast('Title, description, and budget are required.');
      return;
    }
    try {
      await api(`/api/requests/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ title, desc, tags, budget, deadline }),
      });
      closeMd('edit-request');
      await refresh();
      renderRequests();
      if (state.page === 'request-detail') viewRequest(id);
      toast('Request updated.');
    } catch (error) {
      toast(error.message);
    }
  }

  async function deleteMyRequest(requestId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Closing your request')) return;
    const r = state.requests.find((x) => String(x.id) === String(requestId));
    if (!r || !isRequestOwner(r)) {
      toast('You can only close your own requests.');
      return;
    }
    if (!window.confirm('Close this request? It will leave the open marketplace and move to Closed.')) return;
    try {
      await api(`/api/requests/${encodeURIComponent(requestId)}`, { method: 'DELETE' });
      closeMd('edit-request');
      await refresh();
      if (state.page === 'request-detail') nav('requests');
      else renderRequests();
      toast('Request closed.');
    } catch (error) {
      toast(error.message);
    }
  }

  async function submitService() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Publishing a service package')) {
      return;
    }
    const title = $('post-service-title').value.trim();
    const category = $('post-service-category').value;
    const price = $('post-service-price').value.trim();
    const delivery = $('post-service-delivery').value.trim();
    if (!title || !price) {
      toast('Please add a service title and starting price.');
      return;
    }
    const description = ($('post-service-desc') && $('post-service-desc').value.trim()) || '';
    try {
      const created = await api('/api/services', {
        method: 'POST',
        body: JSON.stringify({ title, category, price, delivery, description }),
      });
      const sid = created.service?.id;
      const coverInp = $('post-service-cover-file');
      if (sid && coverInp?.files?.[0]) {
        try {
          const dataUrl = await readFileAsDataUrl(coverInp.files[0]);
          await api(`/api/services/${encodeURIComponent(sid)}/cover`, {
            method: 'POST',
            body: JSON.stringify({ dataUrl }),
          });
        } catch (coverErr) {
          toast(coverErr.message || 'Cover upload failed — add one from Edit listing.');
        }
        coverInp.value = '';
      }
      closeMd('post-service');
      clearFields(['post-service-title', 'post-service-category', 'post-service-price', 'post-service-delivery', 'post-service-desc']);
      await refresh();
      nav('services');
      toast('Service listed in the marketplace.');
    } catch (error) {
      toast(error.message);
    }
  }

  function syncServiceCategorySelect(selectId, category) {
    const sel = $(selectId);
    if (!sel) return;
    const cat = String(category || 'Design').trim();
    const match = [...sel.options].some((o) => o.value === cat);
    if (match) {
      sel.value = cat;
      return;
    }
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
    sel.value = cat;
  }

  function openEditService(serviceId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Editing your service')) return;
    const s = state.services.find((x) => String(x.id) === String(serviceId));
    if (!s) {
      toast('Service not found.');
      return;
    }
    if (!isServiceOwner(s)) {
      toast('You can only edit services you created.');
      return;
    }
    $('edit-service-id').value = s.id;
    $('edit-service-title').value = s.title || '';
    syncServiceCategorySelect('edit-service-category', s.cat);
    $('edit-service-price').value = s.price != null ? String(s.price) : '';
    $('edit-service-delivery').value = s.deliveryDays != null ? String(s.deliveryDays) : '3';
    $('edit-service-desc').value = s.description || '';
    const ec = $('edit-service-cover-file');
    if (ec) ec.value = '';
    openMd('edit-service');
  }

  async function submitEditService() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Saving your service')) return;
    const id = $('edit-service-id').value.trim();
    const title = $('edit-service-title').value.trim();
    const category = $('edit-service-category').value;
    const price = $('edit-service-price').value.trim();
    const delivery = $('edit-service-delivery').value.trim();
    const description = $('edit-service-desc').value.trim();
    if (!id || !title || !price) {
      toast('Title and price are required.');
      return;
    }
    try {
      await api(`/api/services/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ title, category, price, delivery, description }),
      });
      const coverInp = $('edit-service-cover-file');
      if (coverInp?.files?.[0]) {
        try {
          const dataUrl = await readFileAsDataUrl(coverInp.files[0]);
          await api(`/api/services/${encodeURIComponent(id)}/cover`, {
            method: 'POST',
            body: JSON.stringify({ dataUrl }),
          });
          coverInp.value = '';
        } catch (coverErr) {
          toast(coverErr.message || 'Cover upload failed; other changes were saved.');
        }
      }
      closeMd('edit-service');
      await refresh();
      renderServices();
      if (state.page === 'service-detail') viewService(id);
      toast('Service updated.');
    } catch (error) {
      toast(error.message);
    }
  }

  async function deleteMyService(serviceId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Removing your service')) return;
    const s = state.services.find((x) => String(x.id) === String(serviceId));
    if (!s || !isServiceOwner(s)) {
      toast('You can only delete your own services.');
      return;
    }
    if (!window.confirm('Remove this service from the marketplace? You can list a new one anytime.')) return;
    try {
      await api(`/api/services/${encodeURIComponent(serviceId)}`, { method: 'DELETE' });
      closeMd('edit-service');
      await refresh();
      if (state.page === 'service-detail') nav('services');
      else renderServices();
      toast('Service removed from the marketplace.');
    } catch (error) {
      toast(error.message);
    }
  }

  async function submitAgentTask() {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Launching an agent task')) {
      return;
    }
    const description = $('new-agent-description').value.trim();
    const model = $('new-agent-model').value;
    if (!description) {
      toast('Describe the task before launching the agent.');
      return;
    }
    try {
      const created = await api('/api/agent-runs', {
        method: 'POST',
        body: JSON.stringify({ description, model }),
      });
      const run = created.run;
      try {
        const ai = await api('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            mode: 'milestones',
            messages: [{ role: 'user', content: description }],
          }),
        });
        if (ai.reply && run?.id) {
          await api(`/api/agent-runs/${encodeURIComponent(run.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ aiAssistantReply: String(ai.reply) }),
          });
        }
      } catch (_) {
        // Optional: server may have no LLM keys
      }
      closeMd('new-agent');
      clearFields(['new-agent-description', 'new-agent-model']);
      await refresh();
      nav('agent');
      toast('Agent task saved — open the card below for the AI milestone draft if configured.');
    } catch (error) {
      toast(error.message);
    }
  }

  function bindSearchInput(id, key) {
    const field = $(id);
    if (!field) return;
    field.addEventListener('input', (event) => {
      state.filters[key] = event.target.value;
      renderAll();
    });
  }

  function setupAccessibility() {
    document.querySelectorAll('[onclick]').forEach((el) => {
      if (['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          el.click();
        }
      });
    });
  }

  async function initialize() {
    bindSearchInput('profiles-search', 'profilesSearch');
    bindSearchInput('services-search', 'servicesSearch');
    bindSearchInput('requests-search', 'requestsSearch');
    bindSearchInput('hchat-search', 'hchatSearch');
    bindSearchInput('aichat-search', 'aichatSearch');

    $('r-ta').addEventListener('input', (event) => {
      state.research.topic = event.target.value;
    });
    $('hta').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = `${Math.min(this.scrollHeight, 180)}px`;
    });
    $('hta').addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        homeSubmit();
      }
    });
    $('chat-ta').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = `${Math.min(this.scrollHeight, 120)}px`;
      const now = Date.now();
      if (now - state.live.lastTypingPingAt > 1500) {
        state.live.lastTypingPingAt = now;
        sendTypingSignal(true);
      }
      if (state.live.typingStoppedTimer) clearTimeout(state.live.typingStoppedTimer);
      state.live.typingStoppedTimer = setTimeout(() => {
        sendTypingSignal(false);
      }, 1700);
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) state.sidebarMobileOpen = false;
      syncSidebar();
    });
    function applyHashRoute() {
      const raw = window.location.hash.replace(/^#/, '');
      const svc = raw.match(/^service=(.+)$/);
      if (svc) {
        viewService(decodeURIComponent(svc[1]));
        return true;
      }
      const req = raw.match(/^request=(.+)$/);
      if (req) {
        viewRequest(decodeURIComponent(req[1]));
        return true;
      }
      const prj = raw.match(/^project=(.+)$/);
      if (prj) {
        viewProject(decodeURIComponent(prj[1]));
        return true;
      }
      return false;
    }

    window.addEventListener('hashchange', () => {
      if (applyHashRoute()) return;
      const requested = window.location.hash.replace('#', '');
      if (validPages.has(requested) && requested !== state.page) nav(requested, { updateHash: false });
    });
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        nav('agent');
      }
      if (event.key === 'Escape') {
        closeMobileSidebar();
        document.querySelectorAll('.mdbg.open').forEach((modal) => modal.classList.remove('open'));
      }
    });

    setupAccessibility();
    await refresh();
    if (!applyHashRoute()) {
      const initialPage = validPages.has(window.location.hash.replace('#', '')) ? window.location.hash.replace('#', '') : state.page;
      nav(initialPage, { updateHash: false });
    }
  }

  // ── Sidebar chat section toggle ───────────────────────────────────────────

  function toggleChatSection(listId) {
    const list = $(listId);
    if (!list) return;
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? '' : 'none';
    const chevronId = listId === 'hchat-sidebar-list' ? 'hchat-chevron' : 'aichat-chevron';
    const chevron = $(chevronId);
    if (chevron) chevron.style.transform = isHidden ? '' : 'rotate(-90deg)';
  }

  // ── Start project from chat ───────────────────────────────────────────────

  async function deleteChat(chatId, type) {
    if (!confirm('Remove this chat from your history?')) return;
    const source = type === 'human' ? state.humanChats : state.aiChats;
    const target = source.find((c) => c.id === chatId);
    const leavePath = target?.isUnified ? `/api/chats/${chatId}/leave` : `/api/chat/${chatId}/leave`;
    const hideLocally = async () => {
      const hidden = getHiddenChatIds();
      hidden.add(String(chatId));
      saveHiddenChatIds(hidden);
      if (type === 'human') {
        state.humanChats = state.humanChats.filter((c) => c.id !== chatId);
      } else {
        state.aiChats = state.aiChats.filter((c) => c.id !== chatId);
      }
      if (state.activeChat?.id === chatId) {
        state.activeChat = { id: '', title: 'Chat', type: 'human', messages: [] };
        nav('hchat');
      }
      renderHistories();
      await refresh();
    };
    try {
      await api(leavePath, { method: 'POST' });
      // Ensure it stays hidden even if stale rows still exist server-side.
      const hidden = getHiddenChatIds();
      hidden.add(String(chatId));
      saveHiddenChatIds(hidden);
      if (type === 'human') {
        state.humanChats = state.humanChats.filter((c) => c.id !== chatId);
      } else {
        state.aiChats = state.aiChats.filter((c) => c.id !== chatId);
      }
      if (state.activeChat?.id === chatId) {
        state.activeChat = { id: '', title: 'Chat', type: 'human', messages: [] };
        nav('hchat');
      }
      await refresh();
      toast('Chat removed from history.');
    } catch (error) {
      if (String(error.message || '').includes('404')) {
        await hideLocally();
        toast('Old chat hidden. Restart backend to delete it permanently.');
        return;
      }
      toast(`Could not remove chat: ${error.message}`);
    }
  }

  async function clearAllOldChats() {
    if (!confirm('Clear all old legacy chats from your history?')) return;
    try {
      const payload = await api('/api/chat/legacy/clear', { method: 'POST' });
      const hidden = getHiddenChatIds();
      state.humanChats.forEach((chat) => {
        if (!chat.isUnified && chat.id) hidden.add(String(chat.id));
      });
      state.aiChats.forEach((chat) => {
        if (!chat.isUnified && chat.id) hidden.add(String(chat.id));
      });
      saveHiddenChatIds(hidden);
      await refresh();
      toast(`Old chats cleared (${payload.cleared || 0}).`);
    } catch (error) {
      toast(`Could not clear old chats: ${error.message}`);
    }
  }

  async function startProjectFromChat() {
    const ctx = state.activeChat?.context;
    if (!ctx) { toast('No listing context in this chat.'); return; }
    if (ctx.type === 'service') {
      toast('Projects open when a client accepts a bid on a request. Continue negotiating or post a request.');
      return;
    }
    if (ctx.type !== 'request') {
      toast('Use the project workspace from the Projects page.');
      return;
    }
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Starting a project')) return;
    const me = getCurrentUserId();
    const req = state.requests.find((r) => String(r.id) === String(ctx.id));
    if (!req) {
      toast('Reloading request list…');
      try {
        await refresh();
      } catch (_) {}
      return;
    }
    if (String(req.ownerId) !== String(me)) {
      toast('Only the client who posted this request can accept a bid and start the project.');
      return;
    }
    if (!ctx.bidId) {
      toast('No bid is linked to this chat yet. Ask the specialist to submit via Place Bid, or accept from Review Bids.');
      return;
    }
    try {
      const { project } = await api(`/api/bids/${encodeURIComponent(ctx.bidId)}/accept`, { method: 'POST' });
      await refresh();
      closeMd('bid');
      toast('Project created.');
      if (project?.id) viewProject(project.id);
      else nav('projects');
    } catch (error) {
      toast(error.message || 'Could not start project.');
    }
  }

  // ── Tutorial ──────────────────────────────────────────────────────────────

  function markTutorialDone() {
    try { localStorage.setItem('mx_tutorial_done', '1'); } catch (_) {}
  }

  async function saveTutorialStep() {
    const username = $('tutorial-username')?.value.trim();
    const role = $('tutorial-role')?.value;
    const headline = $('tutorial-headline')?.value.trim();

    if (!username) { toast('Please enter a username to continue.'); return; }

    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Saving profile')) {
      closeMd('tutorial');
      return;
    }

    try {
      const payload = {};
      if (username) payload.username = username;
      if (headline) payload.headline = headline;
      if (role) payload.role = role;

      await api('/api/profile', { method: 'PUT', body: JSON.stringify(payload) });
      markTutorialDone();
      closeMd('tutorial');
      toast('✅ Profile set up! Welcome to mxstermind.');
      await refresh();
    } catch (err) {
      toast(`Could not save: ${err.message}`);
    }
  }

  function maybeShowTutorial() {
    try {
      if (localStorage.getItem('mx_tutorial_done')) return;
    } catch (_) {}
    const user = window.mxAuthState?.user;
    if (!user) return;
    const profile = window.mxAuthState?.profile;
    // Show tutorial if username is not yet set
    if (!profile?.username) {
      setTimeout(() => openMd('tutorial'), 800);
    }
  }

  // ── Single-item view helpers ──────────────────────────────────────────────

  async function openLegacyChatById(conversationId, title, context) {
    if (!conversationId) {
      toast('No conversation id.');
      return;
    }
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Opening chat')) return;
    state.activeChat = {
      id: conversationId,
      title: title || 'Chat',
      type: 'human',
      isUnified: false,
      context: context || null,
      participants: [],
      presence: {},
      messages: [],
    };
    nav('chat', { updateHash: false });
    history.replaceState(null, '', '#chat');
    try {
      const payload = await api(`/api/chat/${encodeURIComponent(conversationId)}`);
      if (payload.activeChat) {
        state.activeChat = {
          ...state.activeChat,
          ...payload.activeChat,
          context: context || state.activeChat.context,
          isUnified: false,
        };
        renderChat();
      }
    } catch (error) {
      toast(error.message || 'Could not load chat.');
    }
  }

  function openLegacyProjectChat(conversationId) {
    const p = state.projectDetail;
    openLegacyChatById(
      conversationId,
      p?.title || 'Project',
      p
        ? {
          type: 'project',
          id: p.id,
          title: p.title,
          subtitle: `${p.status} · project thread`,
          icon: '📁',
        }
        : null,
    );
  }

  async function updateProjectStatusAction(projectId, nextStatus) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Updating project')) return;
    try {
      await api(`/api/projects/${encodeURIComponent(projectId)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      toast('Project updated.');
      state.projectDetail = await fetchProjectDetail(projectId);
      renderProjectDetailIntoDom(state.projectDetail);
      await refresh();
    } catch (error) {
      toast(error.message || 'Update failed.');
    }
  }

  async function fetchProjectDetail(projectId) {
    const { project } = await api(`/api/projects/${encodeURIComponent(projectId)}`);
    return project;
  }

  async function saveProjectMilestonesList(projectId, list) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Updating milestones')) return;
    try {
      const { project } = await api(`/api/projects/${encodeURIComponent(projectId)}/milestones`, {
        method: 'PUT',
        body: JSON.stringify({ milestones: list }),
      });
      state.projectDetail = project;
      renderProjectDetailIntoDom(project);
    } catch (error) {
      toast(error.message || 'Could not save milestones.');
    }
  }

  async function projectMilestoneMoveColumn(projectId, milestoneId, column) {
    const p = state.projectDetail;
    if (!p || String(p.id) !== String(projectId)) return;
    const list = (p.milestones || []).map((x) => (String(x.id) === String(milestoneId) ? { ...x, column } : x));
    await saveProjectMilestonesList(projectId, list);
  }

  async function projectMilestoneRemove(projectId, milestoneId) {
    const p = state.projectDetail;
    if (!p || String(p.id) !== String(projectId)) return;
    const list = (p.milestones || []).filter((x) => String(x.id) !== String(milestoneId));
    await saveProjectMilestonesList(projectId, list);
  }

  async function projectMilestoneAddFromInput(projectId) {
    const input = $('project-milestone-input');
    const title = String(input?.value || '').trim();
    if (!title) {
      toast('Enter a milestone title.');
      return;
    }
    const p = state.projectDetail;
    if (!p || String(p.id) !== String(projectId)) return;
    const uid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`;
    const list = [...(p.milestones || []), { id: uid, title, column: 'todo', order: Date.now() }];
    await saveProjectMilestonesList(projectId, list);
    if (input) input.value = '';
  }

  function renderProjectDetailIntoDom(project) {
    const el = $('project-detail-content');
    if (!el || !project) return;
    const me = getCurrentUserId();
    const isClient = String(project.clientId) === String(me);
    const isSpecialist = String(project.ownerId) === String(me);
    const st = project.status;
    const pid = escapeHtml(project.id);

    const actions = [];
    if (st === 'active' && isSpecialist) {
      actions.push(`<button type="button" class="btp" onclick="updateProjectStatusAction('${pid}','review')">Mark delivered · submit for review</button>`);
    }
    if (st === 'review' && isClient) {
      actions.push(`<button type="button" class="btp" onclick="updateProjectStatusAction('${pid}','delivered')">Approve delivery</button>`);
      actions.push(`<button type="button" class="bts" onclick="updateProjectStatusAction('${pid}','active')">Request revision</button>`);
    }
    if (st === 'delivered' && isClient) {
      actions.push(`<button type="button" class="btp" onclick="updateProjectStatusAction('${pid}','completed')">Complete &amp; close project</button>`);
    }
    if (['active', 'review', 'delivered'].includes(st) && (isClient || isSpecialist)) {
      actions.push(`<button type="button" class="bts" style="border-color:rgba(251,191,36,.45);color:#fbbf24" onclick="updateProjectStatusAction('${pid}','disputed')">Open dispute</button>`);
    }
    if (st === 'disputed' && (isClient || isSpecialist)) {
      actions.push(`<button type="button" class="btp" onclick="updateProjectStatusAction('${pid}','active')">Resume project</button>`);
      actions.push(`<button type="button" class="bts" style="border-color:rgba(252,165,165,.35);color:#fecaca" onclick="updateProjectStatusAction('${pid}','cancelled')">Cancel project</button>`);
    }
    if (isClient && !['completed', 'cancelled', 'disputed'].includes(st)) {
      actions.push(`<button type="button" class="bts" style="border-color:rgba(252,165,165,.35);color:#fecaca" onclick="updateProjectStatusAction('${pid}','cancelled')">Cancel (client)</button>`);
    }

    const convId = project.conversation && project.conversation.id;
    const chatBtn = convId
      ? `<button type="button" class="bts" onclick="openLegacyProjectChat('${escapeHtml(convId)}')">Open project chat</button>
         <span style="font-size:12px;color:var(--muted)"> · Messages sync live when Supabase Realtime is enabled (polling every few seconds otherwise).</span>`
      : '<span style="font-size:12px;color:var(--muted)">No project thread linked.</span>';

    const runs = (project.agentRuns || []).slice(0, 5).map((r) => `<li style="margin-bottom:6px"><strong>${escapeHtml(r.title || 'Agent run')}</strong> · ${escapeHtml(r.status)}</li>`).join('');
    const dels = (project.deliverables || []).slice(0, 8).map((d) => `<li style="margin-bottom:6px">${escapeHtml(d.title)} <span style="color:var(--muted)">(${escapeHtml(d.status)})</span></li>`).join('');

    const milestoneReadOnly = ['completed', 'cancelled', 'disputed'].includes(st);
    const cols = ['todo', 'progress', 'review', 'done'];
    const colLabels = { todo: 'To do', progress: 'In progress', review: 'Review', done: 'Done' };
    const sortedM = [...(project.milestones || [])].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const byCol = Object.fromEntries(cols.map((c) => [c, []]));
    sortedM.forEach((m) => {
      const c = cols.includes(m.column) ? m.column : 'todo';
      byCol[c].push(m);
    });
    const milestoneGrid = cols.map((col) => {
      const items = byCol[col].map((m) => {
        const mid = escapeHtml(m.id);
        const sel = milestoneReadOnly
          ? ''
          : `<select class="fi" style="padding:6px 8px;font-size:12px;max-width:124px;background:var(--input);border:1px solid var(--border);border-radius:8px;color:#fff" aria-label="Move milestone" onchange="projectMilestoneMoveColumn('${pid}','${mid}',this.value)">
              ${cols.map((c) => `<option value="${c}" ${m.column === c ? 'selected' : ''}>${colLabels[c]}</option>`).join('')}
            </select>`;
        const del = milestoneReadOnly
          ? ''
          : `<button type="button" class="auth-link" style="margin-left:6px" onclick="projectMilestoneRemove('${pid}','${mid}')">Remove</button>`;
        return `<li style="margin-bottom:10px;font-size:13px;color:#ddd;list-style:disc">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
              <span style="flex:1;min-width:140px">${escapeHtml(m.title)}</span>
              ${sel}${del}
            </div>
          </li>`;
      }).join('');
      return `<div class="mini-card" style="min-height:100px">
        <div class="k">${escapeHtml(colLabels[col])}</div>
        <ul style="margin:0;padding-left:18px">${items || '<li style="color:var(--muted);list-style:none;margin-left:-18px;font-size:12px">Empty</li>'}</ul>
      </div>`;
    }).join('');

    const addMilestone = milestoneReadOnly
      ? ''
      : `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center">
        <input class="fi" id="project-milestone-input" placeholder="New milestone title…" style="flex:1;min-width:200px;padding:8px 12px"/>
        <button type="button" class="bts" onclick="projectMilestoneAddFromInput('${pid}')">Add milestone</button>
      </div>`;

    const disputeBanner = st === 'disputed'
      ? `<div class="focus-banner" style="margin-bottom:16px;border-color:rgba(251,191,36,.35)"><strong>Dispute open</strong><span>Work is paused. Use <strong>Resume project</strong> when you are ready to continue, or cancel. Formal admin workflows can be layered on later.</span></div>`
      : '';

    el.innerHTML = `
      <div class="detail-hero">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">
            <div class="detail-title" style="margin-bottom:0">${escapeHtml(project.title)}</div>
            <span class="sk" style="text-transform:capitalize">${escapeHtml(st)}</span>
            <span class="sk">${escapeHtml(project.deliveryMode.replace(/_/g, ' '))}</span>
          </div>
          ${disputeBanner}
          <div class="detail-meta">
            <div class="detail-meta-item">Client: <strong>${escapeHtml(project.clientName)}</strong></div>
            <div class="detail-meta-item">Specialist: <strong>${escapeHtml(project.ownerName)}</strong></div>
            ${project.budget ? `<div class="detail-meta-item">${escapeHtml(project.budget)}</div>` : ''}
            ${project.deliveryDays ? `<div class="detail-meta-item">${escapeHtml(String(project.deliveryDays))}d delivery</div>` : ''}
          </div>
          <div class="detail-section">
            <h3>Actions</h3>
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">${actions.length ? actions.join('') : '<span style="color:var(--muted);font-size:13px">No actions for your role at this stage.</span>'}</div>
          </div>
          <div class="detail-section">
            <h3>Milestone board</h3>
            <p style="font-size:12px;color:var(--muted);margin:0 0 12px">Track work across four columns. Edits are allowed until the project is completed, cancelled, or in dispute.</p>
            <div class="mini-grid">${milestoneGrid}</div>
            ${addMilestone}
          </div>
          <div class="detail-section">
            <h3>Coordination</h3>
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">${chatBtn}</div>
          </div>
          <div class="detail-section">
            <h3>Partner reviews</h3>
            <div id="project-review-cta"></div>
          </div>
          <div class="detail-section">
            <h3>Deliverables</h3>
            ${dels ? `<ul style="margin:0;padding-left:18px;font-size:13px;color:#ccc">${dels}</ul>` : '<p style="color:var(--muted);font-size:13px">None recorded yet.</p>'}
          </div>
          <div class="detail-section">
            <h3>Agent runs</h3>
            ${runs ? `<ul style="margin:0;padding-left:18px;font-size:13px;color:#ccc">${runs}</ul>` : '<p style="color:var(--muted);font-size:13px">None yet.</p>'}
          </div>
        </div>
      </div>`;
    loadProjectReviewCta(project.id);
  }

  async function loadProjectReviewCta(projectId) {
    const box = $('project-review-cta');
    if (!box || !projectId) return;
    box.innerHTML = '<span style="font-size:12px;color:var(--muted)">Checking review eligibility…</span>';
    if (!window.mxAuthState?.user) {
      box.innerHTML = '<span style="font-size:12px;color:var(--muted)">Sign in to leave a review.</span>';
      return;
    }
    try {
      const e = await api(`/api/projects/${encodeURIComponent(projectId)}/review-eligibility`);
      if (e.reason === 'not_completed') {
        box.innerHTML = '<span style="font-size:12px;color:var(--muted)">Reviews open after the project is marked complete.</span>';
        return;
      }
      if (e.reason === 'expired') {
        box.innerHTML = '<span style="font-size:12px;color:var(--muted)">The 7-day review window has ended (no score impact).</span>';
        return;
      }
      if (e.reason === 'already_submitted') {
        box.innerHTML = '<span style="font-size:12px;color:var(--muted)">You already submitted a review for this project. Thank you.</span>';
        return;
      }
      if (!e.canSubmit || !e.revieweeId) {
        box.innerHTML = '';
        return;
      }
      const pide = escapeHtml(projectId);
      const ride = escapeHtml(e.revieweeId);
      box.innerHTML = `
        <p style="font-size:12px;color:var(--muted);margin:0 0 10px">This project is complete. Share structured feedback for your partner (min 20 characters, 7-day window).</p>
        <button type="button" class="btp" onclick="openReviewProjectModal('${pide}','${ride}','${escapeHtml(e.projectTitle || '')}')">Write review</button>`;
    } catch (_) {
      box.innerHTML = '';
    }
  }

  function openReviewProjectModal(projectId, revieweeId, titleText) {
    if ($('review-project-id')) $('review-project-id').value = projectId;
    if ($('review-reviewee-id')) $('review-reviewee-id').value = revieweeId;
    if ($('review-body')) $('review-body').value = '';
    if ($('review-rating')) $('review-rating').value = '5';
    if ($('review-modal-title')) $('review-modal-title').textContent = titleText ? `Rate your experience · ${titleText}` : 'Rate your experience';
    openMd('review');
  }

  async function submitProjectReview() {
    const projectId = $('review-project-id')?.value;
    const revieweeId = $('review-reviewee-id')?.value;
    const rating = Number($('review-rating')?.value || 5);
    const body = String($('review-body')?.value || '').trim();
    if (!projectId || !revieweeId) { toast('Missing project.'); return; }
    if (body.length < 20) { toast('Please write at least 20 characters.'); return; }
    try {
      await api('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ projectId, revieweeId, rating, body }),
      });
      closeMd('review');
      toast('Review published on their profile. Thanks.');
      await refresh();
      const p = state.projectDetail;
      if (p && String(p.id) === String(projectId)) {
        state.projectDetail = await fetchProjectDetail(projectId);
        renderProjectDetailIntoDom(state.projectDetail);
      }
    } catch (err) {
      toast(err.message || 'Could not submit review.');
    }
  }

  async function viewProject(projectId) {
    if (typeof window.requireMxAuth === 'function' && !window.requireMxAuth('Viewing project')) return;
    try {
      const project = await fetchProjectDetail(projectId);
      state.projectDetail = project;
      renderProjectDetailIntoDom(project);
      nav('project-detail', { updateHash: false });
      history.replaceState(null, '', `#project=${encodeURIComponent(projectId)}`);
    } catch (error) {
      toast(error.message || 'Could not load project.');
    }
  }

  function viewService(id) {
    const service = state.services.find((s) => String(s.id) === String(id));
    if (!service) { toast('Service not found.'); return; }

    const el = $('service-detail-content');
    if (!el) return;

    const mine = isServiceOwner(service);
    const sid = escapeHtml(service.id);
    const bannerInner = service.coverUrl
      ? `<img src="${escapeAttr(service.coverUrl)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover"/>`
      : service.e;

    el.innerHTML = `
      <div class="detail-banner" style="background:${service.bg}">${bannerInner}</div>
      <div class="detail-hero">
        <div>
          <div class="detail-title">${escapeHtml(service.title)}</div>
          ${mine ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
            <button type="button" class="bts" onclick="openEditService('${sid}')">Edit listing</button>
            <button type="button" class="bts" style="border-color:rgba(252,165,165,.35);color:#fecaca" onclick="deleteMyService('${sid}')">Remove from marketplace</button>
          </div>` : ''}
          <div class="detail-meta">
            <div class="detail-meta-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <strong>${escapeHtml(String(service.rating))}</strong> rating
            </div>
            <div class="detail-meta-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <strong>${escapeHtml(String(service.sales))}</strong> orders
            </div>
            <div class="detail-meta-item">
              <span class="sk">${escapeHtml(service.cat)}</span>
            </div>
          </div>
          <div class="detail-seller" ${mine ? '' : `onclick="openChat('${escapeHtml(service.sel)}','human')"`} style="${mine ? 'opacity:.85;cursor:default' : ''}">
            <div class="detail-seller-av" style="background:${service.sc}22;color:${service.sc}">${escapeHtml((service.sel||'?')[0])}</div>
            <div>
              <div class="detail-seller-name">${escapeHtml(service.sel)}</div>
              <div class="detail-seller-role">${mine ? 'You · this is your listing' : 'Service provider · Click to start a chat'}</div>
            </div>
            ${mine ? '' : '<svg style="margin-left:auto;color:var(--muted)" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'}
          </div>
          <div class="detail-section">
            <h3>About this service</h3>
            <p>${escapeHtml(service.description || `${service.title} — a professional service delivered by ${service.sel}. Place a bid to start a conversation and negotiate the exact scope, timeline, and price that works for both of you.`)}</p>
          </div>
          <div class="detail-section">
            <h3>What's included</h3>
            <div class="detail-tags">
              ${(service.includes || ['Custom scope', 'Direct chat', 'Revisions included', 'Fast delivery']).map((i) => `<span class="detail-tag">✓ ${escapeHtml(i)}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="detail-cta">
          <div class="detail-price">$${escapeHtml(String(service.price))}<span> starting</span></div>
          <div class="detail-cta-sub">${mine ? 'Buyers place bids from this page' : 'Negotiate the final price in chat'}</div>
          ${mine ? `<button type="button" class="btp" style="width:100%;justify-content:center;margin-bottom:10px" onclick="openEditService('${sid}')">Edit package</button>
          <button type="button" class="bts" style="width:100%;justify-content:center" onclick="deleteMyService('${sid}')">Archive listing</button>` : `<button type="button" class="btp" style="width:100%;justify-content:center;margin-bottom:10px" onclick="placeBidOnService('${escapeHtml(service.id)}','${escapeHtml(service.title)}','${escapeHtml(String(service.price))}','${escapeHtml(service.sel)}')">
            💬 Place Bid
          </button>
          <button type="button" class="bts" style="width:100%;justify-content:center" onclick="openChat('${escapeHtml(service.sel)}','human')">
            Message Seller
          </button>`}
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
            <div style="font-size:11px;color:var(--muted);line-height:1.6">
              ${mine ? '✓ Edits apply immediately<br>✓ Archive hides from marketplace' : '✓ No upfront payment<br>✓ Negotiate scope &amp; price<br>✓ Start only when you agree'}
            </div>
          </div>
        </div>
      </div>
    `;

    nav('service-detail', { updateHash: false });
    history.replaceState(null, '', `#service=${encodeURIComponent(String(id))}`);
  }

  function viewRequest(id) {
    const request = state.requests.find((r) => String(r.id) === String(id));
    if (!request) { toast('Request not found.'); return; }

    const el = $('request-detail-content');
    if (!el) return;

    const statusColor = request.status === 'open'
      ? 'var(--accent)'
      : request.status === 'review'
        ? 'var(--accent2)'
        : request.status === 'awarded'
          ? 'var(--accent2)'
          : 'var(--muted)';
    const statusLabel = request.status === 'open'
      ? 'Open'
      : request.status === 'review'
        ? 'In Review'
        : request.status === 'awarded'
          ? 'Awarded'
          : 'Closed';
    const isOwner = isRequestOwner(request);
    const rid = escapeHtml(request.id);
    const canEditOwner = isOwner && request.status !== 'closed' && request.status !== 'awarded';

    el.innerHTML = `
      <div class="detail-hero">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div class="detail-title" style="margin-bottom:0">${escapeHtml(request.title)}</div>
            <span style="font-size:11px;padding:3px 10px;border-radius:20px;background:${statusColor}18;color:${statusColor};border:1px solid ${statusColor}40;white-space:nowrap;flex-shrink:0">${statusLabel}</span>
          </div>
          ${isOwner && request.status !== 'closed' ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
            ${canEditOwner ? `<button type="button" class="bts" onclick="openEditRequest('${rid}')">Edit request</button>` : ''}
            <button type="button" class="bts" style="border-color:rgba(252,165,165,.35);color:#fecaca" onclick="deleteMyRequest('${rid}')">Close request</button>
          </div>` : ''}
          <div class="detail-meta">
            <div class="detail-meta-item">💰 <strong>${escapeHtml(request.budget)}</strong></div>
            <div class="detail-meta-item">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <strong>${request.bids}</strong> bids so far
            </div>
            ${request.days > 0 ? `<div class="detail-meta-item">⏱ <strong>${request.days}d</strong> left</div>` : ''}
          </div>
          <div class="detail-section">
            <h3>Project description</h3>
            <p>${escapeHtml(request.desc)}</p>
          </div>
          <div class="detail-section">
            <h3>Skills needed</h3>
            <div class="detail-tags">
              ${(request.tags || []).map((t) => `<span class="detail-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
          ${isOwner && request.bids > 0 ? `
          <div class="detail-section">
            <h3>Bids received</h3>
            <button class="btp" onclick="openRequestBids('${escapeHtml(request.id)}','${escapeHtml(request.title)}')">Review ${request.bids} bid${request.bids !== 1 ? 's' : ''}</button>
          </div>` : ''}
          ${isOwner ? '<div id="request-matches-slot"></div>' : ''}
        </div>
        <div class="detail-cta">
          <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:var(--accent);margin-bottom:4px">${escapeHtml(request.budget)}</div>
          <div class="detail-cta-sub">${isOwner ? 'You posted this brief' : 'Budget · Submit a formal bid, then chat'}</div>
          ${canEditOwner ? `<button type="button" class="btp" style="width:100%;justify-content:center;margin-bottom:10px" onclick="openEditRequest('${rid}')">Edit brief</button>` : ''}
          ${isOwner && request.status !== 'closed' ? `<button type="button" class="bts" style="width:100%;justify-content:center;margin-bottom:10px" onclick="deleteMyRequest('${rid}')">Close request</button>` : ''}
          ${request.canBid && !isOwner ? `
          <button type="button" class="btp" style="width:100%;justify-content:center;margin-bottom:10px" onclick="openBidModal('${escapeHtml(request.id)}','${escapeHtml(request.title)}')">
            Place Bid
          </button>` : ''}
          ${isOwner && request.bids > 0 ? `
          <button type="button" class="bts" style="width:100%;justify-content:center" onclick="openRequestBids('${escapeHtml(request.id)}','${escapeHtml(request.title)}')">
            Review Bids
          </button>` : ''}
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
            <div style="font-size:11px;color:var(--muted);line-height:1.6">
              ${isOwner ? '✓ Edit scope or budget anytime while open<br>✓ Close when you are done hiring' : '✓ Submit price, timeline, and proposal<br>✓ Chat opens with the client automatically<br>✓ Refine scope until you both agree'}
            </div>
          </div>
        </div>
      </div>
    `;

    nav('request-detail', { updateHash: false });
    history.replaceState(null, '', `#request=${encodeURIComponent(String(id))}`);
    if (isOwner) hydrateRequestMatches(request.id);
  }

  function viewLeaderboardProfile(index) {
    const lb = window._lbList || state.leaderboard;
    const user = lb[index];
    if (!user) return;
    viewProfile({
      id: user.id,
      n: user.n,
      c: user.c,
      r: user.r,
      username: user.username || null,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || '',
      jobs: user.j,
      rating: user.rt,
      sk: user.sk || [],
      role: user.role || 'specialist',
      usdt: user.usdt,
      tier: user.tier,
      successRate: 99,
    }, 'leaderboard');
  }

  // ─────────────────────────────────────────────────────────────────────────

  window.renderAll = renderAll;
  window.toast = toast;
  window.toastMxAiLocked = function toastMxAiLocked() {
    toast(MX_AI_LOCKED);
  };
  window.nav = nav;
  window.viewProfile = viewProfile;
  window.openChat = openChat;
  window.openConversation = openConversation;
  window.startNewChat = startNewChat;
  window.mpick = mpick;
  window.toggleSB = toggleSB;
  window.closeMobileSidebar = closeMobileSidebar;
  window.openMd = openMd;
  window.closeMd = closeMd;
  window.homeSubmit = homeSubmit;
  window.copyHomeAiSuggestion = copyHomeAiSuggestion;
  window.useHomeAiAsRequest = useHomeAiAsRequest;
  window.viewMatchProfile = viewMatchProfile;
  window.copyResearchSummary = copyResearchSummary;
  window.submitMxImage = submitMxImage;
  window.sendMsg = sendMsg;
  window.chatKey = chatKey;
  window.dopt = dopt;
  window.runResearch = runResearch;
  window.ftab = ftab;
  window.setLeaderboardWindow = setLeaderboardWindow;
  window.toggleSetting = toggleSetting;
  window.saveProfileSettings = saveProfileSettings;
  window.submitRequest = submitRequest;
  window.submitService = submitService;
  window.openEditService = openEditService;
  window.submitEditService = submitEditService;
  window.deleteMyService = deleteMyService;
  window.openEditRequest = openEditRequest;
  window.submitEditRequest = submitEditRequest;
  window.deleteMyRequest = deleteMyRequest;
  window.submitAgentTask = submitAgentTask;
  window.openBidModal = openBidModal;
  window.startRequestChat = startRequestChat;
  window.submitBid = submitBid;
  window.openRequestBids = openRequestBids;
  window.acceptBid = acceptBid;
  window.rejectBid = rejectBid;
  window.viewService = viewService;
  window.viewRequest = viewRequest;
  window.viewLeaderboardProfile = viewLeaderboardProfile;
  window.viewProject = viewProject;
  window.updateProjectStatusAction = updateProjectStatusAction;
  window.projectMilestoneMoveColumn = projectMilestoneMoveColumn;
  window.projectMilestoneRemove = projectMilestoneRemove;
  window.projectMilestoneAddFromInput = projectMilestoneAddFromInput;
  window.openLegacyProjectChat = openLegacyProjectChat;
  window.openUnifiedChat = openUnifiedChat;
  window.openChatFilePicker = openChatFilePicker;
  window.handleChatFileSelected = handleChatFileSelected;
  window.openProfileChat = openProfileChat;
  window.openProfileBid = openProfileBid;
  window.publicProfileHire = publicProfileHire;
  window.openNotifications = openNotifications;
  window.markNotificationRead = markNotificationRead;
  window.handleNotificationOpen = handleNotificationOpen;
  window.markAllNotificationsReadAction = markAllNotificationsReadAction;
  window.submitProjectReview = submitProjectReview;
  window.openReviewProjectModal = openReviewProjectModal;
  window.uploadSettingsAvatar = uploadSettingsAvatar;
  window.placeBidOnService = placeBidOnService;
  window.renderSidebarChats = renderSidebarChats;
  window.toggleChatSection = toggleChatSection;
  window.startProjectFromChat = startProjectFromChat;
  window.deleteChat = deleteChat;
  window.clearAllOldChats = clearAllOldChats;
  window.saveTutorialStep = saveTutorialStep;
  window.markTutorialDone = markTutorialDone;

  // Add event listeners for search inputs
  document.addEventListener('DOMContentLoaded', function() {
    [
      ['profiles-search', 'profilesSearch', renderProfiles],
      ['services-search', 'servicesSearch', renderServices],
      ['requests-search', 'requestsSearch', renderRequests],
      ['hchat-search', 'hchatSearch', renderHistories],
      ['aichat-search', 'aichatSearch', renderHistories],
      ['r-ta', 'topic', renderResearch],
    ].forEach(([inputId, stateKey, renderFn]) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', (e) => {
          if (stateKey === 'topic') {
            state.research.topic = e.target.value;
          } else {
            state.filters[stateKey] = e.target.value;
          }
          renderFn();
        });
      }
    });
    setInterval(() => {
      refreshNotifications();
    }, 45000);
    setInterval(() => {
      refreshMarketplaceStatsOnly();
    }, 90000);
    bindNotificationsRealtime();
  });

  // Start auth init immediately — do NOT wait for data bootstrap to finish first.
  // This ensures state.client is ready before the user can click Sign In.
  if (typeof window.initializeMxAuth === 'function') {
    window.initializeMxAuth().catch((error) => {
      console.error(error);
      toast(`Auth bootstrap failed: ${error.message}`);
    });
  }

  initialize().catch((error) => {
    console.error(error);
    toast(`Bootstrap failed: ${error.message}`);
  });
})();
