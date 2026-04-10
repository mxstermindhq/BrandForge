"use client";

type Props = {
  onSynthesis: () => void;
  onArtisan: () => void;
  onDeploy: () => void;
  deploying: boolean;
};

export function StudioBottomToolbar({ onSynthesis, onArtisan, onDeploy, deploying }: Props) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 justify-center px-4 md:left-[calc(50%+4rem)]">
      <div className="border-outline-variant/30 bg-surface-container-high/90 pointer-events-auto flex items-center gap-1 rounded-2xl border p-1.5 shadow-glow backdrop-blur-xl">
        <button
          type="button"
          onClick={onSynthesis}
          className="font-headline text-on-surface hover:bg-secondary/15 hover:text-secondary flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            bubble_chart
          </span>
          Synthesis
        </button>
        <button
          type="button"
          onClick={onArtisan}
          className="font-headline text-on-surface hover:bg-secondary/15 hover:text-secondary flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            palette
          </span>
          Artisan
        </button>
        <button
          type="button"
          onClick={onDeploy}
          disabled={deploying}
          className="bg-primary text-on-primary font-headline flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-glow disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            rocket_launch
          </span>
          {deploying ? "Deploying…" : "Deploy"}
        </button>
      </div>
    </div>
  );
}
