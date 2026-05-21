const fs = require('fs');
const path = require('path');
const { officialIntelligenceFromItem } = require('./listing-intelligence');

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
    'AI & Automation': 'linear-gradient(135deg, #050510, #ff4d00, #ffb800)',
    'Discord Growth Systems': 'linear-gradient(135deg, #120818, #5865f2, #ff4d00)',
    'Content Creation Systems': 'linear-gradient(135deg, #0a0505, #ff2a00, #ffc14d)',
    'Short-form Video Systems': 'linear-gradient(135deg, #ff0000, #ff4d00, #1a0500)',
    'Brand Identity': 'linear-gradient(135deg, #1a0800, #ff6b00, #ffb800)',
    'Landing Pages & Funnels': 'linear-gradient(135deg, #050508, #ff6b00, #ff2200)',
    'Lead Generation Systems': 'linear-gradient(135deg, #0a0018, #ff4d00, #ffb800)',
    'Digital Business Setup': 'linear-gradient(135deg, #111, #333, #ff4d00)',
    'Creator Monetization Systems': 'linear-gradient(135deg, #120818, #ff4d00, #ffb800)',
    'Marketing Systems': 'linear-gradient(135deg, #050508, #ff6b00, #ff2200)',
  };
  return m[cat] || 'linear-gradient(135deg, #0a0505, #ff4d00, #ffb800)';
}

function endsAtFromDays(days) {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function mapOfficialToMarketplaceListing(item, seller) {
  const listingType = item.listingType === 'long_term' ? 'long_term' : 'short_term';
  const price = Number(item.price) || 0;
  const billingInterval = item.billingInterval || null;
  const endsAt = listingType === 'short_term' ? endsAtFromDays(item.endsInDays) : null;
  const deliveryDays = Math.max(1, Number(item.deliveryDays) || 1);
  const priceLabel =
    listingType === 'long_term' && billingInterval
      ? `$${price.toLocaleString()}/${billingInterval}`
      : `$${price.toLocaleString()}`;
  const deliveryLabel =
    listingType === 'long_term'
      ? `${billingInterval || 'monthly'} subscription`
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

function getOfficialListings({ term = 'short', q = '', category = '', sort = 'newest' } = {}) {
  const { seller, listings } = loadCatalog();
  const listingType = term === 'long' || term === 'long_term' ? 'long_term' : 'short_term';
  let out = listings
    .filter((item) => (item.listingType === 'long_term' ? 'long_term' : 'short_term') === listingType)
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
  const cat = String(category || '').trim();
  if (cat && cat !== 'All') {
    out = out.filter((l) => l.category.toLowerCase().includes(cat.toLowerCase()));
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
