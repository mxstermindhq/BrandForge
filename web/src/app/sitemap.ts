import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://brandforge.gg";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/requests`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/plans`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];
}
