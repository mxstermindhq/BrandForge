/**
 * Rasterize OG + favicons from SVG sources. Run from `web/`: npm run generate:public-assets
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const iconSvg = readFileSync(join(root, "src/app/icon.svg"));
const ogSvg = readFileSync(join(publicDir, "og-image.svg"));

async function main() {
  await sharp(ogSvg).resize(1200, 630).png().toFile(join(publicDir, "og-image.png"));

  const sizes = [
    ["favicon-16x16.png", 16],
    ["favicon-32x32.png", 32],
    ["apple-touch-icon.png", 180],
    ["android-chrome-192x192.png", 192],
    ["android-chrome-512x512.png", 512],
  ];
  let buf16;
  let buf32;
  for (const [name, size] of sizes) {
    const buf = await sharp(iconSvg).resize(size, size).png().toBuffer();
    await sharp(buf).toFile(join(publicDir, name));
    if (size === 16) buf16 = buf;
    if (size === 32) buf32 = buf;
  }
  if (buf16 && buf32) {
    const ico = await pngToIco([buf16, buf32]);
    writeFileSync(join(publicDir, "favicon.ico"), ico);
  }

  console.log("Wrote og-image.png, favicon set, and site.webmanifest targets under public/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
