"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Msg = { role: "user" | "assistant"; content: string };

export function StudioCopilotHud() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollEnd = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollEnd();
  }, [messages.length, scrollEnd]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setErr(null);
    const nextUser: Msg = { role: "user", content: text };
    setMessages((m) => [...m, nextUser]);
    setInput("");
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      if (!t) throw new Error("Sign in required for co-pilot.");

      const history = [...messages, nextUser].map(({ role, content }) => ({ role, content }));
      const { ok, data } = await apiFetch<{ reply?: string; error?: string }>("/api/ai/chat", {
        method: "POST",
        accessToken: t,
        body: JSON.stringify({
          mode: "general",
          messages: history.map((h) => ({ role: h.role, content: h.content })),
        }),
      });
      if (!ok) throw new Error((data as { error?: string })?.error || "Chat failed");
      const reply = String((data as { reply?: string }).reply || "");
      setMessages((m) => [...m, { role: "assistant", content: reply || "…" }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="border-outline-variant/20 bg-surface-container-lowest/85 flex h-80 w-full shrink-0 flex-col border-t backdrop-blur-xl md:h-auto md:w-80 md:border-l md:border-t-0">
      <div className="border-outline-variant/15 border-b px-4 py-3">
        <h2 className="font-headline text-secondary text-[10px] font-black uppercase tracking-[0.25em]">
          Co-pilot HUD
        </h2>
        <p className="text-on-surface-variant mt-1 text-[11px] font-light">Contextual assistance — scrolls with the run.</p>
      </div>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className="text-on-surface-variant px-1 py-8 text-center text-xs font-light leading-relaxed">
            Signal the co-pilot with a message. Replies stream from <code className="text-secondary/80">/api/ai/chat</code>.
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, i) => (
              <li
                key={`${i}-${m.role}`}
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "border-outline-variant/20 bg-surface-container-high/50 ml-4 border text-on-surface"
                    : "border-secondary/15 bg-secondary/5 mr-4 border text-on-surface-variant"
                }`}
              >
                {m.content}
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
      {err ? <p className="text-error px-4 pb-2 text-xs">{err}</p> : null}
      <div className="border-outline-variant/15 border-t p-3">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Direct co-pilot…"
            className="border-outline-variant/30 bg-background/70 focus:border-secondary/40 placeholder:text-on-surface-variant/50 min-h-[44px] flex-1 resize-none rounded-lg border px-3 py-2 text-xs text-on-surface transition-all duration-300 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className="bg-secondary-container text-on-secondary-container font-headline h-[44px] shrink-0 self-end rounded-lg px-4 text-xs font-bold transition-all duration-300 hover:shadow-glow disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </aside>
  );
}
