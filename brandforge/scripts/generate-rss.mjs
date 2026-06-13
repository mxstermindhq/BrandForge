#!/usr/bin/env node
/**
 * Generates public/rss.xml from blog manifest at build time.
 * Usage: node scripts/generate-rss.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest, readContentFile } from "./lib/parse-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogTs = readContentFile(root, "blog/index.ts");
const postsDir = path.join(root, "src", "content", "blog", "posts");
const manifest = buildManifest(root);

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dateForSlug(slug) {
  const inline = blogTs.match(new RegExp(`"${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":[\\s\\S]*?datePublished:\\s*"([^"]+)"`));
  if (inline) return inline[1];
  if (fs.existsSync(postsDir)) {
    const file = fs.readdirSync(postsDir).find((f) => f.includes(slug.slice(0, 20)));
    if (file) {
      const text = fs.readFileSync(path.join(postsDir, file), "utf8");
      const d = text.match(/datePublished:\s*"([^"]+)"/)?.[1];
      if (d) return d;
    }
  }
  return "2026-06-13";
}

const items = manifest.blogPosts
  .map((p) => ({ ...p, date: dateForSlug(p.slug) }))
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>https://brandforge.gg${p.path}</link>
      <guid isPermaLink="true">https://brandforge.gg${p.path}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`,
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BrandForge Blog</title>
    <link>https://brandforge.gg/blog/</link>
    <description>Operator guides on brand, GEO, Discord, forums, and growth.</description>
    <language>en-us</language>
    <atom:link href="https://brandforge.gg/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

const out = path.join(root, "public", "rss.xml");
fs.writeFileSync(out, rss);
console.log(`✓ rss.xml — ${manifest.blogPosts.length} items`);
