import type { Metadata } from "next";
import { StoreClient } from "./_components/StoreClient";

export const metadata: Metadata = {
  title: "Store",
  description: "Honor, boosts, and seasonal perks on BrandForge.",
};

export default function StorePage() {
  return <StoreClient />;
}
