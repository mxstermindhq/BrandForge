import type { CampaignQueueMessage } from "@/types";
import { createTursoDb } from "@/lib/adapters/turso-d1";
import { createUpstashKv } from "@/lib/adapters/upstash-kv";
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

function buildVercelEnv(): CloudflareEnv {
  const tursoUrl = readEnvString("TURSO_DATABASE_URL");
  const tursoToken = readEnvString("TURSO_AUTH_TOKEN");
  const redisUrl = readEnvString("UPSTASH_REDIS_REST_URL");
  const redisToken = readEnvString("UPSTASH_REDIS_REST_TOKEN");

  if (!tursoUrl || !tursoToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required on Vercel");
  }
  if (!redisUrl || !redisToken) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required on Vercel");
  }

  const env: CloudflareEnv = {
    DB: createTursoDb(tursoUrl, tursoToken),
    SESSIONS: createUpstashKv(redisUrl, redisToken),
    GEMINI_API_KEY: readEnvString("GEMINI_API_KEY"),
    GEMINI_MODEL: readEnvString("GEMINI_MODEL") || undefined,
    STRIPE_SECRET_KEY: readEnvString("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET: readEnvString("STRIPE_WEBHOOK_SECRET"),
    RESEND_API_KEY: readEnvString("RESEND_API_KEY"),
    JWT_SECRET: readEnvString("JWT_SECRET"),
    ADMIN_EMAIL: readEnvString("ADMIN_EMAIL"),
    APP_URL: readEnvString("APP_URL", "https://leadforge.vercel.app"),
    APP_ENV: readEnvString("APP_ENV", "production"),
    SEARCH_PROVIDER: readEnvString("SEARCH_PROVIDER") || undefined,
    SERPER_API_KEY: readEnvString("SERPER_API_KEY") || undefined,
    GOOGLE_CSE_KEY: readEnvString("GOOGLE_CSE_KEY") || undefined,
    GOOGLE_CSE_CX: readEnvString("GOOGLE_CSE_CX") || undefined,
    CAMPAIGN_QUEUE: undefined as unknown as Queue<CampaignQueueMessage>,
  };
  env.CAMPAIGN_QUEUE = buildQueueStub(env);
  return env;
}

/** Runtime bindings (Cloudflare Workers or Vercel + Turso/Upstash). */
export function getEnv(): CloudflareEnv {
  if (process.env.TURSO_DATABASE_URL) {
    return buildVercelEnv();
  }
  // Cloudflare / opennext local dev path.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
    getCloudflareContext: () => { env: CloudflareEnv };
  };
  return getCloudflareContext().env;
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
