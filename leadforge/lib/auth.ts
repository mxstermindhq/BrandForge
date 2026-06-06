import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { UserSession } from "@/types";

export const SESSION_COOKIE = "lf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_ROUNDS = 10;

/** Thrown by requireAuth/requireAdmin; routes map .status to an HTTP response. */
export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function secretKey(secret: string): Uint8Array {
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function kvKey(jti: string): string {
  return `session:${jti}`;
}

// ── Passwords ────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

// ── Sessions ────────────────────────────────────────────────────────────────
export async function createSession(
  kv: KVNamespace,
  secret: string,
  user: { userId: string; email: string; isAdmin: boolean },
): Promise<string> {
  const jti = crypto.randomUUID();
  const session: UserSession = {
    userId: user.userId,
    email: user.email,
    isAdmin: user.isAdmin,
    issuedAt: Date.now(),
  };

  await kv.put(kvKey(jti), JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });

  return new SignJWT({ email: user.email, isAdmin: user.isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey(secret));
}

export async function getSession(
  kv: KVNamespace,
  secret: string,
  token: string,
): Promise<UserSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    const jti = payload.jti;
    if (!jti) return null;
    const raw = await kv.get(kvKey(jti));
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export async function destroySession(
  kv: KVNamespace,
  secret: string,
  token: string,
): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    if (payload.jti) await kv.delete(kvKey(payload.jti));
  } catch {
    // invalid token — nothing to revoke
  }
}

// ── Request helpers ────────────────────────────────────────────────────────────
export function readSessionCookie(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=");
  }
  return null;
}

export async function requireAuth(
  request: Request,
  kv: KVNamespace,
  secret: string,
): Promise<UserSession> {
  const token = readSessionCookie(request);
  const session = token ? await getSession(kv, secret, token) : null;
  if (!session) throw new AuthError(401, "Authentication required");
  return session;
}

export async function requireAdmin(
  request: Request,
  kv: KVNamespace,
  secret: string,
): Promise<UserSession> {
  const session = await requireAuth(request, kv, secret);
  if (!session.isAdmin) throw new AuthError(403, "Admin access required");
  return session;
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
