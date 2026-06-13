"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type ResultStatBoxProps = {
  stat: string;
  context: string;
  serviceHref?: string;
  serviceLabel?: string;
};

export function ResultStatBox({
  stat,
  context,
  serviceHref,
  serviceLabel,
}: ResultStatBoxProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(`${stat} — ${context}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [stat, context]);

  return (
    <div className="rounded-md border border-accent/30 bg-gradient-to-br from-s1 to-bg p-6">
      <p className="font-mono text-3xl font-bold text-accent-bright">{stat}</p>
      <p className="mt-2 text-sm text-text-secondary">{context}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onCopy()}
          className="rounded border border-b2 px-3 py-1.5 font-mono text-[9px] font-semibold text-muted hover:text-text"
        >
          {copied ? "Copied ✓" : "Copy stat"}
        </button>
        {serviceHref && serviceLabel ? (
          <Link
            href={serviceHref}
            className="font-mono text-[9px] text-accent-bright hover:text-text"
          >
            {serviceLabel} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
