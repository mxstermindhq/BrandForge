"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiMutateJson } from "@/lib/api";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuth } from "@/providers/AuthProvider";

export function NewRequestForm() {
  const { session } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
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
      if (!t) {
        throw new Error("Sign in required to post a request.");
      }
      const res = await apiMutateJson<{ request?: { id?: string } }>(
        "/api/requests",
        "POST",
        { title, desc, budget, successCriteria },
        t,
      );
      const newId = res?.request?.id;
      router.push(newId ? `/requests/${newId}` : "/requests");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent("/requests/new")}`;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">New request</h1>
        <p className="text-muted mt-1 text-sm">
          Uses{" "}
          <code className="bg-muted/50 rounded px-1 text-xs">POST /api/requests</code> — title, description, and
          budget are required.
        </p>
      </header>

      {!session ? (
        <div className="border-outline-variant/30 bg-surface-container-low rounded-xl border p-4 text-sm">
          <p className="text-on-surface-variant">You need an account to post a request.</p>
          <Link href={loginHref} className="text-primary mt-2 inline-block font-semibold hover:underline">
            Sign in or create an account →
          </Link>
        </div>
      ) : null}

      {err ? (
        <p className="text-error text-sm" role="alert">
          {err}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-border bg-background focus:ring-accent/40 w-full min-h-[44px] rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="desc" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="desc"
          required
          rows={5}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border-border bg-background focus:ring-accent/40 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="budget" className="mb-1 block text-sm font-medium">
          Budget (e.g. 500–1500 or 2000)
        </label>
        <input
          id="budget"
          required
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="$500–$2,000"
          className="border-border bg-background focus:ring-accent/40 w-full min-h-[44px] rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="successCriteria" className="mb-1 block text-sm font-medium">
          Success criteria (optional)
        </label>
        <textarea
          id="successCriteria"
          rows={3}
          value={successCriteria}
          onChange={(e) => setSuccessCriteria(e.target.value)}
          className="border-border bg-background focus:ring-accent/40 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-background inline-flex min-h-[44px] items-center rounded-lg px-5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post request"}
        </button>
        <Link
          href="/requests"
          className="border-border inline-flex min-h-[44px] items-center rounded-lg border px-5 text-sm font-medium hover:bg-muted/30"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
