#!/usr/bin/env node
/** Site-wide AVIF/WebP for logo + OG image. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = path.join(root, "public", "img");

const TARGETS = [
  { src: "logo-header.png", maxWidth: 480, webpKb: 40, avifKb: 32 },
  { src: "og-image.png", maxWidth: 1200, webpKb: 120, avifKb: 100 },
  { src: "logo-mark-512.png", maxWidth: 512, webpKb: 60, avifKb: 48 },
];

const sharp = (await import("sharp")).default;

async function convert({ src, maxWidth, webpKb, avifKb }) {
  const input = path.join(imgDir, src);
  if (!fs.existsSync(input)) {
    console.warn(`skip ${src}`);
    return;
  }
  const base = src.replace(/\.[^.]+$/, "");

  for (const [format, targetKb] of [
    ["webp", webpKb],
    ["avif", avifKb],
  ]) {
    let quality = format === "avif" ? 50 : 82;
    const out = path.join(imgDir, `${base}.${format}`);
    const pipe = () => sharp(input).resize({ width: maxWidth, withoutEnlargement: true });
    let buffer =
      format === "avif"
        ? await pipe().avif({ quality, effort: 4 }).toBuffer()
        : await pipe().webp({ quality }).toBuffer();
    while (buffer.length > targetKb * 1024 && quality > 28) {
      quality -= 6;
      buffer =
        format === "avif"
          ? await pipe().avif({ quality, effort: 4 }).toBuffer()
          : await pipe().webp({ quality }).toBuffer();
    }
    fs.writeFileSync(out, buffer);
    console.log(`✓ ${base}.${format} — ${Math.round(buffer.length / 1024)}KB`);
  }
}

for (const t of TARGETS) await convert(t);
