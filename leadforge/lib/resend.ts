// Resend transactional email via REST API (fetch only). These helpers never
// throw — email is best-effort and must not break the request/queue flow.

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "LeadForge <onboarding@resend.dev>";

async function send(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!apiKey || !to) return;
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      console.warn(`Resend send failed: ${res.status}`);
    }
  } catch (err) {
    console.warn("Resend send error", err instanceof Error ? err.message : err);
  }
}

function shell(title: string, body: string): string {
  return `<div style="font-family:Outfit,Arial,sans-serif;background:#080808;color:#f0f0f0;padding:32px">
    <h1 style="font-family:'Cormorant Garamond',serif;color:#c9a84c;font-weight:300">${title}</h1>
    ${body}
    <p style="color:#666;font-size:12px;margin-top:32px">LeadForge · a BrandForge tool</p>
  </div>`;
}

export async function sendWelcome(
  apiKey: string,
  to: string,
  name: string,
): Promise<void> {
  await send(
    apiKey,
    to,
    "Welcome to LeadForge — 500 free leads",
    shell(
      "Welcome to LeadForge",
      `<p>Hi ${name}, your account is ready with <strong>500 free credits</strong>.</p>
       <p>Describe your ideal customer, pick your sources, and launch your first campaign.</p>`,
    ),
  );
}

export async function sendLeadsReady(
  apiKey: string,
  to: string,
  campaignName: string,
  count: number,
  dashboardUrl: string,
): Promise<void> {
  await send(
    apiKey,
    to,
    `Your leads are ready — ${campaignName}`,
    shell(
      "Your leads are ready",
      `<p>Campaign <strong>${campaignName}</strong> delivered <strong>${count}</strong> enriched leads.</p>
       <p><a href="${dashboardUrl}" style="color:#c9a84c">Open your dashboard →</a></p>`,
    ),
  );
}

export async function sendLowCredits(
  apiKey: string,
  to: string,
  balance: number,
): Promise<void> {
  await send(
    apiKey,
    to,
    "Low credit balance — LeadForge",
    shell(
      "Running low on credits",
      `<p>Your balance is down to <strong>${balance}</strong> credits.</p>
       <p>Top up to keep your campaigns running without interruption.</p>`,
    ),
  );
}
