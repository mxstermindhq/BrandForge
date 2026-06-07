// Cloudflare binding contract for LeadForge. Accessed at runtime via
// getCloudflareContext().env from "@opennextjs/cloudflare".
interface CloudflareEnv {
  DB: D1Database;
  SESSIONS: KVNamespace;
  CAMPAIGN_QUEUE: Queue<import("@/types").CampaignQueueMessage>;
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  APP_URL: string;
  APP_ENV: string;
  // Optional search providers. Free DuckDuckGo is used when none are set;
  // providing a key auto-upgrades to that provider (priority: Serper > Google CSE).
  SEARCH_PROVIDER?: string;
  SERPER_API_KEY?: string;
  GOOGLE_CSE_KEY?: string;
  GOOGLE_CSE_CX?: string;
}
