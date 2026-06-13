#!/usr/bin/env node
/**
 * Purge Cloudflare cache after deploy (optional — requires env vars).
 * CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID for brandforge.gg
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!token || !zoneId) {
  console.log("→ skip cache purge (set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID to enable)");
  process.exit(0);
}

const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ purge_everything: true }),
});

const data = await res.json();
if (!data.success) {
  console.error("Cache purge failed:", data.errors ?? data);
  process.exit(1);
}

console.log("✓ Cloudflare cache purged");
