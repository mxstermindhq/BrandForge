import type { Metadata } from "next";
import { HomeHubClient } from "@/app/(main)/_components/HomeHubClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your home hub for deals, marketplace, and live network activity.",
};

export default function DashboardPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <HomeHubClient />
      </div>
    </div>
  );
}