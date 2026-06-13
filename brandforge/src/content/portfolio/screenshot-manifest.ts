/**
 * Portfolio screenshots — optimized WebP in public/img/portfolio/[slug]/
 * Run `npm run optimize:portfolio` after adding source PNGs to public/portfolio/
 */
import optimized from "./optimized-manifest.json";

const LEGACY_FILES: Partial<Record<string, string>> = {
  carspotlive: "carspotlive.webp.jpg",
  whiteskyhosting: "whiteskyhosting.png",
  "drain-cx": "drain-cx.png",
  directfiber: "DirectFiber.png",
  boostingfactory: "boostingfactory.png",
  "fluorite-store": "flueritestore.png",
};

const LEGACY_GALLERY: Partial<Record<string, readonly string[]>> = {
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

type OptimizedManifest = {
  primary: Record<string, string>;
  gallery: Record<string, string[]>;
};

const opt = optimized as OptimizedManifest;

/** Paths relative to /img/portfolio/ — e.g. carspotlive/hero.webp */
export const SCREENSHOT_FILES: Partial<Record<string, string>> = {
  ...LEGACY_FILES,
  ...opt.primary,
};

export const SCREENSHOT_GALLERY: Partial<Record<string, readonly string[]>> = {
  ...LEGACY_GALLERY,
  ...opt.gallery,
};
