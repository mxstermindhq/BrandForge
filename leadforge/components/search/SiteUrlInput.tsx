"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
  quantity: number;
  onQuantityChange: (n: number) => void;
  submitLabel?: string;
}

const EXAMPLES = [
  "https://stripe.com",
  "https://webflow.com",
  "https://youragency.com",
  "https://shopify.com",
];

export function SiteUrlInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isBusy,
  quantity,
  onQuantityChange,
  submitLabel = "Analyze website",
}: Props): React.JSX.Element {
  const placeholder = EXAMPLES[Math.floor(Date.now() / 15000) % EXAMPLES.length];

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] transition-colors focus-within:border-white/20">
      <div className="px-5 pt-5">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-600">
          Your website
        </p>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isBusy}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
          autoComplete="url"
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-zinc-600">
          Paste your product or service site — we&apos;ll read it and find your ideal buyers.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-600">Leads</label>
          <select
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            disabled={isBusy}
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
          {isBusy ? (
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
