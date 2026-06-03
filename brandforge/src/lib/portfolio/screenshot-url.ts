import { SCREENSHOT_FILES } from "@/content/portfolio/screenshot-manifest";

type ScreenshotSource = {
  slug: string;
  ogImageUrl?: string;
};

/** Local manifest first, then remote OG — gradients used when both missing. */
export function resolveProjectScreenshot(project: ScreenshotSource): string | undefined {
  const file = SCREENSHOT_FILES[project.slug];
  if (file) {
    return `/portfolio/${file}`;
  }
  return project.ogImageUrl;
}
