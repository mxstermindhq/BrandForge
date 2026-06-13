#!/usr/bin/env node
/**
 * Discord webhook notifications (optional).
 * Usage: node scripts/notify-discord.mjs <deploy|fail|weekly> [message]
 * Env: DISCORD_WEBHOOK_URL
 */
const webhook = process.env.DISCORD_WEBHOOK_URL;
const kind = process.argv[2] ?? "deploy";
const message = process.argv[3] ?? "";

if (!webhook) {
  console.log("→ skip Discord notify (set DISCORD_WEBHOOK_URL)");
  process.exit(0);
}

const titles = {
  deploy: "✅ BrandForge deploy succeeded",
  fail: "🚨 BrandForge pre-deploy FAILED",
  weekly: "📊 BrandForge weekly report",
};

const body = {
  content: [`**${titles[kind] ?? kind}**`, message].filter(Boolean).join("\n\n").slice(0, 1900),
};

const res = await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error("Discord webhook failed:", res.status, await res.text());
  process.exit(1);
}

console.log("✓ Discord notification sent");
