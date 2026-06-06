import type { Campaign, CampaignView, User, UserPublic, UserSession } from "@/types";
import { getEnv } from "@/lib/cloudflare";
import { requireAdmin, requireAuth } from "@/lib/auth";

export interface AuthedContext {
  env: CloudflareEnv;
  session: UserSession;
}

export async function authed(request: Request): Promise<AuthedContext> {
  const env = getEnv();
  const session = await requireAuth(request, env.SESSIONS, env.JWT_SECRET);
  return { env, session };
}

export async function adminAuthed(request: Request): Promise<AuthedContext> {
  const env = getEnv();
  const session = await requireAdmin(request, env.SESSIONS, env.JWT_SECRET);
  return { env, session };
}

export function userToPublic(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin === 1,
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
