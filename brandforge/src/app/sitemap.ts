import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getAllContentEntries } from "@/content/index";

export const dynamic = "force-static";

const PRIORITY: Partial<Record<string, number>> = {
  "/": 1,
  "/portfolio/": 0.9,
};

function priorityFor(path: string, category: string): number {
  if (PRIORITY[path] !== undefined) return PRIORITY[path]!;
  if (category === "portfolio") return 0.85;
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
