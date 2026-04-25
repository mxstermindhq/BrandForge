import { spawn } from "node:child_process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true, stdio: "pipe", ...options });
    let output = "";
    child.stdout.on("data", (d) => {
      const s = d.toString();
      output += s;
      process.stdout.write(s);
    });
    child.stderr.on("data", (d) => {
      const s = d.toString();
      output += s;
      process.stderr.write(s);
    });
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Command failed (${command} ${args.join(" ")}) with exit ${code}\n${output}`));
    });
  });
}

function normalizeUrl(pathOrUrl) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_WEB_ORIGIN || "https://brandforge.gg").replace(/\/+$/, "");
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

async function postJson(url, payload) {
  const u = String(url || "").trim();
  if (!u) return;
  try {
    const res = await fetch(u, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[deploy-notify] non-2xx", res.status, body.slice(0, 800));
    }
  } catch (e) {
    console.warn("[deploy-notify] webhook error:", e?.message || e);
  }
}

function tgEscapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function notifyChannels({ versionId, workerUrl }) {
  const compareUrl = normalizeUrl("/docs/strategy/05-execution-roadmap.md");
  const appUrl = normalizeUrl("/");
  const title = "New production deployment";
  const message = `Live update is deployed${versionId ? ` (version ${versionId})` : ""}.`;
  const actions = [
    { label: "Open app", url: appUrl },
    ...(workerUrl ? [{ label: "Worker URL", url: workerUrl }] : []),
    { label: "Changelog source", url: compareUrl },
  ];

  const discordWebhook = String(process.env.DISCORD_DEALS_WEBHOOK_URL || "").trim();
  if (discordWebhook) {
    await postJson(discordWebhook, {
      content: title,
      embeds: [
        {
          title,
          description: message,
          color: 0x8b5cf6,
          fields: [
            { name: "Version", value: versionId || "unknown", inline: true },
            { name: "Site", value: appUrl, inline: false },
          ],
          url: appUrl,
        },
      ],
      components: [
        {
          type: 1,
          components: actions.slice(0, 5).map((a) => ({
            type: 2,
            style: 5,
            label: a.label,
            url: a.url,
          })),
        },
      ],
    });
  }

  const telegramToken = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const telegramChatId = String(process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_DEALS_CHAT_ID || "").trim();
  if (telegramToken && telegramChatId) {
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const text = [
      `🚀 <b>${tgEscapeHtml(title)}</b>`,
      tgEscapeHtml(message),
      `• <b>Version:</b> ${tgEscapeHtml(versionId || "unknown")}`,
      `• <a href="${appUrl}">Open app</a>`,
      ...(workerUrl ? [`• <a href="${workerUrl}">Worker URL</a>`] : []),
      `• <a href="${compareUrl}">Changelog source</a>`,
    ].join("\n");
    await postJson(url, {
      chat_id: telegramChatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [actions.slice(0, 3).map((a) => ({ text: a.label, url: a.url }))],
      },
    });
  }
}

async function main() {
  const output = await run("node", ["./node_modules/@opennextjs/cloudflare/dist/cli/index.js", "build"]);
  const deployOut = await run("node", ["./node_modules/@opennextjs/cloudflare/dist/cli/index.js", "deploy"]);
  const combined = `${output}\n${deployOut}`;
  const versionMatch = combined.match(/Current Version ID:\s*([a-z0-9-]+)/i);
  const workerMatch = combined.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/gi);
  const versionId = versionMatch ? versionMatch[1] : "";
  const workerUrl = workerMatch && workerMatch.length ? workerMatch[workerMatch.length - 1] : "";
  await notifyChannels({ versionId, workerUrl });
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
