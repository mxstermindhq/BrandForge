/**
 * Portfolio screenshots in public/portfolio/
 *
 * HOW TO ADD YOUR IMAGES:
 * 1. Compress to WebP (or JPG), max ~1280px wide, under 200KB
 * 2. Drop file in brandforge/public/portfolio/
 * 3. Add primary: slug: "filename"
 * 4. Optional gallery: slug: ["file1", "file2", ...] for case study grid
 *
 * See public/portfolio/README.md for full guide.
 */
export const SCREENSHOT_FILES: Partial<Record<string, string>> = {
  carspotlive: "carspotlive.webp.jpg",
};

/** Extra shots for case study “Screenshots & product surfaces” (primary may repeat as hero). */
export const SCREENSHOT_GALLERY: Partial<Record<string, readonly string[]>> = {
  carspotlive: [
    "carspotlive.webp.jpg",
    "carspotlive-1.webp.png",
    "carspotlive-2.webp.png",
    "carspotlive-3.webp.png",
    "carspotlive-4.webp.png",
    "carspotlive-5.webp.jpg",
  ],
};
