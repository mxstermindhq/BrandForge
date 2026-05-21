"use client";

import { contactMessage } from "@/content/landing-directory";

type StickyConversationCTAProps = {
  /** Pre-filled Telegram subject line */
  subject?: string;
  label?: string;
  sublabel?: string;
};

export function StickyConversationCTA({
  subject = "BrandForge — I'd like to start a scoped conversation",
  label = "Start conversation",
  sublabel = "mxstermind routes you to the right operator",
}: StickyConversationCTAProps) {
  const href = contactMessage(subject);

  return (
    <div className="sticky-cta-bar" role="region" aria-label="Contact mxstermind">
      <div className="sticky-cta-bar-inner">
        <div className="sticky-cta-copy">
          <p className="sticky-cta-label">{label}</p>
          <p className="sticky-cta-sublabel">{sublabel}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta-button"
          data-track="sticky_conversation_cta"
        >
          {label} →
        </a>
      </div>
    </div>
  );
}
