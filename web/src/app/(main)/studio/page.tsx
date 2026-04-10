import dynamic from "next/dynamic";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

const StudioWorkspace = dynamic(
  () => import("./_components/StudioWorkspace").then((m) => ({ default: m.StudioWorkspace })),
  {
    loading: () => <PageRouteLoading title="Loading studio" variant="inline" />,
  },
);

export default function StudioPage() {
  return (
    <div className="px-2 pb-24 pt-1 md:px-4">
      <StudioWorkspace />
    </div>
  );
}
