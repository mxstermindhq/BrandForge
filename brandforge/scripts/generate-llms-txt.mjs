#!/usr/bin/env node
/**
 * Rich llms.txt with one-paragraph summaries per page cluster.
 */
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
  "> BrandForge.gg is a design, development, and growth studio for Discord communities, gaming operators, Web3 founders, forum sellers, and SaaS teams. Fixed USD packages from $300. Quote in 24 hours. Discord primary intake, Telegram secondary — no email contact form.",
  "",
  "## Entity",
  "- BrandForge: digital branding agency — validate → design → deliver → support",
  "- mxstermind.com: sister platform for premium bespoke engagements above package tiers",
  "- Niches: gaming servers, Web3/crypto, forum sellers, SaaS startups, e-commerce, content creators",
  "",
  "## Contact",
  "- Discord (primary): https://discord.gg/a8Nz2R6M55",
  "- Telegram (secondary): https://t.me/Notmxstermind",
  "- Custom tier scope call: book via /packages/ Calendly embed when configured",
  "",
  "## Pricing (USD)",
  "- Blueprint: $300–$500 one-time — logo, lander, Discord kit",
  "- Automator: $1,500–$3,000/mo — automation + CRO",
  "- MVP Engine: $5,000/mo — web app sprints",
  "- AI & Community: $7,500/mo — bots, AI, video",
  "- Full-Stack Powerhouse: $10,000+/mo — enterprise retainer",
  "- Custom / above tier 5: mxstermind.com",
  "",
  "## Brand guide",
  "- Voice: direct, operator-first, fixed pricing, no agency theatre",
  "- Full guide: https://brandforge.gg/brand-guide/",
  "",
  "## Hub pages",
];

for (const r of manifest.staticRoutes) {
  const url = `https://brandforge.gg${r.path === "/" ? "/" : r.path}`;
  lines.push(`- ${r.title}: ${url}`);
  lines.push(`  ${r.description}`);
}

lines.push("", "## Niche guides (/for/)");
for (const n of manifest.nichePages) {
  lines.push(`- ${n.title.replace(" | BrandForge", "")}: https://brandforge.gg${n.path}`);
  lines.push(`  ${n.description}`);
}

lines.push("", "## Services");
for (const s of manifest.servicePages) {
  lines.push(`- ${s.title.replace(" | BrandForge", "")}: https://brandforge.gg${s.path}`);
  lines.push(`  ${s.description}`);
}

lines.push("", "## Blog");
for (const b of manifest.blogPosts) {
  lines.push(`- ${b.title.replace(" | BrandForge", "")}: https://brandforge.gg${b.path}`);
  if (b.description) lines.push(`  ${b.description}`);
}

lines.push("", "## Portfolio (sample)");
for (const p of manifest.portfolio.slice(0, 15)) {
  lines.push(`- ${p.title}: https://brandforge.gg${p.path}`);
  if (p.description) lines.push(`  ${p.description.slice(0, 200)}`);
}

lines.push(
  "",
  "## Partners & resources",
  "- Partners & tools: https://brandforge.gg/partners/",
  "- Template store (coming soon): https://brandforge.gg/store/",
  "",
  "## Policies",
  "- Terms: https://brandforge.gg/terms/",
  "- Privacy: https://brandforge.gg/privacy/",
  "- Ethics: https://brandforge.gg/ethics-standards/",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} · ${manifest.total} indexable pages · ${lines.length} lines`,
  "",
);

const text = lines.join("\n");
if (text.split("\n").length > 500) {
  console.warn(`⚠ llms.txt ${text.split("\n").length} lines — trim if needed`);
}
fs.writeFileSync(out, text);
console.log(`✓ llms.txt — ${manifest.total} pages, ${text.split("\n").length} lines`);
