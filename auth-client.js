(function () {
  const state = {
    enabled: false,
    client: null,
    session: null,
    user: null,
    profile: null,
    settings: null,
    pendingActionLabel: '',
    mode: 'signin',
  };

  let refreshInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return payload;
  }

  function updateUi() {
    const pill = $('auth-status-pill');
    const copy = $('auth-status-copy');
    const button = $('auth-open-btn');
    const banner = $('auth-banner');

    if (!state.enabled) {
      copy.textContent = 'Auth not configured';
      button.textContent = 'Setup';
      button.onclick = () => {
        banner.style.display = 'block';
        banner.innerHTML = '<strong>Supabase auth is not configured yet.</strong> Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env`, then restart the server.';
      };
      syncModal();
      return;
    }

    if (state.user) {
      const label = state.profile?.full_name || state.user.email || 'Signed in';
      copy.innerHTML = `Signed in as <strong>${label}</strong>`;
      button.textContent = 'Sign Out';
      button.onclick = authSignOut;
      banner.style.display = 'none';
      syncModal();
      return;
    }

    copy.textContent = 'Signed out';
    button.textContent = 'Sign In';
    button.onclick = () => openAuthModal('signin');
    syncModal();
  }

  function syncModal() {
    const context = $('auth-context-copy');
    const primary = $('auth-primary-btn');
    const secondary = $('auth-secondary-btn');
    const title = $('auth-modal-title');
    const kicker = $('auth-modal-kicker');
    const signinTab = $('auth-tab-signin');
    const signupTab = $('auth-tab-signup');

    if (context) {
      context.textContent = state.pendingActionLabel
        ? `${state.pendingActionLabel} needs an account. Use Google, Apple, or an email sign-in link.`
        : 'Google, Apple, or email link — same entry for everyone. Turn on Google / Apple in the Supabase Auth dashboard if a provider button errors.';
    }

    if (title) title.textContent = 'Sign in to mxstermind';
    if (kicker) kicker.textContent = 'Passwordless · Google · Apple';
    if (primary) primary.textContent = 'Sign in';
    if (secondary) secondary.style.display = 'none';
    if (signinTab) signinTab.style.display = 'none';
    if (signupTab) signupTab.style.display = 'none';
  }

  function setMode(mode) {
    state.mode = mode === 'signup' ? 'signup' : 'signin';
    syncModal();
  }

  function openAuthModal(mode = 'signin', reason = '') {
    state.pendingActionLabel = reason || '';
    setMode(mode);
    window.openMd('auth');
  }

  function requireAuth(reason = 'This action') {
    if (!state.enabled) {
      const banner = $('auth-banner');
      banner.style.display = 'block';
      banner.innerHTML = '<strong>Authentication is not ready yet.</strong> Add your Supabase keys to `.env`, apply the schema, and restart the server.';
      return false;
    }

    if (state.user) return true;

    openAuthModal('signin', reason);
    return false;
  }

  async function refreshAuthState() {
    if (refreshInFlight) {
      console.log('⏳ refreshAuthState already in flight, skipping overlap');
      return;
    }
    refreshInFlight = true;
    if (!state.enabled || !state.client) {
      console.log('⏭️ Auth not ready, skipping refresh');
      updateUi();
      refreshInFlight = false;
      return;
    }

    console.log('🔄 Refreshing auth state...');
    console.log('📍 Calling getSession...');
    
    try {
      const { data } = await withTimeout(
        state.client.auth.getSession(),
        30000,
        'getSession'
      );
      console.log('✓ getSession returned:', data?.session ? 'Session exists' : 'No session');
      state.session = data.session || null;

      if (!state.session?.access_token) {
        console.log('❌ No active session');
        state.user = null;
        state.profile = null;
        state.settings = null;
        window.mxAuthState = state;
        updateUi();
        if (typeof window.mxOnAuthSessionReady === 'function') {
          try {
            window.mxOnAuthSessionReady();
          } catch (hookErr) {
            console.warn('[auth] mxOnAuthSessionReady:', hookErr);
          }
        }
        return;
      }

      console.log('✓ Session found, token:', state.session.access_token.substring(0, 20) + '...');
      console.log('📍 Fetching profile from /api/auth/me...');
      const me = await fetchJson('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${state.session.access_token}`,
        },
      });
      console.log('✓ Profile fetched:', me);
      state.user = me.user;
      state.profile = me.profile;
      state.settings = me.settings;
    } catch (err) {
      console.error('❌ Error in refreshAuthState:', err);
      const msg = String(err?.message || '').toLowerCase();
      // A network timeout or lock error is transient — keep the existing session alive.
      // Only wipe state on a real auth failure (invalid token, signed out, etc.).
      const isTransient = msg.includes('timed out') || msg.includes('timeout')
        || msg.includes('lock') || msg.includes('network') || msg.includes('fetch');
      if (!isTransient) {
        state.user = null;
        state.profile = null;
        state.settings = null;
      } else {
        console.warn('⚠️ Transient error — keeping existing auth state');
      }
    } finally {
      refreshInFlight = false;
    }

    console.log('📍 Calling updateUi...');
    updateUi();
    window.mxAuthState = state;
    if (typeof window.mxOnAuthSessionReady === 'function') {
      try {
        window.mxOnAuthSessionReady();
      } catch (hookErr) {
        console.warn('[auth] mxOnAuthSessionReady:', hookErr);
      }
    }
    if (typeof window.refreshAppData === 'function') {
      console.log('📍 Calling refreshAppData...');
      try {
        window.refreshAppData();
        console.log('✓ refreshAppData complete');
      } catch (err) {
        console.error('❌ refreshAppData error:', err);
      }
    }
    console.log('✓ refreshAuthState complete');
  }

  async function initializeAuth() {
    console.log('🔄 Initializing auth...');
    const config = await fetchJson('/api/auth/config');
    state.enabled = Boolean(config.enabled && config.url && config.anonKey);

    if (!state.enabled) {
      console.warn('⚠️ Supabase auth not configured');
      updateUi();
      window.mxAuthState = state;
      return;
    }

    console.log('✓ Supabase configured');

    // Use sessionStorage instead of localStorage to avoid cross-tab locking contention
    // This prevents "Lock was released because another request stole it" errors
    state.client = window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        storage: sessionStorage,
        storageKey: 'sb-auth-token',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    
    console.log('✓ Supabase client created');
    
    state.client.auth.onAuthStateChange(async () => {
      console.log('🔔 Auth state changed');
      await refreshAuthState();
    });

    await refreshAuthState();
    console.log('✓ Auth initialized');
  }

  function redirectOrigin() {
    return `${window.location.origin}${window.location.pathname || '/'}`;
  }

  async function authSendMagicLink() {
    if (!state.client) {
      window.toast('Auth not ready.');
      return;
    }
    const email = $('auth-email').value.trim();
    if (!email) {
      window.toast('Enter your email address.');
      return;
    }
    const btn = $('auth-magic-btn');
    if (btn) {
      btn.classList.add('loading');
      btn.disabled = true;
    }
    try {
      const { error } = await retryWithBackoff(async () =>
        state.client.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: redirectOrigin(),
          },
        })
      );
      if (error) throw error;
      window.toast('Check your email for the sign-in link.');
      window.closeMd('auth');
    } catch (err) {
      window.toast(err.message || 'Could not send email.');
    } finally {
      if (btn) {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }
  }

  async function authGoogle() {
    if (!state.client) return;
    const { error } = await state.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectOrigin() },
    });
    if (error) window.toast(error.message);
  }

  async function authApple() {
    if (!state.client) return;
    const { error } = await state.client.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: redirectOrigin() },
    });
    if (error) window.toast(error.message);
  }

  async function retryWithBackoff(fn, maxAttempts = 3) {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        // Check if it's a lock error
        if (error.message?.includes('Lock') || error.message?.includes('lock')) {
          const waitMs = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw error; // Non-lock errors should fail immediately
      }
    }
    throw lastError;
  }

  async function authSignUp() {
    if (!state.client) {
      window.toast('Auth system not initialized. Please refresh the page.');
      return;
    }
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value;
    if (!email || !password) {
      window.toast('Email and password are required.');
      return;
    }

    const btn = $('auth-primary-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const { data, error } = await retryWithBackoff(async () => {
        return await state.client.auth.signUp({
          email,
          password,
          options: {
            data: {},
          },
        });
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        window.toast(`Sign up failed: ${error.message}`);
        return;
      }

      if (data.user) {
        // Create profile on server
        try {
          console.log('📋 Creating profile...');
          await fetchJson('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${data.session?.access_token || ''}`,
            },
          });
          console.log('✓ Profile created');
        } catch (e) {
          console.warn('⚠️ Profile creation deferred:', e.message);
        }

        window.closeMd('auth');
        $('auth-password').value = '';
        window.toast('✓ Account created! Check your email to confirm, then sign in.');
        // Switch to signin mode for next time
        setMode('signin');
        return;
      }

      window.toast('Account created! Check your email if confirmation is enabled.');
      window.closeMd('auth');
      $('auth-password').value = '';
    } catch (err) {
      console.error('❌ Sign up exception:', err);
      window.toast(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function authSignIn() {
    if (!state.client) {
      window.toast('Auth system not initialized. Please refresh the page.');
      return;
    }
    const email = $('auth-email').value.trim();
    const password = $('auth-password').value;
    if (!email || !password) {
      window.toast('Email and password are required.');
      return;
    }

    const btn = $('auth-primary-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      console.log('🔐 Attempting sign-in for:', email);
      const { data, error } = await retryWithBackoff(async () => {
        return await withTimeout(
          state.client.auth.signInWithPassword({ email, password }),
          15000,
          'signInWithPassword'
        );
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        window.toast(`Sign in failed: ${error.message}`);
        return;
      }

      if (!data.session) {
        console.warn('⚠️ No session after sign-in');
        window.toast('Sign in succeeded but no session found. Please try again.');
        return;
      }

      console.log('✓ Session established, refreshing auth state...');
      // Manually refresh auth state after successful signin
      await refreshAuthState();
      
      window.closeMd('auth');
      $('auth-password').value = '';
      console.log('✓ Sign-in complete');
      window.toast('✓ Signed in successfully!');
    } catch (err) {
      console.error('❌ Sign in exception:', err);
      window.toast(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function authSignOut() {
    if (!state.client) return;
    await state.client.auth.signOut();
    state.user = null;
    state.profile = null;
    state.settings = null;
    updateUi();
    window.mxAuthState = state;
    if (typeof window.mxOnAuthSessionReady === 'function') {
      try {
        window.mxOnAuthSessionReady();
      } catch (hookErr) {
        console.warn('[auth] mxOnAuthSessionReady:', hookErr);
      }
    }
    window.toast('Signed out.');
  }

  async function authPrimaryAction() {
    await authSignIn();
  }

  function authToggleMode() {
    setMode(state.mode === 'signup' ? 'signin' : 'signup');
  }

  window.authSignUp = authSignUp;
  window.authSignIn = authSignIn;
  window.authSignOut = authSignOut;
  window.authPrimaryAction = authPrimaryAction;
  window.authSendMagicLink = authSendMagicLink;
  window.authGoogle = authGoogle;
  window.authApple = authApple;
  window.authToggleMode = authToggleMode;
  window.authSetMode = setMode;
  window.openMxAuth = openAuthModal;
  window.requireMxAuth = requireAuth;
  window.initializeMxAuth = initializeAuth;
})();
