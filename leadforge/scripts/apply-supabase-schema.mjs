#!/usr/bin/env node
/**
 * Apply supabase/schema.sql via Supabase Management API (database/query).
 * Requires SUPABASE_ACCESS_TOKEN (sb_secret_* or personal access token).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = "wrmibhymtxnntixzbxsx";
const TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SECRET_KEY?.trim();

if (!TOKEN) {
  console.error("Set SUPABASE_ACCESS_TOKEN or SUPABASE_SECRET_KEY");
  process.exit(1);
}

const raw = readFileSync(join(__dirname, "../supabase/schema.sql"), "utf8");
const statements = raw
  .split(/;\s*\n/)
  .map((s) => s.replace(/^--[^\n]*\n?/gm, "").trim())
  .filter((s) => s.length > 0)
  .map((s) => `${s};`);

async function runQuery(query, label) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${label} failed (${res.status}): ${text}`);
  }
  console.log(`OK: ${label}`);
}

for (const [i, stmt] of statements.entries()) {
  const label = stmt.slice(0, 60).replace(/\s+/g, " ");
  await runQuery(stmt, `[${i + 1}/${statements.length}] ${label}`);
}

console.log("Schema applied successfully.");
