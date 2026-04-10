"use client";

export default function NewRequestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-on-surface mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
      <h1 className="font-display text-xl font-semibold">Something went wrong</h1>
      <p className="text-error font-mono text-xs">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-primary text-on-primary font-headline inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Try again
      </button>
    </div>
  );
}
