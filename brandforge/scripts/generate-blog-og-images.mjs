#!/usr/bin/env node
/** Generate blog OG hero images (1200×630) — run from build or manually. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "img", "blog");
fs.mkdirSync(outDir, { recursive: true });

const POSTS = [
  {
    slug: "the-state-of-things-2026",
    title: "The State of Things",
    subtitle: "10 problems. 10 solutions. One question.",
  },
];

const sharp = (await import("sharp")).default;

function svgFor({ title, subtitle }) {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#060608"/>
      <stop offset="100%" style="stop-color:#12101a"/>
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="50%" r="55%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:0.35"/>
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <text x="80" y="120" fill="#9d5fff" font-family="ui-monospace,monospace" font-size="14" letter-spacing="4">BRANDFORGE.GG</text>
  <text x="80" y="280" fill="#e2e0ea" font-family="system-ui,sans-serif" font-size="52" font-weight="700">${title}</text>
  <text x="80" y="340" fill="#a09cb8" font-family="system-ui,sans-serif" font-size="28">${subtitle}</text>
  <text x="80" y="560" fill="#7c3aed" font-family="ui-monospace,monospace" font-size="13" letter-spacing="2">THOUGHT LEADERSHIP · 2026</text>
</svg>`;
}

for (const post of POSTS) {
  const base = path.join(outDir, `${post.slug}-og`);
  const svg = Buffer.from(svgFor(post));
  const png = await sharp(svg).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(svg).webp({ quality: 82 }).toBuffer();
  const avif = await sharp(svg).avif({ quality: 50, effort: 4 }).toBuffer();
  fs.writeFileSync(`${base}.png`, png);
  fs.writeFileSync(`${base}.webp`, webp);
  fs.writeFileSync(`${base}.avif`, avif);
  console.log(`✓ ${post.slug} OG — webp ${Math.round(webp.length / 1024)}KB`);
}
