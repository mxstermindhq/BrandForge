#!/usr/bin/env node
/**
 * Post-deploy production verification.
 * Usage: node scripts/post-deploy.mjs [--base https://brandforge.gg]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AUDIT_ROOT, extractLighthouseMetrics, timestampSlug, writeJson } from "./lib/audit-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base =
  process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ?? "https://brandforge.gg";

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  return { status: res.status, text: await res.text(), ok: res.ok };
}

const checks = [];

async function check(name, fn) {
  try {
    const result = await fn();
    checks.push({ name, ...result, passed: result.ok !== false });
  } catch (err) {
    checks.push({ name, passed: false, error: String(err.message ?? err) });
  }
}

await check("home-200", async () => {
  const r = await fetchText(`${base}/`);
  return { ok: r.status === 200, status: r.status };
});

await check("sitemap", async () => {
  const r = await fetchText(`${base}/sitemap.xml`);
  const count = (r.text.match(/<loc>/g) ?? []).length;
  return { ok: r.status === 200 && count > 50, urlCount: count };
});

await check("robots", async () => {
  const r = await fetchText(`${base}/robots.txt`);
  return { ok: r.status === 200 && r.text.includes("Sitemap"), hasSitemap: r.text.includes("Sitemap") };
});

await check("llms", async () => {
  const r = await fetchText(`${base}/llms.txt`);
  return { ok: r.status === 200 && r.text.includes("BrandForge"), lines: r.text.split("\n").length };
});

await check("admin-noindex", async () => {
  const r = await fetchText(`${base}/admin/`);
  const noindex = /noindex/i.test(r.text);
  return { ok: r.status === 200 && noindex, noindex };
});

let homeLh = null;
const lhOut = path.join(AUDIT_ROOT, "post-deploy-home-lh.json");
try {
  execSync(
    `npx lighthouse "${base}/" --preset=perf --only-categories=performance --output=json --output-path="${lhOut}" --form-factor=mobile --screenEmulation.mobile=true --quiet --chrome-flags="--headless --no-sandbox"`,
    { stdio: "pipe", timeout: 120000, cwd: root },
  );
  homeLh = extractLighthouseMetrics(JSON.parse(fs.readFileSync(lhOut, "utf8")));
} catch {
  homeLh = { performance: null, error: "Lighthouse failed" };
}

const lhScore = homeLh?.performance ?? null;
const lhOk = lhScore === null || lhScore >= 50;

const report = {
  verifiedAt: new Date().toISOString(),
  base,
  checks,
  homeMobile: homeLh,
  passed: checks.every((c) => c.passed) && lhOk,
};

const ts = timestampSlug();
writeJson(path.join(AUDIT_ROOT, `post-deploy-${ts}.json`), report);
writeJson(path.join(AUDIT_ROOT, "post-deploy-latest.json"), report);

console.log(`Post-deploy: ${report.passed ? "PASS" : "FAIL"}`);
for (const c of checks) console.log(`  ${c.passed ? "✓" : "✗"} ${c.name}`);
console.log(`  Home mobile perf: ${homeLh?.performance ?? "n/a"}`);
console.log(`  → audit/post-deploy-${ts}.json`);

if (!report.passed) process.exit(1);
