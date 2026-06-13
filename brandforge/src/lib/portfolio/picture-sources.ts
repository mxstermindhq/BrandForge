const IMG_ROOT = "/img/portfolio";

export type PictureSources = {
  avif?: string;
  webp?: string;
  fallback: string;
};

function resolveFilePath(slug: string, file: string): string {
  if (file.startsWith(`${slug}/`)) {
    return `${IMG_ROOT}/${file}`;
  }
  return `/portfolio/${file}`;
}

function webpToAvif(webpPath: string): string {
  return webpPath.replace(/\.webp$/i, ".avif");
}

/** Map a resolved WebP URL to AVIF + WebP + fallback trio. */
export function toPictureSources(url: string | undefined): PictureSources | undefined {
  if (!url) return undefined;
  if (url.includes("/img/portfolio/") && url.endsWith(".webp")) {
    return { avif: webpToAvif(url), webp: url, fallback: url };
  }
  if (url.endsWith(".webp")) {
    return { webp: url, avif: webpToAvif(url), fallback: url };
  }
  return { fallback: url };
}

export { resolveFilePath };
