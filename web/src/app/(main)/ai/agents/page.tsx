import dynamic from "next/dynamic";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

const AgentsClient = dynamic(
  () => import("./_components/AgentsClient").then((m) => ({ default: m.AgentsClient })),
  {
    loading: () => <PageRouteLoading title="Loading agents" variant="inline" />,
  },
);

export default function AiAgentsPage() {
  return <AgentsClient />;
}
