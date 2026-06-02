type TrustBarProps = {
  items?: readonly { value: string; label: string }[];
};

const DEFAULT_ITEMS = [
  { value: "50+", label: "Projects delivered" },
  { value: "24h", label: "Quote turnaround" },
  { value: "Escrow", label: "Every order" },
  { value: "Crypto", label: "Payments accepted" },
  { value: "Discord", label: "Primary contact" },
] as const;

/** Five trust signals in a horizontal strip. */
export function TrustBar({ items = DEFAULT_ITEMS }: TrustBarProps): React.JSX.Element {
  return (
    <div
      className="border-y border-b1 bg-s2"
      role="region"
      aria-label="Trust signals"
    >
      <div className="content-wrap grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-mono text-lg font-bold text-accent-bright">{item.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
