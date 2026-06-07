import { CHANNEL_META } from "@/lib/constants";

interface Props {
  channels: string[];
  status: Record<string, "idle" | "searching" | "done" | "error">;
  counts: Record<string, number>;
  className?: string;
}

export function ChannelBar({ channels, status, counts, className = "" }: Props): React.JSX.Element {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {channels.map((ch) => {
        const meta = CHANNEL_META[ch] ?? { label: ch, color: "#6b7280", icon: "?" };
        const s = status[ch] || "idle";
        const count = counts[ch] || 0;

        return (
          <div
            key={ch}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-300"
            style={{
              borderColor:
                s === "searching"
                  ? `${meta.color}60`
                  : s === "done"
                    ? `${meta.color}40`
                    : "#ffffff10",
              backgroundColor:
                s === "searching"
                  ? `${meta.color}15`
                  : s === "done"
                    ? `${meta.color}08`
                    : "transparent",
            }}
          >
            {s === "searching" && (
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: meta.color }}
              />
            )}
            {s === "done" && (
              <span className="text-[10px]" style={{ color: meta.color }}>
                ✓
              </span>
            )}
            {s === "error" && <span className="text-[10px] text-red-400">✕</span>}
            <span className={s === "idle" ? "text-zinc-700" : "text-zinc-400"}>{meta.label}</span>
            {count > 0 && (
              <span className="font-mono font-semibold" style={{ color: meta.color }}>
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
