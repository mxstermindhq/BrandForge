import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { BLOG_SLUGS } from "@/content/blog/index";
import { DEV_SLUGS } from "@/content/developers/pages";
import { PORTFOLIO_SLUGS } from "@/content/hubs/portfolio-hub";

export const dynamic = "force-static";

const HUBS = [
  "/",
  "/services/",
  "/portfolio/",
  "/process/",
  "/apply/",
  "/about/",
  "/developers/",
  "/ethics-standards/",
  "/terms/",
  "/privacy/",
  "/blog/",
  "/for/established-businesses/",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-19");
  const url = (path: string) => (path === "/" ? SITE.url : `${SITE.url}${path}`);

  const entries: MetadataRoute.Sitemap = HUBS.map((path) => ({
    url: url(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.85,
  }));

  for (const slug of PORTFOLIO_SLUGS) {
    entries.push({
      url: `${SITE.url}/portfolio/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const slug of DEV_SLUGS) {
    entries.push({
      url: `${SITE.url}/developers/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const slug of BLOG_SLUGS) {
    entries.push({
      url: `${SITE.url}/blog/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return entries;
}
