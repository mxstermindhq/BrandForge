// Isolated so the edge middleware can import the cookie name without pulling in
// bcryptjs (a Node-only dependency) from lib/auth.ts.
export const SESSION_COOKIE = "lf_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
