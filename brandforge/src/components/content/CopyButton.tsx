"use client";

import { useCallback, useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

/** One-click clipboard copy for brand guide templates. */
export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`rounded border border-b2 bg-s2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors hover:border-accent hover:text-text ${className}`}
      aria-live="polite"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
