import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ALLOWED = new Set([
  "page_view",
  "cta_click",
  "search_open",
  "search_select",
  "interest_submit",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      event?: string;
      path?: string;
      props?: Record<string, unknown>;
    };
    const event = String(body.event || "").trim();
    const path = String(body.path || "/").slice(0, 512);
    const props =
      body.props && typeof body.props === "object" && !Array.isArray(body.props)
        ? body.props
        : {};

    if (!ALLOWED.has(event)) {
      return NextResponse.json({ error: "Invalid event." }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/directory_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ event, path, props }),
    });

    if (!res.ok) {
      console.error("directory_events insert failed", res.status);
      return NextResponse.json({ ok: true, stored: false });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (error) {
    console.error("events route error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
