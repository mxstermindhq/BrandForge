'use strict';

/**
 * Curated professional titles (display + storage). Keep in sync with
 * `web/src/config/professional-titles.ts` for the UI.
 */
const PROFESSIONAL_TITLES = Object.freeze([
  'Product designer',
  'UX / UI designer',
  'Software engineer',
  'Full-stack developer',
  'Frontend developer',
  'Backend developer',
  'Mobile developer',
  'Data scientist',
  'ML / AI engineer',
  'DevOps / SRE',
  'Product manager',
  'Project manager',
  'Technical writer',
  'Marketing strategist',
  'Brand designer',
  'Video / motion designer',
  'Founder / executive',
  'Consultant',
  'Other specialist',
]);

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
