#!/usr/bin/env node
/**
 * Pre-deploy gate — runs content lint + production build.
 * Usage: node scripts/pre-deploy-check.mjs
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("→ lint-content");
run("node", ["scripts/lint-content.mjs"]);

console.log("→ next build");
run("npm", ["run", "build"]);

console.log("✓ pre-deploy checks passed");
