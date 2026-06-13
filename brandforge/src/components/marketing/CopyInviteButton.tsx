"use client";

import { useCallback, useState } from "react";
import { discordCopyUrl } from "@/lib/tracking";

type CopyInviteButtonProps = {
  campaign?: string;
  className?: string;
};

/** Copies tracked Discord invite — utm_medium=copy */
export function CopyInviteButton({
  campaign = "copy-invite",
  className = "",
}: CopyInviteButtonProps): React.JSX.Element {
  const [toast, setToast] = useState(false);

  const onCopy = useCallback(async (): Promise<void> => {
    const url = discordCopyUrl(campaign);
    try {
      await navigator.clipboard.writeText(url);
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch {
      /* fallback ignored */
    }
  }, [campaign]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => void onCopy()}
        data-bf-cta="copy"
        data-bf-campaign={campaign}
        aria-label="Copy Discord invite link"
        className="rounded border border-b2 px-3 py-2 font-mono text-[10px] font-semibold text-text-secondary transition-colors hover:border-discord hover:text-discord"
      >
        ⧉ Copy invite link
      </button>
      {toast ? (
        <span
          role="status"
          className="pointer-events-none absolute -bottom-9 left-0 z-10 whitespace-nowrap rounded border border-b1 bg-bg px-2 py-1 font-mono text-[9px] text-green shadow-lg"
        >
          Link copied — share it anywhere
        </span>
      ) : null}
    </div>
  );
}
