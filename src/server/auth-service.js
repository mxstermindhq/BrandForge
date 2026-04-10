const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');

function getServiceClient() {
  const env = getEnv();
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getUserFromAccessToken(accessToken) {
  const client = getServiceClient();
  if (!client || !accessToken) return null;

  const { data, error } = await client.auth.getUser(accessToken);
  if (error) throw error;
  return data.user || null;
}

/** DB `profiles_role_check` allows only these (see supabase/migrations/profiles_role_member_moderator.sql). */
const ALLOWED_PROFILE_ROLES = new Set(['member', 'affiliate', 'moderator', 'admin', 'enterprise']);
const LEGACY_PROFILE_ROLES = { client: 'member', specialist: 'member' };

function normalizeProfileRoleForInsert(raw) {
  const r = String(raw || 'member').trim().toLowerCase();
  if (LEGACY_PROFILE_ROLES[r]) return LEGACY_PROFILE_ROLES[r];
  if (ALLOWED_PROFILE_ROLES.has(r)) return r;
  return 'member';
}

async function ensureProfileForUser(user) {
  const client = getServiceClient();
  if (!client || !user) return null;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Mxstermind User';

  const userRole = normalizeProfileRoleForInsert(user.user_metadata?.role);

  const baseProfile = {
    id: user.id,
    role: userRole,
    username: user.email ? user.email.split('@')[0].toLowerCase() : null,
    full_name: fullName,
    avatar_url: user.user_metadata?.avatar_url || null,
    headline: user.user_metadata?.headline || null,
    timezone: 'UTC',
    is_public: false,
  };

  const { data: existingProfile, error: existingProfileError } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfileError) {
    console.warn('[auth] Unable to read profile:', existingProfileError.message);
    return { profile: null, settings: null };
  }

  let profile = existingProfile;

  if (!profile) {
    const createdProfile = await client
      .from('profiles')
      .insert(baseProfile)
      .select('*')
      .single();
    if (createdProfile.error) {
      console.warn('[auth] Unable to insert profile:', createdProfile.error.message);
      return { profile: null, settings: null };
    }
    profile = createdProfile.data;
  }

  const defaultSettings = {
    user_id: user.id,
    notification_settings: {
      newBids: true,
      aiUpdates: true,
      weeklyDigest: false,
      marketingEmails: false,
      emailNotifications: true,
    },
    ai_settings: {
      defaultModel: 'mxAI Turbo',
      autoRunAgent: false,
      aiInBids: true,
    },
    privacy_settings: {
      isPublic: false,
      discoverable: true,
    },
    billing_settings: {},
    security_settings: {
      twoFactor: false,
      loginAlerts: true,
    },
  };

  const { data: existingSettings, error: existingSettingsError } = await client
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingSettingsError) {
    console.warn('[auth] Unable to read user settings:', existingSettingsError.message);
    return { profile, settings: null };
  }

  let settings = existingSettings;

  if (!settings) {
    const createdSettings = await client
      .from('user_settings')
      .insert(defaultSettings)
      .select('*')
      .single();
    if (createdSettings.error) {
      console.warn('[auth] Unable to insert user settings:', createdSettings.error.message);
      return { profile, settings: null };
    }
    settings = createdSettings.data;
  }

  return { profile, settings };
}

module.exports = {
  getUserFromAccessToken,
  ensureProfileForUser,
};
