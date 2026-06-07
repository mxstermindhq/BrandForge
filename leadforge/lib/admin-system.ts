import { DEFAULT_GEMINI_MODEL } from "@/lib/constants";
import { maskSecret } from "@/lib/admin-mask";
import type { AdminKeyStatus, AdminSystemInfo } from "@/types";

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function keyStatus(
  envVar: string,
  label: string,
  category: AdminKeyStatus["category"],
  value: string | undefined,
  note?: string,
): AdminKeyStatus {
  const configured = Boolean(value?.trim());
  return {
    envVar,
    label,
    category,
    configured,
    preview: maskSecret(value),
    note,
  };
}

/** Admin-safe system snapshot — masked secrets only. */
export function buildAdminSystemInfo(env: CloudflareEnv): AdminSystemInfo {
  const geminiModel = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const groqModel = env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const searchProvider =
    env.SEARCH_PROVIDER?.trim() ||
    (env.SERPER_API_KEY ? "serper" : env.GOOGLE_CSE_KEY ? "google_cse" : "duckduckgo");

  let runtime: AdminSystemInfo["runtime"] = "local";
  if (process.env.VERCEL) runtime = "vercel";
  else if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.VERCEL) runtime = "local";

  const keys: AdminKeyStatus[] = [
    keyStatus("GEMINI_API_KEY", "Gemini API", "ai", env.GEMINI_API_KEY, `Model: ${geminiModel}`),
    keyStatus("GROQ_API_KEY", "Groq API (fallback)", "ai", env.GROQ_API_KEY, `Model: ${groqModel}`),
    keyStatus("SERPER_API_KEY", "Serper (Google search)", "search", env.SERPER_API_KEY),
    keyStatus("GOOGLE_CSE_KEY", "Google CSE key", "search", env.GOOGLE_CSE_KEY),
    keyStatus("GOOGLE_CSE_CX", "Google CSE CX", "search", env.GOOGLE_CSE_CX, "Search engine ID"),
    keyStatus("STRIPE_SECRET_KEY", "Stripe secret", "billing", env.STRIPE_SECRET_KEY),
    keyStatus("STRIPE_WEBHOOK_SECRET", "Stripe webhook secret", "billing", env.STRIPE_WEBHOOK_SECRET),
    keyStatus("RESEND_API_KEY", "Resend email", "email", env.RESEND_API_KEY),
    keyStatus("APOLLO_API_KEY", "Apollo.io", "integrations", env.APOLLO_API_KEY, "Campaign processor only"),
    keyStatus("APIFY_API_KEY", "Apify", "integrations", env.APIFY_API_KEY, "Campaign processor only"),
    keyStatus(
      "APIFY_USER_ID",
      "Apify user ID",
      "integrations",
      env.APIFY_USER_ID,
      "Not a secret — actor routing",
    ),
    keyStatus(
      "SUPABASE_SERVICE_ROLE_KEY",
      "Supabase service role",
      "auth",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Server-only — never expose to client",
    ),
    keyStatus(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "Supabase anon key",
      "auth",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "Public — safe in browser",
    ),
  ];

  return {
    appEnv: env.APP_ENV || "production",
    appUrl: env.APP_URL,
    adminEmail: env.ADMIN_EMAIL || null,
    searchProvider,
    models: {
      gemini: geminiModel,
      groq: groqModel,
    },
    keys,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null,
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    runtime,
    nodeVersion: process.version,
    vercel: Boolean(process.env.VERCEL),
  };
}
