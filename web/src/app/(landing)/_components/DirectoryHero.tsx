"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CONTACT } from "@/content/landing-directory";
import { IslamicPattern } from "@/components/ui/IslamicPattern";

export function DirectoryHero() {
  const [intent, setIntent] = useState<"hire" | "get_hired" | null>(null);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const ticker = [
    "● Founder matched · lifecycle operator · 2 min ago",
    "● New scope: Next.js rebuild · Under review",
    "● Deal delivered: AI support agent · Approved",
    "● UGC retainer filled · 3 operators shortlisted",
  ];

  async function submitInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!intent) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/landing-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, intent }),
      });
      if (!res.ok) throw new Error("Could not save email");
      setMsg("You're in. We'll send updates when applications/news drop.");
      setEmail("");
    } catch {
      setMsg("Could not save right now. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8" style={{ background: "var(--color-bg)" }}>
      <IslamicPattern className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[720px] -translate-x-1/2 rounded-full blur-[130px]" style={{ background: "var(--color-gold-subtle)" }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full blur-[120px]" style={{ background: "var(--color-emerald-subtle)" }} />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)", color: "var(--color-gold)" }}
        >
          Curated talent · Verified operators · Managed by {CONTACT.guarantor}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="landing-gold-line max-w-4xl font-headline text-5xl font-semibold leading-[1.02] text-[var(--color-text-primary)] sm:text-6xl md:text-7xl"
        >
          The team behind the brands winning online.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16 }}
          className="mt-8 max-w-2xl text-lg text-[var(--color-text-secondary)] sm:text-xl"
        >
          One conversation with mxstermind routes you to the right operator — scoped, trusted, and ready.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--color-gold)]"
        >
          No bidding. No spam. No hidden fees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.21 }}
          className="mt-6 flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setIntent("hire")}
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-[var(--color-gold-subtle)] hover:text-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Hire
          </button>
          <button
            type="button"
            onClick={() => setIntent("get_hired")}
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] transition-colors hover:bg-[var(--color-gold-subtle)] hover:text-[var(--color-gold)]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Get hired
          </button>
        </motion.div>

        {intent ? (
          <motion.form
            onSubmit={(e) => void submitInterest(e)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex max-w-xl flex-wrap gap-2 rounded-xl border p-2"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for whitelist updates"
              className="min-h-10 min-w-[220px] flex-1 rounded-lg border px-3 text-sm outline-none"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
            />
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-70"
              style={{ background: "var(--color-gold)" }}
            >
              {saving ? "Saving…" : "Notify me"}
            </button>
            <button
              type="button"
              onClick={() => setIntent(null)}
              className="min-h-10 rounded-lg border px-3 text-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              Close
            </button>
            {msg ? <p className="w-full text-xs text-[var(--color-text-secondary)]">{msg}</p> : null}
          </motion.form>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <a href={CONTACT.telegram} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-11 px-6 text-sm">
            Start a conversation →
          </a>
          <a href="#talent" className="btn-secondary min-h-11 px-6 text-sm">
            See who's available ↓
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-14"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Live activity</p>
          <div className="ticker-mask overflow-hidden rounded-lg border py-2" style={{ borderColor: "var(--color-gold-border)", background: "var(--color-surface)" }}>
            <div className="ticker-track">
              {[...ticker, ...ticker].map((line, i) => (
                <span key={`${line}-${i}`} className="mx-5 whitespace-nowrap text-xs uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
