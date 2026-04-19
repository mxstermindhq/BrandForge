export default function ServicesLoading() {
  return (
    <div className="page-root animate-pulse px-6 py-10 md:px-12">
      <div className="mb-4 h-3 w-32 rounded-xl bg-surface-container" />
      <div className="mb-3 h-10 max-w-sm rounded-xl bg-surface-container" />
      <div className="mb-8 h-4 max-w-xl rounded-xl bg-surface-container" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-surface-container" />
        ))}
      </div>
    </div>
  );
}
