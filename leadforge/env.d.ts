// Runtime binding contract for LeadForge.
// Supabase (Vercel): Postgres via service-role client + Supabase Auth cookies.
// Cloudflare (local): D1 + KV via opennext.
interface CampaignCache {
  put(
    campaignId: string,
    candidates: import("@/types").ExtractedLeadData[],
  ): Promise<void>;
  get(campaignId: string): Promise<import("@/types").ExtractedLeadData[] | null>;
  delete(campaignId: string): Promise<void>;
}

interface CloudflareEnv {
  DB: import("@supabase/supabase-js").SupabaseClient;
  CACHE: CampaignCache;
  /** @deprecated Cloudflare KV — use CACHE. Kept for wrangler local dev compat. */
  SESSIONS?: KVNamespace;
  CAMPAIGN_QUEUE: Queue<import("@/types").CampaignQueueMessage>;
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
  APP_URL: string;
  APP_ENV: string;
  SEARCH_PROVIDER?: string;
  SERPER_API_KEY?: string;
  GOOGLE_CSE_KEY?: string;
  GOOGLE_CSE_CX?: string;
}

// Supabase (set in Vercel / .env.local):
// NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
