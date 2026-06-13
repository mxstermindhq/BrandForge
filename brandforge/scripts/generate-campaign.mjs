#!/usr/bin/env node
/**
 * Generate a 7-day launch campaign scaffold.
 * Usage: node scripts/generate-campaign.mjs "Campaign Name" "target-niche" "offer headline"
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const [nameArg, nicheArg, offerArg] = process.argv.slice(2);
if (!nameArg || !nicheArg || !offerArg) {
  console.error(
    "Usage: node scripts/generate-campaign.mjs \"Campaign Name\" \"target-niche\" \"offer headline\"",
  );
  process.exit(1);
}

const slug = nameArg
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const id = slug.slice(0, 32);
const now = new Date();
const start = now.toISOString().slice(0, 10);
const endDate = new Date(now.getTime() + 6 * 86400000).toISOString().slice(0, 10);

const platforms = ["discord", "x", "reddit", "linkedin", "hackforums", "voided", "threads"];
const dayKeys = ["fri", "sat", "sun", "mon", "tue", "wed", "thu"];
const dayLabels = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

const days = dayKeys.map((key, i) => ({
  key,
  label: dayLabels[i],
  date: new Date(now.getTime() + i * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
  dayNumber: i + 1,
  posts: [
    {
      id: `${key}-${platforms[i % platforms.length]}`,
      platform: platforms[i % platforms.length],
      timeEst: i === 0 ? "18:51" : "10:00",
      kind: i === 0 ? "kickoff" : "new-thread",
      title: i === 0 ? `#announcements — ${nameArg} kickoff` : undefined,
      body: `${offerArg}\n\nNiche: ${nicheArg}\n→ brandforge.gg/packages\n→ discord.gg/a8Nz2R6M55`,
      notes: "Edit copy before posting.",
    },
  ],
}));

const fileBody = `import type { LaunchCampaign } from "@/content/launch/types";

/** Auto-generated — review and merge into campaign.ts or set as ACTIVE_CAMPAIGN */
export const GENERATED_CAMPAIGN: LaunchCampaign = ${JSON.stringify(
  {
    id,
    weekLabel: nameArg,
    dateRange: `${start} – ${endDate}`,
    startDate: start,
    endDate,
    campaignStart: {
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dayLabel: dayLabels[0],
      time: "18:51",
      timezone: "Your local time",
    },
    theme: offerArg,
    hook: `Outreach for ${nicheArg} — ${offerArg}`,
    keyMessages: [offerArg, "Fixed USD packages", "Quote in 24h"],
    avoid: ["No spam bumps", "Value before link"],
    timezonePrimary: "US Eastern (EST/EDT)",
    timezoneSecondary: "UTC overlap — add 4–5h to EST",
    postingGuide: [],
    days,
  },
  null,
  2,
)};
`;

const outDir = path.join(root, "src/content/launch/campaigns");
await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, `${slug}.ts`);
await writeFile(outPath, fileBody, "utf8");
console.log(`Wrote ${outPath}`);
