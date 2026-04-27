function normalizeUrl(pathOrUrl) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_WEB_ORIGIN || "https://brandforge.gg").replace(/\/+$/, "");
  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function buildDeploymentDiscordPayload({ versionId, workerUrl } = {}) {
  const compareUrl = normalizeUrl("/docs/strategy/05-execution-roadmap.md");
  const appUrl = normalizeUrl("/");
  const title = "New production deployment";
  const message = `Live update is deployed${versionId ? ` (version ${versionId})` : ""}.`;
  const actions = [
    { label: "Open app", url: appUrl },
    ...(workerUrl ? [{ label: "Worker URL", url: workerUrl }] : []),
    { label: "Changelog source", url: compareUrl },
  ];

  return {
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
  };
}

