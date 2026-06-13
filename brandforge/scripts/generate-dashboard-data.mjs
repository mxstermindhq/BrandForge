#!/usr/bin/env node
/**
 * Build admin dashboard JSON from audits + content manifest.
 * Usage: node scripts/generate-dashboard-data.mjs
 * Output: public/admin/dashboard-data.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AUDIT_ROOT,
  BF_ROOT,
  collectLighthouseHistory,
  readJson,
  regressionFlags,
} from "./lib/audit-utils.mjs";
import { buildManifest } from "./lib/parse-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(BF_ROOT, "public/admin/dashboard-data.json");

function countInternalLinks(manifest) {
  const contentDir = path.join(root, "src");
  let corpus = "";
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !e.name.includes("node_modules")) walk(full);
      else if (/\.(tsx?|md)$/.test(e.name)) corpus += fs.readFileSync(full, "utf8");
    }
  }
  walk(contentDir);

  const inbound = {};
  for (const m of corpus.matchAll(/href="(\/[^"#?]*\/?)"/g)) {
    const p = m[1].endsWith("/") ? m[1] : `${m[1]}/`;
    inbound[p] = (inbound[p] ?? 0) + 1;
  }

  const pages = [
    ...manifest.staticRoutes.map((r) => ({ path: r.path, title: r.title, category: "static" })),
    ...manifest.blogPosts.map((p) => ({ ...p, category: "blog" })),
    ...manifest.portfolio.map((p) => ({ ...p, category: "portfolio" })),
    ...manifest.nichePages.map((p) => ({ ...p, category: "niche" })),
    ...manifest.servicePages.map((p) => ({ ...p, category: "service" })),
    ...manifest.roadmap.map((p) => ({ ...p, category: "roadmap" })),
  ];

  return pages.map((p) => ({
    ...p,
    internalLinksIn: inbound[p.path] ?? 0,
    orphan: (inbound[p.path] ?? 0) === 0 && p.path !== "/",
  }));
}

function schemaStatus(category) {
  switch (category) {
    case "service":
      return "Service + FAQ";
    case "blog":
      return "Article + FAQ";
    case "portfolio":
      return "CreativeWork";
    case "roadmap":
      return "HowTo";
    case "static":
      return "WebPage + Org";
    default:
      return "WebPage";
  }
}

function parseContentDates(indexTs) {
  const dates = {};
  for (const m of indexTs.matchAll(/path:\s*"([^"]+)"[\s\S]*?lastModified:\s*"([^"]+)"/g)) {
    dates[m[1]] = m[2];
  }
  return dates;
}

const manifest = buildManifest(root);
const indexTs = fs.readFileSync(path.join(root, "src/content/index.ts"), "utf8");
const dates = parseContentDates(indexTs);
const contentPages = countInternalLinks(manifest).map((p) => ({
  ...p,
  lastModified: dates[p.path] ?? null,
  schema: schemaStatus(p.category),
  schemaOk: true,
}));

const perfAll = readJson(path.join(AUDIT_ROOT, "brandforge-perf-all.json"));
const history = collectLighthouseHistory();
const regressions = regressionFlags(history);

const seoKeywords = [
  { keyword: "discord server branding", pages: ["/services/discord-branding/", "/blog/discord-server-branding-complete-guide/"], position: null, checkedAt: null },
  { keyword: "web3 brand design", pages: ["/for/web3-crypto-projects/", "/services/brand-identity/"], position: null, checkedAt: null },
  { keyword: "forum seller store design", pages: ["/for/forum-sellers/", "/portfolio/forum-commerce-hub/"], position: null, checkedAt: null },
  { keyword: "generative engine optimisation", pages: ["/blog/what-is-geo-generative-engine-optimisation/"], position: null, checkedAt: null },
];

const ga4Snapshot = readJson(path.join(AUDIT_ROOT, "ga4-snapshot.json"), {
  note: "Populate via GA4 Data API in CI or paste exports to audit/ga4-snapshot.json",
  topPages7d: [],
  topPages30d: [],
  conversions: {
    click_discord: null,
    click_package_tier: null,
    click_calendly: null,
    resource_download: null,
    page_conversion: null,
  },
  trafficSources: [],
  devices: { mobile: null, desktop: null },
});

const data = {
  generatedAt: new Date().toISOString(),
  site: "brandforge.gg",
  authNote:
    "Static export — protect /admin/ with Cloudflare Access (recommended) or NEXT_PUBLIC_BF_ADMIN_KEY client gate. Never ship GA credentials in the bundle.",
  lookerStudioUrl: process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL ?? null,
  ga4Property: "G-G3L5EBB195",
  contentStats: {
    total: manifest.total,
    blog: manifest.blogPosts.length,
    portfolio: manifest.portfolio.length,
    niche: manifest.nichePages.length,
    services: manifest.servicePages.length,
    roadmap: manifest.roadmap.length,
    static: manifest.staticRoutes.length,
  },
  lighthouse: {
    history,
    regressions,
    current: perfAll
      ? {
          home: perfAll.pages?.find((p) => p.path === "/") ?? null,
          siteWideAverage: perfAll.avgPerformance,
          auditedAt: perfAll.auditedAt,
          worstPages: [...(perfAll.pages ?? [])]
            .filter((p) => p.performance !== null)
            .sort((a, b) => a.performance - b.performance)
            .slice(0, 10),
        }
      : null,
  },
  bundles: readJson(path.join(AUDIT_ROOT, "bundles/latest.json")),
  images: readJson(path.join(AUDIT_ROOT, "images/latest.json")),
  schema: readJson(path.join(AUDIT_ROOT, "schema/latest.json")),
  links: readJson(path.join(AUDIT_ROOT, "links/latest.json")),
  abTests: readJson(path.join(AUDIT_ROOT, "ab-tests.json")),
  ga4: ga4Snapshot,
  contentPages,
  seoKeywords,
  contentScorecardNote:
    "Page-level views/conversions sync from GA4 → audit/ga4-snapshot.json. Sort scorecard by conversion rate in Looker or update snapshot manually.",
  preDeploy: readJson(path.join(AUDIT_ROOT, "pre-deploy-latest.json")),
  postDeploy: readJson(path.join(AUDIT_ROOT, "post-deploy-latest.json")),
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
console.log(`✓ dashboard-data.json — ${contentPages.length} pages, ${history.length} LH data points`);
