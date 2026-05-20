"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { OPERATOR_MEDIA } from "@/content/operator-media";

type DirectorySearchPaletteProps = {
  operators: CuratedOperator[];
};

type Result = {
  id: string;
  label: string;
  sub: string;
  href: string;
  kind: "profile" | "service" | "work";
};

export function DirectorySearchPalette({ operators }: DirectorySearchPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out: Result[] = [];
    for (const op of operators) {
      const blob = `${op.name} ${op.role} ${op.bio} ${op.skills.join(" ")}`.toLowerCase();
      if (!needle || blob.includes(needle)) {
        out.push({
          id: `p-${op.username}`,
          label: op.name,
          sub: op.role,
          href: `/${encodeURIComponent(op.username)}`,
          kind: "profile",
        });
      }
      const media = OPERATOR_MEDIA[op.username.toLowerCase()];
      if (!media) continue;
      for (const s of media.services) {
        const sb = `${s.name} ${s.tagline} ${op.name}`.toLowerCase();
        if (!needle || sb.includes(needle)) {
          out.push({
            id: `s-${s.id}`,
            label: s.name,
            sub: `Service · ${op.name}`,
            href: `/offer/${encodeURIComponent(s.id)}`,
            kind: "service",
          });
        }
      }
      for (const w of media.workPieces) {
        const wb = `${w.title} ${w.description} ${op.name}`.toLowerCase();
        if (!needle || wb.includes(needle)) {
          out.push({
            id: `w-${op.username}-${w.id}`,
            label: w.title,
            sub: `Work · ${op.name}`,
            href: `/work/${encodeURIComponent(op.username)}/${encodeURIComponent(w.id)}`,
            kind: "work",
          });
        }
      }
    }
    return out.slice(0, 12);
  }, [operators, q]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="directory-cmd-trigger"
        aria-label="Search directory (Ctrl+K)"
      >
        <span className="text-[var(--color-text-muted)]">Search directory…</span>
        <kbd className="directory-kbd">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="directory-cmd-backdrop"
        aria-label="Close search"
        onClick={() => setOpen(false)}
      />
      <div className="directory-cmd-panel" role="dialog" aria-modal="true" aria-label="Search directory">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              go(results[active].href);
            }
          }}
          placeholder="Find an operator, service, or project…"
          className="directory-cmd-input"
        />
        <ul className="directory-cmd-results">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-[var(--color-text-muted)]">No matches.</li>
          ) : (
            results.map((r, i) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="directory-cmd-result"
                  data-active={i === active ? true : undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                >
                  <span className="directory-cmd-kind">{r.kind}</span>
                  <span>
                    <span className="block text-sm font-medium text-[var(--color-text-primary)]">{r.label}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">{r.sub}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
