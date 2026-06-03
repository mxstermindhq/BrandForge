/**
 * Lighthouse mobile performance audit for every BrandForge sitemap URL.
 * Usage: node scripts/audit-perf-all.mjs
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "..", "audit", "lh-bf-all");
const SUMMARY_PATH = join(ROOT, "..", "audit", "brandforge-perf-all.json");

const BASE = "https://brandforge.gg";

const HUBS = [
  "/",
  "/services/",
  "/packages/",
  "/portfolio/",
  "/about/",
  "/contact/",
  "/roadmap/",
  "/blog/",
  "/ethics-standards/",
  "/brand-guide/",
  "/privacy/",
  "/terms/",
];

const SERVICE_SLUGS = [
  "brand-identity",
  "web-design",
  "mobile-apps",
  "discord-branding",
  "automation",
  "ai-tools",
  "seo-growth",
  "paid-ads",
  "social-media",
];

const PORTFOLIO_SLUGS = [
  "cascade-markets",
  "drain-cx",
  "carspotlive",
  "dyotravel",
  "sui-blockchain-app",
  "valaccs",
  "whiteskyhosting",
  "linkedin-automation",
];

const ROADMAP_SLUGS = [
  "validate-your-idea",
  "build-your-brand",
  "launch-strategy",
  "grow-your-audience",
  "scale-operations",
  "tools-resources",
];

const NICHE_SLUGS = [
  "gaming-server-owners",
  "web3-crypto-projects",
  "saas-startups",
  "forum-sellers",
  "ecommerce-brands",
  "content-creators",
];

const BLOG_SLUGS = [
  "how-to-build-a-brand-from-scratch-2026",
  "what-is-geo-generative-engine-optimisation",
  "discord-server-branding-complete-guide",
  "how-to-build-a-web-store-gaming-community",
  "forum-marketing-2026-what-still-works",
  "how-we-built-carspotlive-mobile-app-case-study",
  "brand-identity-vs-brand-design-difference",
  "what-is-cro-conversion-rate-optimisation",
  "how-to-choose-a-design-agency-2026",
  "ai-tools-every-operator-should-use",
];

function allPaths() {
  const paths = [...HUBS];
  for (const s of SERVICE_SLUGS) paths.push(`/services/${s}/`);
  for (const s of PORTFOLIO_SLUGS) paths.push(`/portfolio/${s}/`);
  for (const s of ROADMAP_SLUGS) paths.push(`/roadmap/${s}/`);
  for (const s of NICHE_SLUGS) paths.push(`/for/${s}/`);
  for (const s of BLOG_SLUGS) paths.push(`/blog/${s}/`);
  return paths;
}

function slugFromPath(path) {
  return path === "/" ? "home" : path.replace(/\//g, "_").replace(/^_|_$/g, "");
}

function extractMetrics(report) {
  const audits = report.audits ?? {};
  const perf = report.categories?.performance?.score ?? null;
  const num = (id) => audits[id]?.numericValue ?? null;
  return {
    performance: perf !== null ? Math.round(perf * 100) : null,
    lcp: num("largest-contentful-paint"),
    tbt: num("total-blocking-time"),
    cls: num("cumulative-layout-shift"),
    fcp: num("first-contentful-paint"),
    si: num("speed-index"),
  };
}

mkdirSync(OUT_DIR, { recursive: true });

const paths = allPaths();
const results = [];
let i = 0;

for (const path of paths) {
  i += 1;
  const slug = slugFromPath(path);
  const url = path === "/" ? BASE : `${BASE}${path}`;
  const outFile = join(OUT_DIR, `${slug}.json`);

  process.stdout.write(`[${i}/${paths.length}] ${path} ... `);

  if (existsSync(outFile)) {
    try {
      const cached = JSON.parse(readFileSync(outFile, "utf8"));
      const m = extractMetrics(cached);
      results.push({ path, url, ...m, cached: true });
      console.log(`cached perf=${m.performance}`);
      continue;
    } catch {
      /* re-run */
    }
  }

  try {
    execSync(
      `npx lighthouse "${url}" --preset=perf --only-categories=performance --output=json --output-path="${outFile}" --form-factor=mobile --screenEmulation.mobile=true --quiet --chrome-flags="--headless --no-sandbox"`,
      { stdio: "pipe", timeout: 180000, cwd: ROOT },
    );
    const report = JSON.parse(readFileSync(outFile, "utf8"));
    const m = extractMetrics(report);
    results.push({ path, url, ...m, cached: false });
    console.log(`perf=${m.performance} LCP=${m.lcp?.toFixed(0)}ms CLS=${m.cls?.toFixed(3)}`);
  } catch (err) {
    console.log(`FAILED`);
    results.push({ path, url, error: String(err.message ?? err), performance: null });
  }
}

results.sort((a, b) => (a.performance ?? -1) - (b.performance ?? -1));

const summary = {
  auditedAt: new Date().toISOString(),
  domain: "brandforge.gg",
  formFactor: "mobile",
  total: paths.length,
  succeeded: results.filter((r) => r.performance !== null).length,
  failed: results.filter((r) => r.error).length,
  avgPerformance: Math.round(
    results.filter((r) => r.performance !== null).reduce((s, r) => s + r.performance, 0) /
      results.filter((r) => r.performance !== null).length,
  ),
  pages: results,
};

writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));
console.log(`\nWrote ${SUMMARY_PATH}`);
