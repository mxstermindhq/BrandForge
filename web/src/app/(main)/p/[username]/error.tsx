"use client";

export default function PublicProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-on-surface mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-error text-sm font-medium">Could not load this profile.</p>
      <p className="text-on-surface-variant mt-2 font-mono text-xs">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-on-primary font-headline mt-6 min-h-11 rounded-xl px-4 text-sm font-bold"
      >
        Try again
      </button>
    </div>
  );
}
