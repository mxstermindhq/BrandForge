import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/** Service-role client for server-side DB work (bypasses RLS). */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  adminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
