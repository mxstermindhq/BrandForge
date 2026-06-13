#!/usr/bin/env node
/**
 * AVIF + WebP from public/portfolio sources and existing WebP outputs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public", "portfolio");
const outRoot = path.join(root, "public", "img", "portfolio");

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

const MAX_WIDTH = 1200;
const WEBP_TARGET_KB = 150;
const AVIF_TARGET_KB = 120;

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("✗ sharp not installed");
  process.exit(1);
}

async function encode(inputPath, outputPath, format) {
  const targetKb = format === "avif" ? AVIF_TARGET_KB : WEBP_TARGET_KB;
  let quality = format === "avif" ? 50 : 82;
  const pipeline = () =>
    sharp(inputPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });

  let buffer =
    format === "avif"
      ? await pipeline().avif({ quality, effort: 4 }).toBuffer()
      : await pipeline().webp({ quality }).toBuffer();

  while (buffer.length > targetKb * 1024 && quality > 30) {
    quality -= format === "avif" ? 6 : 8;
    buffer =
      format === "avif"
        ? await pipeline().avif({ quality, effort: 4 }).toBuffer()
        : await pipeline().webp({ quality }).toBuffer();
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
    const srcPath = path.join(srcDir, files[i]);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  skip missing ${files[i]}`);
      continue;
    }
    const base = i === 0 ? "hero" : String(i);
    const webpPath = path.join(outDir, `${base}.webp`);
    const avifPath = path.join(outDir, `${base}.avif`);
    const w = await encode(srcPath, webpPath, "webp");
    const a = await encode(srcPath, avifPath, "avif");
    names.push(`${slug}/${base}.webp`);
    console.log(
      `  ✓ ${slug}/${base} — webp ${Math.round(w.bytes / 1024)}KB · avif ${Math.round(a.bytes / 1024)}KB`,
    );
  }

  if (names.length) {
    manifestPrimary[slug] = names[0];
    manifestGallery[slug] = names;
  }
}

// AVIF pass on existing webp-only outputs
for (const dir of fs.readdirSync(outRoot, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const slugDir = path.join(outRoot, dir.name);
  for (const file of fs.readdirSync(slugDir).filter((f) => f.endsWith(".webp"))) {
    const avifName = file.replace(/\.webp$/, ".avif");
    if (fs.existsSync(path.join(slugDir, avifName))) continue;
    await encode(path.join(slugDir, file), path.join(slugDir, avifName), "avif");
    console.log(`  ✓ ${dir.name}/${avifName} (from existing webp)`);
  }
}

const manifestPath = path.join(root, "src", "content", "portfolio", "optimized-manifest.json");
fs.writeFileSync(
  manifestPath,
  JSON.stringify({ primary: manifestPrimary, gallery: manifestGallery }, null, 2),
);
console.log(`\n✓ ${Object.keys(manifestPrimary).length} slugs · AVIF + WebP`);
