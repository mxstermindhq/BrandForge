"use client";

interface SkeletonCardProps {
  variant?: "marketplace" | "profile" | "chat" | "leaderboard" | "dashboard";
  count?: number;
}

export function SkeletonCard({ variant = "marketplace", count = 1 }: SkeletonCardProps) {
  const shimmer = "animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%]";

  if (variant === "marketplace") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 rounded ${shimmer}`} />
                <div className={`h-3 w-1/2 rounded ${shimmer}`} />
              </div>
            </div>
            <div className={`h-20 rounded-lg ${shimmer}`} />
            <div className="flex items-center justify-between">
              <div className={`h-4 w-16 rounded ${shimmer}`} />
              <div className={`h-8 w-20 rounded-lg ${shimmer}`} />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === "profile") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-24 h-24 rounded-xl ${shimmer}`} />
          <div className="flex-1 space-y-3 pt-2">
            <div className={`h-6 w-48 rounded ${shimmer}`} />
            <div className={`h-4 w-32 rounded ${shimmer}`} />
            <div className="flex gap-2 pt-2">
              <div className={`h-6 w-20 rounded-full ${shimmer}`} />
              <div className={`h-6 w-20 rounded-full ${shimmer}`} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`h-20 rounded-lg ${shimmer}`} />
          <div className={`h-20 rounded-lg ${shimmer}`} />
          <div className={`h-20 rounded-lg ${shimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === "chat") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <div className={`w-8 h-8 rounded-lg ${shimmer}`} />
            <div className={`${i % 2 === 0 ? "w-2/3" : "w-1/2"} h-16 rounded-2xl ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "leaderboard") {
    return (
      <div className="space-y-2">
        {/* Top 3 */}
        <div className="flex justify-center gap-4 mb-6">
          <div className={`w-24 h-32 rounded-t-xl ${shimmer}`} />
          <div className={`w-28 h-40 rounded-t-xl ${shimmer}`} />
          <div className={`w-24 h-28 rounded-t-xl ${shimmer}`} />
        </div>
        {/* List */}
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <div className={`w-6 h-6 rounded ${shimmer}`} />
            <div className={`w-8 h-8 rounded-full ${shimmer}`} />
            <div className={`h-4 w-32 rounded ${shimmer}`} />
            <div className="flex-1" />
            <div className={`h-4 w-16 rounded ${shimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  // Dashboard variant
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-24 rounded-xl ${shimmer}`} />
        ))}
      </div>
      {/* Main content */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className={`h-64 rounded-xl ${shimmer}`} />
          <div className={`h-48 rounded-xl ${shimmer}`} />
        </div>
        <div className={`h-96 rounded-xl ${shimmer}`} />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const shimmer = "animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%]";
  
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded ${shimmer} ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const shimmer = "animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%]";
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24",
  };
  
  return <div className={`${sizeClasses[size]} rounded-full ${shimmer}`} />;
}
