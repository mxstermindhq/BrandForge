/**
 * Lighthouse mobile performance audit for every BrandForge sitemap URL.
 * Usage: node scripts/audit-perf-all.mjs [--fresh]
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
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

/** Extract quoted slugs from TS content modules — stays in sync with sitemap. */
function slugsFromFile(relativePath, pattern = /slug:\s*"([^"]+)"/g) {
  const text = readFileSync(join(ROOT, relativePath), "utf8");
  return [...text.matchAll(pattern)].map((m) => m[1]);
}

function blogSlugsFromFile() {
  const text = readFileSync(join(ROOT, "src/content/blog/index.ts"), "utf8");
  return [...text.matchAll(/^\s+"([^"]+)":\s*\{/gm)].map((m) => m[1]);
}

const SERVICE_SLUGS = slugsFromFile("src/content/hubs/services-hub.ts");
const PORTFOLIO_SLUGS = slugsFromFile("src/content/portfolio/projects.ts");
const ROADMAP_SLUGS = slugsFromFile("src/content/roadmap/stages.ts");
const NICHE_SLUGS = slugsFromFile("src/content/niche/pages.ts");
const BLOG_SLUGS = blogSlugsFromFile();

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

const fresh = process.argv.includes("--fresh");
const fast = process.argv.includes("--fast");
if (fresh && existsSync(OUT_DIR)) {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
}

let paths = allPaths();
if (fast) {
  const sample = paths.filter((p) => p !== "/").sort(() => Math.random() - 0.5).slice(0, 5);
  paths = ["/", ...sample];
  console.log(`--fast mode: auditing ${paths.length} URLs (home + 5 random)\n`);
} else {
  console.log(
    `Auditing ${paths.length} URLs (${PORTFOLIO_SLUGS.length} portfolio, ${BLOG_SLUGS.length} blog)…\n`,
  );
}

const results = [];
let i = 0;

for (const path of paths) {
  i += 1;
  const slug = slugFromPath(path);
  const url = path === "/" ? BASE : `${BASE}${path}`;
  const outFile = join(OUT_DIR, `${slug}.json`);

  process.stdout.write(`[${i}/${paths.length}] ${path} ... `);

  if (existsSync(outFile) && !fresh) {
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
  slugCounts: {
    portfolio: PORTFOLIO_SLUGS.length,
    blog: BLOG_SLUGS.length,
    services: SERVICE_SLUGS.length,
  },
  pages: results,
};

writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));

if (fast) {
  const preDeployPath = join(ROOT, "..", "audit", "pre-deploy-latest.json");
  const home = results.find((r) => r.path === "/");
  const existing = existsSync(preDeployPath)
    ? JSON.parse(readFileSync(preDeployPath, "utf8"))
    : {};
  writeFileSync(
    preDeployPath,
    JSON.stringify(
      {
        ...existing,
        checkedAt: new Date().toISOString(),
        homeMobile: home?.performance ?? null,
        sampled: results.filter((r) => r.path !== "/"),
        fast: true,
      },
      null,
      2,
    ),
  );
}

console.log(`\nWrote ${SUMMARY_PATH}`);
