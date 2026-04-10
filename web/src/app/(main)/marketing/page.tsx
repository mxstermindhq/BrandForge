import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

export const metadata: Metadata = {
  title: "Marketing",
  description: "Distribution and growth tools for BrandForge specialists.",
};

const MarketingClient = dynamic(
  () => import("./_components/MarketingClient").then((m) => ({ default: m.MarketingClient })),
  {
    loading: () => <PageRouteLoading title="Loading marketing" variant="inline" />,
  },
);

export default function MarketingPage() {
  return <MarketingClient />;
}
