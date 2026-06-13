"use client";

import { useCallback, useState } from "react";

type CopyIntakeButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

/** Copies pre-filled Discord/Telegram intake text — pairs with tracked outbound links. */
export function CopyIntakeButton({
  text,
  label = "Copy message",
  className = "",
}: CopyIntakeButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still paste manually from selection fallback */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className={`rounded border border-b2 px-4 py-2 font-mono text-[10px] font-semibold text-text-secondary transition-colors hover:border-accent hover:text-accent-bright ${className}`}
      aria-live="polite"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
