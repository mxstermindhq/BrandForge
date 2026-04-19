"use client";

import Link from "next/link";
import { useState } from "react";

type Phase = { key: string; label: string };

type SectionProps = { title: string; defaultOpen?: boolean; children: React.ReactNode };

function RailSection({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-outline-variant pb-2 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant hover:text-on-surface"
      >
        {title}
        <span className="material-symbols-outlined text-base" aria-hidden>
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open ? <div className="pb-2">{children}</div> : null}
    </div>
  );
}

/** Right context rail (deal room). Collapsible sections; data hooks land in BrandForge follow-ups. */
export function ChatRail({
  chatTitle,
  stickyProjectTitle,
  stickyProjectStatus,
  contextListingHref,
  contextListingLabel,
  collapsed,
  onToggleCollapse,
  dealPhases,
  dealPhaseIndex,
  phaseAnchors,
  onPhaseNavigate,
}: {
  chatTitle?: string;
  stickyProjectTitle?: string | null;
  stickyProjectStatus?: string | null;
  stickyHref?: string | null;
  contextListingHref: string | null;
  contextListingLabel: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  dealPhases?: Phase[];
  dealPhaseIndex?: number;
  phaseAnchors?: Record<string, string | null>;
  onPhaseNavigate?: (phaseKey: string) => void;
}) {
  const phases = dealPhases?.length ? dealPhases : [];
  const idx = dealPhaseIndex != null ? Math.max(0, Math.min(dealPhaseIndex, phases.length - 1)) : 0;

  if (collapsed) {
    return (
      <div className="hidden h-full min-h-0 w-12 shrink-0 flex-col border-l border-outline-variant bg-surface-container lg:flex">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-on-surface-variant hover:text-on-surface mt-3 flex w-full justify-center p-2"
          aria-label="Expand deal context"
        >
          <span className="material-symbols-outlined" aria-hidden>
            left_panel_open
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside className="hidden h-full min-h-0 w-[300px] min-w-[300px] shrink-0 flex-col overflow-y-auto border-l border-outline-variant bg-surface-container lg:flex">
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Deal context</p>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="text-on-surface-variant hover:text-on-surface rounded p-1"
          aria-label="Collapse panel"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            right_panel_close
          </span>
        </button>
      </div>
      <div className="p-4 border-b border-outline-variant">
        <p className="text-sm font-semibold text-on-surface">{chatTitle || "Deal room"}</p>
        {contextListingHref ? (
          <Link href={contextListingHref} className="text-xs text-amber-500 hover:text-amber-600 hover:underline mt-1 block transition-colors">
            {contextListingLabel}
          </Link>
        ) : (
          <p className="text-xs text-on-surface-variant mt-1">Active deal thread</p>
        )}
      </div>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 pt-1">
        <RailSection title="Deal phase" defaultOpen>
          {phases.length ? (
            <div className="space-y-2">
              <ol className="relative space-y-3 pl-1">
                {phases.map((p, i) => {
                  const active = i === idx;
                  const done = i < idx;
                  const hasTarget = Boolean(phaseAnchors?.[p.key]);
                  return (
                    <li key={p.key} className="flex gap-2 text-[12px] leading-snug">
                      <span className="relative mt-0.5 flex w-4 flex-col items-center">
                        <span
                          className={`flex h-3 w-3 shrink-0 rounded-full ${
                            active
                              ? "bg-purple-500 shadow-[0_0_12px_rgba(124,92,252,0.9)]"
                              : done
                                ? "bg-emerald-500"
                                : "bg-on-surface-variant/30"
                          }`}
                          aria-hidden
                        />
                        {i < phases.length - 1 ? (
                          <span className="bg-outline-variant mt-0.5 h-6 w-px grow" aria-hidden />
                        ) : null}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <button
                          type="button"
                          disabled={!hasTarget}
                          onClick={() => hasTarget && onPhaseNavigate?.(p.key)}
                          className={`text-left transition-colors ${
                            active ? "text-on-surface font-semibold" : "text-on-surface-variant"
                          } ${hasTarget ? "hover:text-purple-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40" : "cursor-default opacity-50"}`}
                        >
                          {p.label}
                        </button>
                        {active ? (
                          <p className="text-purple-500 mt-0.5 text-[10px] font-bold uppercase tracking-wide">You are here</p>
                        ) : null}
                        {hasTarget ? (
                          <p className="text-on-surface-variant mt-0.5 text-[10px] font-light">Click to jump in chat</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <p className="text-on-surface-variant text-xs font-light">Phase data loads as this thread evolves.</p>
          )}
        </RailSection>
        {stickyProjectTitle ? (
          <RailSection title="Engagement" defaultOpen={false}>
            <p className="text-on-surface text-sm font-medium">{stickyProjectTitle}</p>
            {stickyProjectStatus ? (
              <p className="text-on-surface-variant mt-1 text-[11px] uppercase">{stickyProjectStatus}</p>
            ) : null}
            <p className="text-on-surface-variant mt-2 text-[11px] font-light">
              Scope, contract, and delivery updates stay in this thread — use the sections below to track what ships when.
            </p>
          </RailSection>
        ) : null}
        <RailSection title="Deadlines & milestones" defaultOpen>
          <ul className="text-on-surface-variant list-inside list-disc space-y-1.5 text-[11px] font-light leading-relaxed">
            <li>
              <span className="text-on-surface font-medium">Deadlines</span> — due dates from the contract and agreed
              delivery window; specialists keep these current, clients see them at a glance.
            </li>
            <li>
              <span className="text-on-surface font-medium">Milestones</span> — named checkpoints (e.g. draft, review,
              final handoff) so progress is obvious without digging through chat.
            </li>
          </ul>
          <p className="text-on-surface-variant mt-2 text-[10px] font-medium uppercase tracking-wide opacity-80">
            Live dates sync here in a future release — for now, align on them in the contract card and messages.
          </p>
        </RailSection>
        <RailSection title="Tasks & scope" defaultOpen={false}>
          <ul className="text-on-surface-variant list-inside list-disc space-y-1.5 text-[11px] font-light leading-relaxed">
            <li>
              <span className="text-on-surface font-medium">Specialist</span> — checklist of work tied to the agreed
              scope; mark what is done, note blockers, attach proof in chat.
            </li>
            <li>
              <span className="text-on-surface font-medium">Client</span> — read-only view of status and what is left
              before sign-off.
            </li>
          </ul>
          <p className="text-on-surface-variant mt-2 text-[10px] font-medium uppercase tracking-wide opacity-80">
            Structured task lists are on the roadmap; the stream remains the source of truth today.
          </p>
        </RailSection>
        <RailSection title="Retention & bonuses" defaultOpen={false}>
          <p className="text-on-surface-variant text-[11px] font-light leading-relaxed">
            After core <span className="text-on-surface font-medium">delivery &amp; review</span>, specialists can pitch
            a <span className="text-on-surface font-medium">bonus / retention</span> add-on: extra deliverables,
            continued support, or scope beyond the original contract — with clear pricing and what the client gets.
          </p>
          <p className="text-on-surface-variant mt-2 text-[11px] font-light leading-relaxed">
            Goal: simple admin for the specialist (one place to define the extra work) and a calm, scannable view for the
            client before they accept.
          </p>
          <p className="text-on-surface-variant mt-2 text-[10px] font-medium uppercase tracking-wide opacity-80">
            Bonus contracts and retention phase messages will appear in chat when this flow is enabled.
          </p>
        </RailSection>
      </div>
    </aside>
  );
}
