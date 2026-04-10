"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="text-on-surface mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-headline text-lg font-bold">Studio unavailable</p>
      <p className="text-on-surface-variant mt-2 text-sm">Something went wrong loading the workspace.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-primary text-on-primary font-headline mt-6 min-h-[44px] rounded-xl px-6 text-sm font-bold transition-all duration-300 hover:shadow-glow"
      >
        Retry
      </button>
    </div>
  );
}
