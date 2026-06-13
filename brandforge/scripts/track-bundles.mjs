#!/usr/bin/env node
/**
 * Record JS/CSS bundle sizes per route after build.
 * Usage: node scripts/track-bundles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  BF_ROOT,
  AUDIT_ROOT,
  OUT_DIR,
  readJson,
  writeLatest,
  walkDir,
} from "./lib/audit-utils.mjs";

const BUNDLE_DIR = path.join(AUDIT_ROOT, "bundles");
const CHUNKS_DIR = path.join(OUT_DIR, "_next/static/chunks");

function fileSizeKb(filePath) {
  return Math.round((fs.statSync(filePath).size / 1024) * 10) / 10;
}

function routeFromAppChunk(name) {
  const m = name.match(/^app\/(.+?)(?:\/page|-[a-f0-9]+)?\.js$/);
  if (!m) return null;
  const seg = m[1].replace(/\(content\)\//g, "").replace(/\[slug\]/g, ":slug");
  if (seg === "page") return "/";
  return `/${seg}/`;
}

function collectChunks() {
  const appDir = path.join(CHUNKS_DIR, "app");
  const routes = {};
  let totalJsKb = 0;

  if (fs.existsSync(appDir)) {
    for (const file of walkDir(appDir, ".js")) {
      const rel = path.relative(appDir, file).replace(/\\/g, "/");
      const kb = fileSizeKb(file);
      totalJsKb += kb;
      const route = routeFromAppChunk(rel);
      if (route) {
        routes[route] = (routes[route] ?? 0) + kb;
      }
    }
  }

  for (const file of walkDir(CHUNKS_DIR, ".js")) {
    if (file.includes(`${path.sep}app${path.sep}`)) continue;
    totalJsKb += fileSizeKb(file);
  }

  const cssDir = path.join(OUT_DIR, "_next/static/css");
  let totalCssKb = 0;
  for (const file of walkDir(cssDir, ".css")) {
    totalCssKb += fileSizeKb(file);
  }

  let imgKb = 0;
  for (const file of walkDir(path.join(OUT_DIR, "img"))) {
    imgKb += fileSizeKb(file);
  }

  return { routes, totalJsKb: Math.round(totalJsKb), totalCssKb: Math.round(totalCssKb), imgKb: Math.round(imgKb) };
}

function compareHomeGrowth(current, previous) {
  const home = current.routes["/"] ?? 0;
  const prevHome = previous?.routes?.["/"] ?? 0;
  const delta = Math.round((home - prevHome) * 10) / 10;
  return { homeKb: home, prevHomeKb: prevHome, deltaKb: delta, regressed: delta > 10 };
}

if (!fs.existsSync(OUT_DIR)) {
  console.error("track-bundles: run after `npm run build` — out/ missing");
  process.exit(1);
}

const previous = readJson(path.join(BUNDLE_DIR, "latest.json"));
const collected = collectChunks();
const homeCompare = compareHomeGrowth(collected, previous);

const report = {
  recordedAt: new Date().toISOString(),
  ...collected,
  homeRoute: homeCompare,
  flags: homeCompare.regressed ? [`Home route JS grew ${homeCompare.deltaKb}KB (>10KB threshold)`] : [],
};

const ts = writeLatest(BUNDLE_DIR, report);
console.log(`✓ bundles tracked — home ${homeCompare.homeKb}KB JS, total ${collected.totalJsKb}KB → audit/bundles/latest.json (${ts})`);

if (homeCompare.regressed) {
  console.warn(`⚠ Home bundle regression: +${homeCompare.deltaKb}KB`);
}
