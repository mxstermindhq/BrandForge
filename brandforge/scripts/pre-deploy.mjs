#!/usr/bin/env node
/**
 * Pre-deploy gate — build, lint, fast perf, bundles, images, schema.
 * Usage: node scripts/pre-deploy.mjs [--skip-lighthouse]
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AUDIT_ROOT, readJson, timestampSlug, writeJson } from "./lib/audit-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipLh = process.argv.includes("--skip-lighthouse");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runCapture(cmd, args) {
  return spawnSync(cmd, args, { cwd: root, encoding: "utf8", shell: true });
}

console.log("═══ BrandForge pre-deploy ═══\n");

console.log("→ npm run build");
run("npm", ["run", "build"]);

console.log("\n→ lint:content");
run("node", ["scripts/lint-content.mjs"]);

console.log("\n→ track-bundles");
run("node", ["scripts/track-bundles.mjs"]);

console.log("\n→ audit-images");
run("node", ["scripts/audit-images.mjs", ...(skipLh ? [] : ["--strict"])]);

console.log("\n→ validate-schema");
const schema = runCapture("node", ["scripts/validate-schema.mjs"]);
if (schema.status !== 0) {
  console.error("Schema validation failed");
  process.exit(1);
}

let perf = { homeMobile: null, sampled: [] };
if (!skipLh) {
  console.log("\n→ audit-perf-all --fast");
  run("node", ["scripts/audit-perf-all.mjs", "--fast"]);
  perf = readJson(path.join(AUDIT_ROOT, "pre-deploy-latest.json"), perf);
}

const homeScore = skipLh
  ? null
  : (perf.homeMobile ??
    readJson(path.join(AUDIT_ROOT, "brandforge-perf-all.json"))?.pages?.find((p) => p.path === "/")
      ?.performance);
const blockers = [];

if (!skipLh && homeScore !== null && homeScore < 70) blockers.push(`Home mobile perf ${homeScore} < 70`);
if (!skipLh && perf.sampled?.some((p) => p.performance !== null && p.performance < 50)) {
  blockers.push("Sample page perf < 50");
}

const report = {
  checkedAt: new Date().toISOString(),
  passed: blockers.length === 0,
  blockers,
  homeMobile: homeScore,
  bundles: readJson(path.join(AUDIT_ROOT, "bundles/latest.json")),
  images: readJson(path.join(AUDIT_ROOT, "images/latest.json")),
  perf,
};

const ts = timestampSlug();
writeJson(path.join(AUDIT_ROOT, `pre-deploy-${ts}.json`), report);
writeJson(path.join(AUDIT_ROOT, "pre-deploy-latest.json"), report);

if (blockers.length) {
  console.error("\n✗ pre-deploy BLOCKED:");
  for (const b of blockers) console.error("  -", b);
  process.exit(1);
}

console.log("\n✓ pre-deploy passed");
console.log(`  Home mobile: ${homeScore ?? "n/a (cached)"}`);
console.log(`  Report: audit/pre-deploy-${ts}.json`);
