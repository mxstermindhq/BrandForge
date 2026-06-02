import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-19");

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/terms/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE.url}/privacy/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
