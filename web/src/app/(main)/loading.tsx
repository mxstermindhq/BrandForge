export default function MainRouteLoading() {
  return (
    <div className="page-root animate-pulse px-6 py-10 md:px-12">
      <div className="mb-4 h-3 w-28 rounded-xl bg-surface-container" />
      <div className="mb-3 h-9 max-w-md rounded-xl bg-surface-container" />
      <div className="mb-8 h-4 max-w-lg rounded-xl bg-surface-container" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 rounded-xl bg-surface-container" />
        <div className="h-36 rounded-xl bg-surface-container" />
        <div className="h-36 rounded-xl bg-surface-container" />
      </div>
    </div>
  );
}
