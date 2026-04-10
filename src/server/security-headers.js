/**
 * Baseline headers for every HTTP response (defense in depth; does not replace auth/RLS).
 * Kept conservative so the SPA (inline handlers, external fonts) is not broken.
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  /* interest-cohort removed — deprecated in Chrome and triggers console warnings */
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function mergeSecurityHeaders(headers = {}) {
  if (!headers || typeof headers !== 'object') return { ...SECURITY_HEADERS };
  return { ...SECURITY_HEADERS, ...headers };
}

module.exports = { SECURITY_HEADERS, mergeSecurityHeaders };
