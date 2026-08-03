import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CAP_MESSAGE, parseMentionModel } from "@/lib/ai/mention";
import { callClaude } from "@/lib/ai/anthropic";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser(token);
  if (userErr || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { message_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const messageId = body.message_id;
  if (!messageId) {
    return NextResponse.json({ error: "message_id required" }, { status: 400 });
  }

  const { data: msg } = await sb
    .from("messages")
    .select("id, ticket_id, sender_id, content")
    .eq("id", messageId)
    .single();
  if (!msg || msg.sender_id !== user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const mention = parseMentionModel(msg.content);
  if (!mention) {
    return NextResponse.json({ error: "no mention in message" }, { status: 400 });
  }

  const { data: ticket } = await sb
    .from("tickets")
    .select("id, client_id, operator_id")
    .eq("id", msg.ticket_id)
    .single();
  if (!ticket) {
    return NextResponse.json({ error: "ticket not found" }, { status: 404 });
  }

  const { data: me } = await sb.from("users").select("role").eq("id", user.id).single();
  const role = me?.role ?? "";
  const canAccess =
    role === "founder" || ticket.client_id === user.id || ticket.operator_id === user.id;
  if (!canAccess) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const cap = Number.parseInt(process.env.AI_MENTION_CAP_PER_TICKET ?? "30", 10) || 30;
  const { count } = await sb
    .from("ai_invocations")
    .select("id", { count: "exact", head: true })
    .eq("ticket_id", msg.ticket_id);
  if ((count ?? 0) >= cap) {
    return NextResponse.json({ blocked: true, message: CAP_MESSAGE });
  }

  const { data: history } = await sb
    .from("messages")
    .select("sender_type, content, created_at")
    .eq("ticket_id", msg.ticket_id)
    .order("created_at", { ascending: true })
    .limit(30);

  const transcript = (history ?? [])
    .map((m) => {
      const who =
        m.sender_type === "ai"
          ? "AI"
          : m.sender_type === "client"
            ? "Client"
            : m.sender_type === "founder"
              ? "Founder"
              : "Operator";
      return `${who}: ${m.content}`;
    })
    .join("\n");

  let result;
  try {
    result = await callClaude({ model: mention.model, transcript });
  } catch (e) {
    console.error("ai mention call failed", e);
    return NextResponse.json({ error: "ai call failed" }, { status: 502 });
  }

  const { data: reply } = await sb
    .from("messages")
    .insert({
      ticket_id: msg.ticket_id,
      sender_type: "ai",
      sender_id: null,
      content: result.text,
      mentioned_model: mention.model,
    })
    .select("id")
    .single();

  if (reply) {
    await sb.from("ai_invocations").insert({
      message_id: msg.id,
      ticket_id: msg.ticket_id,
      model: mention.model,
      tokens_used: result.tokens,
      cost_estimate: result.cost,
    });
  }

  return NextResponse.json({ ok: true, model: mention.model, reply_id: reply?.id ?? null });
}
