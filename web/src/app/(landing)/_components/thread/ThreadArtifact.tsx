"use client";

import type { ReactNode } from "react";

function Row({
  role,
  side,
  delay,
  children,
}: {
  role: string;
  side: "left" | "right" | "card" | "center";
  delay: number;
  children: ReactNode;
}) {
  return (
    <div className={`tl-row tl-row-${side}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="tl-rail-label">{role}</span>
      <div className="tl-msg">{children}</div>
    </div>
  );
}

export function ThreadArtifact() {
  return (
    <div className="tl-thread" aria-label="A live client thread inside BrandForge">
      <div className="tl-thread-head">
        <span className="tl-avatar">N</span>
        <div className="tl-thread-meta">
          <div className="tl-thread-title">Landing page v1</div>
          <div className="tl-thread-sub">Nova Studio · Marcus</div>
        </div>
        <span className="tl-escrow-pill">
          <span className="tl-escrow-dot" aria-hidden />
          $1,200 escrowed
        </span>
      </div>

      <div className="tl-thread-body">
        <Row role="CLIENT" side="left" delay={200}>
          Can we have the landing page live by Thursday?
        </Row>

        <Row role="ESCROW" side="card" delay={550}>
          <div className="tl-escrow-card">
            <div className="tl-escrow-top">
              <span className="tl-pill tl-pill-funded">FUNDED</span>
              <span className="tl-amount">$1,200</span>
            </div>
            <div className="tl-escrow-line">Landing page v1 — held until M1 delivered</div>
          </div>
        </Row>

        <Row role="FOUNDER" side="right" delay={900}>
          Scope locked. Board is live — you’ll see every card move.
        </Row>

        <Row role="@AI" side="right" delay={1250}>
          <div className="tl-ai-bubble">
            <div className="tl-ai-bubble-head">
              <span className="tl-ai-glyph">@</span>
              <span>drafted a reply in your voice</span>
            </div>
            <div className="tl-ai-bubble-text">
              “Yes — Thursday EOD, with the form wired in. Ready when you are.”
            </div>
            <div className="tl-ai-bubble-actions">
              <span className="tl-btn tl-btn-small tl-btn-primary">Review</span>
              <span className="tl-btn tl-btn-small tl-btn-soft">Send</span>
            </div>
          </div>
        </Row>

        <Row role="DONE" side="center" delay={1600}>
          <span className="tl-milestone">✓ Milestone released — $1,200 → payout</span>
        </Row>
      </div>
    </div>
  );
}
