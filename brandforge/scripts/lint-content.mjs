#!/usr/bin/env node
/**
 * Validates content slugs, meta lengths, and required fields.
 * Usage: node scripts/lint-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src", "content");

const errors = [];

function read(file) {
  return fs.readFileSync(path.join(src, file), "utf8");
}

function extractSlugs(ts, pattern) {
  return [...ts.matchAll(pattern)].map((m) => m[1]);
}

// Portfolio
const portfolioTs = read("portfolio/projects.ts");
const portfolioSlugs = extractSlugs(portfolioTs, /slug:\s*"([^"]+)"/g);
const portfolioUnique = new Set(portfolioSlugs);
if (portfolioUnique.size !== portfolioSlugs.length) {
  errors.push("Duplicate portfolio slugs detected");
}
if (portfolioSlugs.length < 25) {
  errors.push(`Expected ≥25 portfolio projects, found ${portfolioSlugs.length}`);
}

// Blog — read index and count slug keys
const blogTs = read("blog/index.ts");
const blogSlugs = extractSlugs(blogTs, /^\s+slug: "([^"]+)"/gm);
const blogUnique = new Set(blogSlugs);
if (blogUnique.size !== blogSlugs.length) {
  errors.push("Duplicate blog slugs detected");
}
if (blogSlugs.length + (blogTs.includes("BUILD_IN_PUBLIC_01") ? 1 : 0) < 14) {
  errors.push(`Expected ≥14 blog posts, found ${blogSlugs.length + (blogTs.includes("BUILD_IN_PUBLIC_01") ? 1 : 0)}`);
}

// Meta description length (rough parse)
for (const match of blogTs.matchAll(/metaDescription:\s*\n?\s*"([^"]+)"/g)) {
  const len = match[1].length;
  if (len < 50 || len > 165) {
    errors.push(`Blog metaDescription length ${len} out of range (50–165): "${match[1].slice(0, 40)}…"`);
  }
}

// Package keys in home.ts
const homeTs = read("home.ts");
const packageKeys = extractSlugs(homeTs, /key:\s*"([^"]+)"/g);
const requiredPackages = [
  "blueprint",
  "automator",
  "mvp-engine",
  "ai-community",
  "full-stack-enterprise",
];
for (const key of requiredPackages) {
  if (!packageKeys.includes(key)) {
    errors.push(`Missing package key in home.ts: ${key}`);
  }
}

if (errors.length) {
  console.error("lint-content failed:\n");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}

console.log(
  `✓ content OK — ${portfolioSlugs.length} portfolio, ${blogSlugs.length} blog, ${packageKeys.length} packages`,
);
