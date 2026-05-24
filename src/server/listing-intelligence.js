/**
 * Value Intelligence Layer — structured decision metadata for marketplace listings.
 */

const DOMAIN_BY_CATEGORY = {
  Developer: 'Dev',
  Designer: 'Branding',
  'Video Editor': 'Marketing',
  Dev: 'Dev',
  Design: 'Branding',
  Video: 'Marketing',
};

function normalizeIntelligence(raw, ctx = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const price = Number(ctx.price) || 0;
  const deliveryDays = Math.max(1, Number(ctx.deliveryDays) || 3);
  const category = String(ctx.category || 'General');
  const isOfficial = Boolean(ctx.isOfficial);
  const ownerVerified = Boolean(ctx.ownerVerified);

  const domain =
    src.domain ||
    DOMAIN_BY_CATEGORY[category] ||
    (category.toLowerCase().includes('ai') ? 'AI' : 'General');

  let impactScale = src.impact_scale || src.impactScale;
  if (!impactScale) {
    if (price >= 2500 || ctx.listingType === 'partner') impactScale = 'Enterprise';
    else if (price >= 600) impactScale = 'Creator';
    else impactScale = 'Startup';
  }

  let executionSpeed = src.execution_speed || src.executionSpeed;
  if (!executionSpeed) {
    if (deliveryDays <= 1) executionSpeed = '24h';
    else if (deliveryDays <= 2) executionSpeed = '48h';
    else if (deliveryDays <= 7) executionSpeed = '7d';
    else executionSpeed = '14d+';
  }

  const complexityScore = Math.min(
    5,
    Math.max(1, Number(src.complexity_score ?? src.complexityScore) || (price >= 1500 ? 4 : price >= 400 ? 3 : 2)),
  );

  let roiPotential = src.roi_potential || src.roiPotential;
  if (!roiPotential) {
    if (price >= 1200) roiPotential = 'High';
    else if (price >= 350) roiPotential = 'Medium';
    else roiPotential = 'Low';
  }

  let trustLevel = src.trust_level || src.trustLevel;
  if (!trustLevel) {
    if (isOfficial || ownerVerified) trustLevel = 'Verified';
    else if (ctx.whitelistedSeller) trustLevel = 'Whitelisted';
    else trustLevel = 'New';
  }

  const deliveryFormat =
    src.delivery_format ||
    src.deliveryFormat ||
    (ctx.listingType === 'partner' ? 'Partnership' : 'Service');

  return {
    domain,
    impactScale,
    executionSpeed,
    complexityScore,
    roiPotential,
    trustLevel,
    deliveryFormat,
  };
}

function officialIntelligenceFromItem(item) {
  if (item.intelligence && typeof item.intelligence === 'object') {
    return normalizeIntelligence(item.intelligence, {
      category: item.category,
      price: item.price,
      deliveryDays: item.deliveryDays,
      listingType: item.listingType,
      isOfficial: true,
    });
  }
  return normalizeIntelligence({}, {
    category: item.category,
    price: item.price,
    deliveryDays: item.deliveryDays,
    listingType: item.listingType,
    isOfficial: true,
  });
}

module.exports = { normalizeIntelligence, officialIntelligenceFromItem, DOMAIN_BY_CATEGORY };
