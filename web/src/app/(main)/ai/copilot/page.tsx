import dynamic from "next/dynamic";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

const CopilotClient = dynamic(
  () => import("./_components/CopilotClient").then((m) => ({ default: m.CopilotClient })),
  {
    loading: () => <PageRouteLoading title="Loading co-pilot" variant="inline" />,
  },
);

export default function CopilotPage() {
  return <CopilotClient />;
}
