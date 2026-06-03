/**
 * Build markdown table from audit/brandforge-perf-all.json
 * Usage: node scripts/generate-perf-report.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = join(__dirname, "..", "..", "audit", "brandforge-perf-all.json");
const MD_PATH = join(__dirname, "..", "..", "audit", "brandforge-perf-all.md");

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

const fmt = (n, unit = "") =>
  n === null || n === undefined ? "—" : `${typeof n === "number" ? n.toFixed(unit === "ms" ? 0 : 3) : n}${unit}`;

const rows = data.pages
  .map((p) => {
    if (p.error) {
      return `| ${p.path} | — | — | — | — | FAILED |`;
    }
    const flag =
      p.performance >= 85
        ? "✅"
        : p.performance >= 50
          ? "⚠️"
          : p.cls > 0.1
            ? "❌ CLS"
            : "❌";
    return `| ${p.path} | ${p.performance ?? "—"} | ${fmt(p.lcp, "ms")} | ${fmt(p.tbt, "ms")} | ${fmt(p.cls)} | ${flag} |`;
  })
  .join("\n");

const worst = [...data.pages]
  .filter((p) => p.performance !== null)
  .sort((a, b) => a.performance - b.performance)
  .slice(0, 5);

const best = [...data.pages]
  .filter((p) => p.performance !== null)
  .sort((a, b) => b.performance - a.performance)
  .slice(0, 5);

const clsBad = data.pages.filter((p) => p.cls > 0.1);

const md = `# BrandForge — Full-site mobile performance audit

**Domain:** brandforge.gg only  
**Date:** ${data.auditedAt.split("T")[0]}  
**Form factor:** Mobile (Lighthouse perf preset)  
**Pages audited:** ${data.succeeded}/${data.total}  
**Average performance score:** ${data.avgPerformance ?? "—"}

Raw JSON: \`audit/brandforge-perf-all.json\`  
Per-page reports: \`audit/lh-bf-all/*.json\`

---

## All pages (sorted worst → best in JSON)

| Path | Perf | LCP | TBT | CLS | Status |
|------|------|-----|-----|-----|--------|
${rows}

---

## Worst 5

${worst.map((p) => `- **${p.path}** — perf ${p.performance}, LCP ${fmt(p.lcp, "ms")}, CLS ${fmt(p.cls)}`).join("\n")}

## Best 5

${best.map((p) => `- **${p.path}** — perf ${p.performance}, LCP ${fmt(p.lcp, "ms")}, CLS ${fmt(p.cls)}`).join("\n")}

${
  clsBad.length
    ? `## CLS failures (>0.1)

${clsBad.map((p) => `- **${p.path}** — CLS ${fmt(p.cls)}`).join("\n")}
`
    : ""
}

---

## Targets

| Metric | Target | Pages passing |
|--------|--------|---------------|
| Performance | ≥85 | ${data.pages.filter((p) => p.performance >= 85).length}/${data.total} |
| LCP | <2500ms | ${data.pages.filter((p) => p.lcp !== null && p.lcp < 2500).length}/${data.total} |
| CLS | <0.1 | ${data.pages.filter((p) => p.cls !== null && p.cls < 0.1).length}/${data.total} |

---

*BrandForge-only audit. Re-run: \`node brandforge/scripts/audit-perf-all.mjs\`*
`;

writeFileSync(MD_PATH, md);
console.log(`Wrote ${MD_PATH}`);
