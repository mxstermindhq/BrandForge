import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// === BRAND MARK SVG ===
// A hexagonal forge/anvil icon with warm gold gradient
const BRAND_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D4A029"/>
      <stop offset="40%" stop-color="#B08D3E"/>
      <stop offset="100%" stop-color="#8A6B2E"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8C860"/>
      <stop offset="100%" stop-color="#C9A64F"/>
    </linearGradient>
  </defs>
  <!-- Hexagon body -->
  <polygon points="256,70 420,150 420,362 256,442 92,362 92,150" fill="url(#g)"/>
  <!-- Anvil top surface -->
  <polygon points="180,180 332,180 360,240 152,240" fill="url(#g2)"/>
  <!-- Anvil horn (left) -->
  <polygon points="152,240 120,270 100,290 120,310 152,310" fill="url(#g)"/>
  <!-- Spark core -->
  <circle cx="300" cy="200" r="14" fill="#EDE7DC" opacity="0.4"/>
  <circle cx="300" cy="200" r="7" fill="#EDE7DC"/>
  <!-- Base line -->
  <polygon points="160,360 352,360 370,380 142,380" fill="#8A6B2E"/>
</svg>`;

// === WORDMARK SVG ===
// "BrandForge" with brand mark to the left
const WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200">
  <defs>
    <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C9A64F"/>
      <stop offset="100%" stop-color="#B08D3E"/>
    </linearGradient>
  </defs>
  <!-- Brand mark -->
  <polygon points="100,40 160,70 160,130 100,160 40,130 40,70" fill="url(#gw)"/>
  <polygon points="72,75 128,75 145,100 55,100" fill="#E8C860"/>
  <polygon points="55,100 40,115 35,125 40,130 55,130" fill="#C9A64F"/>
  <circle cx="130" cy="95" r="5" fill="#EDE7DC" opacity="0.5"/>
  <circle cx="130" cy="95" r="2.5" fill="#EDE7DC"/>
  <polygon points="72,135 128,135 136,145 64,145" fill="#8A6B2E"/>
  <!-- "Brand" | "Forge" stacked -->
  <text x="200" y="95" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" fill="#EDE7DC">Brand</text>
  <text x="200" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" fill="#EDE7DC">Forge</text>
  <text x="455" y="165" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="14" fill="#756E64" letter-spacing="2">DESIGN · DEV · GROWTH</text>
</svg>`;

async function main() {
  const outDir = path.join(__dirname, "..", "public", "img");
  const siteSourceDir = path.join(__dirname, "..", "..", "site", "scripts", "source");

  // Write SVGs to temp files
  const markSvgPath = path.join(outDir, "brand-mark.svg");
  const wordmarkSvgPath = path.join(outDir, "logo-wordmark.svg");
  fs.writeFileSync(markSvgPath, BRAND_MARK_SVG);
  fs.writeFileSync(wordmarkSvgPath, WORDMARK_SVG);

  // Generate brandforge favicon assets from SVG
  const mark = sharp(Buffer.from(BRAND_MARK_SVG));
  const markPng = await mark.clone().png().toBuffer();

  await Promise.all([
    sharp(markPng).resize(16, 16).png().toFile(path.join(outDir, "favicon-16x16.png")),
    sharp(markPng).resize(32, 32).png().toFile(path.join(outDir, "favicon-32x32.png")),
    sharp(markPng).resize(180, 180).png().toFile(path.join(outDir, "apple-touch-icon.png")),
    sharp(markPng).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(outDir, "logo-mark-512.png")),
    sharp(markPng).resize(64, 64).png({ compressionLevel: 9 }).toFile(path.join(outDir, "logo-nav.png")),
    sharp(markPng).resize(192, 192).png().toFile(path.join(outDir, "android-chrome-192x192.png")),
    sharp(markPng).resize(384, 384).png().toFile(path.join(outDir, "android-chrome-384x384.png")),
  ]);
  await sharp(path.join(outDir, "favicon-32x32.png")).toFile(path.join(outDir, "..", "favicon.ico"));

  // Generate wordmark (header logo)
  const wordmark = sharp(Buffer.from(WORDMARK_SVG));
  const wordmarkPng = await wordmark.clone().resize({ height: 100 }).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(outDir, "logo-header.png"), wordmarkPng);

  // Also generate optimized webp/avif
  await sharp(wordmarkPng).resize(400, 100).webp({ quality: 85 }).toFile(path.join(outDir, "logo-header.webp"));
  await sharp(wordmarkPng).resize(400, 100).avif({ quality: 70 }).toFile(path.join(outDir, "logo-header.avif"));

  // Resize logo-mark to webp/avif
  await sharp(markPng).resize(512, 512).webp({ quality: 85 }).toFile(path.join(outDir, "logo-mark-512.webp"));
  await sharp(markPng).resize(512, 512).avif({ quality: 70 }).toFile(path.join(outDir, "logo-mark-512.avif"));

  // OG image (simple brand forge background)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="ogbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0E0B09"/>
        <stop offset="100%" stop-color="#1A1510"/>
      </linearGradient>
      <linearGradient id="ogg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D4A029"/>
        <stop offset="100%" stop-color="#B08D3E"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#ogbg)"/>
    <polygon points="600,120 740,210 740,420 600,510 460,420 460,210" fill="url(#ogg)" opacity="0.15"/>
    <polygon points="600,180 680,240 680,400 600,460 520,400 520,240" fill="url(#ogg)"/>
    <text x="600" y="340" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="64" fill="#EDE7DC">BrandForge</text>
    <text x="600" y="390" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="400" font-size="20" fill="#B8AFA3">Design · Development · Growth Studio</text>
  </svg>`;
  const ogSharp = sharp(Buffer.from(ogSvg));
  await ogSharp.clone().resize(1200, 630).png().toFile(path.join(outDir, "og-image.png"));
  await ogSharp.clone().resize(1200, 630).webp({ quality: 85 }).toFile(path.join(outDir, "og-image.webp"));
  await ogSharp.clone().resize(1200, 630).avif({ quality: 70 }).toFile(path.join(outDir, "og-image.avif"));

  // Copy to site/img/ for the static site
  const siteImgDir = path.join(__dirname, "..", "..", "site", "img");
  if (fs.existsSync(siteImgDir)) {
    const files = ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "logo-mark-512.png", "logo-nav.png", "logo-header.png", "og-image.png"];
    for (const f of files) {
      fs.copyFileSync(path.join(outDir, f), path.join(siteImgDir, f));
    }
    await sharp(path.join(outDir, "favicon-32x32.png")).toFile(path.join(siteImgDir, "..", "favicon.ico"));
  }

  // Copy to site/source for regeneration
  if (fs.existsSync(siteSourceDir)) {
    const markSrcBuf = await sharp(Buffer.from(BRAND_MARK_SVG)).resize(1536, 1024).png().toBuffer();
    const wordmarkSrcBuf = await sharp(Buffer.from(WORDMARK_SVG)).resize(1536, 1024).toBuffer();
    fs.writeFileSync(path.join(siteSourceDir, "logo-mark.png"), markSrcBuf);
    fs.writeFileSync(path.join(siteSourceDir, "logo-wordmark.png"), wordmarkSrcBuf);
  }

  // Copy to mxstermind/public/img/
  const mxstermindImgDir = path.join(__dirname, "..", "..", "mxstermind", "public", "img");
  if (fs.existsSync(mxstermindImgDir)) {
    for (const f of ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "logo-mark-512.png", "logo-nav.png", "logo-header.png", "og-image.png"]) {
      if (fs.existsSync(path.join(outDir, f))) {
        fs.copyFileSync(path.join(outDir, f), path.join(mxstermindImgDir, f));
      }
    }
    await sharp(path.join(outDir, "favicon-32x32.png")).toFile(path.join(mxstermindImgDir, "..", "favicon.ico"));
  }

  // Copy to web/public/
  const webPublicDir = path.join(__dirname, "..", "..", "web", "public");
  if (fs.existsSync(webPublicDir)) {
    for (const f of ["favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "og-image.png"]) {
      if (fs.existsSync(path.join(outDir, f))) {
        fs.copyFileSync(path.join(outDir, f), path.join(webPublicDir, f));
      }
    }
    await sharp(path.join(outDir, "favicon-32x32.png")).toFile(path.join(webPublicDir, "favicon.ico"));
  }

  console.log("All brand assets generated and distributed.");
}

main().catch(e => { console.error(e); process.exit(1); });
