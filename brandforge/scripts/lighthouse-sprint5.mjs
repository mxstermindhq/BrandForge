/**
 * Sprint 5 Lighthouse audit — home mobile + site-wide summary.
 * Usage: node scripts/lighthouse-sprint5.mjs [--fresh] [--local]
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "..", "audit", "sprint-5");
const FINAL_PATH = join(OUT_DIR, "perf-final.json");

const local = process.argv.includes("--local");
const BASE = local ? "http://localhost:3002" : "https://brandforge.gg";

/** Reuse sitemap paths from audit-perf-all.mjs */
function slugsFromFile(relativePath, pattern = /slug:\s*"([^"]+)"/g) {
  const text = readFileSync(join(ROOT, relativePath), "utf8");
  return [...text.matchAll(pattern)].map((m) => m[1]);
}

function blogSlugsFromFile() {
  const text = readFileSync(join(ROOT, "src/content/blog/index.ts"), "utf8");
  return [...text.matchAll(/^\s+"([^"]+)":\s*\{/gm)].map((m) => m[1]);
}

const HUBS = [
  "/",
  "/services/",
  "/packages/",
  "/portfolio/",
  "/partners/",
  "/contact/",
  "/roadmap/",
  "/blog/",
  "/brand-guide/",
];

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
const cacheDir = join(OUT_DIR, "lh-reports");
if (fresh && existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
}
mkdirSync(cacheDir, { recursive: true });

const paths = allPaths();
const results = [];

console.log(`Sprint 5 perf audit — ${paths.length} URLs on ${BASE}`);

for (const p of paths) {
  const slug = p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_|_$/g, "");
  const outFile = join(cacheDir, `${slug}.json`);
  const url = `${BASE}${p === "/" ? "" : p}`;

  if (!fresh && existsSync(outFile)) {
    results.push({ path: p, ...extractMetrics(JSON.parse(readFileSync(outFile, "utf8"))) });
    continue;
  }

  try {
    execSync(
      `npx lighthouse "${url}" --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --throttling-method=simulate --output=json --output-path="${outFile}" --chrome-flags="--headless --no-sandbox" --quiet`,
      { stdio: "pipe", timeout: 120000 },
    );
    const report = JSON.parse(readFileSync(outFile, "utf8"));
    results.push({ path: p, ...extractMetrics(report) });
    console.log(`  ${p} → ${results.at(-1).performance}`);
  } catch (err) {
    console.warn(`  ${p} failed:`, err.message?.slice(0, 80));
    results.push({ path: p, performance: null, error: true });
  }
}

const scored = results.filter((r) => r.performance !== null);
const avg = scored.length
  ? Math.round(scored.reduce((s, r) => s + r.performance, 0) / scored.length)
  : null;
const home = results.find((r) => r.path === "/") ?? {};

const summary = {
  auditedAt: new Date().toISOString(),
  base: BASE,
  urlCount: paths.length,
  scoredCount: scored.length,
  homeMobile: home,
  siteWideAverage: avg,
  targets: {
    homeMobilePerf: 85,
    siteWideAverage: 85,
    homeLcpMs: 2500,
    homeTbtMs: 200,
  },
  acceptance: {
    homeMobilePerf: (home.performance ?? 0) >= 85,
    siteWideAverage: (avg ?? 0) >= 85,
    homeLcp: (home.lcp ?? Infinity) < 2500,
    homeTbt: (home.tbt ?? Infinity) < 200,
  },
  results,
};

writeFileSync(FINAL_PATH, JSON.stringify(summary, null, 2));
console.log("\n── Sprint 5 summary ──");
console.log(`Home mobile perf: ${home.performance ?? "n/a"} (target ≥85)`);
console.log(`Site-wide avg:    ${avg ?? "n/a"} (target ≥85)`);
console.log(`Home LCP:         ${home.lcp != null ? `${Math.round(home.lcp)}ms` : "n/a"} (target <2500ms)`);
console.log(`Home TBT:         ${home.tbt != null ? `${Math.round(home.tbt)}ms` : "n/a"} (target <200ms)`);
console.log(`Saved → ${FINAL_PATH}`);
