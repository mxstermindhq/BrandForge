import type { MetadataRoute } from "next";
import { OPERATOR_SEED } from "@/content/operator-seed";
import { OPERATOR_MEDIA } from "@/content/operator-media";

const BASE = "https://brandforge.gg";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const profiles: MetadataRoute.Sitemap = OPERATOR_SEED.map((op) => ({
    url: `${BASE}/${encodeURIComponent(op.username)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const offers: MetadataRoute.Sitemap = OPERATOR_SEED.flatMap((op) => {
    const media = OPERATOR_MEDIA[op.username.toLowerCase()];
    if (!media) return [];
    return media.services.map((s) => ({
      url: `${BASE}/offer/${encodeURIComponent(s.id)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));
  });

  const work: MetadataRoute.Sitemap = OPERATOR_SEED.flatMap((op) => {
    const media = OPERATOR_MEDIA[op.username.toLowerCase()];
    if (!media) return [];
    return [
      {
        url: `${BASE}/work/${encodeURIComponent(op.username)}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...media.workPieces.map((piece) => ({
        url: `${BASE}/work/${encodeURIComponent(op.username)}/${encodeURIComponent(piece.id)}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
    ];
  });

  return [...staticPages, ...profiles, ...offers, ...work];
}
