export default function LeaderboardLoading() {
  return (
    <div className="page-root mx-auto max-w-[960px] animate-pulse px-6 py-10 md:px-12">
      <div className="mb-6 h-40 rounded-xl bg-surface-container" />
      <div className="mb-4 h-24 rounded-xl bg-surface-container" />
      <div className="mb-6 h-32 rounded-xl bg-surface-container" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-container" />
        ))}
      </div>
    </div>
  );
}
