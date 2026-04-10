import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

export default function MessagesLoading() {
  return (
    <PageRouteLoading
      title="Opening Messages"
      subtitle="Pulling your active deals and threads — this can take a moment on first load."
    />
  );
}
