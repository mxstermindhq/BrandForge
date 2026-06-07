import type { Campaign, CampaignView, User, UserPublic, UserSession } from "@/types";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";

export interface AuthedContext {
  env: CloudflareEnv;
  session: UserSession;
}

export async function authed(_request: Request): Promise<AuthedContext> {
  const env = getEnv();
  const session = await requireAuth(env.DB);
  return { env, session };
}

export async function adminAuthed(_request: Request): Promise<AuthedContext> {
  const env = getEnv();
  const session = await requireAdmin(env.DB);
  return { env, session };
}

export function userToPublic(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  };
}

export function campaignToView(c: Campaign): CampaignView {
  const { platforms, enrich, ...rest } = c;
  let parsed: string[] = [];
  try {
    parsed = JSON.parse(platforms) as string[];
  } catch {
    parsed = [];
  }
  return { ...rest, platforms: parsed, enrich: enrich === 1 };
}
