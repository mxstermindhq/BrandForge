import type { Metadata } from "next";
import { StoreClient } from "./_components/StoreClient";

export const metadata: Metadata = {
  title: "Store",
  description: "Honor, boosts, and seasonal perks on BrandForge.",
};

export default function StorePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <StoreClient />
    </div>
  );
}
