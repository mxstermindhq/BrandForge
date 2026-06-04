import {
  SCREENSHOT_FILES,
  SCREENSHOT_GALLERY,
} from "@/content/portfolio/screenshot-manifest";

type ScreenshotSource = {
  slug: string;
  ogImageUrl?: string;
};

function portfolioAssetPath(filename: string): string {
  return `/portfolio/${filename}`;
}

/** Local manifest first, then remote OG — gradients used when both missing. */
export function resolveProjectScreenshot(project: ScreenshotSource): string | undefined {
  const file = SCREENSHOT_FILES[project.slug];
  if (file) {
    return portfolioAssetPath(file);
  }
  const gallery = SCREENSHOT_GALLERY[project.slug];
  if (gallery?.[0]) {
    return portfolioAssetPath(gallery[0]);
  }
  return project.ogImageUrl;
}

/** All local shots for a slug (case study grid). Empty when none registered. */
export function resolveProjectGallery(slug: string): readonly string[] {
  const gallery = SCREENSHOT_GALLERY[slug];
  if (gallery?.length) {
    return gallery.map(portfolioAssetPath);
  }
  const primary = SCREENSHOT_FILES[slug];
  if (primary) {
    return [portfolioAssetPath(primary)];
  }
  return [];
}
