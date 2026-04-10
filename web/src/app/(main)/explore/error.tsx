"use client";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-on-surface mx-auto max-w-lg px-4 py-16 text-center">
      <h2 className="font-display text-lg font-semibold">Could not load home</h2>
      <p className="text-error mt-2 font-mono text-xs">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-on-primary font-headline mt-6 min-h-[44px] rounded-xl px-5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Try again
      </button>
    </div>
  );
}
