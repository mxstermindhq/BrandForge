import type { Metadata } from "next";
import { Suspense } from "react";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";
import { ServicesClient } from "@/app/(main)/_services/_components/ServicesClient";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse published services from verified specialists. " +
    "Find the right expert, send a bid, and negotiate in one deal room.",
  openGraph: { url: "https://brandforge.gg/services" },
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<PageRouteLoading title="Loading marketplace" variant="inline" />}>
      <ServicesClient />
    </Suspense>
  );
}
