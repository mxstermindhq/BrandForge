"use client";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-background text-on-surface flex min-h-screen flex-col items-center justify-center px-6">
      <p className="text-error text-sm font-medium">Sign-in page failed to load.</p>
      <p className="text-on-surface-variant mt-2 max-w-sm text-center font-mono text-xs">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-on-primary font-headline mt-6 min-h-11 rounded-xl px-4 text-sm font-bold"
      >
        Retry
      </button>
    </div>
  );
}
