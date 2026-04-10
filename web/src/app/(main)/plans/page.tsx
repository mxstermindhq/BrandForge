import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Free to start. Upgrade for more listings, AI tools, and reduced fees. " + "Choose the plan that fits how you work.",
  openGraph: { url: "https://brandforge.gg/plans" },
};

const PlansClient = dynamic(
  () => import("./_components/PlansClient").then((m) => ({ default: m.PlansClient })),
  {
    loading: () => <PageRouteLoading title="Loading plans" variant="inline" />,
  },
);

export default function PlansPage() {
  return (
    <Suspense fallback={<PageRouteLoading title="Loading plans" variant="inline" />}>
      <PlansClient />
    </Suspense>
  );
}
