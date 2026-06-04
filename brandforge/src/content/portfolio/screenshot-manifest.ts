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
  whiteskyhosting: "whiteskyhosting.png",
  "drain-cx": "drain-cx.png",
  directfiber: "DirectFiber.png",
  boostingfactory: "boostingfactory.png",
  "fluorite-store": "flueritestore.png",
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
  whiteskyhosting: [
    "whiteskyhosting.png",
    "whiteskyhosting-1.png",
    "whiteskyhosting-2.png",
    "whiteskyhosting-3.png",
  ],
  "drain-cx": ["drain-cx.png", "drain-cx1.png", "drain-cx2.png", "drain-cx3.png"],
  directfiber: [
    "DirectFiber.png",
    "DirectFiber1.png",
    "DirectFiber2.png",
    "DirectFiber4.png",
  ],
  boostingfactory: [
    "boostingfactory.png",
    "boostinfactory1.png",
    "boostingfactory2.png",
    "boostingfactory3.png",
  ],
  "fluorite-store": ["flueritestore.png", "fluorite1.png", "fluorite2.png"],
};
