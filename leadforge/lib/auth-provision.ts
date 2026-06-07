import type { User as AuthUser } from "@supabase/supabase-js";
import { WELCOME_CREDITS } from "@/lib/constants";
import { createProfile, ensureCreditRow, getUserById, type Db } from "@/lib/db";
import type { User } from "@/types";

function displayNameFromAuthUser(authUser: AuthUser): string {
  const meta = authUser.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim());
  if (fromMeta) return fromMeta;

  const email = authUser.email?.trim().toLowerCase();
  if (email?.includes("@")) return email.split("@")[0] ?? "User";
  return "User";
}

/** Create profile + welcome credits for first-time OAuth (or missing profile) sign-ins. */
export async function ensureUserProfile(
  db: Db,
  authUser: AuthUser,
  adminEmail?: string,
): Promise<User> {
  const existing = await getUserById(db, authUser.id);
  if (existing) return existing;

  const email = authUser.email?.trim().toLowerCase();
  if (!email) throw new Error("Account is missing an email address");

  const isAdmin = email === adminEmail?.trim().toLowerCase();
  const user = await createProfile(db, {
    id: authUser.id,
    email,
    name: displayNameFromAuthUser(authUser),
    is_admin: isAdmin,
  });
  await ensureCreditRow(db, user.id, WELCOME_CREDITS);
  return user;
}
