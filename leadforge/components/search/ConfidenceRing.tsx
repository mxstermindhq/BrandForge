export function ConfidenceRing({ value }: { value: number }): React.JSX.Element {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ;
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#ffffff0a" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="10" fill={color} fontFamily="monospace">
          {value}%
        </text>
      </svg>
    </div>
  );
}
