#!/usr/bin/env node
/**
 * Converts public/portfolio/* assets to WebP in public/img/portfolio/[slug]/.
 * Usage: node scripts/optimize-portfolio-images.mjs
 * Requires: npm install sharp (devDependency)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public", "portfolio");
const outRoot = path.join(root, "public", "img", "portfolio");

/** slug → primary source filename in public/portfolio/ */
const SLUG_SOURCES = {
  carspotlive: "carspotlive.webp.jpg",
  whiteskyhosting: "whiteskyhosting.png",
  "drain-cx": "drain-cx.png",
  directfiber: "DirectFiber.png",
  boostingfactory: "boostingfactory.png",
  "fluorite-store": "flueritestore.png",
};

/** slug → gallery filenames (order preserved) */
const SLUG_GALLERIES = {
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
  directfiber: ["DirectFiber.png", "DirectFiber1.png", "DirectFiber2.png", "DirectFiber4.png"],
  boostingfactory: [
    "boostingfactory.png",
    "boostinfactory1.png",
    "boostingfactory2.png",
    "boostingfactory3.png",
  ],
  "fluorite-store": ["flueritestore.png", "fluorite1.png", "fluorite2.png"],
};

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("✗ sharp not installed — run: npm install --save-dev sharp");
  process.exit(1);
}

const MAX_WIDTH = 1200;
const TARGET_KB = 200;

async function toWebp(inputPath, outputPath) {
  let quality = 82;
  let buffer = await sharp(inputPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > TARGET_KB * 1024 && quality > 40) {
    quality -= 8;
    buffer = await sharp(inputPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return { bytes: buffer.length, quality };
}

const manifestPrimary = {};
const manifestGallery = {};

for (const [slug, files] of Object.entries(SLUG_GALLERIES)) {
  const outDir = path.join(outRoot, slug);
  const names = [];

  for (let i = 0; i < files.length; i++) {
    const srcName = files[i];
    const srcPath = path.join(srcDir, srcName);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  skip missing ${srcName}`);
      continue;
    }
    const outName = i === 0 ? "hero.webp" : `${i}.webp`;
    const outPath = path.join(outDir, outName);
    const { bytes, quality } = await toWebp(srcPath, outPath);
    names.push(`${slug}/${outName}`);
    console.log(`  ✓ ${slug}/${outName} — ${Math.round(bytes / 1024)}KB q${quality}`);
  }

  if (names.length) {
    manifestPrimary[slug] = names[0];
    manifestGallery[slug] = names;
  }
}

const manifestPath = path.join(root, "src", "content", "portfolio", "optimized-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify({ primary: manifestPrimary, gallery: manifestGallery }, null, 2));
console.log(`\n✓ Wrote ${Object.keys(manifestPrimary).length} slug folders → public/img/portfolio/`);
console.log(`✓ Manifest: src/content/portfolio/optimized-manifest.json`);
