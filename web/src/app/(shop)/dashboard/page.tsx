import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Orders, payments, and seller performance on BrandForge",
};

export default function DashboardPage() {
  return (
    <main className="forge-page pb-24">
      <div className="forge-container forge-page-inner">
        <h1 className="font-headline text-4xl font-semibold text-[var(--forge-text)]">Dashboard</h1>
        <p className="mt-2 text-[var(--forge-text-muted)]">Orders, crypto payments, and listing analytics.</p>
        <div className="mt-10">
          <DashboardClient />
        </div>
      </div>
    </main>
  );
}
