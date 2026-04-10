const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif|ico)(\?|#|$)/i;

/**
 * Returns a URL only when it is plausibly an image asset (not an SPA route stored by mistake).
 */
export function safeImageSrc(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const t = url.trim();
  if (t.startsWith("data:image/")) return t;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const path = u.pathname;
    const hasImageExt = IMAGE_EXT_RE.test(path);
    if (u.hash && u.hash.length > 1 && !hasImageExt) return null;
    if (hasImageExt) return t;
    if (path.includes("/storage/v1/object/")) return t;
    if (/googleusercontent\.com$/i.test(u.hostname)) return t;
    if (/cloudinary\.com$/i.test(u.hostname)) return t;
    if (/gravatar\.com$/i.test(u.hostname) && path.includes("/avatar")) return t;
    if (/githubusercontent\.com$/i.test(u.hostname)) return t;
    if (/\.supabase\.co$/i.test(u.hostname) && path.includes("/object/")) return t;
    return null;
  } catch {
    return null;
  }
}

export function safeImageSrcOr(url: string | null | undefined, fallback: string): string {
  return safeImageSrc(url) ?? fallback;
}
