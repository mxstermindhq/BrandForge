/**
 * CORS: when `corsOriginSet` is non-empty, cross-origin browser requests must send
 * an Origin that matches. Empty set = same-origin only (no Access-Control-Allow-Origin).
 */
function evaluateCors(req, corsOriginSet) {
  const origin = req.headers.origin;
  if (!origin) return { headers: {}, reject: false };
  if (!corsOriginSet || corsOriginSet.size === 0) {
    return { headers: {}, reject: false };
  }
  if (corsOriginSet.has(origin)) {
    return {
      reject: false,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        Vary: 'Origin',
      },
    };
  }
  return { reject: true, headers: {} };
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim().slice(0, 80);
  }
  return String(req.socket?.remoteAddress || 'unknown').slice(0, 80);
}

const MUTATE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function shouldApplyMutateRateLimit(pathname, method) {
  if (pathname === '/api/stripe/webhook' || pathname === '/api/nowpayments/ipn') return false;
  return MUTATE_METHODS.has(String(method || '').toUpperCase());
}

/** Fixed window per IP per minute — simple abuse throttle (not distributed). */
function createMutateLimiter(maxPerMinute) {
  const counts = new Map();
  const windowMs = 60_000;
  return function allow(ip) {
    const w = Math.floor(Date.now() / windowMs);
    const k = `${ip}:${w}`;
    const n = (counts.get(k) || 0) + 1;
    counts.set(k, n);
    if (counts.size > 50_000) {
      const cut = w - 2;
      for (const key of counts.keys()) {
        const part = Number(key.split(':').pop());
        if (part < cut) counts.delete(key);
      }
    }
    return n <= maxPerMinute;
  };
}

module.exports = {
  evaluateCors,
  getClientIp,
  shouldApplyMutateRateLimit,
  createMutateLimiter,
};
