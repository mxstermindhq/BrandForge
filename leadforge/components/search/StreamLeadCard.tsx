"use client";

import { useState } from "react";
import type { StreamLead } from "@/types";
import { CHANNEL_META } from "@/lib/constants";

interface Props {
  lead: StreamLead;
  index: number;
}

function ScoreBar({ score }: { score: number }): React.JSX.Element {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#6b7280";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-xs" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function StreamLeadCard({ lead, index }: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const meta = CHANNEL_META[lead.platform] ?? {
    label: lead.platform,
    color: "#6b7280",
    icon: "?",
  };

  return (
    <div
      className="animate-fade-up cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/15"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: meta.color, backgroundColor: `${meta.color}18` }}
            >
              {meta.label}
            </span>
            {lead.fit_tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="truncate text-sm font-medium text-white">{lead.name || "Unknown"}</p>
          {(lead.title || lead.company) && (
            <p className="truncate text-xs text-zinc-500">
              {lead.title}
              {lead.company ? ` · ${lead.company}` : ""}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <ScoreBar score={lead.score || 0} />
        </div>
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className={`ml-2 flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              lead.email_confidence === "high"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : lead.email_confidence === "medium"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700 bg-white/[0.03] text-zinc-500"
            }`}
          >
            ✉ {lead.email}
          </a>
        )}
      </div>

      {lead.pitch_angle && (
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {lead.pitch_angle}
        </p>
      )}

      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-xs">
          {lead.likely_pain && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Pain Point</span>
              <p className="mt-0.5 text-zinc-300">{lead.likely_pain}</p>
            </div>
          )}
          {lead.score_reason && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fit Reason</span>
              <p className="mt-0.5 text-zinc-300">{lead.score_reason}</p>
            </div>
          )}
          {lead.location_guess && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Location</span>
              <p className="mt-0.5 text-zinc-300">{lead.location_guess}</p>
            </div>
          )}
          {lead.best_contact_channel && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Best Contact</span>
              <p className="mt-0.5 capitalize text-zinc-300">{lead.best_contact_channel}</p>
            </div>
          )}
          {lead.url && (
            <div className="col-span-2">
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block truncate text-zinc-600 transition-colors hover:text-white"
              >
                {lead.url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
