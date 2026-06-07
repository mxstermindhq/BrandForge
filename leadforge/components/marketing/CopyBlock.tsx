"use client";

import { useCallback, useState } from "react";

type CopyBlockProps = {
  id: string;
  platform: string;
  title: string;
  body: string;
  notes?: string;
  tags?: string[];
};

export function CopyBlock({
  id,
  platform,
  title,
  body,
  notes,
  tags,
}: CopyBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select is enough for manual copy */
    }
  }, [body]);

  return (
    <article
      id={id}
      className="scroll-mt-28 rounded-xl border border-border bg-bg-surface overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold">{platform}</p>
          <h3 className="mt-1 text-base font-medium">{title}</h3>
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-bg px-2 py-0.5 font-mono text-[9px] text-tx-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded border border-border px-4 py-2 font-mono text-[10px] font-semibold text-tx-muted transition hover:border-gold hover:text-gold"
        >
          {copied ? "Copied ✓" : "Copy post"}
        </button>
      </div>
      {notes && (
        <p className="border-b border-border bg-gold-bg/30 px-5 py-2.5 text-xs leading-relaxed text-tx-muted">
          {notes}
        </p>
      )}
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-tx-muted">
        {body}
      </pre>
    </article>
  );
}
