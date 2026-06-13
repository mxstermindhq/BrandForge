import { SCREENSHOT_FILES, SCREENSHOT_GALLERY } from "@/content/portfolio/screenshot-manifest";

type ScreenshotSource = {
  slug: string;
  ogImageUrl?: string;
};

const IMG_ROOT = "/img/portfolio";
const LEGACY_ROOT = "/portfolio";

function resolveFilePath(slug: string, file: string): string {
  if (file.startsWith(`${slug}/`)) {
    return `${IMG_ROOT}/${file}`;
  }
  return legacyPath(file);
}

function legacyPath(filename: string): string {
  return `${LEGACY_ROOT}/${filename}`;
}

/** Prefer /img/portfolio/[slug]/ WebP, then legacy /portfolio/, then remote OG. */
export function resolveProjectScreenshot(project: ScreenshotSource): string | undefined {
  const file = SCREENSHOT_FILES[project.slug];
  if (file) return resolveFilePath(project.slug, file);

  const gallery = SCREENSHOT_GALLERY[project.slug];
  if (gallery?.[0]) return resolveFilePath(project.slug, gallery[0]);

  return project.ogImageUrl;
}

export function resolveProjectGallery(slug: string): readonly string[] {
  const gallery = SCREENSHOT_GALLERY[slug];
  if (gallery?.length) {
    return gallery.map((file) => resolveFilePath(slug, file));
  }
  const primary = SCREENSHOT_FILES[slug];
  if (primary) return [resolveFilePath(slug, primary)];
  return [];
}
