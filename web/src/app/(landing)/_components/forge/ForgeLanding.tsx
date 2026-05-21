"use client";

import { Suspense } from "react";
import type { CuratedOperator } from "@/lib/schemas/operator.schema";
import { ListingBrowse } from "@/components/marketplace/ListingBrowse";
import { ForgeFinalCTA } from "./ForgeFinalCTA";
import { ForgeFooter } from "./ForgeFooter";
import { ForgeHero } from "./ForgeHero";
import { ForgeHowItWorks } from "./ForgeHowItWorks";
import { ForgeNavbar } from "./ForgeNavbar";
import { ForgeStats } from "./ForgeStats";
import { ForgeTalentStrip } from "./ForgeTalentStrip";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

type ForgeLandingProps = {
  operators: CuratedOperator[];
};

export function ForgeLanding({ operators }: ForgeLandingProps) {
  return (
    <div className="forge-layout">
      <OnboardingGate />
      <ForgeNavbar />
      <main>
        <ForgeHero />
        <Suspense fallback={<section id="browse" className="forge-section forge-section-alt" />}>
          <ListingBrowse />
        </Suspense>
        <ForgeHowItWorks />
        <ForgeStats />
        <ForgeTalentStrip operators={operators} />
        <ForgeFinalCTA />
      </main>
      <ForgeFooter />
    </div>
  );
}
