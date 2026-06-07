"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isSearching: boolean;
  quantity: number;
  onQuantityChange: (n: number) => void;
  submitLabel?: string;
}

const PLACEHOLDERS = [
  "SaaS founders in London with 10-50 employees struggling with customer churn...",
  "E-commerce store owners doing $50k-200k/mo who need better ad ROI...",
  "Dental practice owners in Spain interested in AI scheduling tools...",
  "Freelance designers on Instagram with 5k+ followers looking for clients...",
  "B2B sales managers at mid-market companies frustrated with lead quality...",
];

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isSearching,
  quantity,
  onQuantityChange,
  submitLabel = "Search",
}: Props): React.JSX.Element {
  const ref = useRef<HTMLTextAreaElement>(null);
  const placeholder = PLACEHOLDERS[Math.floor(Date.now() / 10000) % PLACEHOLDERS.length];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] transition-colors focus-within:border-white/20">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isSearching}
        rows={3}
        className="w-full resize-none bg-transparent px-5 pb-16 pt-5 text-sm leading-relaxed text-white outline-none placeholder:text-zinc-700"
      />

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-600">Leads</label>
          <select
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            disabled={isSearching}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400 outline-none"
          >
            {[10, 25, 50, 100, 250].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-700">⌘ + Enter</span>
          {isSearching ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!value.trim()}
              className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
