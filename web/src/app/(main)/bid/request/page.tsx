import type { Metadata } from "next";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { BidPageClient } from "../_components/BidPageClient";

export const metadata: Metadata = {
  title: "Bid on brief",
  robots: { index: false, follow: false },
};

export default function BidRequestPage() {
  return (
    <Suspense fallback={<PageRouteLoading title="Brief bid" subtitle="Loading form." variant="inline" />}>
      <BidPageClient variant="request" />
    </Suspense>
  );
}
