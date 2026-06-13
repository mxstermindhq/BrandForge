#!/usr/bin/env node
/**
 * Crawl sitemap URLs and check internal/external links.
 * Usage: node scripts/check-links.mjs [--base https://brandforge.gg]
 */
import fs from "node:fs";
import path from "node:path";
import { BF_ROOT, writeLatest } from "./lib/audit-utils.mjs";

const base =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ??
  (process.argv.includes("--local") ? "http://localhost:3002" : "https://brandforge.gg");

const sitemapPath = path.join(BF_ROOT, "out/sitemap.xml");
const OUT_DIR = path.join(BF_ROOT, "..", "audit", "links");

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractLinks(html, pageUrl) {
  const internal = [];
  const external = [];
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("/")) internal.push(href);
    else if (href.startsWith("http")) external.push(href);
  }
  return { internal: [...new Set(internal)], external: [...new Set(external)] };
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    return { url, status: 0, ok: false, error: String(err.message ?? err) };
  }
}

let urls = [];
if (fs.existsSync(sitemapPath)) {
  urls = urlsFromSitemap(fs.readFileSync(sitemapPath, "utf8"));
} else {
  const res = await fetch(`${base}/sitemap.xml`);
  urls = urlsFromSitemap(await res.text());
}

const broken = [];
const checked = new Set();

for (const pageUrl of urls.slice(0, 40)) {
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      broken.push({ url: pageUrl, status: res.status, type: "page" });
      continue;
    }
    const html = await res.text();
    const { internal, external } = extractLinks(html, pageUrl);
    for (const link of internal.slice(0, 30)) {
      const abs = new URL(link, pageUrl).href;
      if (checked.has(abs)) continue;
      checked.add(abs);
      const r = await checkUrl(abs);
      if (!r.ok) broken.push({ url: abs, status: r.status, type: "internal", from: pageUrl });
    }
    for (const link of external.slice(0, 10)) {
      if (checked.has(link)) continue;
      checked.add(link);
      const r = await checkUrl(link);
      // 403 often means bot/WAF block — not a dead link for humans
      if (!r.ok && r.status !== 0 && r.status !== 403) {
        broken.push({ url: link, status: r.status, type: "external", from: pageUrl });
      }
    }
  } catch (err) {
    broken.push({ url: pageUrl, status: 0, type: "page", error: String(err.message ?? err) });
  }
}

const report = {
  checkedAt: new Date().toISOString(),
  base,
  pagesSampled: Math.min(urls.length, 40),
  totalSitemapUrls: urls.length,
  linksChecked: checked.size,
  broken,
  passed: broken.length === 0,
};

writeLatest(OUT_DIR, report);
console.log(`✓ link check — ${checked.size} links, ${broken.length} broken`);
if (broken.length) process.exitCode = 1;
