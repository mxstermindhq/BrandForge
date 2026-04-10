import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsClient } from "./_components/SettingsClient";
import { PageRouteLoading } from "@/components/ui/PageRouteLoading";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageRouteLoading title="Loading settings" variant="inline" />}>
      <SettingsClient />
    </Suspense>
  );
}
