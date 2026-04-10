const crypto = require('crypto');
const { getEnv } = require('./env');

const LINKEDIN_AUTH = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO = 'https://api.linkedin.com/v2/userinfo';

const X_AUTH = 'https://twitter.com/i/oauth2/authorize';
const X_TOKEN = 'https://api.twitter.com/2/oauth2/token';

function base64urlFromBuffer(buf) {
  return Buffer.from(buf).toString('base64url');
}

function socialOAuthConfig() {
  const env = getEnv();
  const apiPublicBase = String(env.publicAppUrl || `http://127.0.0.1:${env.port || 3000}`).replace(/\/$/, '');
  const webAppOrigin = String(process.env.WEB_APP_ORIGIN || env.publicAppUrl || 'http://127.0.0.1:3001').replace(
    /\/$/,
    '',
  );
  return {
    stateSecret: String(process.env.SOCIAL_OAUTH_STATE_SECRET || env.supabaseServiceRoleKey || 'mx-social-oauth-dev')
      .slice(0, 64),
    apiPublicBase,
    webAppOrigin,
    linkedinClientId: String(process.env.SOCIAL_LINKEDIN_CLIENT_ID || '').trim(),
    linkedinClientSecret: String(process.env.SOCIAL_LINKEDIN_CLIENT_SECRET || '').trim(),
    xClientId: String(process.env.SOCIAL_X_CLIENT_ID || '').trim(),
    xClientSecret: String(process.env.SOCIAL_X_CLIENT_SECRET || '').trim(),
  };
}

function redirectUri() {
  const { apiPublicBase } = socialOAuthConfig();
  return `${apiPublicBase}/api/social/oauth/callback`;
}

function encodeOAuthState(payload) {
  const { stateSecret } = socialOAuthConfig();
  const body = JSON.stringify({ ...payload, exp: Date.now() + 15 * 60_000 });
  const b64 = Buffer.from(body, 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', stateSecret).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function decodeOAuthState(state) {
  const { stateSecret } = socialOAuthConfig();
  const raw = String(state || '').trim();
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) throw new Error('Invalid state');
  const b64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = crypto.createHmac('sha256', stateSecret).update(b64).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('Invalid state signature');
  }
  const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
  if (payload.exp && Date.now() > payload.exp) throw new Error('State expired');
  return payload;
}

function buildLinkedInStartUrl(userId) {
  const cfg = socialOAuthConfig();
  if (!cfg.linkedinClientId) {
    throw new Error('LinkedIn is not configured. Set SOCIAL_LINKEDIN_CLIENT_ID (and SECRET for the callback).');
  }
  const state = encodeOAuthState({ uid: userId, p: 'linkedin' });
  const scope = 'openid profile email w_member_social';
  const u = new URL(LINKEDIN_AUTH);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', cfg.linkedinClientId);
  u.searchParams.set('redirect_uri', redirectUri());
  u.searchParams.set('state', state);
  u.searchParams.set('scope', scope);
  return u.toString();
}

function buildXStartUrl(userId) {
  const cfg = socialOAuthConfig();
  if (!cfg.xClientId) {
    throw new Error('X (Twitter) is not configured. Set SOCIAL_X_CLIENT_ID (and SECRET for token exchange).');
  }
  const codeVerifier = base64urlFromBuffer(crypto.randomBytes(32));
  const codeChallenge = base64urlFromBuffer(crypto.createHash('sha256').update(codeVerifier).digest());
  const state = encodeOAuthState({ uid: userId, p: 'x', cv: codeVerifier });
  const scope = 'tweet.read tweet.write users.read offline.access';
  const u = new URL(X_AUTH);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', cfg.xClientId);
  u.searchParams.set('redirect_uri', redirectUri());
  u.searchParams.set('state', state);
  u.searchParams.set('scope', scope);
  u.searchParams.set('code_challenge', codeChallenge);
  u.searchParams.set('code_challenge_method', 'S256');
  return u.toString();
}

/**
 * @param {string} provider
 * @param {string} userId
 */
function buildProviderAuthorizeUrl(provider, userId) {
  const p = String(provider || '').toLowerCase();
  if (p === 'linkedin') return buildLinkedInStartUrl(userId);
  if (p === 'x') return buildXStartUrl(userId);
  throw new Error(`Unsupported provider: ${provider}`);
}

async function fetchForm(url, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(json.error_description || json.error || json.raw || `Token exchange failed (${res.status})`);
  }
  return json;
}

async function exchangeLinkedInCode(code) {
  const cfg = socialOAuthConfig();
  const json = await fetchForm(LINKEDIN_TOKEN, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    client_id: cfg.linkedinClientId,
    client_secret: cfg.linkedinClientSecret,
  });
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token || null,
    expiresIn: json.expires_in != null ? Number(json.expires_in) : null,
  };
}

async function exchangeXCode(code, codeVerifier) {
  const cfg = socialOAuthConfig();
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    code_verifier: codeVerifier,
    client_id: cfg.xClientId,
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (cfg.xClientSecret) {
    const basic = Buffer.from(`${cfg.xClientId}:${cfg.xClientSecret}`).toString('base64');
    headers.Authorization = `Basic ${basic}`;
  }
  const res = await fetch(X_TOKEN, { method: 'POST', headers, body: params.toString() });
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch {
    j = {};
  }
  if (!res.ok) {
    throw new Error(j.error_description || j.error || `X token failed (${res.status})`);
  }
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token || null,
    expiresIn: j.expires_in != null ? Number(j.expires_in) : null,
  };
}

async function fetchLinkedInUserInfo(accessToken) {
  const res = await fetch(LINKEDIN_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { id: null, name: null };
  const j = await res.json();
  return {
    id: j.sub != null ? String(j.sub) : null,
    name: j.name != null ? String(j.name) : null,
  };
}

async function fetchXUserMe(accessToken) {
  const res = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { id: null, name: null };
  const j = await res.json();
  const u = j.data || {};
  const handle = u.username != null ? String(u.username) : null;
  return {
    id: u.id != null ? String(u.id) : null,
    name: u.name != null ? String(u.name) : handle,
  };
}

/**
 * @param {string} provider
 * @param {string} code
 * @param {{ codeVerifier?: string | null }} opts
 */
async function completeOAuthExchange(provider, code, opts = {}) {
  const p = String(provider || '').toLowerCase();
  if (p === 'linkedin') {
    const tokens = await exchangeLinkedInCode(code);
    const prof = await fetchLinkedInUserInfo(tokens.accessToken);
    return {
      provider: 'linkedin',
      providerAccountId: prof.id,
      displayName: prof.name,
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
      ...tokens,
    };
  }
  if (p === 'x') {
    const cv = opts.codeVerifier || '';
    if (!cv) throw new Error('Missing PKCE verifier for X');
    const tokens = await exchangeXCode(code, cv);
    const prof = await fetchXUserMe(tokens.accessToken);
    return {
      provider: 'x',
      providerAccountId: prof.id,
      displayName: prof.name,
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      ...tokens,
    };
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

module.exports = {
  socialOAuthConfig,
  redirectUri,
  encodeOAuthState,
  decodeOAuthState,
  buildProviderAuthorizeUrl,
  completeOAuthExchange,
};
