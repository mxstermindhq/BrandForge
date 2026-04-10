import dynamic from "next/dynamic";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

const CopilotClient = dynamic(
  () => import("../copilot/_components/CopilotClient").then((m) => ({ default: m.CopilotClient })),
  {
    loading: () => <PageRouteLoading title="Loading AI chat" variant="inline" />,
  },
);

export default function AiChatPage() {
  return <CopilotClient />;
}
