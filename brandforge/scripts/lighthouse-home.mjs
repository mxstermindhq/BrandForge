#!/usr/bin/env node
/**
 * Lighthouse mobile — home page. Saves JSON to audit/sprint-3/
 * Usage: node scripts/lighthouse-home.mjs [--url=https://brandforge.gg]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "..", "audit", "sprint-3");
const urlArg = process.argv.find((a) => a.startsWith("--url="));
const url = urlArg?.split("=")[1] ?? "https://brandforge.gg/";

fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "home-mobile.json");

console.log(`→ Lighthouse mobile ${url}`);

try {
  execSync(
    `npx lighthouse "${url}" --only-categories=performance,accessibility,seo,best-practices --form-factor=mobile --screenEmulation.mobile=true --throttling-method=simulate --output=json --output-path="${outFile}" --chrome-flags="--headless --no-sandbox" --quiet`,
    { stdio: "inherit", cwd: root },
  );
} catch {
  /* lighthouse may exit non-zero on Windows temp cleanup while JSON is written */
}

if (!fs.existsSync(outFile)) {
  console.error("✗ Lighthouse output missing");
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(outFile, "utf8"));
const perf = Math.round(report.categories.performance.score * 100);
const a11y = Math.round(report.categories.accessibility.score * 100);
const seo = Math.round(report.categories.seo.score * 100);
const lcp = report.audits["largest-contentful-paint"]?.displayValue ?? "—";
const tbt = report.audits["total-blocking-time"]?.displayValue ?? "—";
const cls = report.audits["cumulative-layout-shift"]?.displayValue ?? "—";

const summary = { url, perf, a11y, seo, lcp, tbt, cls, date: new Date().toISOString().slice(0, 10) };
fs.writeFileSync(path.join(outDir, "home-mobile-summary.json"), JSON.stringify(summary, null, 2));

console.log(`✓ perf ${perf} · a11y ${a11y} · seo ${seo} · LCP ${lcp} · TBT ${tbt} · CLS ${cls}`);
console.log(`✓ ${outFile}`);

if (perf < 60) {
  console.warn("⚠ perf below Sprint 3 milestone (60)");
  process.exit(1);
}
