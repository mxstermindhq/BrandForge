import type { MetadataRoute } from "next";
import { OPERATOR_MEDIA } from "@/content/operator-media";
import { CATEGORIES, PRODUCTS, SELLERS } from "@/lib/marketplace";
import { getLandingOperators } from "@/lib/operators.server";

const BASE = "https://brandforge.gg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const operators = await getLandingOperators();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/offers`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/mxstermind`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/marketplace/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const products: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const profiles: MetadataRoute.Sitemap = [
    ...SELLERS.map((s) => ({
      url: `${BASE}/profile/${s.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...operators.map((op) => ({
      url: `${BASE}/profile/${encodeURIComponent(op.username)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];

  const legacyProfiles: MetadataRoute.Sitemap = operators.map((op) => ({
    url: `${BASE}/${encodeURIComponent(op.username)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const work: MetadataRoute.Sitemap = operators.flatMap((op) => {
    const media = OPERATOR_MEDIA[op.username.toLowerCase()];
    if (!media) return [];
    return [
      {
        url: `${BASE}/work/${encodeURIComponent(op.username)}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      },
      ...media.workPieces.map((piece) => ({
        url: `${BASE}/work/${encodeURIComponent(op.username)}/${encodeURIComponent(piece.id)}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  });

  return [...staticPages, ...categories, ...products, ...profiles, ...legacyProfiles, ...work];
}
