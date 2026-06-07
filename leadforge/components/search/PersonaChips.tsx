import type { ExtractedPersona } from "@/types";

interface Props {
  persona: ExtractedPersona;
  className?: string;
}

export function PersonaChips({ persona, className = "" }: Props): React.JSX.Element | null {
  const chips: { label: string; values: string[]; color: string }[] = [
    { label: "Roles", values: persona.titles, color: "text-blue-400 bg-blue-500/10" },
    { label: "Industries", values: persona.industries, color: "text-violet-400 bg-violet-500/10" },
    { label: "Locations", values: persona.locations, color: "text-emerald-400 bg-emerald-500/10" },
    { label: "Pain Points", values: persona.pain_points, color: "text-amber-400 bg-amber-500/10" },
  ].filter((c) => c.values.length > 0);

  if (!chips.length) return null;

  return (
    <div className={className}>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-700">Extracted Persona</p>
      <div className="flex flex-wrap gap-2">
        {chips.flatMap((cat) =>
          cat.values.slice(0, 3).map((val) => (
            <span
              key={`${cat.label}-${val}`}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${cat.color}`}
            >
              {val}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
