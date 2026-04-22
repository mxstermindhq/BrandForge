'use strict';

const PROFESSIONAL_TITLES = Object.freeze(require('../../data/professional-titles.json'));

const lowerToCanonical = new Map(PROFESSIONAL_TITLES.map((t) => [t.trim().toLowerCase(), t]));

function isProfessionalTitle(s) {
  const k = String(s || '').trim().toLowerCase();
  if (!k) return false;
  return lowerToCanonical.has(k);
}

function canonicalProfessionalTitle(s) {
  const k = String(s || '').trim().toLowerCase();
  return lowerToCanonical.get(k) || null;
}

/** Matches provisional usernames from auth-service (email local + _ +12 hex from id). */
function looksLikeProvisionalUsername(username) {
  return /_[0-9a-f]{12}$/i.test(String(username || '').trim());
}

module.exports = {
  PROFESSIONAL_TITLES,
  isProfessionalTitle,
  canonicalProfessionalTitle,
  looksLikeProvisionalUsername,
};
