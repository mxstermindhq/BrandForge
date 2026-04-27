import { createClient } from "@supabase/supabase-js";

function parseEnvFile(content) {
  const out = {};
  for (const rawLine of String(content || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    out[key] = value;
  }
  return out;
}

function getEnv(key, fallback = "") {
  return String(process.env[key] || fallback || "").trim();
}

async function readDotEnv() {
  try {
    const fs = await import("node:fs/promises");
    const txt = await fs.readFile(new URL("../.env", import.meta.url), "utf8");
    return parseEnvFile(txt);
  } catch {
    return {};
  }
}

function chunkText(lines, maxChars = 1800) {
  const chunks = [];
  let current = "";
  for (const ln of lines) {
    if ((current + ln + "\n").length > maxChars && current) {
      chunks.push(current.trimEnd());
      current = "";
    }
    current += `${ln}\n`;
  }
  if (current.trim()) chunks.push(current.trimEnd());
  return chunks;
}

async function postDiscordMessage({ token, channelId, content }) {
  const res = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bot ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord post failed (${res.status}): ${body.slice(0, 500)}`);
  }
}

async function main() {
  const fileEnv = await readDotEnv();
  const env = { ...fileEnv, ...process.env };
  const supabaseUrl = String(env.SUPABASE_URL || "").trim();
  const supabaseKey = String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const discordToken = String(env.DISCORD_BOT_TOKEN || "").trim();
  const discordChannel = String(env.DISCORD_DEALS_CHANNEL_ID || env.DISCORD_CHANNEL_ID || "").trim();

  if (!supabaseUrl || !supabaseKey) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  if (!discordToken || !discordChannel) throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_DEALS_CHANNEL_ID.");

  const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const [servicesRes, requestsRes] = await Promise.all([
    sb
      .from("service_packages")
      .select("id,title,base_price,category,status,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(250),
    sb
      .from("project_requests")
      .select("id,title,budget_min,budget_max,status,created_at")
      .in("status", ["open", "review"])
      .order("created_at", { ascending: false })
      .limit(250),
  ]);

  if (servicesRes.error) throw new Error(`Services query failed: ${servicesRes.error.message}`);
  if (requestsRes.error) throw new Error(`Requests query failed: ${requestsRes.error.message}`);

  const services = servicesRes.data || [];
  const requests = requestsRes.data || [];
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  const lines = [
    `**BrandForge Listings Snapshot**`,
    `Generated: ${now} UTC`,
    ``,
    `**Services (${services.length})**`,
    ...services.map((s, i) => {
      const price = Number(s.base_price || 0).toLocaleString();
      const cat = s.category || "General";
      return `${i + 1}. ${s.title || "Untitled"} — $${price} · ${cat}`;
    }),
    ``,
    `**Open Requests (${requests.length})**`,
    ...requests.map((r, i) => {
      const min = Number(r.budget_min || 0);
      const max = Number(r.budget_max || 0);
      const budget = min && max ? `$${min.toLocaleString()}–$${max.toLocaleString()}` : min ? `$${min.toLocaleString()}+` : max ? `Up to $${max.toLocaleString()}` : "Budget n/a";
      return `${i + 1}. ${r.title || "Untitled"} — ${budget} · ${r.status || "open"}`;
    }),
  ];

  const chunks = chunkText(lines, 1800);
  for (const chunk of chunks) {
    await postDiscordMessage({ token: discordToken, channelId: discordChannel, content: chunk });
  }

  console.log(`[discord-listings] Posted ${services.length} services and ${requests.length} requests in ${chunks.length} message(s).`);
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});

