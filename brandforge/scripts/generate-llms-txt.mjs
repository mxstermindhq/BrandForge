import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest } from "./lib/parse-content.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = buildManifest(root);
const out = path.join(root, "public", "llms.txt");

const lines = [
  "# BrandForge",
  "",
  "> BrandForge.gg is a design, development, and growth studio. Raw ideas forged into battle-ready brands. Contact via Discord or Telegram.",
  "",
  "## Entity",
  "- BrandForge: digital branding agency — design, development, and growth",
  "- mxstermind.com: Founder Operating System — monetization, ops, and growth systems",
  "",
  "## Contact",
  "- Discord (primary): https://discord.gg/GSKHXkUY85",
  "- Telegram (secondary): https://t.me/Notmxstermind",
  "",
  "## Pages",
];

for (const r of manifest.staticRoutes) {
  const url = `https://brandforge.gg${r.path === "/" ? "/" : r.path}`;
  lines.push(`- ${r.title}: ${url}`);
  lines.push(`  ${r.description}`);
}

lines.push("", "## Portfolio");
for (const p of manifest.portfolio) {
  lines.push(`- ${p.title}: https://brandforge.gg${p.path}`);
  if (p.description) lines.push(`  ${p.description.slice(0, 200)}`);
}

lines.push(
  "",
  "## Policies",
  "- Terms: https://brandforge.gg/terms/",
  "- Privacy: https://brandforge.gg/privacy/",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} · ${manifest.total} indexable pages · ${lines.length} lines`,
  "",
);

const text = lines.join("\n");
fs.writeFileSync(out, text);
console.log(`✓ llms.txt — ${manifest.total} pages, ${text.split("\n").length} lines`);
