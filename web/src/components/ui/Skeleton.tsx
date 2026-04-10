import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

/** @deprecated Import `PageRouteLoading` — skeleton pulse UI removed. */
// Legacy callers may pass className; it is ignored.
export function Skeleton(_props: { className?: string }) {
  void _props;
  return <PageRouteLoading variant="inline" title="Loading…" />;
}
