#!/usr/bin/env node
/**
 * Weekly FAQ sentiment report from exported browser localStorage.
 *
 * Export steps:
 * 1. Open brandforge.gg in browser DevTools → Application → Local Storage
 * 2. Copy value of key `bf-faq-feedback` to audit/faq-feedback-export.json (array)
 * 3. Run: node scripts/faq-weekly-report.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const exportPath = path.join(root, "audit/faq-feedback-export.json");
const outPath = path.join(root, "audit/faq-weekly-report.md");

let entries = [];
try {
  const raw = await readFile(exportPath, "utf8");
  entries = JSON.parse(raw);
  if (!Array.isArray(entries)) throw new Error("Expected JSON array");
} catch {
  console.warn(`No export at ${exportPath} — writing template report.`);
}

/** @type {Map<string, { up: number; down: number; page: string }>} */
const byQuestion = new Map();

for (const e of entries) {
  const key = e.question_slug ?? e.question ?? "unknown";
  const row = byQuestion.get(key) ?? { up: 0, down: 0, page: e.page ?? "unknown" };
  if (e.value === 1 || e.vote === "up") row.up += 1;
  else row.down += 1;
  byQuestion.set(key, row);
}

const ranked = [...byQuestion.entries()]
  .map(([slug, stats]) => {
    const total = stats.up + stats.down;
    const downPct = total ? (stats.down / total) * 100 : 0;
    return { slug, ...stats, total, downPct };
  })
  .filter((r) => r.total >= 3)
  .sort((a, b) => b.downPct - a.downPct);

const topWeak = ranked.filter((r) => r.downPct > 30).slice(0, 3);

const lines = [
  "# FAQ weekly report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Total feedback entries: ${entries.length}`,
  "",
  "## Top 3 weakest FAQs (>30% 👎, min 3 votes)",
  "",
];

if (topWeak.length === 0) {
  lines.push("_No questions met the threshold yet. Export `bf-faq-feedback` from localStorage._");
} else {
  for (const row of topWeak) {
    lines.push(
      `- **${row.slug}** (${row.page}) — ${row.downPct.toFixed(0)}% down (${row.down}/${row.total}) → flag for rewrite`,
    );
  }
}

lines.push("", "## All questions by down-rate", "");
for (const row of ranked.slice(0, 15)) {
  lines.push(`- ${row.slug}: ${row.downPct.toFixed(0)}% down (${row.down}/${row.total})`);
}

await mkdir(path.join(root, "audit"), { recursive: true });
await writeFile(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
