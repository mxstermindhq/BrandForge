"use client";

import Link from "next/link";
import { contactMessage } from "@/content/landing-directory";

type ProfileStickyCTAProps = {
  operatorName: string;
  context?: string;
};

export function ProfileStickyCTA({ operatorName, context }: ProfileStickyCTAProps) {
  const subject = context ?? `I'd like to work with ${operatorName}`;
  const href = contactMessage(subject);

  return (
    <>
      <div
        className="mt-10 hidden rounded-2xl border p-6 md:block"
        style={{ borderColor: "var(--color-gold-border)", background: "var(--color-gold-subtle)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gold)]">Ready to scope?</p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          mxstermind confirms fit, timeline, and package before any commitment.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4 inline-flex min-h-11 items-center px-6 text-sm"
        >
          Ask mxstermind about {operatorName} →
        </a>
        <Link href="/#talent" className="mt-3 block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
          ← Back to directory
        </Link>
      </div>

      <div className="profile-sticky-cta md:hidden" role="region" aria-label="Contact mxstermind">
        <a href={href} target="_blank" rel="noopener noreferrer" className="profile-sticky-cta-btn">
          Ask about {operatorName} →
        </a>
      </div>

      <div className="sticky-cta-bar hidden md:block" role="region" aria-label="Contact mxstermind">
        <div className="sticky-cta-bar-inner">
          <div className="sticky-cta-copy">
            <p className="sticky-cta-label">Ask mxstermind about {operatorName}</p>
            <p className="sticky-cta-sublabel">Scoped intro · no bidding</p>
          </div>
          <a href={href} target="_blank" rel="noopener noreferrer" className="sticky-cta-button">
            Start conversation →
          </a>
        </div>
      </div>
    </>
  );
}
