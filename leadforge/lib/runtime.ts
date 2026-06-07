import type { CampaignQueueMessage } from "@/types";
import {
  createKvCampaignCache,
  createSupabaseCampaignCache,
} from "@/lib/campaign-cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { driveCampaign } from "@/workers/campaign-processor";

function readEnvString(key: string, fallback = ""): string {
  return process.env[key]?.trim() || fallback;
}

function buildQueueStub(env: CloudflareEnv): Queue<CampaignQueueMessage> {
  return {
    send: async (message: CampaignQueueMessage) => {
      waitUntil(driveCampaign(env, message));
    },
    sendBatch: async (messages: Iterable<MessageSendRequest<CampaignQueueMessage>>) => {
      for (const msg of messages) {
        waitUntil(driveCampaign(env, msg.body));
      }
    },
  } as unknown as Queue<CampaignQueueMessage>;
}

function buildSupabaseEnv(): CloudflareEnv {
  const db = getSupabaseAdmin();
  const env: CloudflareEnv = {
    DB: db,
    CACHE: createSupabaseCampaignCache(db),
    GEMINI_API_KEY: readEnvString("GEMINI_API_KEY"),
    GEMINI_MODEL: readEnvString("GEMINI_MODEL") || undefined,
    STRIPE_SECRET_KEY: readEnvString("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: readEnvString("STRIPE_WEBHOOK_SECRET"),
    RESEND_API_KEY: readEnvString("RESEND_API_KEY"),
    ADMIN_EMAIL: readEnvString("ADMIN_EMAIL"),
    APP_URL: readEnvString("APP_URL", "https://leadforge-gilt.vercel.app"),
    APP_ENV: readEnvString("APP_ENV", "production"),
    SEARCH_PROVIDER: readEnvString("SEARCH_PROVIDER") || undefined,
    SERPER_API_KEY: readEnvString("SERPER_API_KEY") || undefined,
    GOOGLE_CSE_KEY: readEnvString("GOOGLE_CSE_KEY") || undefined,
    GOOGLE_CSE_CX: readEnvString("GOOGLE_CSE_CX") || undefined,
    APOLLO_API_KEY: readEnvString("APOLLO_API_KEY") || undefined,
    APIFY_API_KEY: readEnvString("APIFY_API_KEY") || undefined,
    APIFY_USER_ID: readEnvString("APIFY_USER_ID") || undefined,
    CAMPAIGN_QUEUE: undefined as unknown as Queue<CampaignQueueMessage>,
  };
  env.CAMPAIGN_QUEUE = buildQueueStub(env);
  return env;
}

function buildCloudflareEnv(): CloudflareEnv {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
    getCloudflareContext: () => { env: CloudflareEnv };
  };
  const cf = getCloudflareContext().env as CloudflareEnv;
  if (!cf.CACHE && cf.SESSIONS) {
    cf.CACHE = createKvCampaignCache(cf.SESSIONS);
  }
  return cf;
}

/** Runtime bindings (Supabase on Vercel, Cloudflare D1/KV locally). */
export function getEnv(): CloudflareEnv {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return buildSupabaseEnv();
  }
  return buildCloudflareEnv();
}

/** Schedule background work that outlives the response. */
export function waitUntil(promise: Promise<unknown>): void {
  if (process.env.VERCEL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { waitUntil: vercelWaitUntil } = require("@vercel/functions") as {
        waitUntil: (p: Promise<unknown>) => void;
      };
      vercelWaitUntil(promise);
      return;
    } catch {
      void promise;
      return;
    }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
      getCloudflareContext: () => { ctx: { waitUntil: (p: Promise<unknown>) => void } };
    };
    getCloudflareContext().ctx.waitUntil(promise);
  } catch {
    void promise;
  }
}
