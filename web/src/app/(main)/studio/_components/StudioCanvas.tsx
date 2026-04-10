"use client";

type Props = {
  brief: string;
  onBriefChange: (v: string) => void;
};

export function StudioCanvas({ brief, onBriefChange }: Props) {
  return (
    <div className="relative flex min-h-[360px] min-w-0 flex-1 flex-col md:min-h-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(189,244,255,0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(189,244,255,0.35) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="border-secondary/20 pointer-events-none absolute left-0 top-0 h-6 w-full border-b text-[9px] font-mono uppercase tracking-[0.35em] text-secondary/70">
        <span className="pl-2 pt-1">0 — grid — 24</span>
      </div>
      <div className="border-secondary/20 pointer-events-none absolute bottom-0 left-0 top-6 w-6 border-r text-[9px] text-secondary/70">
        <span
          className="absolute left-0.5 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          ruler
        </span>
      </div>
      <div className="relative z-[1] flex flex-1 flex-col p-6 pl-10 pt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-headline text-on-surface text-xs font-black uppercase tracking-[0.2em]">Canvas</h2>
          <span className="text-on-surface-variant text-[10px] font-medium uppercase tracking-widest">
            Neon Architect
          </span>
        </div>
        <label className="sr-only" htmlFor="studio-brief">
          Session brief
        </label>
        <textarea
          id="studio-brief"
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="Compose the brief for synthesis — milestones, constraints, tone…"
          className="border-outline-variant/25 bg-background/75 focus:border-secondary/40 placeholder:text-on-surface-variant/45 min-h-[200px] flex-1 resize-none rounded-xl border px-4 py-3 font-body text-sm text-on-surface backdrop-blur-sm transition-all duration-300 focus:outline-none md:min-h-[280px]"
        />
      </div>
    </div>
  );
}
