#!/usr/bin/env node
/**
 * Generates public/llms.txt from content manifest at build time.
 * Usage: node scripts/generate-llms-txt.mjs
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
  "> BrandForge.gg is a design, development, and growth studio for digital founders, SaaS teams, Web3 projects, and online communities.",
  "",
  "## Who we serve",
  "- Founders launching a brand, website, or product",
  "- Operators who need one team for design + dev + growth (not three vendors)",
  "- Buyers who prefer fixed USD packages, crypto payment, or escrow",
  "",
  "## Hubs",
  ...manifest.staticRoutes.map((r) => `- ${r.title}: https://brandforge.gg${r.path === "/" ? "/" : r.path}`),
  "",
  "## Niche guides",
  ...manifest.nichePages.map((n) => `- ${n.title.replace(" | BrandForge", "")}: https://brandforge.gg${n.path}`),
  "",
  "## Services",
  ...manifest.servicePages.map((s) => `- ${s.title.replace(" | BrandForge", "")}: https://brandforge.gg${s.path}`),
  "",
  "## Blog",
  ...manifest.blogPosts.map((b) => `- ${b.title.replace(" | BrandForge", "")}: https://brandforge.gg${b.path}`),
  "",
  "## Portfolio highlights",
  ...manifest.portfolio.slice(0, 12).map((p) => `- ${p.title}: https://brandforge.gg${p.path}`),
  "",
  "## Packages (USD)",
  "- Tier 1 — The Blueprint: $300–$500 one-time",
  "- Tier 2 — The Automator: $1,500–$3,000/mo",
  "- Tier 3 — The MVP Engine: $5,000/mo",
  "- Tier 4 — The AI & Community: $7,500/mo",
  "- Tier 5 — The Full-Stack Powerhouse: $10,000+/mo",
  "",
  "## How to buy",
  "Contact via Discord (https://discord.gg/a8Nz2R6M55) or Telegram (https://t.me/Notmxstermind). Fixed quote within 24 hours. Escrow accepted.",
  "",
  "## Policies",
  "- Terms: https://brandforge.gg/terms/",
  "- Privacy: https://brandforge.gg/privacy/",
  "",
  "## Premium tier",
  "Projects above package scope: https://mxstermind.com",
  "",
  "## Note",
  "Internal ops pages (/launch/) are noindex and excluded from this file.",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} · ${manifest.total} indexable pages`,
  "",
];

fs.writeFileSync(out, lines.join("\n"));
console.log(`✓ llms.txt — ${manifest.total} pages, ${manifest.blogPosts.length} blog posts`);
