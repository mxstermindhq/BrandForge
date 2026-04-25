const fs = require('fs');
const path = require('path');

let loaded = false;

function loadEnvFile() {
  if (loaded) return;
  loaded = true;

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getEnv() {
  loadEnvFile();
  return {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    supabaseStateKey: process.env.SUPABASE_STATE_KEY || 'default',
    resendApiKey: process.env.RESEND_API_KEY || '',
    emailFrom: process.env.EMAIL_FROM || '',
    // Legacy single key; prefer ANTHROPIC_API_KEY / OPENAI_API_KEY / … below
    aiApiKey: process.env.AI_API_KEY || '',
    aiProvider: process.env.AI_PROVIDER || '',
    aiModel: process.env.AI_MODEL || '',
    aiImageKey: process.env.AI_IMAGE_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    // Override OpenAI-compatible chat/completions base (default https://api.openai.com/v1)
    aiOpenaiBaseUrl: process.env.AI_OPENAI_BASE_URL || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openrouterHttpReferer: process.env.OPENROUTER_HTTP_REFERER || '',
    mistralApiKey: process.env.MISTRAL_API_KEY || '',
    togetherApiKey: process.env.TOGETHER_API_KEY || '',
    xaiApiKey: process.env.XAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
    port: Number(process.env.PORT || 3000),
    /** Public browser origin (success/cancel URLs for hosted checkout). */
    publicWebOrigin: String(process.env.PUBLIC_WEB_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/+$/, ''),
    /** Base URL for API (IPN callbacks). */
    apiPublicOrigin: String(process.env.API_PUBLIC_ORIGIN || `http://127.0.0.1:${process.env.PORT || 3000}`).replace(/\/+$/, ''),
    nowpaymentsApiKey: process.env.NOWPAYMENTS_API_KEY || '',
    nowpaymentsSandbox: process.env.NOWPAYMENTS_SANDBOX === '1' || process.env.NOWPAYMENTS_SANDBOX === 'true',
    /** Optional: protect POST /api/cron/decay-* (Bearer or JSON body.secret). Set in host env, not committed. */
    cronSecret: process.env.CRON_SECRET || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    discordDealsWebhookUrl: process.env.DISCORD_DEALS_WEBHOOK_URL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_DEALS_CHAT_ID || '',
  };
}

module.exports = { getEnv };
