import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { BLOG_SLUGS } from "@/content/blog/index";
import { PORTFOLIO_SLUGS } from "@/content/hubs/portfolio-hub";
import { SERVICE_SLUGS } from "@/content/hubs/services-hub";
import { NICHE_SLUGS } from "@/content/niche/pages";
import { ROADMAP_SLUGS } from "@/content/roadmap/stages";

export const dynamic = "force-static";

const HUBS = [
  "/",
  "/services/",
  "/packages/",
  "/portfolio/",
  "/about/",
  "/contact/",
  "/roadmap/",
  "/blog/",
  "/ethics-standards/",
  "/brand-guide/",
  "/privacy/",
  "/terms/",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const url = (path: string) => (path === "/" ? SITE.url : `${SITE.url}${path}`);

  const entries: MetadataRoute.Sitemap = HUBS.map((path) => ({
    url: url(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.85,
  }));

  for (const slug of SERVICE_SLUGS) {
    entries.push({
      url: `${SITE.url}/services/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    });
  }

  for (const slug of PORTFOLIO_SLUGS) {
    entries.push({
      url: `${SITE.url}/portfolio/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const slug of ROADMAP_SLUGS) {
    entries.push({
      url: `${SITE.url}/roadmap/${slug}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  for (const slug of NICHE_SLUGS) {
    entries.push({
      url: `${SITE.url}/for/${slug}/`,
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
