"use client";

import { useState } from "react";

export type ChatPin = {
  pinId?: string;
  messageId?: string;
  pinnedAt?: string;
  pinnedBy?: string;
  preview?: string;
};

/** Pinned messages strip: jump-to-message. */
export function ChatPinnedBar({
  pins,
  onJump,
}: {
  pins: ChatPin[];
  onJump: (messageId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  if (!pins.length) return null;

  return (
    <div className="border-outline-variant/40 bg-surface-container-high shrink-0 border-b">
      <button
        type="button"
        className="text-on-surface flex w-full items-center gap-2 px-4 py-2 text-left md:px-5"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="relative inline-flex shrink-0">
          <span className="text-on-surface-variant material-symbols-outlined text-lg" aria-hidden>
            push_pin
          </span>
          <span className="bg-error absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white">
            {pins.length > 9 ? "9+" : pins.length}
          </span>
        </span>
        <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.12em]">
          Pinned
        </span>
        <span className="text-on-surface-variant material-symbols-outlined ml-auto text-base" aria-hidden>
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>
      {expanded ? (
        <ul className="scrollbar-thin max-h-[7.5rem] space-y-0.5 overflow-y-auto px-4 pb-2.5 md:px-5">
          {pins.map((p) => (
            <li key={String(p.messageId || p.pinId)}>
              <button
                type="button"
                className="hover:bg-surface-container w-full rounded-md px-2 py-1.5 text-left transition-colors"
                onClick={() => {
                  if (p.messageId) onJump(String(p.messageId));
                }}
              >
                <span className="text-on-surface line-clamp-2 text-[13px] font-normal leading-snug">
                  {p.preview || "Pinned message"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
