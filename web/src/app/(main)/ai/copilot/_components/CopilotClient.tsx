"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function CopilotClient() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setErr(null);
    setReply(null);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      if (!t) throw new Error("Sign in required.");
      const { ok, data } = await apiFetch<{ reply?: string; error?: string }>("/api/ai/chat", {
        method: "POST",
        accessToken: t,
        body: JSON.stringify({
          mode: "general",
          messages: [{ role: "user", content: text }],
        }),
      });
      if (!ok) throw new Error((data as { error?: string })?.error || "Chat failed");
      setReply(String((data as { reply?: string }).reply || ""));
      setInput("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">AI Co-Pilot</h1>
        <p className="text-muted mt-1 text-sm">
          Thin client over <code className="text-xs">POST /api/ai/chat</code>. Configure provider keys on the API server.
        </p>
      </header>

      <div className="border-border bg-card flex min-h-[280px] flex-col rounded-xl border p-4">
        <div className="text-muted min-h-[120px] flex-1 whitespace-pre-wrap text-sm">
          {reply || "Replies appear here after you send a message."}
        </div>
        {err ? <p className="text-error text-sm">{err}</p> : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="sr-only" htmlFor="copilot-input">
            Message
          </label>
          <textarea
            id="copilot-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask BrandForge to draft a proposal, summarize a brief, or outline milestones..."
            className="border-border bg-background focus:ring-accent/40 min-h-[44px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className="bg-accent text-background min-h-[44px] shrink-0 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
