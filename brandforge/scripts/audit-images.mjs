#!/usr/bin/env node
/**
 * Scan public/img for oversized or non-modern formats.
 * Usage: node scripts/audit-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { BF_ROOT, writeLatest } from "./lib/audit-utils.mjs";

const IMG_ROOT = path.join(BF_ROOT, "public/img");
const OUT_DIR = path.join(BF_ROOT, "..", "audit", "images");
const MAX_KB = 200;

function walk(dir) {
  const files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const oversized = [];
const legacy = [];
let totalKb = 0;

if (fs.existsSync(IMG_ROOT)) {
  for (const file of walk(IMG_ROOT)) {
    const kb = fs.statSync(file).size / 1024;
    totalKb += kb;
    const rel = path.relative(path.join(BF_ROOT, "public"), file).replace(/\\/g, "/");
    const ext = path.extname(file).toLowerCase();
    if (kb > MAX_KB) oversized.push({ path: `/${rel}`, kb: Math.round(kb) });
    if ([".jpg", ".jpeg", ".png"].includes(ext) && !file.includes(".webp") && !file.includes(".avif")) {
      legacy.push({ path: `/${rel}`, kb: Math.round(kb), suggest: "Convert to AVIF + WebP" });
    }
  }
}

const report = {
  scannedAt: new Date().toISOString(),
  totalImages: oversized.length + legacy.length,
  totalWeightKb: Math.round(totalKb),
  thresholdKb: MAX_KB,
  oversized,
  legacyFormats: legacy,
  passed: oversized.length === 0,
};

writeLatest(OUT_DIR, report);
console.log(
  `✓ image audit — ${Math.round(totalKb)}KB total, ${oversized.length} oversized, ${legacy.length} legacy formats`,
);

const strict = process.argv.includes("--strict");
if (!report.passed && strict) process.exit(1);
if (!report.passed) console.warn("⚠ image audit warnings (use --strict to fail)");
