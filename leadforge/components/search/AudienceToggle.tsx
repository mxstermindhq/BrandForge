"use client";

import type { CampaignType } from "@/types";
import { campaignTypeDescription, campaignTypeLabel } from "@/lib/campaign-type";

interface Props {
  value: CampaignType;
  onChange: (type: CampaignType) => void;
  disabled?: boolean;
}

export function AudienceToggle({ value, onChange, disabled }: Props): React.JSX.Element {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Audience</p>
          <p className="mt-1 text-xs text-zinc-500">{campaignTypeDescription(value)}</p>
        </div>
        <div
          className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1"
          role="group"
          aria-label="B2B or B2C audience"
        >
          {(["b2b", "b2c"] as const).map((mode) => {
            const active = value === mode;
            return (
              <button
                key={mode}
                type="button"
                disabled={disabled}
                onClick={() => onChange(mode)}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? mode === "b2b"
                      ? "bg-white text-black shadow-sm"
                      : "bg-violet-500 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {campaignTypeLabel(mode)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
