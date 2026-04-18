import type { Metadata } from "next";
import { UnifiedMarketplace } from "./_components/UnifiedMarketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Unified marketplace for services and requests. Offer your skills or request what you need. AI-powered matching.",
  openGraph: { url: "https://brandforge.gg/marketplace" },
};

export default function MarketplacePage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <UnifiedMarketplace />
      </div>
    </div>
  );
}
