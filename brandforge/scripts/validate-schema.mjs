#!/usr/bin/env node
/**
 * Validate JSON-LD in exported HTML.
 * Usage: node scripts/validate-schema.mjs [--dir out]
 */
import fs from "node:fs";
import path from "node:path";
import { BF_ROOT, writeLatest } from "./lib/audit-utils.mjs";

const outDir = process.argv.includes("--dir")
  ? process.argv[process.argv.indexOf("--dir") + 1]
  : path.join(BF_ROOT, "out");

const REQUIRED = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  FAQPage: ["mainEntity"],
  Service: ["name", "description"],
  Product: ["name"],
  Article: ["headline"],
  CreativeWork: ["name"],
  HowTo: ["name", "step"],
  BreadcrumbList: ["itemListElement"],
  Review: ["reviewRating"],
};

function htmlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...htmlFiles(full));
    else if (e.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const SKIP_NO_SCHEMA = new Set(["/admin/", "/launch/", "/offline.html", "/404.html"]);

function pathFromFile(file) {
  const rel = path.relative(outDir, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel === "offline.html") return "/offline.html";
  if (rel === "404.html") return "/404.html";
  return `/${rel.replace(/index\.html$/, "").replace(/\/$/, "")}/`;
}

function validateBlock(block, pagePath) {
  const type = block["@type"];
  const types = Array.isArray(type) ? type : [type];
  const issues = [];
  for (const t of types) {
    const req = REQUIRED[t];
    if (!req) continue;
    for (const field of req) {
      if (block[field] === undefined || block[field] === null) {
        issues.push({ page: pagePath, type: t, missing: field });
      }
    }
  }
  return issues;
}

const results = [];
let pass = 0;
let fail = 0;

for (const file of htmlFiles(outDir)) {
  const pagePath = pathFromFile(file);
  const html = fs.readFileSync(file, "utf8");
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (scripts.length === 0) {
    if (!SKIP_NO_SCHEMA.has(pagePath)) {
      results.push({ page: pagePath, status: "warn", message: "No JSON-LD found" });
    } else {
      results.push({ page: pagePath, status: "skip", message: "No schema required" });
    }
    continue;
  }

  const pageIssues = [];
  for (const m of scripts) {
    try {
      const json = JSON.parse(m[1]);
      const blocks = json["@graph"] ?? [json];
      for (const block of blocks) {
        pageIssues.push(...validateBlock(block, pagePath));
      }
    } catch {
      pageIssues.push({ page: pagePath, status: "error", message: "Invalid JSON-LD" });
    }
  }

  if (pageIssues.length) {
    results.push({ page: pagePath, status: "fail", issues: pageIssues });
    fail += 1;
  } else {
    results.push({ page: pagePath, status: "pass", blocks: scripts.length });
    pass += 1;
  }
}

const report = {
  validatedAt: new Date().toISOString(),
  directory: outDir,
  total: pass + fail,
  pass,
  fail,
  warn: results.filter((r) => r.status === "warn").length,
  pages: results,
};

writeLatest(path.join(BF_ROOT, "..", "audit", "schema"), report);
console.log(`✓ schema validation — ${pass} pass, ${fail} fail, ${report.warn} warn`);
if (fail > 0) process.exit(1);
