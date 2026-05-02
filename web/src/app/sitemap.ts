import type { MetadataRoute } from "next";
import { metadataApiBase } from "@/lib/metadata-api";

// Types for dynamic sitemap data
interface SitemapProfile {
  username: string;
  updated_at?: string;
  tier?: string;
}

interface SitemapService {
  id: string;
  updated_at?: string;
  title?: string;
}

interface SitemapRequest {
  id: string;
  updated_at?: string;
  title?: string;
}

interface SitemapSquad {
  id: string;
  slug?: string;
  updated_at?: string;
  name?: string;
}

// Fetch functions for dynamic routes
async function fetchPublicProfiles(): Promise<SitemapProfile[]> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/sitemap/profiles`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.profiles || [];
  } catch {
    return [];
  }
}

async function fetchPublicServices(): Promise<SitemapService[]> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/sitemap/services`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.services || [];
  } catch {
    return [];
  }
}

async function fetchPublicRequests(): Promise<SitemapRequest[]> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/sitemap/requests`, {
      next: { revalidate: 1800 }, // Revalidate every 30 min for briefs
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.requests || [];
  } catch {
    return [];
  }
}

async function fetchPublicSquads(): Promise<SitemapSquad[]> {
  try {
    const base = metadataApiBase();
    const res = await fetch(`${base}/api/sitemap/squads`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.squads || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://brandforge.gg";
  const now = new Date();

  // Static pages - organized by priority
  const staticPages: MetadataRoute.Sitemap = [
    // Core landing - Highest priority
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Product & discovery
    { url: `${base}/product/overview`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${base}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${base}/feed`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },

    // Community & social
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/squads`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/agents`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/agents/marketplace`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },

    // AI tools (public landing pages only)
    { url: `${base}/ai`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // Monetization
    { url: `${base}/plans`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },

    // Content & trust
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/status`, lastModified: now, changeFrequency: "hourly", priority: 0.5 },

    // Legal
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Fetch dynamic data
  const [profiles, services, requests, squads] = await Promise.all([
    fetchPublicProfiles(),
    fetchPublicServices(),
    fetchPublicRequests(),
    fetchPublicSquads(),
  ]);

  // Generate profile URLs (/p/ and /u/ - both point to Chronicle)
  const profileUrls: MetadataRoute.Sitemap = profiles.map((profile) => {
    const updated = profile.updated_at ? new Date(profile.updated_at) : now;
    return {
      url: `${base}/u/${encodeURIComponent(profile.username)}`,
      lastModified: updated,
      changeFrequency: "daily",
      priority: profile.tier && ["Elite", "Pro"].includes(profile.tier) ? 0.7 : 0.6,
    };
  });

  // Also include /p/ redirects for backward compatibility
  const legacyProfileUrls: MetadataRoute.Sitemap = profiles.map((profile) => {
    const updated = profile.updated_at ? new Date(profile.updated_at) : now;
    return {
      url: `${base}/p/${encodeURIComponent(profile.username)}`,
      lastModified: updated,
      changeFrequency: "monthly", // Lower priority as these redirect
      priority: 0.3,
    };
  });

  // Generate service listing URLs
  const serviceUrls: MetadataRoute.Sitemap = services.map((service) => {
    const updated = service.updated_at ? new Date(service.updated_at) : now;
    return {
      url: `${base}/services/${encodeURIComponent(service.id)}`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.65,
    };
  });

  // Generate request/brief URLs
  const requestUrls: MetadataRoute.Sitemap = requests.map((req) => {
    const updated = req.updated_at ? new Date(req.updated_at) : now;
    return {
      url: `${base}/requests/${encodeURIComponent(req.id)}`,
      lastModified: updated,
      changeFrequency: "daily", // Briefs update frequently
      priority: 0.6,
    };
  });

  // Generate squad URLs
  const squadUrls: MetadataRoute.Sitemap = squads.map((squad) => {
    const identifier = squad.slug || squad.id;
    const updated = squad.updated_at ? new Date(squad.updated_at) : now;
    return {
      url: `${base}/squads/${encodeURIComponent(identifier)}`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Combine all URLs
  return [
    ...staticPages,
    ...profileUrls,
    ...legacyProfileUrls,
    ...serviceUrls,
    ...requestUrls,
    ...squadUrls,
  ];
}
