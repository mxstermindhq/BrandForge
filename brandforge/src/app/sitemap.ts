import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export const dynamic = "force-static";

const HUB_ROUTES = [
  "/",
  "/services/",
  "/packages/",
  "/portfolio/",
  "/about/",
  "/contact/",
  "/terms/",
  "/privacy/",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-05-19");

  return HUB_ROUTES.map((path) => ({
    url: path === "/" ? SITE.url : `${SITE.url}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.includes("services") || path.includes("packages") ? 0.9 : 0.7,
  }));
}
