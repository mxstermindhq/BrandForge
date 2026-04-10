/**
 * NOWPayments REST helper (invoice + IPN signature).
 * @see https://documenter.getpostman.com/view/7907941/2s93JusNJt
 */

const nodeCrypto = require('crypto');

function apiBaseUrl(sandbox) {
  return sandbox ? 'https://api-sandbox.nowpayments.io/v1' : 'https://api.nowpayments.io/v1';
}

function sortKeysDeep(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  const sorted = {};
  for (const k of Object.keys(obj).sort()) {
    sorted[k] = sortKeysDeep(obj[k]);
  }
  return sorted;
}

/**
 * Verify `x-nowpayments-sig` per NOWPayments IPN docs (HMAC-SHA512 over JSON with sorted keys).
 */
function verifyNowpaymentsIpnSignature(rawBodyUtf8, sigHeader, ipnSecret) {
  const secret = String(ipnSecret || '').trim();
  if (!secret || !rawBodyUtf8 || !sigHeader) return false;
  let parsed;
  try {
    parsed = JSON.parse(rawBodyUtf8);
  } catch {
    return false;
  }
  const body = JSON.stringify(sortKeysDeep(parsed));
  const h = nodeCrypto.createHmac('sha512', secret).update(body).digest('hex');
  const recv = String(sigHeader).trim().toLowerCase();
  return recv.length > 0 && recv === h.toLowerCase();
}

/**
 * @param {object} opts
 * @param {string} opts.apiKey
 * @param {boolean} [opts.sandbox]
 * @param {number} opts.priceAmount
 * @param {string} [opts.priceCurrency]
 * @param {string|null} [opts.payCurrency] omit/null = customer picks coin on NP invoice
 * @param {string} opts.ipnCallbackUrl
 * @param {string} opts.orderId
 * @param {string} [opts.orderDescription]
 * @param {string} opts.successUrl
 * @param {string} opts.cancelUrl
 */
async function createNowpaymentsInvoice(opts) {
  const base = apiBaseUrl(Boolean(opts.sandbox));
  const url = `${base.replace(/\/$/, '')}/invoice`;
  const payload = {
    price_amount: opts.priceAmount,
    price_currency: (opts.priceCurrency || 'usd').toLowerCase(),
    ipn_callback_url: opts.ipnCallbackUrl,
    order_id: opts.orderId,
    order_description: String(opts.orderDescription || 'Marketplace escrow').slice(0, 500),
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  };
  if (opts.payCurrency != null && String(opts.payCurrency).trim()) {
    payload.pay_currency = String(opts.payCurrency).toLowerCase();
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': String(opts.apiKey || '').trim(),
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    let msg = json && (json.message || json.error) ? json.message || json.error : null;
    if (json && !msg && typeof json === 'object') {
      const code = json.code || json.errorCode || json.statusCode;
      const errArr = Array.isArray(json.errors) ? json.errors.join('; ') : null;
      msg = [code && String(code), errArr].filter(Boolean).join(' · ') || null;
    }
    if (!msg) msg = text && text.length < 800 ? text : res.statusText;
    throw new Error(`NOWPayments invoice ${res.status}: ${msg}`);
  }
  return json;
}

/** Hosted invoice link from POST /invoice response (shape varies slightly by API version). */
function extractInvoiceCheckoutUrl(inv) {
  if (!inv || typeof inv !== 'object') return null;
  const d = inv.data;
  return (
    inv.invoice_url ||
    inv.invoiceUrl ||
    inv.url ||
    (d && typeof d === 'object' && (d.invoice_url || d.invoiceUrl)) ||
    null
  );
}

module.exports = {
  apiBaseUrl,
  verifyNowpaymentsIpnSignature,
  createNowpaymentsInvoice,
  extractInvoiceCheckoutUrl,
};
