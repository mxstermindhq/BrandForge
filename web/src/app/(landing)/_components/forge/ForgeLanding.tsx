"use client";

import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { BrowseForgeGrid } from "./BrowseForgeGrid";
import { ForgeFinalCTA } from "./ForgeFinalCTA";
import { ForgeFooter } from "./ForgeFooter";
import { ForgeHero } from "./ForgeHero";
import { ForgeHowItWorks } from "./ForgeHowItWorks";
import { ForgeNavbar } from "./ForgeNavbar";
import { ForgeStats } from "./ForgeStats";
import { ForgeTalentStrip } from "./ForgeTalentStrip";
import { TrendingMarketplace } from "./TrendingMarketplace";

type ForgeLandingProps = {
  operators: CuratedOperator[];
};

export function ForgeLanding({ operators }: ForgeLandingProps) {
  return (
    <div className="forge-layout">
      <ForgeNavbar />
      <main>
        <ForgeHero />
        <BrowseForgeGrid />
        <TrendingMarketplace />
        <ForgeHowItWorks />
        <ForgeStats />
        <ForgeTalentStrip operators={operators} />
        <ForgeFinalCTA />
      </main>
      <ForgeFooter />
    </div>
  );
}
