"use client";

import { useState } from "react";

const AGENTS = [
  { id: "strategist", label: "Strategist", sub: "Briefs & positioning" },
  { id: "engineer", label: "Engineer", sub: "Implementation paths" },
  { id: "designer", label: "Designer", sub: "Systems & surfaces" },
  { id: "analyst", label: "Analyst", sub: "Signals & QA" },
];

export function StudioAgentPanel() {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(AGENTS.map((a) => [a.id, a.id !== "analyst"])),
  );

  return (
    <aside className="border-outline-variant/20 bg-surface-container-low/90 flex w-full shrink-0 flex-col border-b backdrop-blur-md md:w-64 md:border-b-0 md:border-r">
      <div className="border-outline-variant/15 border-b px-4 py-4">
        <h2 className="font-headline text-on-surface text-[10px] font-black uppercase tracking-[0.25em]">
          Agent selection
        </h2>
        <p className="text-on-surface-variant mt-2 text-xs font-light leading-relaxed">
          Toggle lanes active in this studio session.
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-2 p-3">
        {AGENTS.map((a) => {
          const active = on[a.id];
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOn((s) => ({ ...s, [a.id]: !s[a.id] }))}
                className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                  active
                    ? "border-secondary/50 bg-secondary/10 shadow-ambient"
                    : "border-outline-variant/15 hover:border-outline-variant/30 bg-surface-container-high/40 text-on-surface-variant"
                }`}
              >
                <span className={`font-headline text-sm font-bold ${active ? "text-secondary" : ""}`}>{a.label}</span>
                <span className="mt-1 text-[11px] font-light opacity-80">{a.sub}</span>
                <span className="text-on-surface-variant mt-2 text-[10px] font-bold uppercase tracking-wider">
                  {active ? "Active" : "Idle"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
