import type { Metadata } from "next";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { BidPageClient } from "../_components/BidPageClient";

export const metadata: Metadata = {
  title: "Bid on service",
  robots: { index: false, follow: false },
};

export default function BidServicePage() {
  return (
    <Suspense fallback={<PageRouteLoading title="Service bid" subtitle="Loading form." variant="inline" />}>
      <BidPageClient variant="service" />
    </Suspense>
  );
}
