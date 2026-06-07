import type { UserSession } from "@/types";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { getUserById, type Db } from "@/lib/db";

/** Thrown by requireAuth/requireAdmin; routes map .status to an HTTP response. */
export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/** Resolve the current Supabase user + profile into a session payload. */
export async function resolveSession(db: Db): Promise<UserSession | null> {
  const supabase = await createSupabaseRouteClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const profile = await getUserById(db, user.id);
  if (!profile) return null;

  return {
    userId: profile.id,
    email: profile.email,
    isAdmin: profile.is_admin,
    issuedAt: Date.now(),
  };
}

export async function requireAuth(db: Db): Promise<UserSession> {
  const session = await resolveSession(db);
  if (!session) throw new AuthError(401, "Authentication required");
  return session;
}

export async function requireAdmin(db: Db): Promise<UserSession> {
  const session = await requireAuth(db);
  if (!session.isAdmin) throw new AuthError(403, "Admin access required");
  return session;
}

/** Sign out via Supabase (clears auth cookies on the response). */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseRouteClient();
  await supabase.auth.signOut();
}
