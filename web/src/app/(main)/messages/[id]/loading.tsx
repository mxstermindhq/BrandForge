import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

export default function MessageThreadLoading() {
  return (
    <PageRouteLoading
      title="Loading thread"
      subtitle="Fetching messages and deal context…"
    />
  );
}
