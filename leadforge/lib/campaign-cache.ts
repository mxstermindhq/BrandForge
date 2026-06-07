import type { ExtractedLeadData } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CampaignCache {
  put(campaignId: string, candidates: ExtractedLeadData[]): Promise<void>;
  get(campaignId: string): Promise<ExtractedLeadData[] | null>;
  delete(campaignId: string): Promise<void>;
}

const TTL_HOURS = 6;

function candidatesKey(campaignId: string): string {
  return `campaign:${campaignId}:candidates`;
}

/** Persist scraped candidates between chunked processor invocations. */
export async function saveCandidates(
  cache: CloudflareEnv["CACHE"],
  campaignId: string,
  candidates: ExtractedLeadData[],
): Promise<void> {
  await cache.put(campaignId, candidates);
}

export async function loadCandidates(
  cache: CloudflareEnv["CACHE"],
  campaignId: string,
): Promise<ExtractedLeadData[] | null> {
  return cache.get(campaignId);
}

export async function deleteCandidates(
  cache: CloudflareEnv["CACHE"],
  campaignId: string,
): Promise<void> {
  await cache.delete(campaignId);
}

export function createKvCampaignCache(kv: KVNamespace): CampaignCache {
  return {
    async put(campaignId, candidates) {
      await kv.put(candidatesKey(campaignId), JSON.stringify(candidates), {
        expirationTtl: TTL_HOURS * 3600,
      });
    },
    async get(campaignId) {
      const raw = await kv.get(candidatesKey(campaignId));
      return raw ? (JSON.parse(raw) as ExtractedLeadData[]) : null;
    },
    async delete(campaignId) {
      await kv.delete(candidatesKey(campaignId));
    },
  };
}

export function createSupabaseCampaignCache(db: SupabaseClient): CampaignCache {
  return {
    async put(campaignId, candidates) {
      const expires = new Date(Date.now() + TTL_HOURS * 3600 * 1000).toISOString();
      await db.from("campaign_candidates").upsert({
        campaign_id: campaignId,
        candidates,
        expires_at: expires,
      });
    },
    async get(campaignId) {
      const { data } = await db
        .from("campaign_candidates")
        .select("candidates, expires_at")
        .eq("campaign_id", campaignId)
        .maybeSingle();
      if (!data) return null;
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        await db.from("campaign_candidates").delete().eq("campaign_id", campaignId);
        return null;
      }
      return data.candidates as ExtractedLeadData[];
    },
    async delete(campaignId) {
      await db.from("campaign_candidates").delete().eq("campaign_id", campaignId);
    },
  };
}
