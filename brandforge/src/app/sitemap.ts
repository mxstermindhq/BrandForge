import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getAllContentEntries } from "@/content/index";

export const dynamic = "force-static";

const PRIORITY: Partial<Record<string, number>> = {
  "/": 1,
  "/services/": 0.9,
  "/packages/": 0.9,
  "/portfolio/": 0.85,
  "/blog/": 0.8,
  "/for/": 0.8,
};

function priorityFor(path: string, category: string): number {
  if (PRIORITY[path] !== undefined) return PRIORITY[path]!;
  if (category === "service") return 0.85;
  if (category === "portfolio") return 0.8;
  if (category === "niche") return 0.75;
  if (category === "roadmap") return 0.75;
  if (category === "blog") return 0.65;
  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  return getAllContentEntries().map((entry) => ({
    url: entry.path === "/" ? SITE.url : `${SITE.url}${entry.path}`,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : buildDate,
    changeFrequency: entry.path === "/" ? "weekly" : "monthly",
    priority: priorityFor(entry.path, entry.category),
  }));
}
