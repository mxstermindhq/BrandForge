export default function RequestsLoading() {
  return (
    <div className="page-root animate-pulse px-6 py-10 md:px-12">
      <div className="mb-4 h-3 w-36 rounded-xl bg-surface-container" />
      <div className="mb-3 h-10 max-w-md rounded-xl bg-surface-container" />
      <div className="mb-8 h-4 max-w-xl rounded-xl bg-surface-container" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-container" />
        ))}
      </div>
    </div>
  );
}
