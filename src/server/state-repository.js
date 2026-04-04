const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { getEnv } = require('./env');

const localStatePath = path.join(process.cwd(), 'data', 'platform-state.json');

class LocalStateRepository {
  async read() {
    return JSON.parse(fs.readFileSync(localStatePath, 'utf8'));
  }

  async write(state) {
    fs.writeFileSync(localStatePath, JSON.stringify(state, null, 2));
    return state;
  }
}

class SupabaseStateRepository {
  constructor() {
    const env = getEnv();
    this.key = env.supabaseStateKey;
    this.client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async read() {
    const { data, error } = await this.client
      .from('platform_state')
      .select('payload')
      .eq('state_key', this.key)
      .single();

    if (error) throw error;
    return data.payload;
  }

  async write(state) {
    const { error } = await this.client
      .from('platform_state')
      .upsert(
        {
          state_key: this.key,
          payload: state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'state_key' },
      );

    if (error) throw error;
    return state;
  }
}

async function createStateRepository() {
  const env = getEnv();
  const local = new LocalStateRepository();

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return { repository: local, mode: 'local' };
  }

  const remote = new SupabaseStateRepository();

  try {
    const state = await remote.read();
    if (!state) throw new Error('No state found');
    return { repository: remote, mode: 'supabase' };
  } catch (error) {
    try {
      const seed = await local.read();
      await remote.write(seed);
      return { repository: remote, mode: 'supabase' };
    } catch (seedError) {
      console.warn('[state] Falling back to local storage:', seedError.message || error.message);
      return { repository: local, mode: 'local' };
    }
  }
}

module.exports = {
  createStateRepository,
};
