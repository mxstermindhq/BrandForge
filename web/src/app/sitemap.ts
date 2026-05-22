import type { MetadataRoute } from "next";
import { metadataApiBase } from "@/lib/metadata-api";

const BASE = "https://brandforge.gg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let listings: MetadataRoute.Sitemap = [];
  let profiles: MetadataRoute.Sitemap = [];
  try {
    const base = metadataApiBase();
    const [listRes, profRes] = await Promise.all([
      fetch(`${base}/api/marketplace/listings?term=short`, { next: { revalidate: 3600 } }),
      fetch(`${base}/api/talent`, { next: { revalidate: 3600 } }),
    ]);
    if (listRes.ok) {
      const j = (await listRes.json()) as { listings?: Array<{ id: string; serviceUrl?: string }> };
      listings = (j.listings || []).map((l) => ({
        url: `${BASE}${l.serviceUrl || `/listing/${l.id}`}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
    if (profRes.ok) {
      const j = (await profRes.json()) as { members?: Array<{ username: string }> };
      profiles = (j.members || []).map((m) => ({
        url: `${BASE}/${encodeURIComponent(m.username)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }));
    }
  } catch {
    /* sitemap degrades to static only */
  }

  return [...staticPages, ...listings, ...profiles];
}
