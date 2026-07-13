#!/usr/bin/env node
/**
 * Validates content slugs, meta, duplicates, and minimum counts.
 * Usage: node scripts/lint-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest } from "./lib/parse-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const manifest = buildManifest(root);

function allSlugs() {
  const slugs = [
    ...manifest.blogPosts.map((p) => `blog:${p.slug}`),
    ...manifest.portfolio.map((p) => `portfolio:${p.slug}`),
    ...manifest.nichePages.map((p) => `niche:${p.slug}`),
    ...manifest.servicePages.map((p) => `service:${p.slug}`),
    ...manifest.roadmap.map((p) => `roadmap:${p.slug}`),
  ];
  return slugs;
}

const slugs = allSlugs();
const bare = slugs.map((s) => s.split(":")[1]);
for (const slug of bare) {
  if (bare.filter((s) => s === slug).length > 1) {
    errors.push(`Duplicate slug across categories: ${slug}`);
  }
}

if (manifest.portfolio.length < 20) {
  errors.push(`Expected ≥20 portfolio projects, found ${manifest.portfolio.length}`);
}
if (manifest.total < 20) {
  errors.push(`Expected ≥20 indexable pages, found ${manifest.total}`);
}

for (const post of manifest.blogPosts) {
  if (!post.title) errors.push(`Blog missing title: ${post.slug}`);
  if (!post.description || post.description.length < 50 || post.description.length > 165) {
    errors.push(`Blog metaDescription invalid (${post.description?.length ?? 0}): ${post.slug}`);
  }
  if (post.title.length > 65) {
    errors.push(`Blog metaTitle too long (${post.title.length}): ${post.slug}`);
  }
}

// FAQ count on posts/*.ts (expect ≥4)
const postsDir = path.join(root, "src", "content", "blog", "posts");
if (fs.existsSync(postsDir)) {
  for (const f of fs.readdirSync(postsDir).filter((x) => x.endsWith(".ts") && x !== "index.ts")) {
    const text = fs.readFileSync(path.join(postsDir, f), "utf8");
    const faqCount = (text.match(/question:/g) ?? []).length;
    if (faqCount < 4) errors.push(`Blog post ${f} has ${faqCount} FAQs (need ≥4)`);
  }
}

for (const page of manifest.nichePages) {
  if (!page.title || !page.description) {
    errors.push(`Niche missing meta: ${page.slug}`);
  }
}

for (const page of manifest.servicePages) {
  if (!page.title || !page.description) {
    errors.push(`Service missing meta: ${page.slug}`);
  }
}

// Optional image refs in blog posts
const blogDir = path.join(root, "src", "content", "blog");
function checkImagesInFile(text, context) {
  for (const m of text.matchAll(/ogImage:\s*"([^"]+)"/g)) {
    const img = m[1];
    if (!img.startsWith("/")) continue;
    const disk = path.join(root, "public", img.replace(/^\//, ""));
    if (!fs.existsSync(disk) && !img.includes("og-image.png")) {
      errors.push(`Missing image ${img} (${context})`);
    }
  }
}

if (fs.existsSync(path.join(blogDir, "index.ts"))) {
  checkImagesInFile(fs.readFileSync(path.join(blogDir, "index.ts"), "utf8"), "blog/index.ts");
}
if (fs.existsSync(postsDir)) {
  for (const f of fs.readdirSync(postsDir).filter((x) => x.endsWith(".ts") && x !== "index.ts")) {
    checkImagesInFile(fs.readFileSync(path.join(postsDir, f), "utf8"), f);
  }
}

if (errors.length) {
  console.error("lint-content failed:\n");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}

console.log(
  `✓ content OK — ${manifest.total} pages (${manifest.portfolio.length} portfolio, ${manifest.blogPosts.length} blog, ${manifest.nichePages.length} niches)`,
);
