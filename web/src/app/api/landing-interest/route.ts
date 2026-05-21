import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DISCORD_WEBHOOK = process.env.INTEREST_DISCORD_WEBHOOK_URL;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function notifyDiscord(email: string, intent: string) {
  if (!DISCORD_WEBHOOK) return;
  const label = intent === "hire" ? "Wants to hire" : "Wants to get listed";
  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `**BrandForge interest** — ${label}\n\`${email}\``,
    }),
  }).catch((err) => console.error("discord interest notify failed", err));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      intent?: string;
    };
    const email = String(body.email || "").trim().toLowerCase();
    const intent = String(body.intent || "").trim();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }
    if (intent !== "hire" && intent !== "get_hired") {
      return NextResponse.json({ error: "Invalid intent." }, { status: 400 });
    }
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/landing_interest_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email,
        intent,
        source: "landing",
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("landing-interest insert failed", response.status, detail);
      return NextResponse.json({ error: "Could not save." }, { status: 502 });
    }

    await notifyDiscord(email, intent);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("landing-interest error", error);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
