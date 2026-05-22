"use client";

import { useState } from "react";
import { CONTACT, contactMessage } from "@/content/landing-directory";

type ListingSupportMenuProps = {
  listingTitle: string;
};

/** Tertiary support — never competes with Buy Now. */
export function ListingSupportMenu({ listingTitle }: ListingSupportMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        className="w-full text-center text-xs text-[var(--forge-text-muted)] hover:text-[var(--forge-gold)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        More options
      </button>
      {open ? (
        <div className="mt-2 flex flex-col gap-1 rounded-lg border border-[var(--forge-border)] bg-[var(--forge-surface-2)] p-2">
          <a
            href={CONTACT.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="forge-btn forge-btn-ghost forge-btn-sm justify-center text-xs"
          >
            Ask on Discord
          </a>
          <a
            href={contactMessage(`Question: ${listingTitle}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="forge-btn forge-btn-ghost forge-btn-sm justify-center text-xs"
          >
            Telegram
          </a>
        </div>
      ) : null}
    </div>
  );
}
