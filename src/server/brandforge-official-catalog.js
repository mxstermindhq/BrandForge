const fs = require('fs');
const path = require('path');
const { officialIntelligenceFromItem } = require('./listing-intelligence');
const {
  normalizeListingTerm,
  normalizeListingType,
  normalizeMarketplaceCategory,
  formatTierPriceLabel,
} = require('./package-tiers');

let cached = null;

function loadCatalog() {
  if (cached) return cached;
  const file = path.join(__dirname, '../../data/brandforge-official-catalog.json');
  const raw = fs.readFileSync(file, 'utf8');
  cached = JSON.parse(raw);
  return cached;
}

function categoryBackgrounds(cat) {
  const m = {
    Developer: 'linear-gradient(135deg, #e0f2fe, #38bdf8, #0284c7)',
    Designer: 'linear-gradient(135deg, #fdf4ff, #c084fc, #7c3aed)',
    'Video Editor': 'linear-gradient(135deg, #fff7ed, #fb923c, #ea580c)',
  };
  return m[cat] || 'linear-gradient(135deg, #dff3ff, #7ec8ff, #0284c7)';
}

function endsAtFromDays(days) {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function mapOfficialToMarketplaceListing(item, seller) {
  const listingType = normalizeListingType(item.listingType);
  const price = Number(item.price) || 0;
  const billingInterval = item.billingInterval || null;
  const endsAt = listingType === 'starter' ? endsAtFromDays(item.endsInDays) : null;
  const deliveryDays = Math.max(1, Number(item.deliveryDays) || 1);
  const priceLabel = formatTierPriceLabel(price, listingType, billingInterval);
  const deliveryLabel =
    listingType === 'partner' && billingInterval
      ? `${billingInterval} partner program`
      : deliveryDays === 1
        ? '24h'
        : `${deliveryDays} days`;

  return {
    id: item.slug,
    catalogSlug: item.slug,
    isOfficial: true,
    title: item.title,
    tagline: item.tagline || '',
    description: item.description || '',
    category: item.category || 'General',
    price,
    priceLabel,
    deliveryDays,
    deliveryLabel,
    listingType,
    packageSlot:
      item.packageSlot ||
      (item.slug && String(item.slug).endsWith('-partner-scale')
        ? 'partner_scale'
        : listingType === 'starter'
          ? 'starter'
          : 'partner'),
    endsAt,
    billingInterval,
    ownerId: null,
    ownerUsername: seller.username,
    ownerName: seller.name,
    ownerAvatar: null,
    coverUrl: null,
    thumbGradient: item.thumbGradient || categoryBackgrounds(item.category),
    popularityScore: item.popularityScore || 80,
    deliverables: item.deliverables || [],
    useCases: item.useCases || [],
    createdAt: null,
    serviceUrl: `/listing/${item.slug}`,
    intelligence: officialIntelligenceFromItem(item),
  };
}

function mapOfficialToServiceDetail(item, seller) {
  const listing = mapOfficialToMarketplaceListing(item, seller);
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    tagline: listing.tagline,
    cat: listing.category,
    category: listing.category,
    price: listing.price,
    base_price: listing.price,
    priceLabel: listing.priceLabel,
    deliveryDays: listing.deliveryDays,
    delivery_days: listing.deliveryDays,
    deliveryLabel: listing.deliveryLabel,
    listingType: listing.listingType,
    listing_type: listing.listingType,
    endsAt: listing.endsAt,
    ends_at: listing.endsAt,
    billingInterval: listing.billingInterval,
    billing_interval: listing.billingInterval,
    deliverables: listing.deliverables,
    useCases: listing.useCases,
    tags: [],
    thumbGradient: listing.thumbGradient,
    isOfficial: true,
    ownerId: null,
    ownerUsername: seller.username,
    ownerName: seller.name,
    owner: { username: seller.username, full_name: seller.name, avatar_url: null },
    sel: seller.name,
    ctaText: 'Pay with crypto',
    intelligence: officialIntelligenceFromItem(item),
  };
}

function getOfficialListings({ term = 'starter', q = '', category = '', sort = 'newest' } = {}) {
  const { seller, listings } = loadCatalog();
  const listingType = normalizeListingTerm(term);
  let out = listings
    .filter((item) => normalizeListingType(item.listingType) === listingType)
    .filter((item) => item.packageSlot !== 'partner_scale')
    .map((item) => mapOfficialToMarketplaceListing(item, seller));

  const search = String(q || '').trim().toLowerCase();
  if (search) {
    out = out.filter(
      (l) =>
        l.title.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search) ||
        l.category.toLowerCase().includes(search),
    );
  }
  const cat = normalizeMarketplaceCategory(category);
  if (cat) {
    out = out.filter((l) => l.category === cat);
  }

  if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
  else if (sort === 'ending') {
    out.sort((a, b) => {
      const ae = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
      const be = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
      return ae - be;
    });
  } else {
    out.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
  }

  return out;
}

function getOfficialListingById(id) {
  const slug = String(id || '').trim().replace(/^official:/, '');
  if (!slug) return null;
  const { seller, listings } = loadCatalog();
  const item = listings.find((l) => l.slug === slug);
  if (!item) return null;
  return { item, seller, detail: mapOfficialToServiceDetail(item, seller) };
}

function getOfficialSeller() {
  return loadCatalog().seller;
}

module.exports = {
  getOfficialListings,
  getOfficialListingById,
  getOfficialSeller,
  mapOfficialToMarketplaceListing,
  mapOfficialToServiceDetail,
};
