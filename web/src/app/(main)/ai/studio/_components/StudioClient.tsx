"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const models = ["mxAI Turbo", "mxAI Pro", "Hybrid"];

export function StudioClient() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [model, setModel] = useState(models[0]);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function createRun(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      let t: string | null = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        t = data.session?.access_token ?? null;
      }
      if (!t) throw new Error("Sign in required.");
      await apiMutateJson<unknown>("/api/agent-runs", "POST", { description, model }, t);
      router.push("/ai/agents");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">AI Studio</h1>
        <p className="text-muted mt-1 text-sm">
          Queue a run with a natural-language brief. Uses the same{" "}
          <code className="text-xs">POST /api/agent-runs</code> contract as the legacy agent console.
        </p>
      </header>

      <form onSubmit={createRun} className="border-border bg-card space-y-4 rounded-xl border p-6">
        {err ? <p className="text-error text-sm">{err}</p> : null}
        <div>
          <label htmlFor="brief" className="mb-1 block text-sm font-medium">
            Brief
          </label>
          <textarea
            id="brief"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-border bg-background focus:ring-accent/40 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="model" className="mb-1 block text-sm font-medium">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="border-border bg-background min-h-[44px] w-full rounded-lg border px-3 text-sm"
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-background w-full min-h-[44px] rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create agent run"}
        </button>
      </form>
    </div>
  );
}
