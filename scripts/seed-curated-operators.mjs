#!/usr/bin/env node
/**
 * Upsert curated_operators from web seed via Supabase REST (service role).
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-curated-operators.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "../web/src/content/operator-seed.ts");

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("[seed] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

/** Minimal parse: extract OPERATOR_SEED array objects from TS (seed is stable). */
function loadSeed() {
  const raw = readFileSync(seedPath, "utf8");
  const match = raw.match(/export const OPERATOR_SEED[^=]*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error("Could not parse OPERATOR_SEED from operator-seed.ts");
  const arr = Function(`"use strict"; return (${match[1]});`)();
  return arr;
}

function toRow(op) {
  return {
    username: op.username,
    name: op.name,
    role: op.role,
    years_exp: op.yearsExp,
    availability: op.availability,
    amanah_score: op.amanahScore,
    completion_rate: op.completionRate,
    bio: op.bio,
    best_result: op.bestResult,
    wont_take_on: op.wontTakeOn,
    starting_price: op.startingPrice,
    pricing_model: op.pricingModel,
    skills: op.skills,
    ideal_client: op.idealClient,
    work_style: op.workStyle,
    typical_timeline: op.typicalTimeline,
    proof_link: op.proofLink ?? null,
    faq: op.faq,
    is_verified: op.isVerified,
    layout_span: op.layoutSpan,
    display_order: op.displayOrder,
  };
}

async function main() {
  const operators = loadSeed();
  const endpoint = `${url.replace(/\/+$/, "")}/rest/v1/curated_operators?on_conflict=username`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(operators.map(toRow)),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[seed] failed", res.status, detail);
    process.exit(1);
  }
  console.log(`[seed] upserted ${operators.length} curated_operators`);
}

main().catch((err) => {
  console.error("[seed]", err);
  process.exit(1);
});
